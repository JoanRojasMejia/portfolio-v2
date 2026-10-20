#!/usr/bin/env node
// Exporta tus contribuciones de repos que no están en GitHub (CodeCommit) como
// conteos por día, para sumarlas al calendario de "Actividad" del portafolio.
//
// Se corre en el computador del trabajo, sobre los repos que ya tienes clonados.
// No necesita instalar nada (solo Node 18+ y git; para los PRs, el AWS CLI).
//
// El archivo que genera solo tiene fechas y números ({ "2026-03-12": 7 }): ningún
// nombre de repo, rama, mensaje ni código sale del computador del trabajo.
//
// Uso:
//   node export-codecommit.mjs --root ~/work --author tu@empresa.com
//   node export-codecommit.mjs --repos ~/work/front-b2b ~/work/api --author tu@correo.com --prs
//
// Opciones:
//   --root <carpeta>    busca repos git dentro de la carpeta (hasta 2 niveles)
//   --repos <a> <b>…    o indica los repos uno por uno
//   --author <correo>   tu correo o nombre en los commits; se puede repetir
//   --since <días>      cuántos días hacia atrás (por defecto 371, un año completo)
//   --fetch             trae las ramas remotas antes de contar (git fetch --all)
//   --prs               suma los PRs que abriste (aws codecommit; usa tu sesión de AWS)
//   --author-arn <arn>  ARN con el que abres los PRs (por defecto el de aws sts get-caller-identity)
//   --include-github    cuenta también repos cuyo origin está en GitHub (por defecto se
//                       saltan, porque GitHub ya los cuenta y quedarían dobles)
//   --out <archivo>     dónde guardar (por defecto ./contributions-extra.json)
//   --dry-run           solo muestra el resumen, no escribe el archivo
//
// Luego copia el archivo al portafolio como src/data/contributions-extra.json.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const TZ = 'America/Bogota';

// ---- Argumentos ----
const args = process.argv.slice(2);
const opts = { repos: [], authors: [], root: null, since: 371, fetch: false, prs: false, authorArn: null, includeGithub: false, out: 'contributions-extra.json', dryRun: false };
const expand = (p) => resolve(p.replace(/^~(?=$|\/)/, homedir()));
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const next = () => args[++i];
  if (a === '--root') opts.root = expand(next());
  else if (a === '--repos') while (args[i + 1] && !args[i + 1].startsWith('--')) opts.repos.push(expand(next()));
  else if (a === '--author') opts.authors.push(next());
  else if (a === '--since') opts.since = Number(next());
  else if (a === '--fetch') opts.fetch = true;
  else if (a === '--prs') opts.prs = true;
  else if (a === '--author-arn') opts.authorArn = next();
  else if (a === '--include-github') opts.includeGithub = true;
  else if (a === '--out') opts.out = next();
  else if (a === '--dry-run') opts.dryRun = true;
  else if (a === '--help' || a === '-h') {
    console.log('Uso: node export-codecommit.mjs --root ~/work --author tu@correo.com [--prs] [--fetch] [--out archivo]');
    process.exit(0);
  } else fail(`Opción desconocida: ${a}`);
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!opts.authors.length) fail('Falta --author (tu correo de los commits). Ej.: --author tu@empresa.com');
if (!opts.root && !opts.repos.length) fail('Indica los repos con --root <carpeta> o --repos <ruta> …');
if (!Number.isFinite(opts.since) || opts.since < 1) fail('--since debe ser un número de días');

// ---- Utilidades ----
const run = (cmd, argv, cwd) => execFileSync(cmd, argv, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
const isRepo = (dir) => existsSync(join(dir, '.git'));
const dayOf = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(ms)); // AAAA-MM-DD en Bogotá
const sinceMs = Date.now() - opts.since * 86_400_000;

// Repos dentro de --root (la carpeta misma, sus hijas y nietas).
function findRepos(root, depth = 2) {
  if (isRepo(root)) return [root];
  if (depth === 0) return [];
  let entries = [];
  try {
    entries = readdirSync(root);
  } catch {
    return [];
  }
  return entries
    .filter((n) => !n.startsWith('.') && n !== 'node_modules')
    .map((n) => join(root, n))
    .filter((p) => {
      try {
        return statSync(p).isDirectory();
      } catch {
        return false;
      }
    })
    .flatMap((p) => findRepos(p, depth - 1));
}

const repos = [...new Set([...(opts.root ? findRepos(opts.root) : []), ...opts.repos])];
if (!repos.length) fail('No encontré repos git en las rutas indicadas.');

