export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export interface ClauseFinding {
  id: string
  category: string
  title: string
  text: string
  risk: RiskLevel
  rationale: string
  confidence: number
}

export interface Obligation {
  id: string
  party: string
  action: string
  due: string
  source: string
}

export interface ContractAnalysis {
  score: number
  risk: RiskLevel
  findings: ClauseFinding[]
  obligations: Obligation[]
  deadlines: string[]
  monetaryTerms: string[]
  coveredClauses: string[]
  missingClauses: string[]
  summary: string
}

const categories = [
  { name: 'Payment', pattern: /payment|invoice|fee|price|compensation|amount due/i },
  { name: 'Termination', pattern: /terminat|cancel|notice period|breach/i },
  { name: 'Renewal', pattern: /renew|extension|successive term/i },
  { name: 'Confidentiality', pattern: /confidential|non-disclosure|proprietary/i },
  { name: 'Liability', pattern: /liabil|indemnif|damages|hold harmless/i },
  { name: 'Data protection', pattern: /personal data|privacy|data protection|security incident/i },
  { name: 'Deliverables', pattern: /deliverable|milestone|statement of work|acceptance/i },
  { name: 'Dispute', pattern: /dispute|arbitration|governing law|jurisdiction/i },
]

const riskRules: Array<{ pattern: RegExp; risk: RiskLevel; title: string; rationale: string }> = [
  { pattern: /unlimited liability|without limitation/i, risk: 'critical', title: 'Unlimited liability exposure', rationale: 'Liability is not capped, creating potentially unbounded financial exposure.' },
  { pattern: /sole discretion|for any reason or no reason/i, risk: 'high', title: 'One-sided discretion', rationale: 'A party may act without an objective standard or mutual approval.' },
  { pattern: /automatically renew|automatic renewal/i, risk: 'high', title: 'Automatic renewal', rationale: 'The agreement renews unless notice is given inside a specific window.' },
  { pattern: /non-refundable|no refund/i, risk: 'medium', title: 'Non-refundable payment', rationale: 'Fees may remain payable even when expected value is not delivered.' },
  { pattern: /penalty|late fee|interest at/i, risk: 'medium', title: 'Financial penalty', rationale: 'Late performance or payment may trigger additional charges.' },
  { pattern: /perpetual|irrevocable|worldwide license/i, risk: 'high', title: 'Broad intellectual-property license', rationale: 'Rights may continue indefinitely and across all territories.' },
  { pattern: /immediately terminate|without notice/i, risk: 'high', title: 'Immediate termination right', rationale: 'The clause may permit termination without a reasonable cure period.' },
]

const splitSentences = (text: string) => text
  .replace(/\r/g, '')
  .split(/(?<=[.!?;])\s+|\n+/)
  .map(sentence => sentence.trim())
  .filter(sentence => sentence.length > 18)

const unique = (values: string[]) => [...new Set(values.map(value => value.trim()).filter(Boolean))]

export function analyseContract(text: string): ContractAnalysis {
  const clean = text.replace(/\s+/g, ' ').trim()
  const sentences = splitSentences(text)
  const coveredClauses = categories.filter(category => category.pattern.test(clean)).map(category => category.name)
  const required = ['Payment', 'Termination', 'Liability', 'Confidentiality', 'Dispute']
  const missingClauses = required.filter(item => !coveredClauses.includes(item))

  const findings: ClauseFinding[] = []
  for (const sentence of sentences) {
    for (const rule of riskRules) {
      if (rule.pattern.test(sentence)) {
        findings.push({
          id: `finding-${findings.length + 1}`,
          category: categories.find(category => category.pattern.test(sentence))?.name ?? 'Commercial terms',
          title: rule.title,
          text: sentence,
          risk: rule.risk,
          rationale: rule.rationale,
          confidence: rule.risk === 'critical' ? 96 : 89,
        })
      }
    }
  }

  for (const clause of missingClauses) {
    findings.push({
      id: `finding-${findings.length + 1}`,
      category: clause,
      title: `Missing ${clause.toLowerCase()} clause`,
      text: `No clear ${clause.toLowerCase()} provision was detected in the supplied text.`,
      risk: clause === 'Liability' || clause === 'Termination' ? 'high' : 'medium',
      rationale: `A clear ${clause.toLowerCase()} provision reduces ambiguity and future disputes.`,
      confidence: 78,
    })
  }

  const obligationPattern = /\b(shall|must|agrees to|required to|will provide|will deliver|will pay)\b/i
  const obligations = sentences.filter(sentence => obligationPattern.test(sentence)).slice(0, 12).map((sentence, index) => {
    const partyMatch = sentence.match(/^([A-Z][A-Za-z &-]{1,45}?)(?:\s+shall|\s+must|\s+agrees to|\s+will)/)
    const dueMatch = sentence.match(/(?:within|no later than|by)\s+[^,.;]{2,45}/i)
    return {
      id: `obligation-${index + 1}`,
      party: partyMatch?.[1]?.trim() ?? 'Responsible party',
      action: sentence.length > 150 ? `${sentence.slice(0, 147)}…` : sentence,
      due: dueMatch?.[0] ?? 'No explicit deadline',
      source: `Clause ${index + 1}`,
    }
  })

  const datePattern = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\bwithin\s+\d+\s+(?:business\s+)?days\b|\b\d+\s+days?\s+(?:before|after)\b/gi
  const moneyPattern = /(?:USD|EUR|GBP|SAR|AED|ILS|\$|€|£)\s?\d[\d,]*(?:\.\d{2})?|\d[\d,]*(?:\.\d{2})?\s?(?:USD|EUR|GBP|SAR|AED|ILS)/gi
  const deadlines = unique(clean.match(datePattern) ?? [])
  const monetaryTerms = unique(clean.match(moneyPattern) ?? [])

  const weights: Record<RiskLevel, number> = { critical: 20, high: 11, medium: 5, low: 2 }
  const score = Math.max(18, Math.min(98, 96 - findings.reduce((sum, finding) => sum + weights[finding.risk], 0)))
  const risk: RiskLevel = findings.some(f => f.risk === 'critical') ? 'critical' : score < 55 ? 'high' : score < 76 ? 'medium' : 'low'
  const summary = clean
    ? `${coveredClauses.length} clause families detected, ${obligations.length} obligations extracted, and ${findings.length} review items identified.`
    : 'Add contract text to generate a private, local analysis.'

  return { score, risk, findings, obligations, deadlines, monetaryTerms, coveredClauses, missingClauses, summary }
}
