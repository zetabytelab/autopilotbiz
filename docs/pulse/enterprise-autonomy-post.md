# From driving assistance to enterprise autonomy

Status: editorial proposal and LinkedIn draft; not published. Sources checked September 10, 2026.

## Editorial thesis

The next useful unit of autonomy to measure is a defined business workflow or function. A company can have an autonomous support workflow alongside human-run finance, sales and incident response. A vendor selling agents is not necessarily itself an autonomously operated company.

Use three distinct groups in the index: businesses operated with agents; vendors automating enterprise functions; enabling infrastructure. SRE is an enterprise function, not necessarily a standalone line of business with its own P&L. An autonomous line of business is a broader claim requiring evidence across the relevant operations.

Augustin Friedel's supplied automotive infographic inspires the comparison. Credit him by name; do not present the enterprise framework as his work or as an SAE standard. Do not repeat its time-sensitive automotive company claims without separate verification.

## Proposed workflow scale

This is an editorial analogy, not SAE certification and not a replacement for the index's existing level labels. Assess a deployed workflow, configuration and observation period, not a vendor logo.

| Proposed level | Human/system relationship | Illustrative SRE workflow, not a vendor rating |
| --- | --- | --- |
| L0: Manual operation | Person investigates, decides and executes | Engineer handles the incident |
| L1: Assistance | Agent supplies suggestions or draft work | Agent summarises logs; engineer diagnoses and acts |
| L2: Supervised execution | Agent performs multiple steps; person monitors and controls consequential actions | Agent investigates and prepares a remediation; engineer supervises and approves execution |
| L3: Conditional operation | Agent runs a defined workflow; available human must take over on exceptions | Agent handles a supported incident class, relying on human fallback outside its competence |
| L4: Bounded autonomy | Agent handles the workflow and its fallback inside an explicit operating domain without requiring immediate human rescue | Agent applies permitted fixes, verifies results and can roll back or reach a defined safe state |
| L5: General autonomy | No domain-specific restrictions or operational human fallback within the defined function | Aspirational category; no vendor assigned from this research |

An L4 safe stop is not a successfully resolved incident. Track completion separately from safe containment. People still set objectives, authorise resources and retain organisational accountability. The analogy does not imply legal responsibility transfers to software.

The automotive basis is the distinction between ongoing driver supervision, a fallback-ready driver, and operation without driver intervention within a defined domain. [SAE J3016](https://saemobilus.sae.org/standards/j3016_202104-taxonomy-definitions-terms-related-driving-automation-systems-road-motor-vehicles); [NHTSA overview](https://www.nhtsa.gov/vehicle-safety/automated-vehicle-safety).

## Companies to compare by function

All descriptions below are public vendor positioning or documentation, not independently verified autonomy ratings.

| Function | Examples | What the sources support | What remains to test |
| --- | --- | --- | --- |
| SRE / production operations | Resolve AI; NeuBird | Resolve describes alert triage and incident investigation; NeuBird describes governed operations around production telemetry and agents | Write permissions, approval gates, actual remediation, rollback and verified recovery |
| Accounting | Basis | Accounting, tax and audit workflows; its homepage explicitly positions humans at review | Reviewer time, exception handling, scope of final approval |
| Customer support | Minimal | Automated protocols and integrations; documentation describes escalation and cases requiring actions not yet configured | Reopened tickets, successful resolution, escalation latency and permission boundaries |
| App and business creation | Atoms; NanoCorp | Atoms markets app/website creation; NanoCorp markets autonomous AI businesses | What remains human-operated after launch; repeated production outcomes rather than generated pages |

Sources:

- [Resolve AI: AI SRE](https://website-prod.resolve.ai/product/ai-sre)
- [NeuBird: operations platform](https://neubird.ai/)
- [Basis: work prepared for review](https://www.getbasis.ai/)
- [Minimal: protocols and escalation](https://docs.gominimal.ai/training/protocols)
- [Minimal: integrations](https://gominimal.ai/integrations)
- [Atoms](https://atoms.dev/)
- [NanoCorp](https://www.nanocorp.so/)

Resolve AI and NeuBird are research candidates for the enterprise-function watchlist; this draft does not add them to the live index. Basis, Minimal, Atoms and NanoCorp already appear in the local tracked dataset.

## Evidence to collect

For each workflow record its trigger, eligible workload, connected systems, permissions, financial limits, escalation rules, verification and fallback. Report successful completion without human intervention, human minutes per case, failed/unsafe actions, time to recovery, and cost per verified outcome over a stated period. Include excluded cases and workload complexity so a narrowly filtered denominator does not masquerade as universal autonomy.

## LinkedIn post

What would L4 autonomy look like inside a company?

Augustin Friedel's map of autonomous driving and ADAS got me thinking about the businesses and agent builders I track at Autopilot Index.

In driving, the distinction includes who supervises, who takes over and the conditions in which the system can operate.

We need the same clarity for enterprise agents.

👉 An AI SRE can investigate an incident. Can it also apply a fix, verify recovery and handle a failed fix?

👉 An accounting agent can prepare the work. What still needs a person's review?

👉 A support agent can answer a customer. Can it resolve the issue within its permissions—and handle the exception?

Resolve AI and NeuBird in production operations, Basis in accounting, and Minimal in customer support make this a useful area to examine. Their public product descriptions are starting points, not autonomy certificates.

Alongside AI company builders, I want to track **how much of a defined business function agents can reliably operate.**

My hypothesis: meaningful enterprise autonomy can emerge function by function, before an entire business runs itself.

Think of an operating domain for each agent: which systems, which actions, what budget, what exceptions and what happens when it fails.

An agent that needs continuous supervision is different from one that can operate within those boundaries and reach a safe state when something goes wrong. Both can be useful. They make different promises.

**Which business function would you trust to run without continuous supervision—and what evidence would you require first?**

Thanks, Augustin, for the automotive perspective that prompted this comparison.

#AIAgents #EnterpriseAI #AutopilotIndex

## First comment

The distinction I want to measure: an agent vendor, an autonomous workflow and an autonomously operated company are three different things.

Autopilot Index: https://www.autopilotindex.com/

Useful examples:
Resolve AI: https://resolve.ai/product/overview
NeuBird: https://neubird.ai/
Basis: https://www.getbasis.ai/
Minimal's escalation rules: https://docs.gominimal.ai/training/protocols

The automotive analogy comes from SAE's driving-automation framework. Any enterprise levels I propose are editorial, not an SAE standard or a certification of these vendors.

## Infographic brief

Title: PATHS TOWARDS AUTONOMOUS BUSINESS FUNCTIONS

Use an original layout: central six-step workflow scale; left panel for the human's changing role; right panel for SRE, accounting, support and business-building examples. Keep vendor names in function boxes, not attached to unverified levels. Bottom strip: permissions, evidence, verification, rollback and escalation. Footer: Editorial framework inspired by automotive automation; not SAE certification. Inspiration: Augustin Friedel. Public sources checked September 10, 2026.

Keep autonomy separate from breadth: a narrow workflow with robust fallback may be more autonomous than a broad multi-agent demo. Do not imply that adding L4 functions automatically yields an L5 company.
