# Section 5 — CSS Polish For The Recipe Viewer

## Overview

This section turns the working recipe viewer into something readable and deliberate instead of raw default HTML. The app already loads XML, parses recipes, renders images, and tracks selection state; the missing piece is presentation structure. CSS in this section is treated as a typed boundary's visual equivalent: layout rules define spatial relationships, component classes define visual states, and responsive rules constrain how the same data model is presented across screen sizes. By the end, the current app state has a coherent page shell, styled recipe cards with clear selection states, and responsive behaviour that still works on narrow screens without changing the underlying React logic.

---

### 5.1 — App shell, class names, and CSS tokens

CSS is a rule system that matches selectors against DOM nodes and computes a final style tree. The important mental model is not "paint these pixels" but "declare constraints for categories of elements". C# analogy: a CSS class is closer to attaching an interface marker and letting a renderer apply policy than it is to mutating control properties one by one. Python analogy: think of it as passing a configuration object into a rendering engine, not imperatively drawing widgets. The analogy breaks down because CSS is global and cascade-based: a later rule or more specific selector can override an earlier one, so local reasoning is weaker than in C# objects or Python function arguments.

For this app, start by giving the DOM useful hooks. JSX uses `className`, not `class`:

```tsx
// App.tsx
export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Recipe Migrator</h1>
      </header>
    </div>
  );
}
```

If a file defines component-specific rules, import that stylesheet explicitly:

```tsx
import "./App.css";
```

CSS custom properties are the lowest-friction way to define reusable design tokens without introducing another tool:

```css
/* App.css */
:root {
  --page-bg: #f6f1e8;
  --panel-bg: rgba(255, 252, 246, 0.92);
  --ink: #2b241c;
  --accent: #8f3d2e;
  --radius-lg: 24px;
  --space-md: 1rem;
  --space-xl: 2rem;
}
```

That `:root` selector attaches variables to the document root so every descendant can read them with `var(--token-name)`.

Wrong approach: leaving structural elements anonymous and then styling generic tags.

```css
/* Wrong: too broad, hard to reason about */
div {
  margin: 1rem;
}
```

Correct approach: assign semantic class names in JSX, then target those classes.

```css
.app-shell {
  min-height: 100vh;
  padding: var(--space-xl);
}

.app-header {
  max-width: 72rem;
  margin: 0 auto var(--space-xl);
}
```

Use class names for structure and variables for repeated values. Do not scatter hard-coded spacing and colors across unrelated selectors.

| Concern         | JSX hook                | CSS mechanism             | Why                               |
| --------------- | ----------------------- | ------------------------- | --------------------------------- |
| Page structure  | `className="app-shell"` | layout rules              | Makes the root container explicit |
| Reused values   | none                    | `:root` custom properties | Centralises colors and spacing    |
| Component state | conditional `className` | modifier classes          | Separates logic from presentation |

#### Exercise 5.1.A — Create a styled app shell

**File:** `src/App.tsx`, `src/App.css`

**Task:** Import `src/App.css` into `src/App.tsx` and add class names to the top-level app structure so the page has an explicit shell, header, toolbar area, and recipe list container. In `src/App.css`, define a small set of CSS custom properties for color, spacing, and radius, then use them to create a centered page layout with a distinct header panel and content panel.

**Why:** This exercise establishes the DOM hooks and design tokens needed for every later styling change without mixing presentation logic into React state code.

#### Acceptance Criteria

- [x] `src/App.tsx` imports `./App.css`
- [x] The top-level JSX in `src/App.tsx` includes class names for an app shell and at least one inner layout container
- [x] `src/App.css` defines CSS custom properties under `:root`
- [x] The app layout is styled through class selectors in `src/App.css`, not by adding new inline style objects in `src/App.tsx`

---

### 5.2 — Card presentation, modifier classes, and visible selection state

A component's visual state is the CSS analogue of a discriminated union branch: the underlying data is the same object, but the presentation changes when one boolean or enum-like value changes. In React, that usually means computing a class string from props and letting CSS handle the appearance. C# analogy: this is like binding a view model property to a style trigger. Python analogy: it resembles selecting a template variant from data. The analogy breaks down because React does not have a built-in styling system; you are just emitting attributes into HTML and the browser resolves the cascade afterward.

A typed props object can drive conditional classes directly:

```tsx
type RecipeCardProps = {
  recipe: ParsedRecipe;
  selected: boolean;
  onToggle: (title: string) => void;
};

export function RecipeCard({ recipe, selected, onToggle }: RecipeCardProps) {
  const cardClassName = selected
    ? "recipe-card recipe-card--selected"
    : "recipe-card";

  return (
    <article className={cardClassName} onClick={() => onToggle(recipe.title)}>
      <h2 className="recipe-card__title">{recipe.title}</h2>
    </article>
  );
}
```

