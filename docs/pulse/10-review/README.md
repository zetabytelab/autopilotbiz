# Autopilot Pulse #10 — HarnessTax

Draft prepared 18 September 2026. Nothing published from this package yet.

- linkedin-post.txt: short feed post on the HarnessTax study.
- edition-10-draft.md: newsletter article (in progress).

Source under discussion: **HarnessTax: How Much Does the Harness Matter for Coding Agents?**
https://harnesstax.github.io/ · mirror: https://arena.ai/blog/coding-agents-harness-tax

## Fact-check against the original draft notes

Four claims checked against the study's own published chart data, not against summaries.
The site is a JavaScript app; the numbers below come from its underlying data files.

| Draft claim | Verdict | Correction applied |
| --- | --- | --- |
| Fable 5: 97.8% Claude Code vs 96.7% Pi, ~$1.33 vs ~$0.67 | True | Codex also scores 96.7% at $0.89 — omitting it implies a two-harness race. The unit is cost per attempt (90 rollouts per cell), not per task. SWE-bench Lite only; on Terminal-Bench 2.0 it is 75.6% vs 71.1% at $1.55 vs $1.08. |
| Claude Code ~2.0x Pi and ~1.6x Codex on SWE-bench Lite | True, verbatim | Added the authors' qualifier: geometric means of cost ratios. Terminal-Bench 2.0 is 1.5x Pi. |
| Up to 5x cost difference for the same model | True, verbatim | Named the underlying cell: GPT-5.6 Luna, $0.1525 vs $0.0300, 55.6% vs 53.3%. Cheapest model in the study, so the multiple sits on a 12-cent base. |
| Kimi K3 near the cost/accuracy Pareto frontier | True with qualifier | Near, not on. No Kimi K3 cell is flagged as frontier on either benchmark; it is close on SWE-bench Lite and just below on Terminal-Bench 2.0. |

## Cut from the draft

- **"Happy to test Scenario Builder in early access."** Removed. No such product could be
  found: the string appears nowhere on harnesstax.github.io, nowhere in the Arena mirror of
  the post, and nowhere in Arena's own site search. The closest real offering is Arena's
  **AI Evaluations** product. Do not restore this line without a URL.
- **"Are you seeing this in your 2M+ monthly runs?"** The run volume is not ours to assert and
  is not in the study. Replaced with a plain question.
- **"None of the comparisons survives Holm-Bonferroni."** This line circulates in third-party
  summaries and contradicts the study's published data, where one comparison does survive
  (Opus 4.8 Codex vs Pi, +6.67pp, p_holm = 0.042). Not used.

## Authorship, verified

Five of the six authors are UC Berkeley Sky Computing Lab; only Wei-Lin Chiang is Arena.
Source: https://sky.cs.berkeley.edu/people/

- Melissa Z. Pan — Berkeley, graduate student researcher, advised by Matei Zaharia. Prior work: MAST, LOTUS.
- Shuo Yang — Berkeley EECS PhD, Sky Lab and LMSYS, advised by Ion Stoica. (Do not attribute vLLM to him; his page does not claim it.)
- Negar Arabzadeh — postdoc, Berkeley EECS / Sky Lab. PhD Waterloo.
- Wei-Lin Chiang — Arena co-founder and CTO; co-creator of Chatbot Arena and Vicuna.
- Ion Stoica — Berkeley core faculty. Co-founder of Databricks, Anyscale and Arena; behind Spark, Ray, Mesos.
- Matei Zaharia — Berkeley core faculty. Creator of Apache Spark; co-founder and CTO of Databricks.

**Disclosure worth stating in the piece:** the acknowledgements credit Arena for sponsoring
API access for the profiling experiments, alongside the Amazon AI Fellowship and the Laude
Institute. Arena both employs a co-author and funded the API spend.

## Stated limitations

- List API prices dated 1 September 2026, applied identically across harnesses. Not subscription or actual billing.
- 30 tasks per benchmark, 3 attempts; 95% CIs from 10,000 bootstrap resamples.
- 100-turn cap per attempt; turn definitions differ across harnesses.
- Each harness in native configuration at its high effort setting.
- Network isolation is stated for SWE-bench Lite only; the post is silent on Terminal-Bench.
- The authors note the models may have encountered both benchmarks in training.
- Not tested: multi-session work, evolving requirements, interactive development.

