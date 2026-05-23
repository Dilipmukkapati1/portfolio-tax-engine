# @portfolio/tax-engine

Pure TypeScript federal tax estimation — no I/O, no Azure SDKs.

## Build

```bash
cd ../portfolio-contracts && npm install && npm run build
cd ../portfolio-tax-engine && npm install && npm run build && npm test
```

## API

- `estimateFederalTax(input, rules)` — federal tax estimate for a tax year
- `suggestStrategies(ctx, rules)` — ranked educational strategy ideas
- `loadRulePack(2025)` — loads `tax-rules-2025.json`

**Disclaimer:** Educational estimates only. Not tax, legal, or investment advice.
