import { useEffect, useMemo, useState } from 'react'
import { analyseContract, type Obligation, type RiskLevel } from './analysis'
import { demoContracts, type ContractDocument } from './data'

type Language = 'en' | 'ar'
type View = 'overview' | 'documents' | 'obligations' | 'calendar'

const copy = {
  en: {
    overview: 'Overview', documents: 'Documents', obligations: 'Obligations', calendar: 'Deadlines',
    workspace: 'Legal workspace', heading: 'Contract intelligence, without the data leak.', subheading: 'Surface obligations, deadlines and commercial risk locally in your browser.',
    add: 'Analyze contract', portfolio: 'Contract portfolio', search: 'Search contracts…', review: 'Needs review', active: 'Active', draft: 'Draft',
    exposure: 'Portfolio exposure', health: 'Average health', deadlines30: 'Deadlines · 30d', reviewItems: 'Review items',
    priority: 'Priority review', recent: 'Recently analyzed', all: 'View all', score: 'Health score', clauses: 'Clauses detected',
    riskSignals: 'Risk signals', keyDates: 'Key dates', money: 'Monetary terms', missing: 'Missing safeguards',
    summary: 'Executive summary', findings: 'Findings', obligation: 'Obligations', source: 'Source', owner: 'Responsible party', due: 'Due',
    export: 'Export report', print: 'Print', privacy: 'Private by design', local: 'Analysis stays on this device',
    newTitle: 'Analyze a new contract', name: 'Document name', counterparty: 'Counterparty', paste: 'Paste contract text', cancel: 'Cancel', analyze: 'Run local analysis',
    empty: 'No contracts match this filter.', complete: 'Complete', open: 'Open', noDeadline: 'No explicit deadline',
  },
  ar: {
    overview: 'نظرة عامة', documents: 'المستندات', obligations: 'الالتزامات', calendar: 'المواعيد',
    workspace: 'مساحة العمل القانونية', heading: 'ذكاء العقود دون تسريب البيانات.', subheading: 'اكتشف الالتزامات والمواعيد والمخاطر التجارية محلياً داخل متصفحك.',
    add: 'تحليل عقد', portfolio: 'محفظة العقود', search: 'ابحث في العقود…', review: 'تحتاج مراجعة', active: 'نشطة', draft: 'مسودة',
    exposure: 'قيمة العقود', health: 'متوسط السلامة', deadlines30: 'مواعيد خلال 30 يوماً', reviewItems: 'بنود للمراجعة',
    priority: 'مراجعة ذات أولوية', recent: 'آخر العقود المحللة', all: 'عرض الكل', score: 'مؤشر سلامة العقد', clauses: 'أنواع البنود',
    riskSignals: 'إشارات المخاطر', keyDates: 'المواعيد المهمة', money: 'القيم المالية', missing: 'ضمانات مفقودة',
    summary: 'الملخص التنفيذي', findings: 'النتائج', obligation: 'الالتزامات', source: 'المصدر', owner: 'الطرف المسؤول', due: 'الموعد',
    export: 'تصدير التقرير', print: 'طباعة', privacy: 'خصوصية مدمجة', local: 'يبقى التحليل على هذا الجهاز',
    newTitle: 'تحليل عقد جديد', name: 'اسم المستند', counterparty: 'الطرف المقابل', paste: 'الصق نص العقد', cancel: 'إلغاء', analyze: 'تشغيل التحليل المحلي',
    empty: 'لا توجد عقود مطابقة.', complete: 'مكتمل', open: 'مفتوح', noDeadline: 'لا يوجد موعد صريح',
  },
} as const

const icons: Record<string, React.ReactNode> = {
  overview: <><path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z" /></>,
  documents: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v5h5M9 13h6M9 17h6" /></>,
  obligations: <><path d="M9 11l2 2 4-5" /><circle cx="12" cy="12" r="9" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <><path d="M20 15.2A8 8 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2z" /></>,
  shield: <><path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="m9 12 2 2 4-5" /></>,
  export: <><path d="M12 3v12M7 8l5-5 5 5" /><path d="M5 14v6h14v-6" /></>,
  chevron: <><path d="m9 18 6-6-6-6" /></>,
  alert: <><path d="M12 3 2.8 20h18.4z" /><path d="M12 9v4M12 17h.01" /></>,
}

