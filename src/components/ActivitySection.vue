<template>
  <!-- Commits y PRs del último año: GitHub + CodeCommit (lib/contributions.ts) -->
  <section id="actividad" class="sheet" data-screen-label="Actividad">
    <SheetLabel no="04" :label="t.activityUp" />
    <p class="lead-serif line">{{ t.activityLine }}</p>
    <ContributionGraph :cal="cal" :series="[t.srcGithub, t.srcAws]" :unit="[t.contribOne, t.contribMany]" />
  </section>
</template>

<script setup lang="ts">
import SheetLabel from './SheetLabel.vue';
import ContributionGraph from './ContributionGraph.vue';
import type { Calendar } from '../lib/calendar';
import { t } from '../lib/site';

defineProps<{ cal: Calendar }>();
</script>

<style scoped>
.line { margin-bottom: 28px; max-width: 22em; }
</style>
