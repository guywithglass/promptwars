const recipes = [
  {
    name: "Crispy Veggie Omelet",
    ingredients: ["eggs", "onion", "tomato", "spinach"],
    cost: 38,
    category: "Breakfast",
    dietary: "Vegetarian",
    variations: ["Golden", "Protein-rich", "Morning-ready"]
  },
  {
    name: "Banana Oats Bowl",
    ingredients: ["oats", "banana", "milk"],
    cost: 24,
    category: "Breakfast",
    dietary: "Vegetarian",
    variations: ["Creamy", "Cozy", "Quick"]
  },
  {
    name: "Peanut Butter Toast",
    ingredients: ["bread", "peanut butter", "banana"],
    cost: 26,
    category: "Breakfast",
    dietary: "Vegetarian",
    variations: ["Crunchy", "Sweet", "Fast"]
  },
  {
    name: "Chickpea Rice Bowl",
    ingredients: ["rice", "chickpeas", "tomato", "onion"],
    cost: 42,
    category: "Lunch",
    dietary: "Vegan",
    variations: ["Comforting", "Bright", "Filling"]
  },
  {
    name: "Hummus Wrap",
    ingredients: ["bread", "hummus", "cucumber", "tomato"],
    cost: 35,
    category: "Lunch",
    dietary: "Vegan",
    variations: ["Fresh", "Portable", "Crunchy"]
  },
  {
    name: "Garden Salad Bowl",
    ingredients: ["cucumber", "tomato", "onion", "spinach"],
    cost: 28,
    category: "Lunch",
    dietary: "Vegan",
    variations: ["Cool", "Light", "Mediterranean"]
  },
  {
    name: "Spicy Noodle Stir-Fry",
    ingredients: ["noodles", "carrot", "onion", "peas"],
    cost: 48,
    category: "Dinner",
    dietary: "Vegan",
    variations: ["Bold", "Fast", "Weeknight"]
  },
  {
    name: "Tomato Pasta",
    ingredients: ["pasta", "tomato", "onion", "garlic"],
    cost: 46,
    category: "Dinner",
    dietary: "Vegetarian",
    variations: ["Silky", "Classic", "Cozy"]
  },
  {
    name: "Tofu Curry",
    ingredients: ["tofu", "tomato", "onion", "rice"],
    cost: 54,
    category: "Dinner",
    dietary: "Vegan",
    variations: ["Rich", "Comforting", "Balanced"]
  },
  {
    name: "Paneer Quesadilla",
    ingredients: ["paneer", "bread", "onion", "tomato"],
    cost: 50,
    category: "Dinner",
    dietary: "Vegetarian",
    variations: ["Crispy", "Cheesy", "Snackable"]
  },
  {
    name: "Sweet Potato Toast",
    ingredients: ["sweet potato", "avocado", "tomato"],
    cost: 34,
    category: "Breakfast",
    dietary: "Vegan",
    variations: ["Bright", "Wholesome", "Trendy"]
  },
  {
    name: "Lentil Soup Bowl",
    ingredients: ["lentils", "onion", "tomato", "carrot"],
    cost: 40,
    category: "Lunch",
    dietary: "Vegan",
    variations: ["Warm", "Hearty", "Comforting"]
  }
];

const substitutes = {
  eggs: "paneer",
  milk: "soy milk",
  bread: "roti",
  rice: "quinoa",
  noodles: "rice noodles",
  chickpeas: "beans",
  tofu: "paneer",
  pasta: "rice noodles"
};

let typingInterval = null;

