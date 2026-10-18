# Product engineering delivery loop

The outcome is a polished workflow that a founder, marketer and assisting agent can use without thinking about the machinery. The current shared delivery path is: open a story → inspect its sourced preview → edit its design in Penpot → save → return and reopen the same work. Platform work serves a specific obstacle on this path.

## Roles and coordination

The orchestrator owns the complete journey, current milestone, integration and user communication. A frontend builder owns interaction, composition and addressable state. A backend builder owns the real services and durable data needed by that interaction. The evaluator owns the experience review, using the rendered product and actual interaction. Roles can rotate; there is one integration owner.

Use isolated worktrees for concurrent changes and small, reviewed trunk integrations. Split work by a complete customer behavior or a clearly owned file/component. Agree API names and response states before frontend and backend implementation diverge. Do not develop a mock interface as though it were the delivered product.

At each meaningful change, tell the orchestrator and affected builder: what now works, what changed in the shared contract, the next integration need, and any concrete blocker. The orchestrator reconciles these short updates into one delivery path. Escalate a conflicting product meaning, a missing dependency, or a decision beyond the current authority promptly. Resolve routine implementation choices locally. A blocker should come with the smallest viable alternative, not a growing collection of precautionary tasks.

## Working → quality → exceptional

**Working:** complete the real task with existing services, preserve the resulting work and make its state addressable. Review the actual browser behavior. Expose genuine unavailable states; do not present fixtures or mocked success as the customer workflow.

**Quality:** remove ambiguity and friction. Make the primary action obvious, keep the preview central, preserve context during navigation, provide immediate feedback, and make waiting, empty, error and recovery states useful. Review founder and marketer separately: their jobs and permissions differ.

**Exceptional:** simplify again. Remove controls, copy and indirection that do not help the current task. Refine spacing, alignment, typography, interaction and visual feedback until the interface feels obvious. Prefer familiar patterns and a small, maintainable implementation. Cleverness and extra configuration are not quality.

## Evaluator–optimizer cycle

1. Name the persona, task, intended outcome and evaluation scope. Scope can be the whole journey, screen, compound component or a nested control.
2. Observe the actual screen in BrowserOS neo and take a screenshot at the relevant viewport. Understand its surrounding layout before evaluating a smaller box.
3. Follow the primary path with real clicks. Inspect the supported states that matter to that task; use stable semantic controls and addressable URLs rather than repeatedly rediscovering the interface.
4. Return at most three concrete improvements, ordered by customer impact. Describe what is confusing or visually weak, why it affects this task, and the smallest change that would improve it. Include the screenshot or precise affected component.
5. The builder makes the change. Revisit the same view and action, compare before/after, and continue only if a material problem remains. Keep successful behavior and visual improvements integrated into trunk.

The evaluator is an optimizer, not an additional approval gate. Use judgment; do not invent scores, real-user evidence or universal coverage. No repeated review of unchanged surfaces. Check a whole screen again after a local improvement to ensure the composition still works.

## Human and agent interaction language

Use persistent story/design identifiers, meaningful URLs, semantic landmarks, accessible names and consistent action verbs. A control should communicate its current state and result. The agent should be able to move quickly through the same visible, understandable actions as a person. Keep authentication, operation keys, internal revisions and recovery machinery behind the task unless they explain a decision the user must make.

For the current journey, enter through `?org=<organization>&brand=<brand>&tab=studio&story=<story>&format=<format>`. Use `editor=prepared&page=<zero-based-page>` for a source-preview location. The visible **Campaign design in Penpot** region contains **Create design in Penpot** or **Open design in Penpot**. Open the returned native file/page link rather than searching the Penpot dashboard. After saving in Penpot, return to the same Studio URL and reopen that design. These identifiers and accessible names are the navigation language; screenshots supply visual judgment when structure alone is insufficient.

Local verification uses BrowserOS neo only. Keep hosted checks appropriate to the changed behavior and required repository checks; avoid speculative P99 work, expanding test matrices and redundant runs. Serialization, access control and recovery are implemented where the feature needs them, without becoming the feature or dominating its interface.
