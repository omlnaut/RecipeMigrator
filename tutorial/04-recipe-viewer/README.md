# Section 4 — Building the Recipe Viewer

## Overview

This section turns the raw XML string from section 3 into a working recipe browser. You'll define TypeScript types that model the MyCookBook XML schema, implement a parser using browser-native DOM APIs, render a scrollable list of recipe cards with images, and layer multi-select state on top of the real parsed dataset. By the end, a user can load the XML, browse all recipes with images, and select a subset for export.

---

### 4.1 — Domain modelling: TypeScript types from the XML structure

#### The XML as a typed boundary

The `LoadState<string>` from section 3 holds raw XML text. Before rendering anything, that string must be parsed into typed objects. This is the same pattern as C# deserialization: you define an internal domain type that matches the external format, then work exclusively with the typed representation. The XML never leaks past the parser.

A single `<recipe>` element in `cookbook_recipes.xml` looks like this:

```xml
<recipe>
  <title>Baguette</title>
  <preptime></preptime>
  <cooktime></cooktime>
  <totaltime></totaltime>
  <description></description>
  <ingredient>
    <li>950g Mehl</li>
    <li>16g Salz</li>
  </ingredient>
  <recipetext>
    <li>Step 1</li>
    <li>Step 2</li>
  </recipetext>
  <url></url>
  <imagepath>/storage/emulated/0/Android/data/fr.cookbook/files/Pictures/_Baguette.jpg</imagepath>
  <imageurl></imageurl>
  <quantity></quantity>
  <rating>0</rating>
  <category>Grundrezept</category>
</recipe>
```

Most fields are plain string elements. `<ingredient>` and `<recipetext>` each contain multiple `<li>` children. Fields may be empty strings in the source. A type that maps this cleanly:

```ts
// src/types/recipe.ts
export type ParsedRecipe = {
  title: string;
  preptime: string;
  cooktime: string;
  description: string;
  ingredients: string[]; // <li> children of <ingredient>
  instructions: string[]; // <li> children of <recipetext>
  url: string;
  imagepath: string; // raw Android path from XML
  quantity: string;
  rating: number;
  category: string;
};
```

`imagepath` is kept as the raw XML value. Mapping it to a local URL is a separate concern handled in 4.2.

#### `DOMParser`: parsing XML in the browser

`DOMParser` is a browser built-in that parses an XML (or HTML) string into a live DOM tree. No import or installation needed.

```ts
const parser = new DOMParser();
const doc: Document = parser.parseFromString(xmlText, "application/xml");
```

The second argument is the MIME type. Use `"application/xml"` for XML documents. The returned `Document` is the same type as `window.document`, so all standard DOM methods work on it.

**C# analogy:** `DOMParser.parseFromString` is like `XDocument.Parse(string)` in `System.Xml.Linq`. The result is a tree you traverse with queries, not a directly typed object.

#### Querying the DOM tree

Two methods matter:

```ts
// Returns all matching descendants as NodeListOf<Element>
const nodes: NodeListOf<Element> = doc.querySelectorAll("recipe");

// Returns the first matching descendant, or null
const titleEl: Element | null = recipeNode.querySelector("title");
```

`NodeListOf<Element>` is array-like but not an array — it lacks `.map`, `.filter`, etc. Convert it with `Array.from`:

```ts
const recipeElements: Element[] = Array.from(doc.querySelectorAll("recipe"));
```

To read the text content of an element:

```ts
const text: string | null = element.textContent;
```

`textContent` returns `null` if the element doesn't exist. For required fields, narrow with `??`:

```ts
// String field — empty string if missing
const title = el.querySelector("title")?.textContent ?? "";

// Numeric field — parse with fallback
const rating = parseInt(el.querySelector("rating")?.textContent ?? "0", 10);
```

The optional chain (`?.`) short-circuits to `undefined` when `querySelector` returns `null`, then `??` provides the fallback. This is the standard pattern for every field in the parser.

#### Collecting `<li>` items

`<ingredient>` holds multiple `<li>` children. To extract them as a `string[]`:

```ts
const ingredientEl = el.querySelector("ingredient");
const ingredients: string[] = Array.from(
  ingredientEl?.querySelectorAll("li") ?? [],
).map((li) => li.textContent ?? "");
```

`ingredientEl?.querySelectorAll("li") ?? []` — the optional chain handles a missing `<ingredient>`; `?? []` ensures `Array.from` always receives an iterable.

**Wrong — omitting the fallback:**

```ts
// TypeScript error: Argument of type 'NodeListOf<Element> | undefined' is not
// assignable to parameter of type 'Iterable<unknown>'
const ingredients = Array.from(ingredientEl?.querySelectorAll("li")).map(...);
```

**Correct:**

```ts
const ingredients = Array.from(ingredientEl?.querySelectorAll("li") ?? []).map(
  (li) => li.textContent ?? "",
);
```

#### Full parser shape