function Icon({ name, size = 20 }: { name: keyof typeof icons; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

const riskLabel: Record<RiskLevel, { en: string; ar: string }> = {
  critical: { en: 'Critical', ar: 'حرج' }, high: { en: 'High', ar: 'مرتفع' }, medium: { en: 'Medium', ar: 'متوسط' }, low: { en: 'Low', ar: 'منخفض' },
}

const formatMoney = (value: number, currency: string, language: Language) => new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)

function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('contractlens-language') as Language) || 'en')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('contractlens-theme') as 'light' | 'dark') || 'dark')
  const [view, setView] = useState<View>('overview')
  const [documents, setDocuments] = useState<ContractDocument[]>(() => {
    const saved = localStorage.getItem('contractlens-documents')
    return saved ? JSON.parse(saved) : demoContracts
  })
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | ContractDocument['status']>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState({ name: '', counterparty: '', content: '' })
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => JSON.parse(localStorage.getItem('contractlens-completed') || '{}'))
  const t = copy[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dataset.theme = theme
    localStorage.setItem('contractlens-language', language)
    localStorage.setItem('contractlens-theme', theme)
  }, [language, theme])

  useEffect(() => localStorage.setItem('contractlens-documents', JSON.stringify(documents)), [documents])
  useEffect(() => localStorage.setItem('contractlens-completed', JSON.stringify(completed)), [completed])

  const analyses = useMemo(() => new Map(documents.map(document => [document.id, analyseContract(document.content)])), [documents])
  const selected = documents.find(document => document.id === selectedId) ?? documents[0]
  const analysis = selected ? analyses.get(selected.id)! : analyseContract('')
  const filtered = documents.filter(document => {
    const text = `${document.name} ${document.counterparty} ${document.type}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (status === 'All' || document.status === status)
  })
  const totalValue = documents.reduce((sum, document) => sum + document.value, 0)
  const averageScore = Math.round(documents.reduce((sum, document) => sum + analyses.get(document.id)!.score, 0) / Math.max(documents.length, 1))
  const reviewCount = documents.reduce((sum, document) => sum + analyses.get(document.id)!.findings.length, 0)

  const openDocument = (document: ContractDocument) => {
    setSelectedId(document.id)
    setView('documents')
  }

  const createDocument = () => {
    if (!draft.name.trim() || !draft.content.trim()) return
    const document: ContractDocument = {
      id: `document-${Date.now()}`,
      name: draft.name.trim(), counterparty: draft.counterparty.trim() || 'New counterparty', type: 'Custom agreement',
      value: 0, currency: 'USD', status: 'Review', updatedAt: new Date().toISOString().slice(0, 10), content: draft.content.trim(),
    }
    setDocuments(current => [document, ...current])
    setSelectedId(document.id)
    setDraft({ name: '', counterparty: '', content: '' })
    setModalOpen(false)
    setView('documents')
  }

  const exportReport = () => {
    if (!selected) return
    const blob = new Blob([JSON.stringify({ document: selected, analysis }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${selected.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-analysis.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><span>⌁</span></div><div><strong>ContractLens</strong><small>{t.workspace}</small></div></div>
        <nav aria-label="Primary navigation">
          {(['overview', 'documents', 'obligations', 'calendar'] as View[]).map(item => (
            <button key={item} className={view === item ? 'nav-item active' : 'nav-item'} onClick={() => setView(item)}>
              <Icon name={item} /><span>{t[item]}</span>{item === 'obligations' && <em>{reviewCount}</em>}
            </button>
          ))}
        </nav>
        <div className="privacy-card"><div className="privacy-icon"><Icon name="shield" /></div><strong>{t.privacy}</strong><p>{t.local}</p><div className="pulse-row"><i />AES-256 local vault</div></div>
        <div className="profile"><div className="avatar">IA</div><div><strong>Ibrahim</strong><small>Workspace owner</small></div><button aria-label="Open account menu">•••</button></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="global-search"><Icon name="search" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} /><kbd>⌘ K</kbd></div>
          <div className="top-actions">
            <button className="icon-button language" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} aria-label="Change language">{language === 'en' ? 'ع' : 'EN'}</button>
            <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle color theme"><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
            <button className="primary-button" onClick={() => setModalOpen(true)}><Icon name="plus" size={18} />{t.add}</button>
          </div>
        </header>

        <div className="content">
          {view === 'overview' && (
            <>
              <section className="hero-row"><div><span className="eyebrow">CONTRACT OPERATIONS · 2026</span><h1>{t.heading}</h1><p>{t.subheading}</p></div><div className="trust-chip"><Icon name="shield" /><span><strong>100% local</strong><small>No document upload</small></span></div></section>
              <section className="metrics-grid">
                <Metric label={t.exposure} value={formatMoney(totalValue, 'USD', language)} trend="+12.4%" tone="violet" />
                <Metric label={t.health} value={`${averageScore}/100`} trend="+6 pts" tone="teal" progress={averageScore} />
                <Metric label={t.deadlines30} value="8" trend="2 urgent" tone="amber" />
                <Metric label={t.reviewItems} value={String(reviewCount)} trend="4 high risk" tone="rose" />
              </section>
              <section className="dashboard-grid">
                <div className="panel risk-panel"><PanelHeader title={t.priority} action={t.all} onAction={() => setView('documents')} />
                  {documents.slice().sort((a, b) => analyses.get(a.id)!.score - analyses.get(b.id)!.score).slice(0, 3).map(document => {
                    const itemAnalysis = analyses.get(document.id)!
                    return <button className="risk-row" key={document.id} onClick={() => openDocument(document)}><ScoreRing score={itemAnalysis.score} /><span className="risk-copy"><strong>{document.name}</strong><small>{document.counterparty} · {document.type}</small></span><span className={`risk-pill ${itemAnalysis.risk}`}>{riskLabel[itemAnalysis.risk][language]}</span><Icon name="chevron" size={18} /></button>
                  })}
                </div>
                <div className="panel exposure-panel"><PanelHeader title="Risk trajectory" action="90 days" /><div className="chart-summary"><div><strong>−28%</strong><small>weighted exposure</small></div><span className="positive">Improving</span></div><RiskChart /><div className="chart-axis"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span></div></div>
              </section>
              <section className="panel table-panel">
                <PanelHeader title={t.recent} action={t.all} onAction={() => setView('documents')} />
                <div className="status-filter" aria-label="Filter contracts by status">
                  {(['All', 'Review', 'Active', 'Draft'] as const).map(item => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item}</button>)}
                </div>
                <ContractTable documents={filtered.slice(0, 5)} analyses={analyses} language={language} onOpen={openDocument} />
              </section>
            </>
          )}

          {view === 'documents' && selected && (
            <>
              <section className="document-header">
                <div><button className="back-link" onClick={() => setView('overview')}>← {t.portfolio}</button><div className="title-line"><h1>{selected.name}</h1><span className={`status ${selected.status.toLowerCase()}`}>{selected.status}</span></div><p>{selected.counterparty} · {selected.type} · Updated {selected.updatedAt}</p></div>
                <div className="document-actions"><button className="secondary-button" onClick={() => window.print()}>{t.print}</button><button className="primary-button" onClick={exportReport}><Icon name="export" size={18} />{t.export}</button></div>
              </section>
              <section className="analysis-grid">
                <div className="panel score-card"><div className="score-hero"><ScoreRing score={analysis.score} large /><div><span>{t.score}</span><strong>{riskLabel[analysis.risk][language]} risk</strong><small>{analysis.summary}</small></div></div><div className="coverage"><span>{t.clauses}</span><strong>{analysis.coveredClauses.length}/{analysis.coveredClauses.length + analysis.missingClauses.length}</strong><div><i style={{ width: `${(analysis.coveredClauses.length / Math.max(analysis.coveredClauses.length + analysis.missingClauses.length, 1)) * 100}%` }} /></div></div></div>
                <div className="panel quick-facts"><Fact icon="alert" label={t.riskSignals} value={String(analysis.findings.length)} tone="rose" /><Fact icon="calendar" label={t.keyDates} value={String(analysis.deadlines.length)} tone="amber" /><Fact icon="documents" label={t.money} value={String(analysis.monetaryTerms.length)} tone="violet" /><Fact icon="shield" label={t.missing} value={String(analysis.missingClauses.length)} tone="teal" /></div>
              </section>
              <section className="document-layout">
                <div className="panel findings-panel"><PanelHeader title={t.findings} action={`${analysis.findings.length} items`} />{analysis.findings.length ? analysis.findings.map(finding => <article className="finding" key={finding.id}><span className={`severity-dot ${finding.risk}`} /><div><div className="finding-title"><strong>{finding.title}</strong><span className={`risk-pill ${finding.risk}`}>{riskLabel[finding.risk][language]}</span></div><p>“{finding.text}”</p><small>{finding.rationale} · {finding.confidence}% confidence</small></div></article>) : <EmptyState text="No material risk language detected." />}</div>
                <aside className="right-stack"><div className="panel detail-list"><PanelHeader title={t.keyDates} />{analysis.deadlines.length ? analysis.deadlines.map((date, index) => <div className="detail-item" key={date}><span className="date-box"><strong>{index + 12}</strong><small>SEP</small></span><div><strong>{date}</strong><small>Detected contractual deadline</small></div></div>) : <EmptyState text={t.noDeadline} />}</div><div className="panel detail-list"><PanelHeader title={t.money} />{analysis.monetaryTerms.map(term => <div className="money-item" key={term}><span>$</span><div><strong>{term}</strong><small>Commercial value detected</small></div></div>)}</div></aside>
              </section>
            </>
          )}

          {view === 'obligations' && (
            <><section className="list-heading"><div><span className="eyebrow">ACTION REGISTER</span><h1>{t.obligations}</h1><p>{language === 'ar' ? 'حوّل نصوص العقود إلى قائمة مسؤوليات قابلة للتنفيذ.' : 'Turn contract language into an accountable action register.'}</p></div></section><section className="panel obligations-panel">{documents.flatMap(document => analyses.get(document.id)!.obligations.map(obligation => ({ ...obligation, document }))).map(item => <ObligationRow key={`${item.document.id}-${item.id}`} obligation={item} document={item.document} done={!!completed[`${item.document.id}-${item.id}`]} onToggle={() => setCompleted(current => ({ ...current, [`${item.document.id}-${item.id}`]: !current[`${item.document.id}-${item.id}`] }))} t={t} />)}</section></>
          )}

          {view === 'calendar' && (
            <><section className="list-heading"><div><span className="eyebrow">DEADLINE RADAR</span><h1>{t.calendar}</h1><p>{language === 'ar' ? 'راقب المواعيد المستخرجة من جميع العقود في مكان واحد.' : 'Monitor extracted dates across every agreement in one place.'}</p></div></section><section className="deadline-board">{documents.map(document => <div className="panel deadline-column" key={document.id}><div className="deadline-head"><span className={`document-dot ${analyses.get(document.id)!.risk}`} /><div><strong>{document.name}</strong><small>{document.counterparty}</small></div></div>{analyses.get(document.id)!.deadlines.map(deadline => <div className="deadline-card" key={deadline}><Icon name="calendar" /><span><strong>{deadline}</strong><small>Contractual deadline</small></span></div>)}</div>)}</section></>
          )}
        </div>
      </main>

      {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={event => event.currentTarget === event.target && setModalOpen(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><span className="eyebrow">PRIVATE · LOCAL</span><h2 id="modal-title">{t.newTitle}</h2></div><button className="icon-button" onClick={() => setModalOpen(false)} aria-label={t.cancel}>×</button></div><div className="form-grid"><label>{t.name}<input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Global Services Agreement" /></label><label>{t.counterparty}<input value={draft.counterparty} onChange={event => setDraft(current => ({ ...current, counterparty: event.target.value }))} placeholder="e.g. Acme Global" /></label></div><label>{t.paste}<textarea value={draft.content} onChange={event => setDraft(current => ({ ...current, content: event.target.value }))} placeholder="Paste plain contract text. Nothing leaves this browser." rows={12} /></label><div className="modal-note"><Icon name="shield" /><span><strong>No upload, no account, no API call.</strong><small>The deterministic review engine runs entirely on your device.</small></span></div><div className="modal-actions"><button className="secondary-button" onClick={() => setModalOpen(false)}>{t.cancel}</button><button className="primary-button" onClick={createDocument} disabled={!draft.name.trim() || !draft.content.trim()}><Icon name="plus" />{t.analyze}</button></div></div></div>}
    </div>
  )
}

function PanelHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <div className="panel-header"><h2>{title}</h2>{action && <button onClick={onAction}>{action}{onAction && <Icon name="chevron" size={15} />}</button>}</div>
}

function Metric({ label, value, trend, tone, progress }: { label: string; value: string; trend: string; tone: string; progress?: number }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><i /></div><strong>{value}</strong><div className="metric-foot"><span>{trend}</span>{progress !== undefined && <div className="mini-progress"><i style={{ width: `${progress}%` }} /></div>}<small>vs last period</small></div></article>
}

function ScoreRing({ score, large = false }: { score: number; large?: boolean }) {
  const radius = large ? 34 : 23
  const size = large ? 88 : 58
  const circumference = 2 * Math.PI * radius
  return <div className={large ? 'score-ring large' : 'score-ring'}><svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size / 2} cy={size / 2} r={radius} className="ring-track" /><circle cx={size / 2} cy={size / 2} r={radius} className="ring-value" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} /></svg><strong>{score}</strong></div>
}

function RiskChart() {
  return <svg className="risk-chart" viewBox="0 0 520 160" preserveAspectRatio="none" aria-label="Risk exposure trend"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#6d5dfc" stopOpacity=".35"/><stop offset="1" stopColor="#6d5dfc" stopOpacity="0"/></linearGradient></defs><path className="grid-line" d="M0 25H520M0 78H520M0 132H520"/><path className="area" d="M0 36 C60 28 72 66 130 58 S210 89 260 72 S330 112 390 91 S456 115 520 104 V160 H0Z"/><path className="line" d="M0 36 C60 28 72 66 130 58 S210 89 260 72 S330 112 390 91 S456 115 520 104"/><circle cx="520" cy="104" r="5"/></svg>
}

function Fact({ icon, label, value, tone }: { icon: keyof typeof icons; label: string; value: string; tone: string }) {
  return <div className={`fact ${tone}`}><span><Icon name={icon} /></span><div><small>{label}</small><strong>{value}</strong></div></div>
}

function ContractTable({ documents, analyses, language, onOpen }: { documents: ContractDocument[]; analyses: Map<string, ReturnType<typeof analyseContract>>; language: Language; onOpen: (document: ContractDocument) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>Document</th><th>Counterparty</th><th>Value</th><th>Health</th><th>Status</th><th aria-label="Open" /></tr></thead><tbody>{documents.map(document => { const analysis = analyses.get(document.id)!; return <tr key={document.id} onClick={() => onOpen(document)} tabIndex={0} onKeyDown={event => event.key === 'Enter' && onOpen(document)}><td><span className="document-icon"><Icon name="documents" /></span><div><strong>{document.name}</strong><small>{document.type}</small></div></td><td>{document.counterparty}</td><td>{formatMoney(document.value, document.currency, language)}</td><td><div className="table-score"><i style={{ width: `${analysis.score}%` }} /><span>{analysis.score}</span></div></td><td><span className={`status ${document.status.toLowerCase()}`}>{document.status}</span></td><td><Icon name="chevron" /></td></tr> })}</tbody></table>{!documents.length && <EmptyState text="No matching documents" />}</div>
}

function ObligationRow({ obligation, document, done, onToggle, t }: { obligation: Obligation; document: ContractDocument; done: boolean; onToggle: () => void; t: typeof copy.en | typeof copy.ar }) {
  return <article className={done ? 'obligation-row done' : 'obligation-row'}><button className="check-button" onClick={onToggle} aria-label={done ? t.open : t.complete}>{done ? '✓' : ''}</button><div className="obligation-main"><strong>{obligation.action}</strong><span>{document.name} · {obligation.source}</span></div><div><small>{t.owner}</small><strong>{obligation.party}</strong></div><div><small>{t.due}</small><strong>{obligation.due}</strong></div><span className={done ? 'status active' : 'status review'}>{done ? t.complete : t.open}</span></article>
}

function EmptyState({ text }: { text: string }) { return <div className="empty-state"><span>⌁</span><p>{text}</p></div> }

export default App
