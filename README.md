# Business on Autopilot

A tracker for the new class of companies where **AI agents run the operations and humans set the direction** — who they are, what they run on, how they make money, and how you can build your own. Inspired by the [Lean AI Leaderboard](https://leanaileaderboard.com/) by Henry Shi.

## What's inside

- **The autopilot index** — leaderboard ranked by ARR per human; every figure links to its source (Crunchbase, Tracxn, press) and is labeled verified / self-reported / disputed.
- **[The Autopilot Criteria](/#criteria)** — the published framework for who makes the list.
- **News pulse** (`/news`) — a heat-ranked live signal feed (funding, launches, interviews, social) aggregated from Google News, Hacker News, Techmeme and YouTube, plus a 📡 radar of unvetted new entrants discovered by keyword.
- **The autopilot stack** — the infrastructure pyramid under agent-run companies, with referral programs and credits for builders.
- **Field experiments** — agents doing real-world economic legwork (Guinndex, Le Baguette Index).
- **Why investors care** — verbatim, source-linked theses from the VCs on these cap tables.

## Submit a company

- Visual form: `/submit` on the site (anonymous, bot-protected).
- GitHub-native: [open a submission issue](../../issues/new/choose).

Every submission is researched against independent sources before it can be listed — see [docs/VETTING.md](docs/VETTING.md). Unvetted candidates appear on the radar, clearly labeled.

## Development

```bash
npm install
npm run dev          # develop on :3000
npm run pulse        # refresh data/pulse.json + data/candidates.json (free, keyless sources)
npm run build        # static production build
```

`scripts/refresh.sh` runs pulse + rebuild (wired to launchd/cron for daily refresh).

## Licensing

- **Code:** [MIT](LICENSE)
- **Dataset** (`data/`, `lib/data.ts` content): [CC BY 4.0](data/LICENSE) — free to reuse with attribution.

Maintained by one human + agents. ☕ [Buy the human a coffee](https://buymeacoffee.com/antonioserrano).