// Nombre del repo en CodeCommit a partir del remote (https, ssh o codecommit::).
const codecommitName = (url) => url.match(/codecommit(?:(?:::[^:]+)?:\/\/|\.[^/]+\.amazonaws\.com\/v1\/repos\/)(?:[^@/]+@)?([^/\s]+?)(?:\.git)?$/)?.[1] ?? null;

// ---- Commits ----
const days = {}; // fecha → conteo
const seen = new Set(); // hashes ya contados (el mismo commit puede estar en dos repos)
const summary = [];
const add = (date, n = 1) => (days[date] = (days[date] ?? 0) + n);

for (const repo of repos) {
  if (!isRepo(repo)) {
    console.warn(`· ${repo}: no es un repo git, lo salto`);
    continue;
  }
  let origin = '';
  try {
    origin = run('git', ['remote', 'get-url', 'origin'], repo).trim();
  } catch {}
  const label = repo.replace(homedir(), '~');
  if (!opts.includeGithub && /github\.com/i.test(origin)) {
    console.log(`· ${label}: está en GitHub, lo salto (GitHub ya lo cuenta)`);
    continue;
  }
  if (opts.fetch) {
    try {
      run('git', ['fetch', '--all', '--quiet'], repo);
    } catch (err) {
      console.warn(`· ${label}: no se pudo hacer fetch (${err.message.split('\n')[0]}), cuento lo que hay local`);
    }
  }
  const authorArgs = opts.authors.map((a) => `--author=${a}`);
  let out = '';
  try {
    // --all: todas las ramas (locales y remotas); un commit cuenta una sola vez.
    // Sin --since: git deja de recorrer la historia al primer commit viejo (por
    // fecha de commit), y con rebases o cherry-picks se perdería trabajo reciente.
    // Se filtra abajo por fecha de autor.
    out = run('git', ['log', '--all', '--no-merges', ...authorArgs, '--format=%H %at'], repo);
  } catch (err) {
    console.warn(`· ${label}: git log falló (${err.message.split('\n')[0]})`);
    continue;
  }
  let commits = 0;
  for (const line of out.split('\n')) {
    const [hash, at] = line.trim().split(' ');
    if (!hash || seen.has(hash)) continue;
    seen.add(hash);
    const ms = Number(at) * 1000;
    if (ms < sinceMs) continue;
    add(dayOf(ms));
    commits++;
  }
  summary.push({ repo: label, name: codecommitName(origin), commits, prs: 0 });
}

// ---- PRs (opcional) ----
if (opts.prs) {
  const aws = (argv) => JSON.parse(run('aws', [...argv, '--output', 'json']));
  let arn = opts.authorArn;
  try {
    arn ??= aws(['sts', 'get-caller-identity']).Arn;
  } catch (err) {
    fail(`No pude leer tu sesión de AWS (${err.message.split('\n')[0]}). Inicia sesión (aws sso login) o pasa --author-arn.`);
  }
  console.log(`· PRs abiertos por ${arn}`);
  for (const s of summary) {
    if (!s.name) {
      console.warn(`· ${s.repo}: su origin no es de CodeCommit, no busco PRs`);
      continue;
    }
    const ids = [];
    for (const status of ['OPEN', 'CLOSED']) {
      let token;
      do {
        const page = aws(['codecommit', 'list-pull-requests', '--repository-name', s.name, '--author-arn', arn, '--pull-request-status', status, ...(token ? ['--next-token', token] : [])]);
        ids.push(...(page.pullRequestIds ?? []));
        token = page.nextToken;
      } while (token);
    }
    for (const id of ids) {
      const pr = aws(['codecommit', 'get-pull-request', '--pull-request-id', id]).pullRequest;
      const created = new Date(pr.creationDate).getTime();
      if (created < sinceMs) continue;
      add(dayOf(created));
      s.prs++;
    }
  }
}

// ---- Resultado ----
const sorted = Object.fromEntries(Object.entries(days).sort(([a], [b]) => a.localeCompare(b)));
const total = Object.values(sorted).reduce((a, b) => a + b, 0);

console.log('\nResumen (esto solo se muestra aquí; no va en el archivo):');
for (const s of summary) console.log(`  ${s.repo}: ${s.commits} commits${opts.prs ? ` · ${s.prs} PRs` : ''}`);
console.log(`  Total: ${total} contribuciones en ${Object.keys(sorted).length} días\n`);

if (opts.dryRun) {
  console.log('--dry-run: no se escribió ningún archivo.');
} else {
  const file = {
    source: 'CodeCommit (Global66)',
    updated: dayOf(Date.now()),
    days: sorted,
  };
  writeFileSync(opts.out, `${JSON.stringify(file, null, 2)}\n`);
  console.log(`✓ Guardado en ${resolve(opts.out)}`);
  console.log('  Cópialo al portafolio como src/data/contributions-extra.json y vuelve a compilar.');
}
