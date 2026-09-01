import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'
import { emptyPeople, paidToInput, parsePaid, uid } from './format'
import type { Person, SharePayload } from './types'

export const STORAGE_KEY = 'verrekenen:v1'
const HASH_PREFIX = 's='
const MAX_PEOPLE = 50
const MAX_NAME_LEN = 80
const MAX_PAID = 1_000_000_000_000

function isSharePayload(value: unknown): value is SharePayload {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  if (record.v !== 1 || !Array.isArray(record.people)) return false
  if (record.people.length < 1 || record.people.length > MAX_PEOPLE) return false
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

function peopleFromPayload(payload: SharePayload): Person[] {
  const people = payload.people.map((row) => ({
    id: uid(),
    name: row.name.slice(0, MAX_NAME_LEN),
    paid: paidToInput(row.paid),
  }))
  while (people.length < 2) people.push({ id: uid(), name: '', paid: '' })
  return people
}

export function encodePeople(people: Person[]): string {
  const payload: SharePayload = {
    v: 1,
    people: people.slice(0, MAX_PEOPLE).map((person) => ({
      name: person.name.slice(0, MAX_NAME_LEN),
      paid: Math.min(MAX_PAID, Math.max(0, parsePaid(person.paid))),
    })),
  }
  return compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodePeople(raw: string): Person[] | null {
  try {
    const json = decompressFromEncodedURIComponent(raw)
    if (!json) return null
    const parsed: unknown = JSON.parse(json)
    if (!isSharePayload(parsed)) return null
    return peopleFromPayload(parsed)
  } catch {
    return null
  }
}

export function readHash(): Person[] | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash.startsWith(HASH_PREFIX)) return null
  const encoded = hash.slice(HASH_PREFIX.length)
  if (!encoded) return null
  return decodePeople(encoded)
}

export function writeHash(people: Person[]): void {
  if (typeof window === 'undefined') return
  const encoded = encodePeople(people)
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#${HASH_PREFIX}${encoded}`,
  )
}

export function loadFromLocalStorage(): Person[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isSharePayload(parsed)) return null
    return peopleFromPayload(parsed)
  } catch {
    return null
  }
}

export function saveToLocalStorage(people: Person[]): void {
  if (typeof window === 'undefined') return
  const payload: SharePayload = {
    v: 1,
    people: people.slice(0, MAX_PEOPLE).map((person) => ({
      name: person.name.slice(0, MAX_NAME_LEN),
      paid: Math.min(MAX_PAID, Math.max(0, parsePaid(person.paid))),
    })),
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota of private mode: negeren.
  }
}

export function loadInitialPeople(): Person[] {
  return readHash() ?? loadFromLocalStorage() ?? emptyPeople()
}

export function persistPeople(people: Person[]): void {
  saveToLocalStorage(people)
  writeHash(people)
}

export function shareUrl(people: Person[]): string {
  return `${window.location.origin}${window.location.pathname}${window.location.search}#${HASH_PREFIX}${encodePeople(people)}`
}

export async function copyShareUrl(people: Person[]): Promise<boolean> {
  const url = shareUrl(people)
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
