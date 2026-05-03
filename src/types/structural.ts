type RecipeRef = {id: string, _kind: "recipe"};
type IngredientRef = {id: string, _kind: "ingredient"};

function printId(ref: RecipeRef) {
    console.log(ref.id);
}

function printIngredientId(ref: IngredientRef) {
    console.log(ref.id);
}

const rref: RecipeRef = {id: "recipe1", _kind: "recipe"};
printId(rref);

const iref: IngredientRef = {id: "ingredient1", _kind: "ingredient"};
printIngredientId(iref);