<template>
  <nav class="crumbs mono" aria-label="Breadcrumb">
    <template v-for="(c, i) in items" :key="i">
      <a v-if="c.href" :href="c.href">{{ c.label }}</a>
      <span v-else class="current" aria-current="page">{{ c.label }}</span>
      <span v-if="i < items.length - 1" aria-hidden="true">/</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ items: { label: string; href?: string }[] }>();
</script>

<style scoped>
.crumbs { display: flex; gap: 8px; flex-wrap: wrap; font-size: 12px; color: var(--muted); }
.crumbs a { color: var(--muted); }
.crumbs a:hover { color: var(--fg); }
.current { color: var(--fg); }
</style>
