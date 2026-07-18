# ContractLens

ContractLens is a privacy-first contract intelligence workspace that extracts obligations, deadlines, monetary terms, missing safeguards, and risky language directly in the browser. It is designed as a portfolio-grade SaaS product rather than a static dashboard.

[Live demo](https://ibrahim-omar-almishal.github.io/contractlens/) · [Source code](https://github.com/Ibrahim-Omar-Almishal/contractlens)

## Why it matters

Legal and commercial teams repeatedly lose time searching agreements for renewal windows, payment commitments, liability language, and responsible parties. ContractLens turns pasted text into an actionable review register without uploading the document to a third-party service.

## Product capabilities

- Deterministic local analysis for obligations, dates, money, clause coverage, and risky terms
- Cross-contract health dashboard and exposure trend
- Finding explanations with risk severity and confidence
- Actionable obligation register with completion state
- Deadline radar across the portfolio
- Arabic and English UI with RTL/LTR support
- Light and dark themes, responsive layouts, keyboard access, print report
- LocalStorage persistence and JSON report export
- Offline-ready service worker

> ContractLens is a decision-support demo, not legal advice. Production use should combine attorney-approved playbooks, audited models, access control, encryption, and jurisdiction-specific review.

## Run locally

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Architecture

- React + TypeScript + Vite
- Pure deterministic analysis engine in `src/analysis.ts`
- Browser-only persistence; no remote API or document upload
- GitHub Actions quality and Pages deployment pipeline

## العربية

منصة ذكية لتحليل نصوص العقود محلياً، واستخراج الالتزامات والمواعيد والقيم المالية والمخاطر، مع واجهة عربية وإنجليزية ودون إرسال المستندات إلى خادم خارجي.

## License

MIT
