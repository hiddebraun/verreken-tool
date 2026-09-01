<script setup lang="ts">
import { formatEuro } from '../lib/format'
import type { Balance } from '../lib/types'

defineProps<{
  balances: Balance[]
}>()

function balanceClass(balance: number): string {
  if (balance > 0.005) return 'text-emerald-700'
  if (balance < -0.005) return 'text-rose-700'
  return 'text-zinc-400'
}
</script>

<template>
  <section>
    <h2 class="mb-3 text-sm font-semibold text-zinc-900">Saldo per persoon</h2>
    <ul class="grid gap-2">
      <li
        v-for="row in balances"
        :key="row.id"
        class="flex items-center justify-between text-sm"
      >
        <span class="text-zinc-800">{{ row.name }}</span>
        <span class="font-mono text-[13.5px]" :class="balanceClass(row.balance)">
          {{ row.balance > 0.005 ? '+ ' : '' }}{{ formatEuro(row.balance) }}
        </span>
      </li>
    </ul>
  </section>
</template>