function renderLoading() {
  document.getElementById("output").innerHTML = `
    <div class="loading-card">
      <div class="loader"></div>
      <h3>Planning your day...</h3>
      <p>Matching meals, building your grocery list, and checking the budget.</p>
      <p id="typing-line" class="hint"></p>
    </div>
  `;

  const line = document.getElementById("typing-line");
  const phrases = [
    "Scanning ingredients for the best fit...",
    "Balancing flavor, cost, and timing...",
    "Adding a confident AI-style recommendation..."
  ];
  let phraseIndex = 0;
  let charIndex = 0;

  clearInterval(typingInterval);
  typingInterval = setInterval(() => {
    line.textContent = phrases[phraseIndex].slice(0, charIndex);
    charIndex += 1;

    if (charIndex > phrases[phraseIndex].length) {
      charIndex = 0;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }, 35);
}

function stopLoading() {
  clearInterval(typingInterval);
}

function getDietFilteredRecipes(diet) {
  if (diet === "Vegetarian") {
    return recipes.filter(recipe => recipe.dietary !== "Vegan" || recipe.dietary === "Vegetarian");
  }
  if (diet === "Vegan") {
    return recipes.filter(recipe => recipe.dietary === "Vegan");
  }
  return recipes;
}

function scoreRecipe(recipe, ingredients, budget, category) {
  let score = 0;
  const pantrySet = new Set(ingredients);
  const overlap = recipe.ingredients.filter(item => pantrySet.has(item)).length;
  score += overlap * 10;

  if (recipe.category === category) score += 8;
  if (recipe.cost <= budget / 3) score += 4;
  if (recipe.cost <= budget / 2) score += 2;

  return score;
}

function selectMealRecipes({ ingredients, budget, diet, focusCategory }) {
  const filteredRecipes = getDietFilteredRecipes(diet);
  const mealSlots = ["Breakfast", "Lunch", "Dinner"];
  const selected = [];
  const usedNames = new Set();

  mealSlots.forEach(slot => {
    const pool = filteredRecipes.filter(recipe => recipe.category === slot);
    let candidates = pool.filter(recipe => recipe.ingredients.some(item => ingredients.includes(item)) || focusCategory === "Any");

    if (candidates.length === 0) {
      candidates = pool;
    }

    candidates = candidates.filter(recipe => !usedNames.has(recipe.name));

    if (candidates.length === 0) {
      candidates = pool;
    }

    candidates.sort((a, b) => scoreRecipe(b, ingredients, budget, slot) - scoreRecipe(a, ingredients, budget, slot));
    const best = candidates[0];
    if (best) {
      selected.push(best);
      usedNames.add(best.name);
    }
  });

  return selected;
}

function buildPlanData({ ingredients, budget, diet, mealType, selectedMeals, totalCost }) {
  const pantrySet = new Set(ingredients);
  const groceryList = [...new Set(selectedMeals.flatMap(meal => meal.ingredients).filter(item => !pantrySet.has(item)))].sort();
  const substitutions = groceryList
    .filter(item => substitutes[item])
    .map(item => `${item} → ${substitutes[item]}`);

  const confidence = Math.min(95, 58 + selectedMeals.length * 8 + (totalCost <= budget ? 8 : 0) + (diet !== "Any" ? 4 : 0));
  const suggestions = [];

  if (ingredients.includes("eggs")) suggestions.push("Egg-based meals are a strong fit for your pantry.");
  if (ingredients.includes("rice") || ingredients.includes("noodles")) suggestions.push("Carb-forward meals will feel satisfying and filling.");
  if (budget < 80) suggestions.push("Budget-friendly meals are the safest bet for today.");
  if (diet === "Vegan") suggestions.push("Your plan leans plant-based and flexible.");
  if (suggestions.length === 0) suggestions.push("A balanced day of meals should work well with what you have.");

  const budgetStatus = totalCost > budget ? "warning" : "success";
  const budgetMessage = totalCost > budget
    ? `The day plan is ${totalCost - budget}₹ over budget. Swap a couple of items like ${substitutions.slice(0, 2).join(" and ") || "rice → quinoa"}.`
    : `The full day plan fits your budget and stays practical to cook.`;

  const dietMessage = diet === "Vegan"
    ? "The plan is tuned for a plant-based path with simple swaps."
    : diet === "Vegetarian"
      ? "The plan is tuned for vegetarian-friendly meals."
      : "The plan stays flexible for any preference.";

  const mealCards = selectedMeals.map(meal => `
    <div class="meal-card">
      <span class="meal-badge">${meal.category}</span>
      <strong>${meal.name}</strong>
      <p>${meal.ingredients.join(", ")}</p>
      <div class="meal-meta">₹${meal.cost}</div>
      <div class="confidence">✨ ${meal.variations[Math.floor(Math.random() * meal.variations.length)]} variation</div>
    </div>
  `).join("");

  return {
    ingredients,
    budget,
    diet,
    mealType,
    selectedMeals,
    totalCost,
    confidence,
    suggestions,
    budgetStatus,
    budgetMessage,
    dietMessage,
    groceryList,
    substitutions,
    mealCards
  };
}

function renderPlan(planData) {
  document.getElementById("output").innerHTML = `
    <div class="ai-response">
      <div class="response-header">
        <div>
          <div class="mini-badge">AI response</div>
          <h2>✨ Daily cooking to-do plan</h2>
        </div>
        <div class="status-pill">Live</div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <strong>Pantry</strong>
          <span>${planData.ingredients.length ? planData.ingredients.join(", ") : "No ingredients listed"}</span>
        </div>
        <div class="summary-card">
          <strong>Budget</strong>
          <span>₹${planData.budget || 0}</span>
        </div>
        <div class="summary-card">
          <strong>Diet</strong>
          <span>${planData.diet}</span>
        </div>
      </div>

      <div class="meal-grid">
        ${planData.mealCards}
      </div>

      <div class="grocery-card">
        <strong>🛒 Grocery list</strong>
        <div class="grocery-list">
          ${planData.groceryList.length ? planData.groceryList.map(item => `<span class="grocery-pill">${item}</span>`).join("") : "<span class="grocery-pill">No extra items needed</span>"}
        </div>
      </div>

      <div class="swap-card">
        <strong>🔁 Smart substitutions</strong>
        <div class="swap-list">
          ${planData.substitutions.length ? planData.substitutions.map(item => `<span class="swap-pill">${item}</span>`).join("") : "<span class="swap-pill">No swaps needed</span>"}
        </div>
      </div>

      <div class="insight-card ${planData.budgetStatus}">
        <strong>Budget feasibility</strong>
        <p>${planData.budgetMessage}</p>
        <p>${planData.dietMessage}</p>
      </div>

      <div class="todo-card">
        <strong>AI suggestions</strong>
        <ul>
          ${planData.suggestions.map(item => `<li>${item}</li>`).join("")}
        </ul>
        <div class="confidence">🧠 Confidence score: ${planData.confidence}%</div>
      </div>

      <div class="todo-card">
        <strong>Cooking to-do list</strong>
        <ul>
          <li>Check the grocery list and pantry items</li>
          <li>Prep breakfast first if it is the fastest meal</li>
          <li>Cook lunch and dinner with leftovers in mind</li>
          <li>Save any unused ingredients for tomorrow</li>
        </ul>
      </div>
    </div>
  `;
}

function saveLastPlan(planData) {
  localStorage.setItem("kitchenCopilotLastPlan", JSON.stringify(planData));
}

function restoreLastPlan() {
  const saved = localStorage.getItem("kitchenCopilotLastPlan");
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    document.getElementById("ingredients").value = (parsed.ingredients || []).join(", ");
    document.getElementById("budget").value = parsed.budget || 180;
    document.getElementById("diet").value = parsed.diet || "Any";
    document.getElementById("mealType").value = parsed.mealType || "Any";
    renderPlan(parsed);
  } catch (error) {
    console.warn("Unable to restore last plan", error);
  }
}

