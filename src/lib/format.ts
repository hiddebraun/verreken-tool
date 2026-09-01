import type { Person } from './types'

export function uid(): string {
  return crypto.randomUUID()
}

export function emptyPerson(): Person {
  return { id: uid(), name: '', paid: '' }
}

export function emptyPeople(): Person[] {
  return [emptyPerson(), emptyPerson()]
}

export function parsePaid(value: string): number {
  const n = parseFloat(String(value).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function paidToInput(n: number): string {
  if (n === 0) return ''
  return String(n).replace('.', ',')
}

export function formatEuro(n: number): string {
  return (
    (n < 0 ? '\u2013 ' : '') +
    '\u20ac ' +
    Math.abs(n).toLocaleString('nl-NL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}
