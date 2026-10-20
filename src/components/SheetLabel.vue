<template>
  <div class="sheet-label mono">
    <span class="diamond"></span>
    <span class="name">{{ t.sheetUp }} {{ no }} · {{ label }}</span>
    <span class="line"></span>
    <span class="right">{{ right ?? `${no} / 06` }}</span>
  </div>
</template>

<script setup lang="ts">
import { t } from '../lib/site';

defineProps<{ no: string; label: string; right?: string }>();
</script>

<style scoped>
.sheet-label {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  letter-spacing: .1em;
  color: var(--muted);
  margin-bottom: 16px;
}
.name { white-space: nowrap; flex: none; }
.line { flex: 1; height: 1px; background: var(--rule); display: block; }
.right { white-space: nowrap; }
</style>
