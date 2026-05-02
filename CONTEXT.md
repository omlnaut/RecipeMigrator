# Context

This repository is a learning project and local tool. The domain is recipe migration — specifically converting recipes from the MyCookBook Android app to the Mealie self-hosted recipe manager.

## Glossary

**MyCookBook Export**
An XML file (`MyCookBook_Backup_*.xml`) produced by the MyCookBook Android app. Contains a list of `<recipe>` elements, each with title, ingredients, instructions, category, image path, and metadata fields.

**Recipe**
A single dish definition from a MyCookBook export. Has a title, ingredients (as a list), instructions (as a list), an optional image, and optional metadata (prep time, cook time, category, URL, rating).

**Image**
A JPEG file bundled alongside the MyCookBook export. Each Recipe may reference one image by a local Android file path. The filename portion of that path maps to a file in the `backup/images/` directory.

**Mealie Recipe**
The target format. A JSON object conforming to the Mealie API's `Recipe` schema. Contains structured fields for name, recipe ingredients, recipe instructions, categories, tags, and metadata. Defined by the Mealie OpenAPI spec.

**Conversion**
The act of transforming a Recipe (MyCookBook format) into a Mealie Recipe (Mealie JSON format). Done via a Gemini API call. Conversion output is validated against the Mealie Zod schema before use.

**Zod Schema**
A TypeScript-first runtime validation schema (using the `zod` library) that mirrors the Mealie Recipe JSON structure. Used to validate Gemini conversion output.

**Export**
The act of serialising one or more validated Mealie Recipes to a downloadable JSON file.

**Selection**
The set of Recipes the user has chosen (via checkboxes in the UI) to include in an Export.
