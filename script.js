// Recipe database (fake AI brain)
const recipes = [
  {
    name: "Veggie Rice",
    ingredients: ["rice", "onion", "tomato"],
    cost: 40,
    category: "Lunch",
    variations: ["Smoky", "Crispy", "Herby"]
  },
  {
    name: "Egg Toast",
    ingredients: ["eggs", "bread"],
    cost: 30,
    category: "Breakfast",
    variations: ["Golden", "Wholesome", "Quick"]
  },
  {
    name: "Vegetable Salad",
    ingredients: ["cucumber", "tomato", "onion"],
    cost: 25,
    category: "Lunch",
    variations: ["Fresh", "Crunchy", "Zesty"]
  },
  {
    name: "Fried Rice",
    ingredients: ["rice", "carrot", "peas", "onion"],
    cost: 50,
    category: "Dinner",
    variations: ["Spicy", "Comforting", "Fast"]
  },
  {
    name: "Pancake Stack",
    ingredients: ["eggs", "milk", "flour"],
    cost: 35,
    category: "Breakfast",
    variations: ["Fluffy", "Sweet", "Weekend"]
  },
  {
    name: "Chickpea Bowl",
    ingredients: ["chickpeas", "tomato", "onion"],
    cost: 45,
    category: "Dinner",
    variations: ["Bold", "Cozy", "Protein-rich"]
  }
];

const substitutes = {
  eggs: "paneer",
  milk: "soy milk",
  bread: "roti",
  rice: "quinoa"
};

let typingInterval = null;

function renderLoading() {
  document.getElementById("output").innerHTML = `
    <div class="loading-card">
      <div class="loader"></div>
      <h3>Analyzing your pantry...</h3>
      <p>Matching recipes, checking budget, and shaping a smart plan.</p>
      <p id="typing-line" class="hint"></p>
    </div>
  `;

  const line = document.getElementById("typing-line");
  const phrases = [
    "Scanning ingredients for the best fit...",
    "Tweaking suggestions for your budget...",
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

function buildPlanData({ ingredients, budget, diet, mealType, matchedRecipes, totalCost }) {
  const confidence = Math.min(95, 55 + matchedRecipes.length * 12 + (totalCost <= budget ? 8 : 0) + (diet !== "Any" ? 5 : 0));
  const suggestions = [];

  if (ingredients.includes("eggs")) suggestions.push("A quick egg-based option looks strong.");
  if (ingredients.includes("rice")) suggestions.push("Rice-based meals will feel extra filling.");
  if (budget < 40) suggestions.push("Budget-friendly staples are the best fit.");
  if (diet === "Vegan") suggestions.push("Plant-based swaps keep this plan flexible.");
  if (suggestions.length === 0) suggestions.push("A balanced mix of pantry staples should work well.");

  const budgetStatus = totalCost > budget ? "warning" : "success";
  const budgetMessage = totalCost > budget
    ? `Your plan runs over budget. Try swaps like ${Object.entries(substitutes).slice(0, 2).map(([from, to]) => `${from} → ${to}`).join(", ")}.`
    : `This plan stays within your budget and feels ready to cook.`;

  const dietMessage = diet === "Vegan"
    ? "The suggestions are tuned for a plant-based meal path."
    : diet === "Vegetarian"
      ? "The suggestions are tuned for vegetarian-friendly cooking."
      : "The suggestions are flexible for any preference.";

  const recipeCards = matchedRecipes.length
    ? matchedRecipes.map(recipe => {
        const variation = recipe.variations[Math.floor(Math.random() * recipe.variations.length)];
        return `
          <div class="recipe-card">
            <div>
              <strong>${recipe.name}</strong>
              <p>${recipe.ingredients.join(", ")}</p>
              <span class="category-pill">${recipe.category}</span>
              <div class="confidence">✨ ${variation} variation</div>
            </div>
            <div class="recipe-meta">₹${recipe.cost}</div>
          </div>
        `;
      }).join("")
    : `
      <div class="recipe-card">
        <div>
          <strong>No strong match yet</strong>
          <p>Try adding staples like rice, eggs, or onions.</p>
        </div>
      </div>
    `;

  return {
    ingredients,
    budget,
    diet,
    mealType,
    matchedRecipes,
    recipeCards,
    totalCost,
    confidence,
    suggestions,
    budgetStatus,
    budgetMessage,
    dietMessage
  };
}

function renderPlan(planData) {
  document.getElementById("output").innerHTML = `
    <div class="ai-response">
      <div class="response-header">
        <div>
          <div class="mini-badge">AI response</div>
          <h2>✨ Personalized cooking plan</h2>
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

      <div class="recipe-list">
        ${planData.recipeCards}
      </div>

      <div class="insight-card ${planData.budgetStatus}">
        <strong>Budget insight</strong>
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
        <strong>Next steps</strong>
        <ul>
          <li>Check ingredients and prep surfaces</li>
          <li>Start with the highest-match recipe</li>
          <li>Save leftovers for the next meal</li>
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
    document.getElementById("ingredients").value = parsed.ingredients.join(", ");
    document.getElementById("budget").value = parsed.budget;
    document.getElementById("diet").value = parsed.diet;
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
    let matchedRecipes = recipes.filter(recipe =>
      recipe.ingredients.some(ingredient => ingredients.includes(ingredient))
    );

    if (mealType !== "Any") {
      matchedRecipes = matchedRecipes.filter(recipe => recipe.category === mealType);
    }

    if (diet === "Vegetarian") {
      matchedRecipes = matchedRecipes.filter(recipe => recipe.name !== "Egg Toast");
    }

    if (diet === "Vegan") {
      matchedRecipes = matchedRecipes.filter(recipe => !["Egg Toast", "Pancake Stack"].includes(recipe.name));
    }

    const totalCost = matchedRecipes.reduce((sum, recipe) => sum + recipe.cost, 0);
    const planData = buildPlanData({ ingredients, budget, diet, mealType, matchedRecipes, totalCost });

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
  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
  document.getElementById("ingredients").value = randomRecipe.ingredients.join(", ");
  document.getElementById("budget").value = randomRecipe.cost + 20;
  document.getElementById("diet").value = "Any";
  document.getElementById("mealType").value = randomRecipe.category;
  generatePlan();
}

document.addEventListener("DOMContentLoaded", restoreLastPlan);