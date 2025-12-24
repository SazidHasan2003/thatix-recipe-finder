/* ================= GLOBAL SELECTORS ================= */

const loader = document.getElementById("loader");
const recipesLoader = document.getElementById("recipesLoader");
const recipeContainer = document.getElementById("recipe-container");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const modal = document.getElementById("details-modal");
const modalContent = document.querySelector(".modal-content");

const scrollToTopBtn = document.getElementById("scrollToTopBtn");
const nav = document.querySelector("nav");

/* ================= API URLS ================= */
const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const DETAILS_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

/* ================= LOADERS ================= */
function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}

function showRecipesLoader() {
  recipesLoader.classList.remove("hidden");
}

function hideRecipesLoader() {
  recipesLoader.classList.add("hidden");
}

/* ================= WORD LIMIT ================= */
function limitWords(text, maxWords = 30) {
  if (!text) return "";
  const words = text.split(/\s+/);
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "..."
    : text;
}

/* ================= INITIAL LOAD ================= */
window.addEventListener("load", () => {
  showLoader();
  fetchMeals("");
});

/* ================= FETCH MEALS ================= */
async function fetchMeals(query) {
  try {
    const response = await fetch(`${SEARCH_API}${query}`);
    const data = await response.json();
    displayMeals(data.meals);
  } catch (error) {
    recipeContainer.innerHTML = "<h2>Something went wrong</h2>";
  } finally {
    hideLoader();
    hideRecipesLoader();
  }
}

/* ================= DISPLAY MEALS ================= */
function displayMeals(meals) {
  recipeContainer.innerHTML = "";

  if (!meals) {
    recipeContainer.innerHTML = "<h2>No Data Found</h2>";
    return;
  }

  meals.forEach((meal) => {
    const description = limitWords(meal.strInstructions, 30);

    const card = document.createElement("div");
    card.className = "recipe-card hover-card";

    card.innerHTML = `
      <div class="card-image">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      </div>

      <div class="card-content">
        <h3>${meal.strMeal}</h3>
        <p>${description}</p>

        <div class="card-action">
          <button class="details-btn btn-hover" data-id="${meal.idMeal}">
            View Details
          </button>
        </div>
      </div>
    `;

    recipeContainer.appendChild(card);
  });
}

/* ================= SEARCH ================= */
function handleSearch() {
  const query = searchInput.value.trim();

  recipeContainer.innerHTML = "";
  showRecipesLoader();

  // Empty search → load all recipes
  fetchMeals(query);
}

searchBtn.addEventListener("click", handleSearch);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

/* ================= MODAL OPEN ================= */
recipeContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".details-btn");
  if (!btn) return;

  openModal(btn.dataset.id);
});

async function openModal(id) {
  modalContent.innerHTML = `
    <div class="modal-loader-wrapper">
      <div class="modal-loading"></div>
    </div>
  `;

  modal.classList.remove("hide");
  modal.classList.add("show");
  modal.style.visibility = "visible";
  document.body.style.overflow = "hidden";

  try {
    const response = await fetch(`${DETAILS_API}${id}`);
    const data = await response.json();
    renderModal(data.meals[0]);
  } catch {
    modalContent.innerHTML = "<p>Failed to load details</p>";
  }
}

/* ================= INGREDIENTS ================= */
function getIngredients(meal) {
  let html = "";
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const mea = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      html += `<li>${mea} ${ing}</li>`;
    }
  }
  return html;
}

/* ================= RENDERING MODAL ================= */
function renderModal(meal) {
  modalContent.innerHTML = `
    <div class="modal-image">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    </div>

    <h2>${meal.strMeal}</h2>

    <h3>Ingredients</h3>
    <ol>${getIngredients(meal)}</ol>

    <h3>Instructions</h3>
    <p>${meal.strInstructions}</p>

    <div class="modal-links">
      ${
        meal.strYoutube
          ? `<a href="${meal.strYoutube}" target="_blank">YouTube</a>`
          : ""
      }
      ${
        meal.strSource
          ? `<a href="${meal.strSource}" target="_blank">Source</a>`
          : ""
      }
    </div>

    <div class="modal-close">
      <button id="closeModalBtn">Close</button>
    </div>
  `;

  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeModal);
}

/* ================= CLOSE MODAL ================= */
function closeModal() {
  modal.classList.remove("show");
  modal.classList.add("hide");

  setTimeout(() => {
    modal.style.visibility = "hidden";
    modal.classList.remove("hide");
    document.body.style.overflow = "";
  }, 300);
}

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

/* ================= SCROLL TO TOP ================= */
window.addEventListener("scroll", () => {
  if (window.scrollY > nav.offsetHeight) {
    scrollToTopBtn.classList.add("show");
  } else {
    scrollToTopBtn.classList.remove("show");
  }
});

scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