That pattern scales better than inline style objects because the React code only decides which state applies; CSS decides what that state looks like.

Wrong: packing the whole selected visual treatment into inline style.

```tsx
// Wrong: hard to extend to hover, focus, and mobile variants
<div style={{ outline: selected ? "2px solid blue" : "none" }} />
```

Correct: use a modifier class and let CSS express the state.

```css
.recipe-card {
  border: 1px solid rgba(43, 36, 28, 0.12);
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.recipe-card--selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(143, 61, 46, 0.16);
}
```

Images need explicit constraints or they will render at inconsistent sizes. Use a wrapper or direct class with `aspect-ratio`, `width`, and `object-fit`.

```css
.recipe-card__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 18px;
}
```

| State         | JSX expression                                                   | CSS selector             |
| ------------- | ---------------------------------------------------------------- | ------------------------ |
| Base card     | `"recipe-card"`                                                  | `.recipe-card`           |
| Selected card | `selected ? "recipe-card recipe-card--selected" : "recipe-card"` | `.recipe-card--selected` |
| Text element  | `className="recipe-card__title"`                                 | `.recipe-card__title`    |

#### Exercise 5.2.A — Move selection visuals into CSS

**File:** `src/components/RecipeCard.tsx`, `src/App.css`

**Task:** Replace the current inline selected styling in `RecipeCard` with class-based styling. Give the card, its image, and its text elements stable class names, and add CSS rules in `src/App.css` so cards have a clear base appearance plus a distinct selected state. Preserve the existing click-to-toggle behaviour.

**Why:** This exercise separates state transitions from presentation and makes the component visually extensible without changing its TypeScript surface area.

#### Acceptance Criteria

- [x] `src/components/RecipeCard.tsx` uses class names for card structure and selection state
- [ ] The selected visual treatment is expressed in `src/App.css`, not only through inline `style`
- [x] The recipe image is styled with explicit sizing rules so cards remain visually consistent
- [x] Clicking a card still toggles selection after the styling refactor

---

### 5.3 — Responsive layout, button states, and narrow-screen behaviour

Responsive CSS is not a second layout system. It is the same rule set with conditional branches based on viewport characteristics. C# analogy: think of media queries as policy rules selected by runtime environment rather than by domain state. Python analogy: it is like branching on terminal width when formatting output. The analogy breaks down because CSS conditions are declarative and compositional: multiple rules can all apply at once, and the cascade resolves the final result.

The current recipe viewer has at least three screen-dependent concerns: the toolbar should wrap instead of overflowing, recipe cards should flow into a grid or stack depending on width, and button states should remain legible when disabled.

A basic media query looks like this:

```css
@media (max-width: 700px) {
  .app-shell {
    padding: 1rem;
  }

  .app-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
```

That rule does nothing until the viewport is `700px` wide or narrower. Outside the query, the base rules still apply.

Buttons also need explicit states. Disabled is not just a boolean in React; it becomes a browser pseudo-class you can style:

```css
.toolbar-button {
  border: 0;
  border-radius: 999px;
  padding: 0.8rem 1.2rem;
}

.toolbar-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
```

Wrong: rely on browser defaults and hope the state is obvious.

```css
/* Wrong: no disabled state, no responsive adjustment */
.toolbar-button {
  padding: 0.5rem;
}
```

Correct: define base, hover/focus, and disabled states, then add viewport-specific adjustments only where needed.

```css
.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1rem;
}

@media (max-width: 700px) {
  .recipe-list {
    grid-template-columns: 1fr;
  }
}
```

| Concern        | Base rule                | Narrow-screen override |
| -------------- | ------------------------ | ---------------------- |
| Toolbar layout | horizontal flex row      | vertical stack         |
| Recipe list    | multi-column grid        | single column          |
| Page padding   | generous desktop spacing | reduced mobile spacing |

#### Exercise 5.3.A — Make the viewer responsive and readable on mobile

**File:** `src/App.css`

**Task:** Add responsive rules so the toolbar and recipe list adapt cleanly on narrow screens. Style the load/export buttons with explicit normal and disabled states, and ensure the recipe list does not overflow horizontally on mobile-width viewports.

**Why:** This exercise forces the CSS to express environment-dependent layout decisions while leaving the React and TypeScript logic unchanged.

#### Acceptance Criteria

- [ ] `src/App.css` contains at least one `@media` rule for narrow screens
- [ ] The recipe list layout changes under the media query to avoid horizontal overflow
- [ ] Button styling includes an explicit `:disabled` rule
- [ ] The app remains usable on both desktop-width and narrow-width viewports without changing TypeScript logic