```ts
// src/lib/parseRecipes.ts
import type { ParsedRecipe } from "../types/recipe";

export function parseRecipes(xmlText: string): ParsedRecipe[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const recipeElements = Array.from(doc.querySelectorAll("recipe"));

  return recipeElements.map((el) => {
    // Local helper: get text content of a direct child tag
    const text = (tag: string) => el.querySelector(tag)?.textContent ?? "";

    return {
      title: text("title"),
      preptime: text("preptime"),
      cooktime: text("cooktime"),
      description: text("description"),
      ingredients: Array.from(
        el.querySelector("ingredient")?.querySelectorAll("li") ?? [],
      ).map((li) => li.textContent ?? ""),
      instructions: Array.from(
        el.querySelector("recipetext")?.querySelectorAll("li") ?? [],
      ).map((li) => li.textContent ?? ""),
      url: text("url"),
      imagepath: text("imagepath"),
      quantity: text("quantity"),
      rating: parseInt(text("rating"), 10),
      category: text("category"),
    };
  });
}
```

The local `text` helper avoids repeating `el.querySelector(tag)?.textContent ?? ""` for every scalar field. It is defined inside the `map` callback, capturing `el` from the closure — the same as a private method capturing `this` in C#, but scoped per iteration.

---

#### Exercise 4.1.A — Define `ParsedRecipe` and implement `parseRecipes`

**File:** `src/types/recipe.ts` (add the type), `src/lib/parseRecipes.ts` (create this file and directory)

**Task:** Export a `ParsedRecipe` type from `src/types/recipe.ts`. Then create `src/lib/parseRecipes.ts` and export a `parseRecipes(xmlText: string): ParsedRecipe[]` function that uses `DOMParser` to parse the XML and returns a typed array. In `App.tsx`, after a successful XML fetch (the same path that sets `loadingState` to `"ready"`), call `parseRecipes` and store the result in a new state variable so you can verify the count of parsed recipes in the UI or console.

**Why:** This is the typed deserialization boundary — everything else in the app works with `ParsedRecipe[]`, never with raw XML strings or DOM nodes.

#### Acceptance Criteria

- [ ] `ParsedRecipe` is exported from `src/types/recipe.ts` with at least `title: string`, `ingredients: string[]`, `instructions: string[]`, `imagepath: string`, and `rating: number`
- [ ] `src/lib/parseRecipes.ts` exports `parseRecipes(xmlText: string): ParsedRecipe[]`
- [ ] The function uses `DOMParser` to parse the XML text
- [ ] `App.tsx` calls `parseRecipes` after a successful XML load and stores the result in component state

---

### 4.2 — Recipe list with image display

#### Serving local images through Vite

The recipe images are in `backup/images/`. To serve them through Vite's dev server, copy them into `public/images/`:

```sh
cp backup/images/* public/images/
```

Anything in `public/` is served at the root URL. A file at `public/images/_Baguette.jpg` is available at `/images/_Baguette.jpg`. Vite does not process these files — they are served as-is.

#### Mapping `imagepath` to a local URL

The `imagepath` field contains Android paths like:

```
/storage/emulated/0/Android/data/fr.cookbook/files/Pictures/_Baguette.jpg
```

You only need the filename. `Array.prototype.at(-1)` returns the last element of an array:

```ts
// "/storage/.../Pictures/_Baguette.jpg" → "_Baguette.jpg"
const filename = imagepath.split("/").at(-1) ?? "";
```

`.at(-1)` returns `string | undefined` — the `?? ""` fallback keeps the type `string`. The local URL is then:

```ts
const src = filename ? `/images/${filename}` : null;
```

A recipe with an empty `imagepath` produces `filename = ""`, which is falsy, so `src` is `null`.

#### The `<img>` element in JSX

```tsx
<img src="/images/_Baguette.jpg" alt="Baguette" />
```

- `src` is the image URL
- `alt` is displayed when the image fails to load and is required for accessibility

Some recipes have an `imagepath` that resolves to a filename that does not exist in `public/images/`. Handle this with the `onError` event:

```tsx
<img
  src={src}
  alt={recipe.title}
  onError={(e) => {
    (e.currentTarget as HTMLImageElement).style.display = "none";
  }}
/>
```

`e.currentTarget` is typed `EventTarget` by the DOM event model — it does not have `style`. The cast `as HTMLImageElement` is correct here because the handler is attached to an `<img>` element and the DOM spec guarantees `currentTarget` is that element. This is one of the few valid uses of `as` in this codebase.

**Wrong — accessing `.style` without the cast:**

```ts
// TypeScript error: Property 'style' does not exist on type 'EventTarget'
onError={(e) => { e.currentTarget.style.display = "none"; }}
```

**Correct:**

```ts
onError={(e) => {
  (e.currentTarget as HTMLImageElement).style.display = "none";
}}
```

#### Conditional `<img>` rendering

When `src` is `null`, render nothing:

```tsx
{src !== null && <img src={src} alt={recipe.title} onError={...} />}
```

When `src` is `null`, the expression short-circuits to `null` and React renders nothing.

#### RecipeCard component

