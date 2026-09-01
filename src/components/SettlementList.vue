<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { formatEuro } from '../lib/format'
import type { Transaction } from '../lib/types'

defineProps<{
  transactions: Transaction[]
}>()
</script>

<template>
  <section>
    <h2 class="mb-3 text-sm font-semibold text-zinc-900">Te betalen</h2>
    <p v-if="transactions.length === 0" class="text-sm text-zinc-400">
      Iedereen staat quitte.
    </p>
    <ul v-else class="grid gap-2">
      <li
        v-for="(row, index) in transactions"
        :key="`${row.from}-${row.to}-${index}`"
        class="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-zinc-200"
      >
        <div class="flex items-center gap-2.5 text-[15px] text-zinc-900">
          <span>{{ row.from }}</span>
          <ArrowRight :size="14" class="text-zinc-400" />
          <span>{{ row.to }}</span>
        </div>
        <span class="font-mono text-[15px] text-zinc-900">{{ formatEuro(row.amount) }}</span>
      </li>
    </ul>
  </section>
</template>
