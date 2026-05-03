# Section 3 — React Fundamentals

## Overview

This section introduces React as a typed UI state machine running in the browser: components as pure render functions, state transitions triggered by events, and side effects for I/O. By the end, you will model UI state with TypeScript unions, render typed recipe data through props, and load the MyCookBook XML file into React state using `useEffect` without losing type safety.

---

### 3.1 — Components, JSX, and typed props

React components are functions from input props to JSX output, similar to how a pure Python function maps inputs to return values, except the return value is a declarative UI tree. JSX is syntax sugar for function calls and does not bypass TypeScript; prop contracts are enforced at compile time. In C# terms, a component's props type is the public constructor signature for a render unit, and callers must satisfy it exactly. Avoid `any` props: typed props are the boundary that keeps state and rendering logic coherent as the tree grows.

#### Exercise 3.1.A — Extract a typed recipe row component

**File:** `src/components/RecipeRow.tsx`

**Task:** Create a reusable `RecipeRow` component that receives a single `recipe` prop typed as `RecipeSummary` and a `selected` prop typed as `boolean`. Render the recipe name and id in JSX, and render a visual selected marker that depends on `selected`. Then update `src/App.tsx` to render at least two `RecipeRow` instances with hardcoded sample data.

**Why:** This exercise forces a typed prop boundary between parent and child components, which is the core unit of React architecture.

#### Acceptance Criteria

- [ ] `src/components/RecipeRow.tsx` exists and exports a React function component
- [ ] `RecipeRow` props include `recipe: RecipeSummary` and `selected: boolean`
- [ ] JSX in `RecipeRow` renders both `recipe.name` and `recipe.id`
- [ ] `src/App.tsx` imports and uses `RecipeRow` at least twice with correctly typed props

---

### 3.2 — `useState<T>` and event handling

`useState` stores per-component state across renders; calling its setter schedules a new render from the updated state snapshot. The generic parameter `T` is equivalent to a C# generic field type or a Python `TypeVar`-annotated container: it defines what states are valid. Event handlers should be typed at the boundary (`React.MouseEvent`, `React.ChangeEvent`) and should perform immutable updates so state transitions remain explicit. For collections, update with map/filter patterns rather than in-place mutation.

#### Exercise 3.2.A — Add typed selection state and toggle handling

**File:** `src/App.tsx`

**Task:** Introduce local state for selected recipe ids using `useState<Set<string>>` or `useState<string[]>`. Add a typed click handler that toggles one recipe id in that state and wire it to each rendered recipe row. Ensure UI output changes when selection changes so the state transition is observable.

**Why:** This exercise maps event-driven updates to strongly typed state transitions, which is the central React mental model.

#### Acceptance Criteria

- [ ] `src/App.tsx` declares selection state with an explicit or inferable string-id type
- [ ] A toggle handler exists and is wired to user interaction
- [ ] State updates are immutable (no in-place mutation of existing state object/array)
- [ ] Rendered output reflects selected vs unselected state

---

### 3.3 — `useEffect` and loading data (parses the MyCookBook XML)

`useEffect` is for synchronizing component state with external systems such as file reads, network requests, or parsing work. Think of it as the lifecycle boundary where side effects are allowed, but scoped by dependencies instead of class lifecycle methods. Model loading with the `LoadState<T>` discriminated union from section 2.2 so render logic stays exhaustive and explicit. Keep parsing and transformation logic in plain typed functions; the effect should orchestrate when those functions run and where results are stored.

#### Exercise 3.3.A — Load XML text and model async state

**File:** `src/App.tsx`

**Task:** Add a `LoadState<string>` state value to represent XML-loading progress (`idle`, `loading`, `error`, `ready`). Implement a `useEffect` that fetches the XML text from a local path in `public/` and updates the load state based on success or failure. Render different JSX for each status branch using a `switch` or equivalent exhaustive control flow.

**Why:** This exercise combines side effects and typed async state, which is the foundation for parsing and rendering real recipe data in section 4.

#### Acceptance Criteria

- [ ] `src/App.tsx` stores XML fetch progress using a discriminated union (`LoadState<string>` or equivalent)
- [ ] A `useEffect` triggers the XML load and updates state on both success and failure paths
- [ ] Render logic handles each load status explicitly (`idle`, `loading`, `error`, `ready`)
- [ ] No `any` is introduced in the loading and rendering flow
