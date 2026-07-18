import { describe, expect, it } from 'vitest'
import { analyseContract } from './analysis'

describe('analyseContract', () => {
  it('detects critical unlimited liability language', () => {
    const result = analyseContract('Vendor shall accept unlimited liability without limitation. Buyer will pay USD 5,000 within 10 days.')
    expect(result.risk).toBe('critical')
    expect(result.findings.some(finding => finding.title === 'Unlimited liability exposure')).toBe(true)
    expect(result.monetaryTerms).toContain('USD 5,000')
  })

  it('extracts obligations and deadlines', () => {
    const result = analyseContract('Supplier shall deliver the report by September 30, 2026. Customer must pay within 15 business days. Liability is capped and confidential data is protected. Either party may terminate for breach. Disputes are resolved by arbitration.')
    expect(result.obligations.length).toBeGreaterThanOrEqual(2)
    expect(result.deadlines).toContain('September 30, 2026')
    expect(result.deadlines).toContain('within 15 business days')
  })

  it('reports missing core clauses', () => {
    const result = analyseContract('Designer will provide a logo package by August 12, 2026.')
    expect(result.missingClauses).toContain('Liability')
    expect(result.missingClauses).toContain('Payment')
  })
})
