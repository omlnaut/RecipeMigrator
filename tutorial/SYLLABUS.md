# Tutorial Syllabus: TypeScript + React — Recipe Migrator

## Learner Profile

Senior backend/ML developer (Python, C#). Familiar with typed languages and Git. No meaningful prior JavaScript or frontend experience. Not interested in aesthetics — focused on correctness, types, and architecture.

## App Goal

A local browser tool that:
1. Loads a MyCookBook XML export and its images
2. Displays recipes with images, selectable
3. Converts selected recipes to Mealie JSON format (via Gemini) and validates the output with Zod
4. Exports validated recipes as a downloadable JSON file

## Tech Stack

- **Vite** — build tool / dev server
- **React 18** — UI framework
- **TypeScript** — strict mode
- **Zod** — schema validation
- **DevContainer** — reproducible environment (VS Code + Node.js)

## Progress Tracking

- Git tags mark subsection boundaries: `s1.1-start`, `s1.1-done`, `s1.2-start`, etc.
- The `check-my-work` skill infers current position from tags and evaluates the diff.
- The `start-section` skill generates content for the next section on demand and sets the first subsection start tag.

---

## Sections

### Section 1 — Environment Setup

| ID  | Title                                                | Est. Time | Status      |
| --- | ---------------------------------------------------- | --------- | ----------- |
| 1.1 | DevContainer: VS Code, Node.js, extensions           | 30 min    | in-progress |
| 1.2 | Scaffolding the app with Vite + React + TypeScript   | 30 min    | not-started |
| 1.3 | Project structure tour: what every file does and why | 30 min    | not-started |

### Section 2 — TypeScript for C#/Python Developers

| ID  | Title                                                           | Est. Time | Status      |
| --- | --------------------------------------------------------------- | --------- | ----------- |
| 2.1 | Structural vs. nominal typing: what you need to unlearn from C# | 45 min    | not-started |
| 2.2 | `type` vs `interface`, union types, `unknown` vs `any`          | 45 min    | not-started |
| 2.3 | Generics and utility types (`Partial`, `Pick`, `Record`)        | 45 min    | not-started |

### Section 3 — React Fundamentals

| ID  | Title                                                    | Est. Time | Status      |
| --- | -------------------------------------------------------- | --------- | ----------- |
| 3.1 | Components, JSX, and typed props                         | 45 min    | not-started |
| 3.2 | `useState<T>` and event handling                         | 45 min    | not-started |
| 3.3 | `useEffect` and loading data (parses the MyCookBook XML) | 60 min    | not-started |

### Section 4 — Building the Recipe Viewer

| ID  | Title                                                     | Est. Time | Status      |
| --- | --------------------------------------------------------- | --------- | ----------- |
| 4.1 | Domain modelling: TypeScript types from the XML structure | 45 min    | not-started |
| 4.2 | Recipe list with image display                            | 60 min    | not-started |
| 4.3 | Multi-select state and selection UI                       | 45 min    | not-started |

### Section 5 — Mealie Export

| ID  | Title                                       | Est. Time | Status      |
| --- | ------------------------------------------- | --------- | ----------- |
| 5.1 | Zod schema from the Mealie Recipe model     | 60 min    | not-started |
| 5.2 | Validating Gemini output against the schema | 45 min    | not-started |
| 5.3 | Export: generating a downloadable JSON file | 45 min    | not-started |
