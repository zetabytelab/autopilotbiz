# Editorial checks for the self-improving software article

Draft revised 14 September 2026 following the user's request for market leaders, a visual taxonomy and recent production or pilot-to-scale examples. The article has not been added to a public route or published.

## Revised editorial method

- Lead with eight reference companies selected by relevant product scope, established distribution surfaces or concrete implementation evidence. Do not claim these are measured market-share leaders.
- The new map contains 20 selected companies, five categories and ten subcategories. It is a fresh, scoped selection, not the original artifact's census.
- The Sankey-style drawing is a qualitative relationship map. All connections have equal width and show membership only. They do not encode market share, adoption, integrations, partnership, financial flows or product equivalence.
- Include the AI and developer incumbents explicitly: Anthropic, OpenAI and Microsoft/GitHub. Distinguish their execution role from the product-data and observability platforms.
- The case window is 14 July–14 September 2026. Admission is based on an implementation report published in that window or an in-window deployment record. Report date, rollout date, intervention duration and scale are separate fields.
- A current product page is sufficient for category placement, not sufficient for a dated production case. Amplitude Wave's closed-beta status and Datadog's June product announcement are therefore not recent deployments.
- No claim of independent performance benchmarking is made. A public PR establishes observable repository events; deployment comments are public records of the company's own deployment system, not an independently observed customer outcome.

## Recent-case evidence ledger

| Case | Report date | Implementation timing | Stage supported | Scope limit |
| --- | --- | --- | --- | --- |
| [PostHog](https://posthog.com/blog/replay-vision) / [PR #67643](https://github.com/PostHog/posthog/pull/67643) | 31 July | PR opened 2 July; approved 28 July; merged and production deployment recorded 29 July | Internal production, public PR and deployment entries | Qualifies on in-window deployment, not PR creation. Agent initially could not run frontend tools. Human approval and CI are visible. No post-release outcome metric checked. |
| [HYBRD + Amplitude](https://amplitude.com/blog/hybrd-agent-evals-retention-signal) | 28 July | Same-day fix following evaluation; calendar day not disclosed | Named customer production, CTO account | 25% is the sampled pre-fix rate. Final rate not disclosed. Fourfold retention/conversion is observational, not causal; this is Agent Analytics, not Wave. |
| [Sentry + Claude](https://blog.sentry.io/automated-debugging-workflow-sentry/) | 6 August | Mid-July rollout, exact day not stated | Internal operational use across several projects | Early relative-change language has no clear percentage-point definition or sample size. Action rate is not merge rate. Prose says hourly routine; embedded prompt says every four hours, so no precise cadence asserted. |
| [Sentry + Cursor / Dan Mindru](https://blog.sentry.io/57-bugs-to-1/) | 23 July | Integration enabled days before one example; total backlog intervention period unspecified | Customer-reported production maintenance | 57-to-1 covers multiple methods, including human work. Do not convert to an autonomous resolution rate or assign the total to a single named product. |
| [Warp + Claude](https://claude.com/blog/how-warp-builds-self-improving-agents-on-claude) | 26 August | Ongoing use; start unspecified | Operational open-source-repository use reported by companies | Source describes hundreds of contributors and thousands of reviews; no controlled accuracy uplift. Changes to skills remain reviewed and merged by humans. |
| [loveholidays + Codex](https://openai.com/index/loveholidays/) | 26 August | More than ten experiences built and at least three live by report; individual dates unspecified | Prototype-to-production expansion, customer account | Data Platform improvement from 58% to 93% is over a year, not two months. AI-assisted is not unattended. |
| [Cognition + OpenAI](https://openai.com/index/cognition-devin-testing-with-astra/) | 11 September | Reported product integration; rollout scope/date unspecified | Concrete simulator demonstration plus reported product use | Do not label broad production scaling as established. Test evidence and screenshots are described; adoption and productivity rates are not quantified. |

## Source-map corrections

- The artifact header says 70 companies. Its rendered tables contain 73 rows: 18 product, 18 telemetry, 18 verification and 19 maintenance entries.
- The original rows resolve to 68 distinct company domains after normalising `www`. Repeated entries across lanes are PostHog, Traversal, Cleric, Resolve AI and incident.io. This is a domain-based audit of the original rendered map, not a corporate-ownership census. The revised article counts only its own 20-company selection.
- Header status counts sum to 70 and were not reused because they do not reconcile with the rendered tables.
- The artifact defines “verified” to include both external checking and sufficiently specific company-published figures. These are different evidence standards. The article distinguishes documented features, vendor claims and independent performance verification.
- Some “verified” rows explicitly describe an absence of autonomous action. They cannot be counted as verified self-improving products.
- The Statsig row identifies OpenAI as acquirer in one field and Amplitude as owner in another. The Amplitude row also asserts a Statsig acquisition. No ownership claims from these rows were carried into the article.
- The artifact mixes pricing and versions of PostHog's offering. Historical pricing and Replay Vision performance figures were omitted because the live sources checked here did not establish those specific numbers.
- The artifact's builder list repeats Willem Pienaar. Its displayed builder total should not be presented as a unique-person count.
- Calibre was the opening of the first draft. The revised article leads with the market and uses examples with public primary sources and deployment detail. The event report remains useful context but does not establish a rollout date or production success rate.
- Primary sources were checked on 14 September. The revised article is dated 14 September and does not present newer evidence as known on 10 September.

## Scope

This is a market-led article covering five categories, ten subcategories, twenty representative companies and seven dated implementation reports. It is not a completed re-verification of every company in the original source map. Funding, acquisition, shutdown and benchmark-ranking claims are excluded where unnecessary to the argument.

## Deliverables

- `self-improving-software-article.md`: revised article with inline source links and embedded map.
- `self-improving-software-assets/market-map.png`: article-ready raster graphic, visually reviewed.
- `self-improving-software-assets/market-map.svg`: editable vector version with accessible title and description.
- `self-improving-software-assets/market-map.json`: category placements and source URLs.
- `self-improving-software-assets/render-market-map.py`: reproducible renderer using Pillow.
