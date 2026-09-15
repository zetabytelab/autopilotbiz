# The Self-Improving Products Wave

*autopilotindex · research · 14 September 2026*

**Have your product on autopilot?** Meet the companies turning user feedback into product improvements—and see what is already running in production.

**PostHog and Amplitude are building from product data. Datadog and Sentry are building from production telemetry. OpenAI, Anthropic and GitHub supply agents and execution platforms. Here is how the market fits together—and what recent deployments tell us about the path from pilot to scale.**

The self-improving software market is taking shape around companies that already control an important part of the development cycle: evidence about what users need, the tools that change the software, or the checks that determine whether a change is ready.

Our starting shortlist is **PostHog, Amplitude, Sentry, Datadog, Anthropic, OpenAI, Microsoft/GitHub and Warp**. Each matters for a different reason. PostHog has a concrete public example of usage becoming a deployed fix. Amplitude connects agent behaviour to product outcomes. Sentry shows how automated fixes enter an existing engineering organisation. Warp makes the agents’ own instructions part of the improvement process.

These are editorial reference leaders for the roles below, selected for relevant product scope, an established distribution surface or concrete implementation evidence. They are not a revenue or market-share ranking. “Self-improving software” does not yet have a consistent market definition that would support one.

## The companies to understand first

| Company | Position in the market | Why it belongs on the shortlist | Evidence boundary |
| --- | --- | --- | --- |
| **PostHog** | Product data → proposed software changes | Combines replay, analytics and error signals with background agents. A July example has a public PR and production record. | Concrete internal use; not customer-wide performance proof. [Product](https://posthog.com/self-driving) · [PR](https://github.com/PostHog/posthog/pull/67643) |
| **Amplitude** | Product opportunities, experiments and outcomes | Wave targets the product-improvement cycle; Agent Analytics has a named customer connecting production failures to a prompt fix. | Wave is labelled closed beta. HYBRD uses Agent Analytics, not evidence of a Wave rollout. [Wave](https://amplitude.com/wave) · [HYBRD](https://amplitude.com/blog/hybrd-agent-evals-retention-signal) |
| **Sentry** | Production error → diagnosis → fix → reviewer | Seer generates PRs and hands work to coding agents. Sentry reports operating the workflow across several projects. | Internal rollout and customer accounts; human review remains. [Implementation](https://blog.sentry.io/automated-debugging-workflow-sentry/) |
| **Datadog** | Enterprise observability → code remediation | Bits Code uses telemetry across errors, performance, tests and security to prepare changes for review. | Documented scope and vendor-stated GA; June launch falls outside the recent-case window. [Bits Code](https://www.datadoghq.com/blog/bits-code/) |
| **Anthropic** | Models, coding agents and reusable instructions | Claude appears inside Sentry’s operating workflow and Warp’s feedback-driven agents. | Establishes an execution role, not ownership of every product signal or outcome. [Warp implementation](https://claude.com/blog/how-warp-builds-self-improving-agents-on-claude) |
| **OpenAI** | Coding and testing infrastructure | Codex supports loveholidays’ move from prototypes to live experiences; Cognition describes model-assisted test evidence. | Named customer accounts, not measurements of unattended product improvement. [loveholidays](https://openai.com/index/loveholidays/) · [Cognition](https://openai.com/index/cognition-devin-testing-with-astra/) |
| **Microsoft / GitHub** | Repository events, workflow execution and review | Agentic Workflows puts agents where changes, checks and approvals already live. | June announcement establishes public preview at launch, not a recent customer deployment. [Announcement](https://github.blog/changelog/2026-06-11-github-agentic-workflows-is-now-in-public-preview/) |
| **Warp** | Software factories that improve their agents | Describes triage, specification and review agents whose instructions change from accumulated feedback. | Reported operational use; no independent aggregate improvement rate established here. [Architecture](https://www.warp.dev/blog/agent-self-improving-software-factories) |

The competitive question is who becomes the place where the next change is decided and coordinated. My reading is that product-data platforms have an advantage in choosing valuable work, observability platforms in explaining failures, and AI platforms in executing changes. These advantages can coexist in the same customer stack.

## The market map: five categories, ten subcategories

![Market map connecting five categories to ten subcategories and twenty relevant companies.](self-improving-software-assets/market-map.png)

*A Sankey-style relationship map. Connections show category membership, not revenue, adoption, traffic or integration partnerships. Each company appears under one representative role; many span several. Source links for each placement are below.*

| Category | Subcategory | Relevant companies | Typical use case |
| --- | --- | --- | --- |
| **Product improvement** | Usage and outcome learning | [PostHog](https://posthog.com/self-driving), [Amplitude](https://amplitude.com/wave) | Detect an unsuccessful journey; propose a change; measure its effect. |
| Product improvement | Website experimentation | [Webflow Optimize](https://webflow.com/feature/optimize), [Coframe](https://www.coframe.com/) | Generate or select variants and optimise an approved experience. |
| **Production remediation** | Errors to code changes | [Sentry](https://docs.sentry.io/product/ai-in-sentry/seer), [Datadog](https://www.datadoghq.com/blog/bits-code/) | Investigate a production failure and prepare a reviewable fix. |
| Production remediation | AI incident investigation | [incident.io](https://incident.io/investigations), [Resolve AI](https://resolve.ai/) | Assemble operational context, diagnose incidents and coordinate next actions. |
| **Agent execution** | Established AI and developer platforms | [Anthropic](https://claude.com/blog/how-warp-builds-self-improving-agents-on-claude), [OpenAI](https://openai.com/index/loveholidays/), [Microsoft/GitHub](https://github.blog/changelog/2026-06-11-github-agentic-workflows-is-now-in-public-preview/) | Supply models, coding agents or repository execution for the wider loop. |
| Agent execution | Coding-agent platforms and factories | [Warp](https://www.warp.dev/blog/agent-self-improving-software-factories), [Cursor](https://cursor.com/docs/cloud-agent/automations), [Cognition/Devin](https://openai.com/index/cognition-devin-testing-with-astra/) | Run work across repositories and environments; generate changes and test evidence. |
| **Verification** | Stateful and whole-system simulation | [Veris AI](https://veris.ai/), [Antithesis](https://antithesis.com/) | Exercise dependencies and failure conditions before changes ship. |
| Verification | Replay-based frontend regression | [Meticulous](https://www.meticulous.ai/) | Turn recorded interactions into repeatable workflow checks. |
| **Continuous maintenance** | AI code review | [Greptile](https://www.greptile.com/), [CodeRabbit](https://www.coderabbit.ai/) | Inspect changes and return findings to developers or agents. |
| Continuous maintenance | Dependency updates | [Renovate/Mend](https://docs.renovatebot.com/key-concepts/automerge/) | Prepare upgrades and optionally merge eligible changes after checks. |

The categories expose different products behind the same phrase. Website optimisation changes an experience against a conversion objective. Production remediation fixes a failure. A self-improving agent changes how it performs future tasks. Automated maintenance can run reliably without learning at all.

They also explain why the AI incumbents belong in the map. A company can use Sentry to identify a problem and Cursor or Claude to fix it. A product team can use Amplitude to measure outcomes while another platform writes the code. The execution platform is both a supplier to the specialist and a potential competitor for the customer’s daily workflow.

## What actually happened in the last two months

The reporting window is **14 July–14 September 2026**. Cases qualify through a dated implementation report or an in-window deployment record. Publication dates are not assumed to be deployment dates. Where a report describes an earlier or ongoing rollout without dating it, that is stated explicitly.

### PostHog: a confusing installation screen became a deployed fix

**Stage: internal production use, with a public deployment record. Deployment: 29 July. Report: 31 July.**

PostHog’s Replay Vision account describes a scanner identifying dead clicks on an installation screen. Investigation also found repeated refresh requests producing rate-limit errors. The change clarified the button, kept documentation in a separate tab and removed automatic refresh on page load. [PostHog’s account](https://posthog.com/blog/replay-vision).

PR #67643 records human approval, a merge on 29 July, 196 passing checks and deployment entries for both US and EU production. Its original description acknowledges that the agent could not run the frontend environment itself. This supports a real change through review and CI; it does not establish that the agent independently completed every verification step or quantify subsequent user benefit. [Public PR and deployment record](https://github.com/PostHog/posthog/pull/67643).

**Why it matters:** a traceable path from observed friction to production, with human and automated contributions visible.

### HYBRD + Amplitude: production conversations exposed a prompt defect

**Stage: named customer production use. Report: 28 July; exact deployment day not disclosed.**

HYBRD’s CTO describes investigating complaints that its coaching agent needed a second request before running a tool. An evaluator applied to a week of sampled conversations flagged the behaviour in 25% of them. The team shipped a fix, mostly prompt changes, the same day and reported that the rate fell; it did not publish the final rate.

The account also reports more than fourfold retention and conversion among users engaging with the agent. That is a cohort association, not proof that the prompt fix caused a fourfold improvement. The implemented loop is concrete: complaint, evaluation, prompt change and follow-up measurement. [HYBRD’s account](https://amplitude.com/blog/hybrd-agent-evals-retention-signal).

**Why it matters:** improvement can occur in prompts and tool behaviour without generating an application-code PR. This supports Amplitude’s measurement role, separate from Wave.

### Sentry + Claude: expanding automation into the review workflow

**Stage: internal operational rollout across multiple projects. Rollout: mid-July. Report: 6 August.**

Sentry enabled Seer autofix across its core application, documentation, MCP server and CLI. A scheduled Claude routine checks new PR notifications, identifies a reviewer, confirms the PR needs action and requests feedback.

The company reports approximately 21% higher PR action rate, 13% higher 48-hour response rate and 12.5% more closures without merging. These are early reported changes, with no cohort size or clear percentage-versus-percentage-point definition. Closure can mean a duplicate or a reviewer choosing a broader fix; it is not equivalent to a successful agent merge. [Sentry’s implementation report](https://blog.sentry.io/automated-debugging-workflow-sentry/).

**Why it matters:** scaling includes routing, ownership and review capacity. The operating process around the agent determines whether its output gets used.

### Sentry + Cursor: a customer moves from backlog to recurring fixes

**Stage: customer-reported production maintenance. Report: 23 July; full intervention period unspecified.**

Developer Dan Mindru describes reducing a backlog from 57 bugs to one using several approaches. Straightforward issues use Seer-generated PRs. More involved work is handed to Cursor’s cloud agent, which can run an application and tests. Difficult cases still need human context and verification.

One fix was generated after a colleague enabled the integration a few days earlier and was merged by Mindru. The headline is a practitioner’s account across workflows, not a measured 98% autonomous resolution rate. [Customer account on Sentry’s blog](https://blog.sentry.io/57-bugs-to-1/).

**Why it matters:** a practical division of labour between an observability incumbent and a coding-agent platform.

### Warp + Claude: agents improve instructions for the next run

**Stage: operational use across Warp’s open-source repository, as reported. Report: 26 August; rollout start unspecified.**

Warp separates each agent’s task instructions from an improver that periodically reads accumulated feedback. The improver proposes a small instruction edit through a pull request. A person reviews and merges it before later runs inherit the change.

In the published triage example, maintainer feedback led to a proposed correction to when the agent applies a readiness label. Warp says the pattern operates across triage, specification and review agents. The account describes hundreds of contributors and thousands of reviews, but no controlled before-and-after accuracy result. [Anthropic’s account of Warp’s implementation](https://claude.com/blog/how-warp-builds-self-improving-agents-on-claude).

**Why it matters:** the development process itself improves. Feedback persists as an inspectable change instead of disappearing with a conversation.

### loveholidays + Codex: prototypes become live customer experiences

**Stage: prototype-to-production expansion. Report: 26 August; individual go-live dates unspecified.**

loveholidays built Search Playground around its design system, frontend stack and Codex. Its account describes more than ten new search experiences, mostly built by non-engineers, with at least three running on the customer website.

The report also says successful AI-assisted Data Platform changes rose from 58% to 93% over a year. That longer period must not be presented as a two-month gain. This demonstrates expanded participation and prototypes reaching production, while people choose the work and maintain the standards. [OpenAI’s loveholidays case study](https://openai.com/index/loveholidays/).

**Why it matters:** scaling includes reusable components, codified checks and access to specialist knowledge.

### Cognition + OpenAI: a working verification example, with scale unquantified

**Stage: reported product integration plus a simulator demonstration. Report: 11 September; production rollout scope unspecified.**

Cognition describes using GPT-6 Astra across Devin, CLI and desktop products. In one example, Devin tests an iPhone game in a simulator and returns a recording plus a report of checks completed and areas left untested. The company also describes fixing customer-reported bugs and returning screenshots.

This establishes a concrete verification use case. It does not establish how broadly the specific capability is deployed, a production success rate or measured savings in manual review. [OpenAI’s Cognition case study](https://openai.com/index/cognition-devin-testing-with-astra/).

**Why it matters:** a useful pilot output is evidence a reviewer can inspect, including what was not tested. Scaling requires consistent environments and repeatable checks.

## How the market moves from pilot to scale

The cases suggest three expansion paths.

**From one product surface to a repeatable repair process.** Start with a defined source of friction and reproducible changes. PostHog supplies the source event, proposed change and deployment trail. Broader scope then depends on whether detection and review stay useful as volume grows.

**From one successful agent to an operating workflow.** Sentry adds reviewer selection and feedback; Warp turns feedback into versioned instructions. Work expands when an organisation can assign responsibility, inspect outcomes and improve recurring behaviour without manually rebuilding each task.

**From a prototype to an organisation-wide building capability.** loveholidays supplies the clearest case here: shared components, expertise and checks let more teams produce experiences that reach customers. HYBRD adds the complementary requirement that teams can assess behaviour and outcomes once the product is live.

For a pilot, ask whether one narrow workflow produces a useful result. For expansion, measure accepted changes, review effort, escaped regressions and cost per durable improvement. At production scale, measure those alongside the user or operational outcome the change was meant to improve. These are proposed criteria, not results demonstrated by every company in the map.

## Where to focus

For **product-led improvement**, start with PostHog and Amplitude. PostHog’s strongest evidence in this window is the public path to a deployed fix. Amplitude’s is a named customer using live-agent evaluation to change behaviour and inform product decisions; Wave remains a separate beta proposition.

For **reliability and maintenance**, start with Sentry and Datadog, then compare incident and verification specialists against the workflow you need. Datadog belongs on scope and incumbent relevance; the recent implementation evidence examined here is stronger for Sentry.

For **building your own loop**, the reference stack includes Anthropic, OpenAI and GitHub, with Warp, Cursor and Cognition offering different approaches to orchestration and execution. Their value depends partly on how well they connect to customer signals and verification environments.

The market is moving toward software that identifies useful work, prepares changes and carries evidence into review. The companies worth following are the ones making that sequence repeatable—and showing what happened after the change reached a real user.
