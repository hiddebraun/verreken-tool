<script setup lang="ts">
import { Plus, Trash2 } from '@lucide/vue'
import type { Person } from '../lib/types'

defineProps<{
  people: Person[]
}>()

const emit = defineEmits<{
  add: []
  remove: [id: string]
  updateName: [id: string, name: string]
  updatePaid: [id: string, paid: string]
}>()

function onNameInput(id: string, event: Event) {
  emit('updateName', id, (event.target as HTMLInputElement).value)
}

function onPaidInput(id: string, event: Event) {
  emit('updatePaid', id, (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200">
    <div
      class="grid grid-cols-[minmax(0,1fr)_8rem_2.5rem] gap-2 border-b border-zinc-100 px-4 py-2.5 text-xs font-medium tracking-wide text-zinc-400 uppercase"
    >
      <span>Naam</span>
      <span class="text-right">Totaal betaald</span>
      <span />
    </div>

    <div
      v-for="person in people"
      :key="person.id"
        class="grid grid-cols-[minmax(0,1fr)_8rem_2.5rem] items-center gap-2 border-b border-zinc-100 px-4 py-1.5 last:border-b-0"
    >
      <input
        :value="person.name"
        type="text"
        maxlength="80"
        placeholder="Naam"
        autocomplete="name"
        class="w-full bg-transparent py-2 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-300"
        @input="onNameInput(person.id, $event)"
      />
      <div class="flex items-center justify-end">
        <span class="mr-1 font-mono text-sm text-zinc-400">€</span>
        <input
          :value="person.paid"
          type="text"
          inputmode="decimal"
          placeholder="0,00"
          class="w-[5.5rem] bg-transparent py-2 text-right font-mono text-[15px] text-zinc-900 outline-none placeholder:text-zinc-300"
          @input="onPaidInput(person.id, $event)"
        />
      </div>
      <button
        type="button"
        class="flex items-center justify-center rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-20"
        :disabled="people.length <= 2"
        :aria-label="`Verwijder ${person.name || 'persoon'}`"
        @click="emit('remove', person.id)"
      >
        <Trash2 :size="15" />
      </button>
    </div>

    <button
      type="button"
      class="flex w-full items-center gap-2 px-4 py-3 text-sm text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
      @click="emit('add')"
    >
      <Plus :size="14" />
      Persoon toevoegen
    </button>
  </div>
</template>