function generatePlan() {
  const generateBtn = document.getElementById("generate-btn");
  const surpriseBtn = document.getElementById("surprise-btn");
  const ingredientsInput = document.getElementById("ingredients").value.toLowerCase().trim();
  const ingredients = ingredientsInput
    ? ingredientsInput.split(",").map(value => value.trim()).filter(Boolean)
    : [];
  const budget = parseInt(document.getElementById("budget").value) || 0;
  const diet = document.getElementById("diet").value;
  const mealType = document.getElementById("mealType").value;

  generateBtn.disabled = true;
  surpriseBtn.disabled = true;
  generateBtn.textContent = "Thinking...";
  surpriseBtn.textContent = "Thinking...";
  renderLoading();

  setTimeout(() => {
    const selectedMeals = selectMealRecipes({ ingredients, budget, diet, focusCategory: mealType });
    const totalCost = selectedMeals.reduce((sum, meal) => sum + meal.cost, 0);
    const planData = buildPlanData({ ingredients, budget, diet, mealType, selectedMeals, totalCost });

    renderPlan(planData);
    saveLastPlan(planData);

    generateBtn.disabled = false;
    surpriseBtn.disabled = false;
    generateBtn.textContent = "✨ Generate AI Plan";
    surpriseBtn.textContent = "🎲 Surprise Me";
    stopLoading();
  }, 900);
}

function surpriseMe() {
  const surprisePool = recipes.filter(recipe => recipe.category === "Breakfast");
  const breakfast = surprisePool[Math.floor(Math.random() * surprisePool.length)];
  const lunch = recipes.filter(recipe => recipe.category === "Lunch")[Math.floor(Math.random() * 3)];
  const dinner = recipes.filter(recipe => recipe.category === "Dinner")[Math.floor(Math.random() * 4)];
  const surpriseIngredients = [...new Set([...breakfast.ingredients, ...lunch.ingredients, ...dinner.ingredients])];

  document.getElementById("ingredients").value = surpriseIngredients.join(", ");
  document.getElementById("budget").value = breakfast.cost + lunch.cost + dinner.cost + 20;
  document.getElementById("diet").value = "Any";
  document.getElementById("mealType").value = "Any";
  generatePlan();
}

document.addEventListener("DOMContentLoaded", restoreLastPlan);