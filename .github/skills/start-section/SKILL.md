---
name: start-section
description: Deprecated. Section content generation is now handled automatically by check-my-work when crossing into a new section. If invoked, run check-my-work instead.
---

<what-to-do>

This skill is deprecated. Run `check-my-work` instead — it handles evaluation, advancement, and section-content generation in one flow.

If the user explicitly asks to generate a new section without checking prior work, follow the `check-my-work` workflow: confirm the current subsection is done (or skip evaluation if the user is explicitly seeding a new section), generate the next section README following the `<section-content-format>` in `check-my-work`, set the `s[next]-start` tag, update `tutorial/SYLLABUS.md`, and commit.

</what-to-do>
