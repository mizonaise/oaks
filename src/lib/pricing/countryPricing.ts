/**
 * Country pricing: VAT rates and the promotions in force for a country, from
 * `www.tecnibo.com/api/oaksome/pricing?country_code=<CC>&price_ht=<HT>`.
 *
 * The endpoint does NOT return a computed total: it hands back the raw VAT
 * rates and the promotion list, and the caller applies them. `applyPromotions`
 * and `computeCountryPrice` below are that calculation, kept pure and separate
 * from the fetch so they can be unit-tested without a network.
 */

/** The two VAT rates the country levies, as percentages (e.g. `21`, `6`). */
export interface CountryTva {
  default_rate: number
  reduced_rate: number
}

/**
 * One promotion. `discount_pct` is overloaded and must be read together with
 * `discount_type`: a percentage off for `percentage`, an absolute euro amount
 * off for `fixed_amount` (so `discount_pct: 100` there means €100, not 100%).
 */
export interface CountryPromotion {
  id: number
  name: string
  discount_pct: number
  discount_type: 'percentage' | 'fixed_amount'
  /** ISO dates (`YYYY-MM-DD`) bounding the promotion. */
  date_from: string
  date_to: string
  /** Application order, ascending. Ties keep the endpoint's own order. */
  sequence: number
}

export interface CountryPricingData {
  country_code: string
  tva: CountryTva
  promotions: CountryPromotion[]
  code_promo: string | null
}

export interface CountryPricingResponse {
  success: boolean
  data: CountryPricingData | null
}

/** One promotion's effect on the running total, for the price-details lines. */
export interface AppliedPromotion {
  promotion: CountryPromotion
  /** Running net before this promotion. */
  before: number
  /** Euros this promotion took off (`before - after`), never negative. */
  amount: number
  /** Running net after this promotion. */
  after: number
}

export interface CountryPrice {
  /** The gross excl.-VAT price, before any promotion. */
  grossHt: number
  /** The excl.-VAT price after every promotion. */
  netHt: number
  /** Total euros discounted (`grossHt - netHt`). */
  discount: number
  /** Each promotion's step, in the order applied. */
  applied: AppliedPromotion[]
  /** The headline price: `netHt` incl. VAT at the DEFAULT rate. */
  ttc: number
  /** The VAT itself, in euros (`ttc - netHt`), for the detail breakdown. */
  vat: number
  /** `netHt` incl. VAT at the reduced rate — shown for reference only. */
  ttcReduced: number
  tva: CountryTva
}

/** Rounds to cents, keeping money out of binary-float drift (0.1+0.2 territory). */
function round2 (n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * Applies promotions to an excl.-VAT price, cascading: each one discounts the
 * running total left by the previous, in ascending `sequence` order. So 10%
 * then 20% on 943.40 gives 943.40 × 0.9 × 0.8 = 679.25, not a flat 30% off.
 *
 * Ties on `sequence` keep the endpoint's own order (the sort is stable), and
 * the running total is floored at 0 so a large `fixed_amount` cannot drive the
 * price negative. Dates are NOT checked: the endpoint is trusted to return only
 * the promotions in force.
 */
export function applyPromotions (
  priceHt: number,
  promotions: CountryPromotion[]
): { netHt: number; applied: AppliedPromotion[] } {
  const ordered = [...promotions].sort((a, b) => a.sequence - b.sequence)

  let running = priceHt
  const applied: AppliedPromotion[] = []

  for (const promotion of ordered) {
    const pct = promotion.discount_pct
    if (!Number.isFinite(pct) || pct <= 0) continue

    const before = running
    const raw =
      promotion.discount_type === 'fixed_amount'
        ? before - pct
        : before * (1 - pct / 100)
    const after = round2(Math.max(0, raw))

    applied.push({ promotion, before, amount: round2(before - after), after })
    running = after
  }

  return { netHt: round2(running), applied }
}

/**
 * The full calculation: promotions off the excl.-VAT price, then VAT on what is
 * left. `ttc` uses the country's DEFAULT rate; `ttcReduced` carries the reduced
 * rate alongside it for display, and is not the headline figure.
 */
export function computeCountryPrice (
  priceHt: number,
  data: CountryPricingData
): CountryPrice {
  const { netHt, applied } = applyPromotions(priceHt, data.promotions ?? [])
  const { default_rate: defaultRate, reduced_rate: reducedRate } = data.tva

  const ttc = round2(netHt * (1 + defaultRate / 100))

  return {
    grossHt: round2(priceHt),
    netHt,
    discount: round2(priceHt - netHt),
    applied,
    ttc,
    // Derived from the rounded `ttc` rather than computed independently, so
    // netHt + vat === ttc exactly and the detail lines add up on screen.
    vat: round2(ttc - netHt),
    ttcReduced: round2(netHt * (1 + reducedRate / 100)),
    tva: data.tva
  }
}
