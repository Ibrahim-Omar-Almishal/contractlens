export interface ContractDocument {
  id: string
  name: string
  counterparty: string
  type: string
  value: number
  currency: string
  status: 'Review' | 'Active' | 'Draft'
  updatedAt: string
  content: string
}

export const demoContracts: ContractDocument[] = [
  {
    id: 'msa-northstar',
    name: 'Northstar Cloud MSA',
    counterparty: 'Northstar Labs',
    type: 'SaaS agreement',
    value: 84000,
    currency: 'USD',
    status: 'Review',
    updatedAt: '2026-07-15',
    content: `MASTER SERVICES AGREEMENT\n\nCustomer shall pay Provider USD 7,000 per month within 15 business days after receipt of a valid invoice. Provider shall deliver the implementation milestone by September 30, 2026 and maintain 99.9% monthly availability. The agreement automatically renews for successive twelve-month terms unless either party provides notice 45 days before renewal.\n\nEach party must protect Confidential Information using reasonable safeguards. Provider will notify Customer of a security incident within 48 hours. Provider grants Customer a worldwide license to use the deliverables during the subscription term. Customer may terminate for material breach after a 30-day cure period. Provider's aggregate liability is limited to fees paid in the preceding twelve months. This agreement is governed by the laws of England and disputes shall be resolved by arbitration in London.`,
  },
  {
    id: 'vendor-apex',
    name: 'Apex Vendor Framework',
    counterparty: 'Apex Supply Co.',
    type: 'Vendor agreement',
    value: 146000,
    currency: 'USD',
    status: 'Review',
    updatedAt: '2026-07-12',
    content: `VENDOR FRAMEWORK AGREEMENT\n\nVendor shall deliver all equipment no later than October 15, 2026. Buyer will pay USD 146,000 within 30 days after acceptance. All deposits are non-refundable. Buyer may immediately terminate without notice at its sole discretion. Vendor shall indemnify Buyer against all claims and accepts unlimited liability without limitation.\n\nVendor grants Buyer a perpetual irrevocable worldwide license to all work product. The agreement automatically renews for one year unless Vendor gives 90 days notice. Late delivery triggers a penalty of USD 2,500 per day. Confidential information must be protected for five years.`,
  },
  {
    id: 'consulting-pulse',
    name: 'Pulse Transformation SOW',
    counterparty: 'Pulse Retail Group',
    type: 'Consulting SOW',
    value: 42000,
    currency: 'EUR',
    status: 'Active',
    updatedAt: '2026-07-08',
    content: `STATEMENT OF WORK\n\nConsultant will deliver the discovery report by August 12, 2026 and the operating model within 20 business days after approval. Client shall pay EUR 14,000 at each accepted milestone. Client must review deliverables within 7 days.\n\nBoth parties agree to keep business information confidential. Either party may terminate for material breach after a 14-day cure period. Total liability is capped at the fees paid under this statement of work. The parties will first attempt good-faith negotiation and any unresolved dispute is governed by the laws of the Netherlands.`,
  },
]
