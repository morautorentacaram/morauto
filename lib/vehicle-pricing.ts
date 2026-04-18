type DecimalLike = { toNumber?: () => number; toString?: () => string }

type VehicleLike = {
  dailyRate?: DecimalLike | number | string | null
  weeklyRate?: DecimalLike | number | string | null
  monthlyRate?: DecimalLike | number | string | null
  depositValue?: DecimalLike | number | string | null
}

type CategoryLike = {
  dailyRate: DecimalLike | number | string
  weeklyRate?: DecimalLike | number | string | null
  monthlyRate?: DecimalLike | number | string | null
  depositValue: DecimalLike | number | string
}

function toNum(v: unknown): number {
  if (v === null || v === undefined) return 0
  if (typeof v === "number") return v
  if (typeof v === "string") return Number(v) || 0
  if (typeof (v as any).toNumber === "function") return (v as any).toNumber()
  return Number(v) || 0
}

export type EffectivePrices = {
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  depositValue: number
}

export function getEffectivePrices(
  vehicle: VehicleLike,
  category: CategoryLike
): EffectivePrices {
  const daily = vehicle.dailyRate != null ? toNum(vehicle.dailyRate) : toNum(category.dailyRate)
  const deposit = vehicle.depositValue != null ? toNum(vehicle.depositValue) : toNum(category.depositValue)
  const vw = vehicle.weeklyRate != null ? toNum(vehicle.weeklyRate) : (category.weeklyRate != null ? toNum(category.weeklyRate) : null)
  const vm = vehicle.monthlyRate != null ? toNum(vehicle.monthlyRate) : (category.monthlyRate != null ? toNum(category.monthlyRate) : null)
  return {
    dailyRate: daily,
    weeklyRate: vw,
    monthlyRate: vm,
    depositValue: deposit,
  }
}

export function getEffectiveDaily(vehicle: VehicleLike, category: CategoryLike): number {
  return vehicle.dailyRate != null ? toNum(vehicle.dailyRate) : toNum(category.dailyRate)
}

export function getEffectiveDeposit(vehicle: VehicleLike, category: CategoryLike): number {
  return vehicle.depositValue != null ? toNum(vehicle.depositValue) : toNum(category.depositValue)
}