```tsx
// src/components/RecipeCard.tsx
import type { ParsedRecipe } from "../types/recipe";

type RecipeCardProps = {
  recipe: ParsedRecipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const filename = recipe.imagepath.split("/").at(-1) ?? "";
  const src = filename ? `/images/${filename}` : null;

  return (
    <div>
      {src !== null && (
        <img
          src={src}
          alt={recipe.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <span>{recipe.title}</span>
      <span>{recipe.category}</span>
    </div>
  );
}
```

Rendering the list in `App.tsx` when data is ready — `title` is used as the `key` since `ParsedRecipe` has no `id`:

```tsx
{
  parsedRecipes.map((recipe) => (
    <RecipeCard key={recipe.title} recipe={recipe} />
  ));
}
```

---

#### Exercise 4.2.A — Render the parsed recipe list with images

**File:** `src/components/RecipeCard.tsx` (create), `src/App.tsx`

**Task:** Copy `backup/images/*` into `public/images/`. Create a `RecipeCard` component with a props object containing `recipe: ParsedRecipe` that renders the recipe title, category, and image. Derive the image `src` from `imagepath`, handle recipes with no image path, and handle image load failures via `onError`. Update `App.tsx` to render a `RecipeCard` for each recipe in the parsed list when load state is `"ready"`.

**Why:** This maps typed domain objects to rendered JSX and forces explicit handling of nullable data at the component boundary.

#### Acceptance Criteria

- [ ] `src/components/RecipeCard.tsx` exports a component typed with `recipe: ParsedRecipe` in its props object
- [ ] The component renders an `<img>` element only when a non-empty filename can be derived from `imagepath`
- [ ] Image load failures are handled via `onError` (element hidden or placeholder shown)
- [ ] `App.tsx` renders a `RecipeCard` per recipe when load state is `"ready"`

---

### 4.3 — Multi-select state and selection UI

#### Keying selection on `title`

`ParsedRecipe` has no `id` field — `title` is unique enough in this dataset to serve as the selection key. The toggle pattern from section 3.2 applies directly:

```ts
const [selectedTitles, setSelectedTitles] = useState<string[]>([]);

function onToggle(title: string) {
  setSelectedTitles((prev) =>
    prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
  );
}
```

#### Extending `RecipeCard` props

The card needs to know if it's selected and how to report clicks:

```tsx
type RecipeCardProps = {
  recipe: ParsedRecipe;
  selected: boolean;
  onToggle: (title: string) => void;
};

export function RecipeCard({ recipe, selected, onToggle }: RecipeCardProps) {
  return (
    <div
      onClick={() => onToggle(recipe.title)}
      style={{ outline: selected ? "2px solid blue" : "none" }}
    >
      {/* image and text */}
    </div>
  );
}
```

The `style` prop accepts a `React.CSSProperties` object — camelCased CSS property names and string or number values. Inline `style` is the lowest-friction way to apply a conditional visual change without a separate CSS file.

If you extract the style into a variable, annotate it to get property-name autocomplete and catch typos:

```ts
const containerStyle: React.CSSProperties = {
  outline: selected ? "2px solid blue" : "none",
};
```

#### Derived values from selection state

Selection count is not stored separately — compute it directly from state:

```tsx
<p>{selectedTitles.length} recipes selected</p>
```

An export button that is inert until something is selected:

```tsx
<button disabled={selectedTitles.length === 0}>Export selected</button>
```

`disabled` is a boolean prop on `<button>`. When `true`, the button is non-interactive.

**Wrong — storing count as separate state:**

```ts
// Out of sync with selectedTitles on every update
const [count, setCount] = useState(0);
```

**Correct — derive from existing state:**

```ts
// Always consistent; recomputed on every render for free
const count = selectedTitles.length;
```

Any value that is a pure function of existing state is a `const` computed inline, not a second `useState`. This is the same principle as a C# computed property (`=> expr`) vs. a separate backing field.

---

#### Exercise 4.3.A — Add multi-select over parsed recipes

**File:** `src/App.tsx`, `src/components/RecipeCard.tsx`

**Task:** Add `selected: boolean` and `onToggle: (title: string) => void` fields to `RecipeCard`'s props object. In `App.tsx`, manage a `string[]` state for selected recipe titles, implement a toggle handler using immutable update, and pass both `selected` and `onToggle` to each `RecipeCard`. Display the count of selected recipes and render an "Export selected" button that is `disabled` when no recipes are selected.

**Why:** This closes the loop between parsed domain data, list rendering, and event-driven state — the complete pattern that the Mealie export in section 5 builds on.

#### Acceptance Criteria

- [x] `RecipeCard` props include `selected: boolean` and `onToggle: (title: string) => void`
- [x] `App.tsx` manages `string[]` state for selected titles and wires a toggle handler to each card
- [x] Clicking a `RecipeCard` toggles its selection, with a visible UI change
- [x] The count of selected recipes is displayed
- [ ] An "Export selected" `<button>` is rendered and has `disabled={selectedTitles.length === 0}`
