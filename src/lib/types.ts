export type Person = {
  id: string
  name: string
  paid: string
}

export type Balance = {
  id: string
  name: string
  paid: number
  balance: number
}

export type Transaction = {
  from: string
  to: string
  amount: number
}

export type Settlement = {
  total: number
  share: number
  balances: Balance[]
  transactions: Transaction[]
}

export type SharePayload = {
  v: 1
  people: { name: string; paid: number }[]
}
