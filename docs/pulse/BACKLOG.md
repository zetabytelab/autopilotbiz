# Content backlog

Everything written and not published, plus the research leads worth turning into
editions. Updated 18 September 2026.

Published to date: editions 01–10. Anything below is unpublished unless stated.

## 1. Finished copy, waiting on a decision

| Item | Path | State | Blocked on |
| --- | --- | --- | --- |
| **Pion / Andon Labs** | `docs/pulse/11-review/` | Approved copy, 5 images ready. ~400 words | Your destination call: feed post, newsletter, or both. Renumbered 10 → 11 on 18 Sep |
| **Three short commentary posts** | `docs/pulse/11-review/short-posts.md` | Ready, no images needed | Nothing. Post any time, or use as comments on someone else's thread |
| **Enterprise autonomy (L0–L5 scale)** | `docs/pulse/enterprise-autonomy-post.md` | Full editorial proposal with LinkedIn post and first comment drafted | Sources last checked 10 Sep. Also needs a second look at the Augustin Friedel attribution before it goes out |
| **What it costs to delegate** | `docs/digests/2026-09-10-reviewed.md` | Editorial draft, ~700 words, never assigned an edition number | Decide whether it stands alone or folds into a cost edition |

## 2. Research that could become an edition

| Lead | Path | Why it is worth an edition |
| --- | --- | --- |
| Deep scan, 21 tracked companies | `research/deep-scan-2026-08-14.md` | 5,600 words, every claim carries a source and a verified/self-reported/disputed label. Oldest material here — re-verify before using |
| AI services identity and social research | `docs/AI-SERVICES-RESEARCH-2026-09-09.md` | 1,800 words on founder and company account verification |
| Featured-company research | `docs/research/featured-companies-2026-09-10.md` | Already rendered into the ten company profiles; the editorial angle is unused |
| Search and extraction evaluation | `docs/research/search-and-extraction-evaluation.md` | Engine and tool benchmark. Useful as a methods piece — how the index finds what it finds |
| Pulse digest candidates | `docs/digests/candidates-2026-09-10.md` | A week of collected candidates, editorially triaged, never used |

## 3. Self-driving product delivery — the running case file

This is the through-line of editions 09 and 10, and the one worth building a
standing collection for. Rules for anything added here:

- A dated primary source. Report date and deployment date recorded separately.
- Evidence stage labelled: public deployment record > named customer production >
  vendor-reported internal use > demo.
- Every disclosed number quoted verbatim, with its unit.
- What the account does **not** establish.

### Already used

| Case | Edition | Note |
| --- | --- | --- |
| PostHog Replay Vision, PR #67643 | 09 | Public PR, merged 29 Jul, production deployment entries |
| HYBRD + Amplitude Agent Analytics | 09 | Named customer; deployment day not disclosed |
| Sentry Seer + Claude | 09 | Internal rollout dated mid-July |
| Sentry + Cursor (Dan Mindru) | 09 | Customer-reported maintenance |
| Warp + Claude | 09 | Feedback becomes versioned instructions |
| loveholidays + Codex | 09 | Prototype to production |
| Cognition Devin + Astra | 09 | Simulator demonstration |
| PostHog self-driving loops (15 Sep) | 10 | 90+ scouts, $15 per merged PR, two loops with different economics |
| Shopify River (2 Sep) | 10 | Freshness-gated merge queue; backlog down ~70% in 11 days |
| Figma security agents (23 Jul) | 10 | ~$0.50 median per PR review |
| Uber software factory (27 Aug) | 10 | >70% of PRs agent-attributed; cost per session −52% |

### New lead: the Ralph loop

**[Amplitude, "the Ralph loop"](https://amplitude.com/blog/ralph-loop)** — Eric Carlson,
Chief AI Architect at Amplitude, during Amplitude's AI Week 2026. **Published 13 May 2026.**

A while loop over Claude Code with browser use enabled, cycling through three phases:
build the next opportunity, verify it in the browser, then generate new opportunities
from the changed product state. The human sets goals and constraints up front, then
stays out of it; low-risk categories later got auto-merge. Opportunities are ranked by
Amplitude's experimental Opportunity Finder.

**Disclosed:** 102 shipped features in one week.

**Does not establish:** production-readiness, error rates, token or dollar cost, whether
the features still work, or whether any of them moved a real user metric rather than
synthetic agent usage.

**Why it earns a slot:** it is the purest version of the pattern — no signal source, no
ticket queue, the loop generates its own next task. That is the opposite end of the
spectrum from Shopify's narrow, mechanically checkable gate, and the contrast is an
edition on its own. It is also four months old, so it needs a "what happened next"
before it can carry a piece.

### The open question across every case

No company has published an **escaped-regression, revert or change-failure rate** for
agent-authored production changes. Checked across PostHog, Shopify, Figma, Uber, Arize,
Honeycomb, Sentry, Zalando and gh-aw as of 18 September 2026. Whoever publishes it first
is the edition.

### Leads found 19 September, verification status attached

**1. Post-merge code quality of agent PRs — the closest thing to the missing number.**
"Beyond Bug Fixes: An Empirical Investigation of Post-Merge Code Quality Issues in
Agent-Generated Pull Requests", Cynthia, Muttakin and Roy, University of Saskatchewan.
arXiv:2601.20109v1, submitted **27 January 2026**. https://arxiv.org/html/2601.20109v1

1,210 merged agent-generated bug-fix PRs across 206 Python projects with more than 100
stars, from the AIDev dataset. Five agents: Codex (949 PRs), Copilot (106), Devin (100),
Cursor (40), Claude Code (15). Method is differential SonarQube analysis of the repository
before and after each merge.

Findings: code smells dominate over functional defects — 1,059 code smells against 48 bugs
and 83 security hotspots, no vulnerabilities. After normalising by code churn the
differences between agents largely disappear (Kruskal-Wallis, not significant), though
Cursor keeps a higher median issue density. Cumulative remediation effort 8.9 to 45.8 hours
across agents.

**Why it matters here:** academics measured what the vendors do not publish. It does not
close the gap — the authors state it "lacks a matched human baseline and focuses on static
post-merge quality signals, excluding downstream runtime and maintenance effects" — so it
still says nothing about reverts or escaped regressions in production. But an edition
framed as *the only people measuring this are academics, and here is what they found* is
available now.

**Caveat:** January 2026, so eight months old and outside any recent-case window.

**2. Cursor's internal agent-authored merge share — NOT VERIFIED, do not publish yet.**
Widely repeated figure: more than 35% of PRs merged inside Cursor's own engineering team
are opened by autonomous cloud agents, up from 30% at the February 2026 launch. The
distinction being drawn is merged, not opened.

Every source found for this is secondary (DevOps.com and similar). **The figure does not
appear on Cursor's own blog index**, which for Aug–Sep 2026 lists Projects (10 Sep), cloud
agents on self-managed machines (2 Sep), Git at any scale (18 Aug), the SpaceX acquisition
(14 Aug) and others. Primary source must be found — likely the February cloud-agents launch
post or a changelog — before this is quoted anywhere.

### Note on method

Generic web search for this topic is now saturated with AI-generated SEO content
("loop engineering guide 2026" and similar), which crowds out primary accounts. What worked
for editions 09 and 10 was going directly to company engineering blogs, changelogs and the
GitHub API, and verifying every date from the page itself. Keep doing that.
