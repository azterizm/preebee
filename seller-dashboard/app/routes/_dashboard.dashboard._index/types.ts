export enum ActiveIncomeTime {
  Day,
  Month,
  Year
}

export const activeIncomeTimeKeys = Object.values(ActiveIncomeTime as object).slice(0, 3) as ['Day', 'Month', 'Year']
