# /dealroom post-hackathon copy rewrite

Drafted 9 Oct 2026 (BST) by COO for Site Engineer apply after Zetabyte yes.
Applied locally on box 10 Oct 2026 ~08:00 BST in /workspace/dealroom-landing (not pushed; go-live still needs Zetabyte yes).
Live site check 10 Oct 07:55 BST: still future-tense until PR ships.
Scope: tense and framing only. No Dealroom data, logos, or derived numbers. Keep existing disclaimers.
File: `app/dealroom/page.tsx` (and bump `DEALROOM_PAGE_UPDATED` in `lib/dealroom.ts` to `2026-10-09` if that constant drives dateModified).

## Replacements

| Where | From | To |
| --- | --- | --- |
| File header comment (lines ~16-18) | future / present-progressive; claims no results | past: built at the 1 Oct 2026 Dealroom hackathon; page still shows index data only until Dealroom gives written permission to show joined fields |
| `DESCRIPTION` | We're joining The Autopilot Index of AI-run companies to Dealroom's API at the Dealroom hackathon on 1 Oct 2026. See the evidence-graded index leaderboard now. | Built at the Dealroom hackathon on 1 Oct 2026: Autopilot Index autonomy levels next to funding and revenue per employee. This page shows our own evidence-graded index data only. |
| openGraph.description | Being built at the Dealroom hackathon on 1 Oct 2026. | Built at the Dealroom hackathon on 1 Oct 2026. Index data only until Dealroom gives written permission for joined fields. |
| twitter.description | Being built at the Dealroom hackathon, 1 Oct 2026. | Built at the Dealroom hackathon, 1 Oct 2026. Index data only on this page. |
| FAQ "What is the Autopilot Leverage Screener?" | A screen we're building at the Dealroom hackathon on Thursday 1 October 2026. … Until then, this page shows our own index data only. | A screen designed at the Dealroom hackathon on 1 October 2026. It joins The Autopilot Index (companies that say AI runs them, each with an autonomy level and an evidence grade) to Dealroom's funding and headcount data, so funding per employee and revenue per employee can sit next to how much of the business AI actually runs. Until Dealroom gives written permission to show joined fields, this page shows our own index data only. |
| Badge under H1 | Being built at the Dealroom hackathon · Thu 1 Oct 2026 · London | Built at the Dealroom hackathon · 1 Oct 2026 · London |
| Intro paragraph | On Thursday 1 October we're joining The Autopilot Index… Until then, this page shows our own index data… | At the Dealroom hackathon on 1 October 2026 we designed one screen: funding per employee and revenue per employee, set against how much of the business AI actually runs (L2 to L5), by joining The Autopilot Index to Dealroom's company data. Until Dealroom gives written permission to show joined fields, this page shows our own index data, and every figure on it has a source and a date. |
| Screener step 1 | We're matching each company… | Matching each company in The Autopilot Index (autonomy level, evidence grade, reported humans, dated financial observations) by domain to Dealroom's records for funding rounds and headcount. |
| Footer line | Being built at the Dealroom hackathon, 1 Oct 2026 · Data CC BY 4.0 · | Built at the Dealroom hackathon, 1 Oct 2026 · Data CC BY 4.0 · |
| Host disclaimer | (keep) | Dealroom and Phoenix Court are named here only as hackathon hosts. They have not reviewed or endorsed The Autopilot Index. |

## Out of scope (do not do in this PR)
- Publishing `/dealroom/scout` or any Dealroom API fields
- Claiming demo results, rankings, or a Dealroom partnership
- Changing the leaderboard logic or index data

## Acceptance
- Live copy uses past tense for the hackathon
- No sentence says "we're joining" or "Being built"
- Still states nothing on the page comes from Dealroom