## Reproducibility gaps to name, not paper over

- **No harness versions are disclosed** anywhere in the post, the chart data or the repo.
- **Profiling traces are promised, not released** ("we will publicly release"). The GitHub org holds the website only.
- **No arXiv paper.** Blog post only; the study's own BibTeX has no eprint field.

## Third-party commentary

- Tomasz Tunguz, "The Harness Margin Opportunity", 17 September 2026 — https://tomtunguz.com/the-harness-margin-opportunity/ — "The quality gap is undemonstrated at this sample size, not proven absent."
- Hacker News discussion, 221 points — https://news.ycombinator.com/item?id=49733726 — no small/mid model coverage, no long-horizon tasks where harness complexity would plausibly pay off.

## Use cases in the newsletter — evidence ledger

Window applied: reports dated 2026-07-18 or later. Every date verified from the primary
source (page metadata or the GitHub API), not from summaries.

| Case | Report date | Deployment date | Evidence stage | Disclosed numbers |
| --- | --- | --- | --- | --- |
| [PostHog self-driving loops](https://posthog.com/blog/self-driving-loops) | 15 Sep 2026 | Per-incident and verifiable: PR #90832 created and merged 28 Aug 2026 (GitHub API) | Public production deployment record — public repo, merged PRs, named human reviewers, merge queue | 5 min to report, 8 min to PR; complaint to production under a work day; 5 Sep MCP error rate 9.9% vs 0.3–1.2% baseline, 88 errors/hour across ~44 projects; ~1 in 10 scout runs self-validates (30-day avg 10.8%); 90+ scouts; $15 per merged PR (customer price) |
| [Shopify River](https://shopify.engineering/river-vulnerability-remediation) | 2 Sep 2026 | **Not disclosed** — "first 11 days" cannot be placed on a calendar | Public production deployment record as reported; private monorepo, so not externally auditable | Backlog of open issues down ~70% in 11 days; ~two-thirds direct merges; security merges through the freshness-gated queue 10% → 80% |
| [Figma security agents](https://www.figma.com/blog/how-figma-stays-ahead-of-vulnerabilities-with-agents/) | 23 Jul 2026 | Not disclosed | Vendor-reported internal use | Median ~$0.50 per PR review; 70% precision surfacing threshold. Used as a cost datapoint only |
| [Uber software factory](https://www.uber.com/us/en/blog/efficient-software-factory/) | 27 Aug 2026 | Not disclosed; metrics span Feb–Aug 2026 | Vendor-reported internal use, aggregate only | >70% of PRs attributed to agents; cost per 1,000 model requests −34%; cost per session −52%. Scale/cost datapoint, not proof of the loop |

### Deliberately not used

- **Sentry PR #124608** (sentry-junior bot, opened and merged 16 Sep, human-approved) is real
  public agent-authored merged code, but it cites no issue or telemetry as its trigger. It is
  not evidence of a signal-to-ship loop and is not presented as one.
- **Honeycomb Canvas** (14 Sep) — no deployment date, no numbers, and the artefacts are Linear
  tickets and prompt changes rather than a shipped diff.
- **Charity Majors' 25%-of-PRs-auto-merged line** (2 Sep) is a stated goal for year end, not an
  outcome. Not citable as achieved.
- **Grafana Assistant** (27 Jul) opens PRs, but a human asks it to instrument a service. The
  causation runs the wrong way for this thesis.
- **Arize Signal** (27 Aug) — the cited PR #77349 is in a private repo and could not be verified.

### The claim the article rests on

No company in the window publishes an escaped-regression, revert or change-failure rate for
agent-authored production changes. This was checked across PostHog, Shopify, Figma, Uber,
Arize, Honeycomb, Sentry, Zalando, Braintrust and gh-aw. Throughput and cost are disclosed;
defects that got through are not. If a counter-example turns up before publication, the
closing section needs rewriting.
