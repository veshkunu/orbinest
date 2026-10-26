# Product

## Register

product

## Users

Owners, managers and staff of small businesses (roughly 5–50 people): shops, bakeries, service companies, small offices. Most are not technical and use software only as part of their actual job.

- **Admins** (owner, operations manager) are often on a laptop between other work. They check who is working, hand out tasks, and look at how the team is doing.
- **Staff** are often on a phone or a shared computer. They want to see what they need to do today, mark it done, and get back to work.

## Product Purpose

Orbinest is a single place for a small business to manage employees, assign and track tasks, send notifications and see simple reports. Success means an admin can add a person or assign a task in under a minute without help, and a staff member understands their day at a glance.

The frontend currently runs on mock data and mock authentication. Supabase comes later and will replace only the `src/services` layer.

## Brand Personality

Calm, clear, dependable. The voice is plain and friendly, like a capable office manager: short sentences, everyday words ("Add employee", "Mark as done"), never jargon. The interface should make people feel in control, not rushed or impressed.

## Anti-references

- Enterprise HR suites with dense toolbars, nested menus and settings everywhere (old SAP / Oracle style).
- Flashy SaaS dashboards with gradient hero cards, glowing charts, glassmorphism and decorative motion.
- Dark "developer tool" aesthetics. This is for shop owners, not engineers.
- Icon-only navigation with no labels, and placeholder-only form fields.

## Design Principles

1. **Obvious over clever.** Standard patterns, visible labels, verbs on buttons. If a first-time user hesitates, the design is wrong.
2. **Today first.** Every screen leads with what needs doing now: overdue, due today, unread.
3. **Two clicks to the job.** Key actions (add employee, create task, mark done) are reachable within two clicks from the dashboard.
4. **Quiet until it matters.** Color and emphasis are reserved for actions and status. Red means something is wrong.
5. **Forgiving.** Clear errors that say how to fix the problem, confirmations before destructive actions, and empty states that explain what to do next.

## Accessibility & Inclusion

- WCAG 2.1 AA: 4.5:1 contrast for body text, 3:1 for large text and UI boundaries.
- 44px minimum touch targets. Full keyboard support with a visible focus ring.
- Status is never shown by color alone; it always has a text label.
- Respects `prefers-reduced-motion`.
- 16px base text on mobile to avoid zoom-on-focus. Plain language suitable for non-native English readers.
