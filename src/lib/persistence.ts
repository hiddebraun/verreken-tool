import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'
import { emptyPeople, paidToInput, parsePaid, uid } from './format'
import type { Person, SettlementState, SharePayload } from './types'

export const STORAGE_KEY = 'verrekenen:v1'
const HASH_PREFIX = 's='
const MAX_PEOPLE = 50
const MAX_NAME_LEN = 80
const MAX_TITLE_LEN = 80
const MAX_PAID = 1_000_000_000_000

function isSharePayload(value: unknown): value is SharePayload {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  if (record.v !== 1 || !Array.isArray(record.people)) return false
  if (record.people.length < 1 || record.people.length > MAX_PEOPLE) return false
  if (record.title !== undefined && typeof record.title !== 'string') return false
  return record.people.every((person) => {
    if (typeof person !== 'object' || person === null) return false
    const row = person as Record<string, unknown>
    return (
      typeof row.name === 'string' &&
      row.name.length <= MAX_NAME_LEN &&
      typeof row.paid === 'number' &&
      Number.isFinite(row.paid) &&
      row.paid >= 0 &&
      row.paid <= MAX_PAID
    )
  })
}

function titleFromPayload(payload: SharePayload): string {
  return (payload.title ?? '').slice(0, MAX_TITLE_LEN)
}

function peopleFromPayload(payload: SharePayload): Person[] {
  const people = payload.people.map((row) => ({
    id: uid(),
    name: row.name.slice(0, MAX_NAME_LEN),
    paid: paidToInput(row.paid),
  }))
  while (people.length < 2) people.push({ id: uid(), name: '', paid: '' })
  return people
}

function stateFromPayload(payload: SharePayload): SettlementState {
  return {
    title: titleFromPayload(payload),
    people: peopleFromPayload(payload),
  }
}

function toPayload(state: SettlementState): SharePayload {
  const title = state.title.trim().slice(0, MAX_TITLE_LEN)
  const payload: SharePayload = {
    v: 1,
    people: state.people.slice(0, MAX_PEOPLE).map((person) => ({
      name: person.name.slice(0, MAX_NAME_LEN),
      paid: Math.min(MAX_PAID, Math.max(0, parsePaid(person.paid))),
    })),
  }
  if (title) payload.title = title
  return payload
}

function encodeState(state: SettlementState): string {
  return compressToEncodedURIComponent(JSON.stringify(toPayload(state)))
}

function decodeState(raw: string): SettlementState | null {
  try {
    const json = decompressFromEncodedURIComponent(raw)
    if (!json) return null
    const parsed: unknown = JSON.parse(json)
    if (!isSharePayload(parsed)) return null
    return stateFromPayload(parsed)
  } catch {
    return null
  }
}

function emptyState(): SettlementState {
  return { title: '', people: emptyPeople() }
}

export function readHash(): SettlementState | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash.startsWith(HASH_PREFIX)) return null
  const encoded = hash.slice(HASH_PREFIX.length)
  if (!encoded) return null
  return decodeState(encoded)
}

export function writeHash(state: SettlementState): void {
  if (typeof window === 'undefined') return
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#${HASH_PREFIX}${encodeState(state)}`,
  )
}

export function loadFromLocalStorage(): SettlementState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isSharePayload(parsed)) return null
    return stateFromPayload(parsed)
  } catch {
    return null
  }
}

export function saveToLocalStorage(state: SettlementState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPayload(state)))
  } catch {
    // Quota of private mode: negeren.
  }
}

export function loadInitialState(): SettlementState {
  return readHash() ?? loadFromLocalStorage() ?? emptyState()
}

export function persistState(state: SettlementState): void {
  saveToLocalStorage(state)
  writeHash(state)
}

export function shareUrl(state: SettlementState): string {
  return `${window.location.origin}${window.location.pathname}${window.location.search}#${HASH_PREFIX}${encodeState(state)}`
}

export async function copyShareUrl(state: SettlementState): Promise<boolean> {
  const url = shareUrl(state)
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    const input = document.createElement('textarea')
    input.value = url
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    document.body.appendChild(input)
    input.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(input)
    return ok
  }
}
