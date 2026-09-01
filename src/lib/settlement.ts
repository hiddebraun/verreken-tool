import type { Settlement } from './types'

export function computeSettlement(
  people: { id: string; name: string; paid: number }[],
): Settlement {
  const total = people.reduce((sum, person) => sum + (Number(person.paid) || 0), 0)
  const share = people.length ? total / people.length : 0

  const balances = people.map((person) => ({
    id: person.id,
    name: person.name || 'Naamloos',
    paid: Number(person.paid) || 0,
    balance: Math.round(((Number(person.paid) || 0) - share) * 100) / 100,
  }))

  const creditors = balances
    .filter((b) => b.balance > 0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance)
  const debtors = balances
    .filter((b) => b.balance < -0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.balance - b.balance)

  const transactions: Settlement['transactions'] = []
  let ci = 0
  let di = 0
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]
    const amount = Math.min(creditor.balance, -debtor.balance)
    const rounded = Math.round(amount * 100) / 100
    if (rounded > 0.005) {
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount: rounded,
      })
    }
    creditor.balance = Math.round((creditor.balance - amount) * 100) / 100
    debtor.balance = Math.round((debtor.balance + amount) * 100) / 100
    if (Math.abs(creditor.balance) < 0.01) ci++
    if (Math.abs(debtor.balance) < 0.01) di++
  }

  return { total, share, balances, transactions }
}
