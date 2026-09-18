# The harness tax on self-driving products

**A Berkeley study measured the same model costing up to 5x more depending on the scaffolding around it. Two production loops shipped in the last month show where that tax actually lands — and what nobody is measuring yet.**

Last edition mapped the companies building software that improves itself. The question left open was the one that decides whether any of it scales: what does a durable improvement cost?

A study published on 16 September puts a number on one part of that. [HarnessTax](https://harnesstax.github.io/), from UC Berkeley's Sky Computing Lab with Arena's Wei-Lin Chiang, holds the model constant and varies the harness — the scaffolding that decides what context an agent sees and what tools it can call. Five of the six authors are Berkeley: Melissa Z. Pan, Shuo Yang, Negar Arabzadeh, Ion Stoica and Matei Zaharia. Stoica and Zaharia are behind Spark, Ray and Databricks; Chiang co-created Chatbot Arena. Arena sponsored the API access for the experiments, which is worth stating plainly.

The finding: on the same benchmark, the same model, the scaffolding moves the bill far more than it moves the result.

## What the study measured

Seven models across three harnesses — Claude Code, Codex CLI, and Pi, a deliberately minimal harness with four tools: read, write, edit, bash. Two benchmarks, SWE-bench Lite and Terminal-Bench 2.0. Thirty tasks each, three attempts per task, so ninety rollouts per cell.

On SWE-bench Lite, Claude Fable 5 solved 97.8% of attempts in Claude Code, 96.7% in Codex and 96.7% in Pi — at $1.33, $0.89 and $0.67 per attempt. Across shared models, Claude Code cost about 2.0x Pi and 1.6x Codex, by geometric mean of cost ratios. The headline 5x gap belongs to GPT-5.6 Luna: $0.15 against $0.03 per attempt, at 55.6% versus 53.3%. A striking multiple, on a twelve-cent base.

Two details explain the mechanism better than the headline. Claude Code's mean initial context is over 10x Pi's across all seven models. And on SWE-bench Lite, Fable 5 averaged 15.4 turns in Pi against 15.3 in Claude Code — near-identical work, roughly double the cost. The tax is what you load before the agent does anything, paid on every turn.

Kimi K3, an open-weight model, sits close to the Pareto frontier on SWE-bench Lite and just below it on Terminal-Bench 2.0. Close to, not on: no Kimi cell is flagged as frontier on either benchmark.

**The boundaries matter.** Prices are a fixed list dated 1 September, applied identically across harnesses — not subscription or actual billing. Thirty tasks is a small sample, and the authors note the models may have encountered both benchmarks in training. Harness versions are not disclosed anywhere in the post, the data or the repository. The profiling traces are promised, not yet released. There is no arXiv paper. And nothing here tests multi-session work or evolving requirements, which is exactly where a richer harness might earn its cost. [Tomasz Tunguz's reading](https://tomtunguz.com/the-harness-margin-opportunity/) is the right one: the quality gap is undemonstrated at this sample size, not proven absent.

## Four levers, not one

For a team running a product on autopilot, the study reframes the cost question. Cost per durable improvement has four inputs, and most teams only tune one.

**Harness.** How much context and scaffolding you pay for on every turn. Cheapest to change, least often measured.

**Model.** The obvious lever, and on this evidence the one most likely to be over-credited when a bill goes up.

**Tools.** What the agent can call, and how much it must read before it can decide. Pi's four tools are the study's implicit argument that less can be enough.

**Task.** Which work you route to an agent at all. This governs the other three, and no benchmark will decide it for you.

## Use case one: PostHog runs ninety scouts on itself

On 15 September, PostHog published [an account of seven loops it runs on its own product](https://posthog.com/blog/self-driving-loops). This is new material, distinct from the Replay Vision fix covered last edition.

The architecture is a funnel. Scouts and signal sources emit signals; signals become reports; agents open pull requests for the actionable ones and ask for input on the rest. [The docs](https://posthog.com/docs/self-driving) state that PostHog runs over 90 scouts on its own product, and that after a merge, PostHog measures whether the change worked and feeds the result back.

Two loops are worth separating, because they have different economics.

The **friction loop** starts with a human complaint. In the worked example, a scout emitted a report about five minutes later, and PR #90832 was open eight minutes after that. The author approved at 14:22, merged at 17:27, and it reached production by 18:56 — under a working day from complaint to fix. The GitHub record confirms the PR was created and merged on 28 August.

The **error loop** starts with telemetry. On 5 September, an MCP error-rate alert fired at roughly 9.9% against a baseline of 0.3% to 1.2% over the previous fortnight — 88 errors in an hour across about 44 projects. Over the last month, roughly one in ten scout runs included a self-validation pass, where the scout checks its own fix.

The human gate is stated flatly: nothing reaches production until a human clicks merge. That holds up under inspection — recent self-driving PRs carry named human approvals and pass through a merge queue.

PostHog also publishes the clearest unit price anyone has: **$15 per merged PR**, with reports free. That is a price to customers, not PostHog's own cost, and the distinction matters when you are modelling your own bill.

A 10 September changelog entry adds something more consequential than any single fix: external MCP agents can now claim actionable reports from the inbox and attach implementation pull requests. The signal layer is being opened to harnesses PostHog does not control — which is precisely the substitution HarnessTax says is worth several multiples.

**Evidence boundary.** The under-a-day timeline is one anecdote, not a distribution. PostHog publishes no merge rate, no revert rate, and no cost to itself per merged PR.

## Use case two: Shopify's River, and what a gate is worth

Shopify's [account of River's vulnerability remediation](https://shopify.engineering/river-vulnerability-remediation), published 2 September, runs the same shape from a different signal. A vulnerability tracker entry triggers the agent, which validates that the vulnerability still exists at current head, rebases stale pull requests, regenerates lockfiles with repository tooling and repairs mechanical upgrade failures, documenting the investigation as it goes. Humans make product-behaviour calls and approve.

In the first eleven days of the dependency workflow, the backlog of open issues fell by about 70%, roughly two-thirds as direct merges. Security merges through what Shopify calls a freshness-gated merge queue went from about 10% to 80%.

That gate is the interesting part. CI results computed against a stale head are rejected. In HarnessTax terms this is a task-lever decision, not a model one: narrowing the work to changes whose correctness can be checked mechanically is what makes the loop affordable. Shopify does not disclose a launch date, so the eleven days cannot be placed on a calendar, and it publishes no cost figures at all.

## The number nobody publishes

Across every account in this window, throughput and cost are disclosed. Figma reports a [median cost of about $0.50 per agent PR review](https://www.figma.com/blog/how-figma-stays-ahead-of-vulnerabilities-with-agents/), with findings surfaced only once an agent holds 70% precision on a two-week lookback. Uber reports that [more than 70% of pull requests are attributed to agents](https://www.uber.com/us/en/blog/efficient-software-factory/), with cost per thousand model requests down almost 34% and cost per session down 52% between February and August.

Not one of them publishes an escaped-regression, revert or change-failure rate for agent-authored production changes.

That absence is the story. A 5x harness saving is worth nothing if the cheaper configuration ships one more defect per hundred merges, and none of the published evidence lets you check. HarnessTax measures cost per attempt on benchmarks with a known answer. Production has no answer key — which is why the gate, not the agent, is what you are actually buying.

If you are building one of these loops, the four levers are where the money is, and the harness line deserves the same scrutiny as the model line. But the number to instrument first is the one the whole industry is quietly not reporting: what fraction of agent-authored changes had to be reverted.

**Sources:** [HarnessTax](https://harnesstax.github.io/) · [Arena mirror](https://arena.ai/blog/coding-agents-harness-tax) · [PostHog self-driving loops](https://posthog.com/blog/self-driving-loops) · [PostHog docs](https://posthog.com/docs/self-driving) · [Shopify River](https://shopify.engineering/river-vulnerability-remediation) · [Figma](https://www.figma.com/blog/how-figma-stays-ahead-of-vulnerabilities-with-agents/) · [Uber](https://www.uber.com/us/en/blog/efficient-software-factory/) · [Tunguz](https://tomtunguz.com/the-harness-margin-opportunity/)
