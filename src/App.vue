<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, Link } from '@lucide/vue'
import BalanceList from './components/BalanceList.vue'
import PersonTable from './components/PersonTable.vue'
import SettlementList from './components/SettlementList.vue'
import { emptyPerson, formatEuro, parsePaid } from './lib/format'
import { copyShareUrl, loadInitialState, persistState, shareUrl } from './lib/persistence'
import { computeSettlement } from './lib/settlement'

const initial = loadInitialState()
const title = ref(initial.title)
const people = ref(initial.people)

function currentState() {
  return { title: title.value, people: people.value }
}

persistState(currentState())
document.title = pageTitle(title.value)

const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

watch(
  [title, people],
  () => {
    persistState(currentState())
    document.title = pageTitle(title.value)
  },
  { deep: true },
)

const parsed = computed(() =>
  people.value.map((person) => ({
    ...person,
    paid: parsePaid(person.paid),
  })),
)

const result = computed(() => computeSettlement(parsed.value))

function pageTitle(value: string): string {
  const trimmed = value.trim()
  return trimmed ? `${trimmed} · Wie betaalt wie` : 'Wie betaalt wie'
}

function updateName(id: string, name: string) {
  const person = people.value.find((row) => row.id === id)
  if (person) person.name = name
}

function updatePaid(id: string, paid: string) {
  const person = people.value.find((row) => row.id === id)
  if (person) person.paid = paid
}

function addPerson() {
  people.value.push(emptyPerson())
}

function removePerson(id: string) {
  if (people.value.length <= 2) return
  const index = people.value.findIndex((row) => row.id === id)
  if (index !== -1) people.value.splice(index, 1)
}

async function copyLink() {
  const state = currentState()
  const ok = await copyShareUrl(state)
  if (!ok) {
    window.prompt('Kopieer deze link:', shareUrl(state))
    return
  }
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="min-h-dvh bg-zinc-100 text-zinc-900">
    <main class="mx-auto max-w-lg px-4 py-10 sm:py-14">
      <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium tracking-wide text-zinc-400 uppercase">
            Wie betaalt wie
          </p>
          <input
            v-model="title"
            type="text"
            maxlength="80"
            placeholder="Titel van de verrekening"
            aria-label="Titel van de verrekening"
            class="mt-1 w-full bg-transparent text-2xl font-semibold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-300"
          />
          <p class="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
            Vul in wie wat in totaal heeft betaald. De kosten worden gelijk verdeeld
            en hieronder verschijnt het kleinst mogelijke aantal overboekingen.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-700"
          @click="copyLink"
        >
          <Check v-if="copied" :size="14" />
          <Link v-else :size="14" />
          {{ copied ? 'Gekopieerd' : 'Link kopiëren' }}
        </button>
      </header>

      <PersonTable
        :people="people"
        @add="addPerson"
        @remove="removePerson"
        @update-name="updateName"
        @update-paid="updatePaid"
      />

      <div class="flex justify-between px-1 py-4 text-sm text-zinc-500">
        <span>Totaal: {{ formatEuro(result.total) }}</span>
        <span>Aandeel: {{ formatEuro(result.share) }}</span>
      </div>

      <BalanceList class="mt-2" :balances="result.balances" />
      <SettlementList class="mt-8" :transactions="result.transactions" />
    </main>
  </div>
</template>
