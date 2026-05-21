<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- PRINCIPLE_1_NAME -> I. Code Quality Is a Release Requirement
- PRINCIPLE_2_NAME -> II. Tests Prove Behavior
- PRINCIPLE_3_NAME -> III. User Experience Stays Consistent
- PRINCIPLE_4_NAME -> IV. Performance Budgets Are Explicit
- PRINCIPLE_5_NAME -> V. Simplicity and Boundaries
Added sections:
- Quality Gates
- Development Workflow
Removed sections:
- None
Templates requiring updates:
- Updated .specify/templates/plan-template.md
- Updated .specify/templates/spec-template.md
- Updated .specify/templates/tasks-template.md
- Updated .specify/templates/checklist-template.md
- Updated README.md
- Updated AGENTS.md
Follow-up TODOs:
- None
-->
# one-dead Constitution

## Core Principles

### I. Code Quality Is a Release Requirement
All production code MUST be TypeScript, use ES modules, and follow the existing
workspace structure. React UI code belongs in `apps/web/src/components/`,
browser services in `apps/web/src/services/`, game rules and session behavior in
`apps/web/src/game/`, and API behavior in `apps/api/src/`. New abstractions MUST
match established local patterns and MUST reduce concrete complexity,
duplication, or risk. Code that bypasses these boundaries, leaves dead paths, or
adds unused dependencies is not releasable.

Rationale: The app combines game domain rules, browser state, and a Cloudflare
Worker API. Clear ownership boundaries keep changes reviewable and prevent UI
components from becoming the source of game behavior.

### II. Tests Prove Behavior
Every feature plan MUST define how each user story will be verified before
implementation begins. Logic-heavy changes to game rules, session state,
persistence, API behavior, or cross-module contracts MUST include focused
automated tests when a runner exists, or introduce a minimal runner when the
change cannot be validated reliably by build, lint, and manual checks alone.
Tests MUST be written to fail for the intended behavior before implementation
when practicable. At minimum, web changes MUST pass `bun --cwd apps/web run
build` and `bun --cwd apps/web run lint` before release.

Rationale: No default test runner is currently configured, so the standard must
raise confidence without blocking small UI-only changes on unnecessary tooling.

### III. User Experience Stays Consistent
User-facing changes MUST preserve existing visual language, interaction
patterns, accessibility expectations, and responsive behavior. New screens,
modals, controls, and game flows MUST support keyboard and pointer use where
applicable, avoid layout shift during normal interaction, and provide clear
empty, loading, error, paused, and success states when those states can occur.
UI copy MUST be concise and consistent with the product tone already present in
the app.

Rationale: The game experience depends on predictable controls and readable
state. Inconsistent UI behavior makes correctness harder for users to trust.

### IV. Performance Budgets Are Explicit
Feature plans MUST state the expected performance impact and measurable budget
for user-visible work. Interactive gameplay and timers MUST remain responsive
under normal browser load, avoid unnecessary re-renders, and keep expensive
work out of render paths. Browser storage and network operations MUST handle
slow, offline, hidden-tab, and retry scenarios without freezing the interface.
API changes MUST document expected latency, payload size, and failure behavior
when they affect user flows.

Rationale: Performance regressions in a game are product regressions. Budgets
make tradeoffs visible before implementation rather than after release.

### V. Simplicity and Boundaries
Implementations MUST choose the smallest design that satisfies the specified
user stories, measurable outcomes, and quality gates. Shared state, persistence,
networking, and game rules MUST remain separated unless a plan documents why a
combined approach is simpler and lower risk. Features MUST avoid speculative
generalization, global mutable state, and broad rewrites unless required by the
accepted plan.

Rationale: A small Bun workspace can move quickly when changes stay local and
the reason for each boundary is explicit.

## Quality Gates

Feature plans MUST include constitution checks for code quality, testing, user
experience consistency, and performance. A plan that violates a principle MUST
record the violation, justify why it is necessary, and identify the simpler or
safer alternative that was rejected.

Before release, each change MUST document:

- Build, lint, test, and manual verification performed.
- Affected user stories and acceptance scenarios.
- Performance risks and any measured results for user-visible flows.
- Screenshots or recordings for visible UI changes.
- Configuration, deployment, storage, or secret-handling changes.

## Development Workflow

Work MUST proceed from specification to plan to tasks for feature-sized changes.
Tasks MUST be grouped by independently testable user story and include concrete
file paths. Foundational work may precede user stories only when it unblocks
multiple stories and cannot be delivered safely inside a single story slice.

Pull requests and reviews MUST verify constitution compliance before merge.
Reviewers MUST block changes that skip required verification, mix unrelated
refactors with feature work, weaken accessibility or responsiveness, or move
domain rules into UI components without an approved plan.

## Governance

This constitution supersedes conflicting repository habits, generated template
defaults, and informal practices. Amendments require a documented change to this
file, a semantic version bump, and updates to affected Spec Kit templates and
runtime guidance.

Versioning policy:

- MAJOR: Removes or redefines a core principle in a way that changes compliance.
- MINOR: Adds a principle, section, or materially expands required checks.
- PATCH: Clarifies wording without changing compliance expectations.

Compliance is reviewed during planning and again before release. Any exception
MUST be documented in the plan's Complexity Tracking section with a concrete
reason and a follow-up owner when remediation is deferred.

**Version**: 1.0.0 | **Ratified**: 2026-05-21 | **Last Amended**: 2026-05-21
