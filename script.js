/* ============================================================
BUSINESSLIFE SIMULATOR (Optimized v3 - Debugged + Refined)
============================================================ */
// ===================== IMPORT FUNCTIONS ===================== //
import { displayManagedBusinesses } from './businessManagement.js';
// ===================== PLAYER DATA ===================== //
export let player = {
  stress: 0,
  money: 10000,
  reputation: 0,
  health: 100,
  happiness: 50,
  age: 18,
  month: 1,
  ownedBusinesses: [],
  ownedLuxury: [],
  profession: null
};

// ===================== FAMILY DATA ===================== //
let family = {
  surname: "",
  father: {},
  mother: {},
  siblings: []
};
// ===================== GLOBAL VARIABLES ===================== //
let businesses = [];
let luxuryItems = {};


const openLuxuryTab = document.getElementById("luxury-toggle");
const openBusinessTab = document.getElementById("business-toggle");
const openCareerTab = document.getElementById("career-toggle");

const businessModal = document.getElementById("businessModal");
const luxuryModal = document.getElementById("luxuryModal");
const lifeModal = document.getElementById("lifeModal");

const businessChoices = document.getElementById("business-choices");
const luxuryChoices = document.getElementById("luxury-choices");
const lifeChoices = document.getElementById("life-choices");

const ownedBusinessGrid = document.getElementById("owned-businesses");
const ownedLuxuryGrid = document.getElementById("owned-luxury-grid");
const lifeToggleBtn = document.getElementById("life-toggle");
lifeToggleBtn.addEventListener("click", openLifeTab);

// === CHARACTER CUSTOMIZATION ===
const characterModal = document.getElementById("characterModal");
const openCharacterTab = document.getElementById("open-character-tab");
const closeCharacter = document.getElementById("close-character");
const outfitSelection = document.getElementById("outfit-selection");
const outfitOptions = document.getElementById("outfit-options");
const characterPreview = document.getElementById("character-preview-img");

let playerGender = localStorage.getItem("playerGender") || null;
let playerOutfit = localStorage.getItem("playerOutfit") || null;

// Outfit data
const characterOutfits = {
  female: [
    { id: "polo", src: "assets/female/polo.png" },
    { id: "dress", src: "assets/female/dress.png" },
    { id: "suit", src: "assets/female/suit.png" },
    { id: "suit", src: "assets/female/princess.png" },
    { id: "suit1", src: "assets/female1/suit.svg" }, 
    { id: "athletic", src: "assets/female1/athletic.svg" },
    { id: "cocktail", src: "assets/female1/cocktail.svg" },
    { id: "casual", src: "assets/female1/casual.svg" },
    { id: "polo1", src: "assets/female1/polo.svg" }
  ],
  male: [
    { id: "polo", src: "assets/male/polo.png" },
    { id: "tshirt", src: "assets/male/tshirt.png" },
    { id: "suit", src: "assets/male/suit.png" },
    { id: "prince", src: "assets/male/prince.png" },
    { id: "suit1", src: "assets/male1/suit.svg" }, 
    { id: "athletic", src: "assets/male1/athletic.svg" },
    { id: "cocktail", src: "assets/male1/cocktail.svg" },
    { id: "casual", src: "assets/male1/casual.svg" },
    { id: "polo1", src: "assets/male1/polo.svg" }
  ]
};

// ===================== HELPERS ===================== //
function safeGet(id) {
  return document.getElementById(id);
}
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}
function clampStats() {
  player.health = Math.min(Math.max(player.health, 0), 100);
  player.happiness = Math.min(Math.max(player.happiness, 0), 100);
  player.reputation = Math.min(Math.max(player.reputation, 0), 100);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    toast.remove();
  }, 3000);
}

// ===================== BACKGROUND CONTROL ===================== //
function setGameBackground(imageName) {
  const bgDiv = document.getElementById("player-character-bg");
  if (bgDiv) {
    bgDiv.style.backgroundImage = `url('assets/svgs/${imageName}')`;
    bgDiv.style.backgroundSize = "cover";
    bgDiv.style.backgroundPosition = "center";
    bgDiv.style.backgroundRepeat = "no-repeat";
    bgDiv.style.transition = "background-image 0.8s ease-in-out";
  }
}
// ===================== MODAL HANDLING ===================== //

function openModal(modalElement) {
  document.querySelectorAll(".modal").forEach(m => {
    if (m !== modalElement) m.classList.add("hidden");
  });
  modalElement.classList.remove("hidden");
}
function closeModal(modalElement) {
  modalElement.classList.add("hidden");
}


// ===================== CARD PURCHASE ANIMATION ===================== //
function animateCardPurchase(imageSrc) {
  const img = document.createElement("img");
  img.src = `assets/svgs/${imageSrc}`;
  img.style.position = "fixed";
  img.style.top = "50%";
  img.style.left = "50%";
  img.style.transform = "translate(-50%, -50%) scale(0.5)";
  img.style.transition = "all 0.5s ease-in-out";
  img.style.zIndex = "1000";
  document.body.appendChild(img);
  setTimeout(() => {
    img.style.transform = "translate(-50%, -50%) scale(1.2)";
    img.style.opacity = "0";
  }, 50);
  setTimeout(() => img.remove(), 600);
}

// ===================== PROFESSION SELECTION ===================== //
function openProfessionSelection() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Choose Your Profession</h2>
      <div class="profession-grid">
        <button id="open-business-tab"><img src="assets/buttons/business.svg" alt="Business"></button>
        <button id="choose-athlete"><img src="assets/buttons/athlete.svg" alt="Athlete"></button>
        <button id="choose-licensed"><img src="assets/buttons/Licensed.svg" alt="Licensed"></button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector("#open-business-tab").onclick = () => {
    player.profession = "entrepreneur";
    showToast("You chose Entrepreneur!");
    modal.remove();
  };
  modal.querySelector("#choose-athlete").onclick = () => {
    player.profession = "athlete";
    openSportsTab();
    modal.remove();
  };
  modal.querySelector("#choose-licensed").onclick = () => {
    player.profession = "licensed";
    openLicensedTab();
    modal.remove();
  };
}

// ===================== SPORTS TAB ===================== //
function openSportsTab() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Sports Career</h2>
      <div class="sports-grid">
        <div class="sport-card" data-sport="basketball">
          <img src="assets/svgs/basketball.svg" alt="Basketball">
          <h3>Basketball</h3>
          <p>Train Cost: $500</p>
          <p>Health -5 | Happiness +5</p>
          <button>Train</button>
        </div>
        <div class="sport-card" data-sport="boxing">
          <img src="assets/svgs/boxing.svg" alt="Boxing">
          <h3>Boxing</h3>
          <p>Train Cost: $800</p>
          <p>Health -8 | Happiness +7</p>
          <button>Train</button>
        </div>
        <div class="sport-card" data-sport="swimming">
          <img src="assets/svgs/swim.svg" alt="Swimming">
          <h3>Swimming</h3>
          <p>Train Cost: $600</p>
          <p>Health -6 | Happiness +6</p>
          <button>Train</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();
  modal.querySelectorAll(".sport-card button").forEach(btn => {
    btn.onclick = () => {
      const cost = parseInt(btn.parentElement.querySelector("p").textContent.match(/\d+/)[0]);
      if (player.money < cost) return showToast("Not enough money to train!");

      player.money -= cost;
      player.health -= 5;
      player.happiness += 5;
      player.reputation += 2;

      updateStats();
      showToast(`You trained in ${btn.parentElement.dataset.sport}!`);
    };
  });
}
// ===================== LICENSED CAREER TAB ===================== //
function openLicensedTab() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Licensed Professions</h2>
      <div class="career-grid">
        <div class="career-card" data-career="doctor">
          <img src="assets/svgs/doctor.svg" alt="Doctor">
          <h3>Doctor</h3>
          <p>Workload: Health -10 | Reputation +5 | Money +5000</p>
          <button>Work</button>
        </div>
        <div class="career-card" data-career="engineer">
          <img src="assets/svgs/engineer.svg" alt="Engineer">
          <h3>Engineer</h3>
          <p>Workload: Health -5 | Reputation +3 | Money +4000</p>
          <button>Work</button>
        </div>
        <div class="career-card" data-career="lawyer">
          <img src="assets/svgs/lawyer.svg" alt="Lawyer">
          <h3>Lawyer</h3>
          <p>Workload: Health -7 | Reputation +4 | Money +4500</p>
          <button>Work</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();
  modal.querySelectorAll(".career-card button").forEach(btn => {
    btn.onclick = () => {
      const job = btn.parentElement.dataset.career;
      player.health -= 7;
      player.reputation += 4;
      player.money += 4000;
      player.happiness -= 2;
      updateStats();
      showToast(`You worked as a ${job}!`);
    };
  });
}

// ===================== CONTROL MODAL ===================== //

openMenuTab.onclick = () => openModal(document.getElementById("MenuTab"));
closeMenuTab.onclick = () => closeModal(document.getElementById("close-menu"));

// ===================== SELECT CHARACTER ===================== //
// Open and close modal
openCharacterTab.onclick = () => {
  openModal(characterModal);
};

closeCharacter.onclick = () => {
  closeModal(characterModal);
};

// Gender selection
document.querySelectorAll(".gender-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const gender = btn.dataset.gender;
    playerGender = gender;
    localStorage.setItem("playerGender", gender);
    showOutfits(gender);
  });
});

// Display outfits for selected gender
function showOutfits(gender) {
  outfitSelection.classList.remove("hidden");
  outfitOptions.innerHTML = "";

  characterOutfits[gender].forEach(outfit => {
    const img = document.createElement("img");
    img.src = outfit.src;
    img.alt = outfit.id;
    img.onclick = () => selectOutfit(outfit.id, outfit.src);
    outfitOptions.appendChild(img);
  });
}

// Select outfit
function selectOutfit(id, src) {
  playerOutfit = id;
  localStorage.setItem("playerOutfit", id);
  localStorage.setItem("playerOutfitSrc", src);

  // Update character preview in customization tab
  characterPreview.src = src;

  // Instantly change the actual in-game character image
  const playerCharacter = document.getElementById("playerCharacter");
  if (playerCharacter) {
    playerCharacter.src = src;
  }

  // Optional: subtle animation for feedback
  playerCharacter?.animate(
    [
      { transform: "scale(0.9)", opacity: 0.8 },
      { transform: "scale(1.05)", opacity: 1 },
      { transform: "scale(1)", opacity: 1 }
    ],
    { duration: 400, easing: "ease-in-out" }
  );

  showToast(`Outfit changed to ${id}!`);
}


const playerCharacter = document.getElementById("playerCharacter");
const savedOutfitSrc = localStorage.getItem("playerOutfitSrc");

if (savedOutfitSrc) {
  playerCharacter.src = savedOutfitSrc;
}


// ===================== LIFE EVENTS ===================== //
function handleLifeProgression() {
  if (player.age === 0) {
    showToast(`You were born into the ${family.surname} family!`);
  } else if (player.age === 3) {
    showToast(`You learned to talk and play with ${family.siblings[0]?.name || "your toys"}.`);
  } else if (player.age === 6) {
    showToast("You started school!");
  }else if (player.age === 12) {
  showToast("You discovered a hobby — maybe sports or studying!");
} else if (player.age === 18 && !player.profession) {
  showToast("You’re now an adult! Choose your profession!");
  openProfessionSelection();
}
}

// ===================== TIME PROGRESSION ===================== //
function advanceTime(type) {
  const monthsPassed = type === "year" ? 12 : 1;
  player.month += monthsPassed;

  if (player.month > 12) {
    player.month = 1;
    player.age++;
    handleLifeProgression();
  }

  let totalIncome = 0;
  player.ownedBusinesses.forEach(b => {
    totalIncome += (b.profitPerYear / 12) * monthsPassed;
    player.health -= (b.stressImpact / 12) * monthsPassed;
    player.reputation += (b.reputationImpact / 12) * monthsPassed;
  });

  // Profession-based income and impact
if (player.profession === "entrepreneur") {
  player.money += 12000 * (monthsPassed / 12);
  player.health -= 2 * (monthsPassed / 12);
  player.reputation += 1 * (monthsPassed / 12);
} else if (player.profession === "athlete") {
  player.money += 8000 * (monthsPassed / 12);
  player.health -= 4 * (monthsPassed / 12);
  player.happiness += 3 * (monthsPassed / 12);
} else if (player.profession === "licensed") {
  player.money += 6000 * (monthsPassed / 12);
  player.health -= 1 * (monthsPassed / 12);
  player.reputation += 2 * (monthsPassed / 12);
}

  player.money += Math.round(totalIncome);
  clampStats();
  updateStats();
  
  if (player.profession)
  showToast(`You earned income from your ${player.profession} career! Age: ${player.age}`);

}


// ===================== STATS UPDATE ===================== //
function updateStats() {
  clampStats();
  document.getElementById("money").textContent = `$${player.money.toLocaleString()}`;
  document.getElementById("reputation-text").textContent = `⭐ ${player.reputation}`;
  document.getElementById("age").textContent = `Age: ${player.age}`;
  document.getElementById("month").textContent = `Month: ${player.month}`;
  document.getElementById("profession").textContent = `Profession: ${player.profession || "None"}`;

  const healthFill = document.getElementById("health-fill");
  const happinessFill = document.getElementById("happiness-fill");
  const repFill = document.getElementById("reputation-fill");

  healthFill.style.width = `${player.health}%`;
  happinessFill.style.width = `${player.happiness}%`;
  repFill.style.width = `${player.reputation}%`;

  // Color logic
  healthFill.style.backgroundColor =
    player.health > 70 ? "#4CAF50" : player.health > 40 ? "#FFC107" : "#E53935";
  happinessFill.style.backgroundColor =
    player.happiness > 70 ? "#4CAF50" : player.happiness > 40 ? "#FFC107" : "#E53935";

  displayOwnedBusinesses();
  displayOwnedLuxury();
}


// ===================== FAMILY GENERATION ===================== //
function generateFamily() {
  const surnames = ["Santos", "Reyes", "Garcia", "Cruz", "Dela Cruz", "Mendoza", "Lopez"];
  const maleNames = ["Carlos", "Juan", "Miguel", "Jose", "Antonio", "Rafael"];
  const femaleNames = ["Maria", "Ana", "Carmen", "Sofia", "Isabella", "Luz"];

  family.surname = surnames[Math.floor(Math.random() * surnames.length)];

  family.father = { name: `${maleNames[Math.floor(Math.random() * maleNames.length)]} ${family.surname}`, relationship: 80 };
  family.mother = { name: `${femaleNames[Math.floor(Math.random() * femaleNames.length)]} ${family.surname}`, relationship: 90 };

  family.siblings = Array.from({ length: Math.floor(Math.random() * 3) }, () => {
    const gender = Math.random() < 0.5 ? "male" : "female";
    const name = `${gender === "male"
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)]
    } ${family.surname}`;
    return { name, gender, relationship: 70 };
  });
}
// ===================== PERSONAL LIFE ===================== //
function openLifeTab() {
lifeChoices.innerHTML = "";
const actions = [
{ name: "Vacation Trip", cost: 2000, stressChange: -20, happinessChange: +25, reputationChange: +3, image: "vacation.svg" },
{ name: "Family Time", cost: 500, stressChange: -15, happinessChange: +20, reputationChange: 0, image: "family.svg" },
{ name: "Charity Donation", cost: 1500, stressChange: -5, happinessChange: +10, reputationChange: +10, image: "charity.svg" },
{ name: "Spa Day", cost: 800, stressChange: -25, happinessChange: +15, reputationChange: 0, image: "spa.svg" }
];

actions.forEach(a => {
const card = document.createElement("div");
card.className = "life-card";
card.innerHTML = `       <img src="assets/svgs/${a.image || "default.svg"}" alt="${a.name}">       <p>${a.name}</p>       <p>Cost: $${a.cost}</p>       <p>Stress: ${a.stressChange}</p>       <p>Happiness: +${a.happinessChange}</p>       <p>Reputation: +${a.reputationChange}</p>       <button>Do Activity</button>
    `;
card.querySelector("button").onclick = () => doLifeAction(a, card);
lifeChoices.appendChild(card);
});

openModal(lifeModal);
}

function closeLifeTab() {
closeModal(lifeModal);
}

function doLifeAction(a, card) {
if (player.money < a.cost) return showToast("Not enough money!");

player.money -= a.cost;
player.stress = Math.max(0, player.stress + a.stressChange);
player.happiness = Math.min(100, player.happiness + a.happinessChange);
player.reputation += a.reputationChange;

card.animate([{ transform: "scale(0.9)" }, { transform: "scale(1)" }], { duration: 300 });
updateStats();
showToast(`You enjoyed ${a.name}!`);
}
/* ============================================================
BUSINESS & LUXURY SYSTEMS (Optimized v3.1)
============================================================ */

// ===================== BUSINESS TAB ===================== //
async function loadBusinesses() {
try {
const res = await fetch("businesses.json");
if (!res.ok) throw new Error("Failed to load businesses.json");
businesses = await res.json();
} catch (err) {
console.error(err);
}
}

function openBusinessTab() {
businessChoices.innerHTML = "";

businesses.forEach(b => {
const card = document.createElement("div");
card.className = "business-card";
card.innerHTML = `       <img src="assets/svgs/${b.image || "default.svg"}" alt="${b.name}">       <p>${b.name}</p>       <p>Cost: $${b.cost}</p>       <p>Stress: +${b.stressImpact}</p>       <p>Reputation: +${b.reputationImpact}</p>       <button>Buy</button>
    `;
card.querySelector("button").onclick = () => buyBusiness(b);
businessChoices.appendChild(card);
});

openModal(businessModal);
}

function closeBusinessTab() {
closeModal(businessModal);
}

function buyBusiness(b) {
const owned = player.ownedBusinesses.some(x => x.name === b.name);
if (owned) return showToast(`You already own ${b.name}!`);

if (player.money < b.cost) return showToast("Not enough money!");

player.money -= b.cost;
player.stress += b.stressImpact;
player.reputation += b.reputationImpact;
player.ownedBusinesses.push(b);

animateCardPurchase(b.image);
updateStats();
showToast(`Purchased ${b.name}!`);
}

function displayOwnedBusinesses() {
ownedBusinessGrid.innerHTML = "";
player.ownedBusinesses.forEach(b => {
const card = document.createElement("div");
card.className = "business-card";
card.innerHTML = `       <img src="assets/svgs/${b.image || "default.svg"}" alt="${b.name}">       <p>${b.name}</p>       <p>Stress: +${b.stressImpact}</p>       <p>Reputation: +${b.reputationImpact}</p>
    `;
ownedBusinessGrid.appendChild(card);
});
}

// ===================== LUXURY HANDLERS ===================== //
async function loadLuxuryItems() {
try {
const res = await fetch("luxury.json");
if (!res.ok) throw new Error("Failed to load luxury.json");
luxuryItems = await res.json();
} catch (err) {
console.error(err);
}
}

function openLuxuryTab() {
luxuryChoices.innerHTML = "";
const categoriesDiv = document.getElementById("luxury-categories");
categoriesDiv.innerHTML = "";

Object.keys(luxuryItems).forEach((category, index) => {
const catData = luxuryItems[category];
const btn = document.createElement("button");
btn.className = "luxury-category-btn";


const icon = document.createElement("img");
icon.src = `assets/svgs/${catData.icon || "default.svg"}`;
icon.alt = category;
icon.style.width = "24px";
icon.style.height = "24px";
icon.style.marginRight = "6px";

btn.appendChild(icon);
btn.appendChild(document.createTextNode(category));
if (index === 0) btn.classList.add("active");

btn.onclick = () => {
  setActiveCategory(btn);
  displayLuxuryCategory(category);
};
categoriesDiv.appendChild(btn);

});

const firstCategory = Object.keys(luxuryItems)[0];
if (firstCategory) displayLuxuryCategory(firstCategory);

openModal(luxuryModal);
}

function closeLuxuryTab() {
closeModal(luxuryModal);
}

function setActiveCategory(activeBtn) {
document.querySelectorAll("#luxury-categories button").forEach(btn =>
btn.classList.remove("active")
);
activeBtn.classList.add("active");
}

function displayLuxuryCategory(category) {
  luxuryChoices.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "luxury-grid";

  const items = luxuryItems[category]?.items || [];
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "luxury-card";
    card.innerHTML = `
      <img src="assets/svgs/${item.image || "default.svg"}" alt="${item.name}">
      <p>${item.name}</p>
      <p>Cost: $${item.cost.toLocaleString()}</p>
      ${item.happinessImpact ? `<p>Happiness: +${item.happinessImpact}</p>` : ""}
    `;

    const owned = player.ownedLuxury.some(l => l.name === item.name);

    // If owned, show "Set as Home" for Houses, otherwise "Owned"
    const button = document.createElement("button");

    if (owned && category === "Houses") {
      button.textContent = "Set as Home";
      button.onclick = () => {
        player.selectedHouse = item;
        localStorage.setItem("selectedHouse", JSON.stringify(item)); // save permanently
        setGameBackground(item.image);
        showToast(`${item.name} is now your home!`);
      };
    } 
    else if (!owned) {
      button.textContent = "Buy";
      button.onclick = () => buyLuxury(item, card);
    } 
    else {
      button.textContent = "Owned";
      button.disabled = true;
      button.style.opacity = "0.6";
    }

    card.appendChild(button);
    grid.appendChild(card);
  });

  luxuryChoices.appendChild(grid);
  grid.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
}
function buyLuxury(item, card) {
if (player.ownedLuxury.some(l => l.name === item.name))
return showToast(`You already own ${item.name}!`);
if (player.money < item.cost)
return showToast("Not enough money!");

player.money -= item.cost;
player.ownedLuxury.push(item);

  // If bought item is a House, set as background
if (item.category === "Houses") {
  player.selectedHouse = item;
  setGameBackground(item.image);
}

const gain = item.happinessImpact || 0;
player.happiness = Math.min(100, player.happiness + gain);
player.reputation += Math.floor(gain / 5);

animateCardPurchase(item.image);
updateStats();
showToast(`Purchased ${item.name}! Happiness +${gain}`);
}

function displayOwnedLuxury() {
ownedLuxuryGrid.innerHTML = "";
player.ownedLuxury.forEach(l => {
const card = document.createElement("div");
card.className = "luxury-card";
card.innerHTML = `       <img src="assets/svgs/${l.image || "default.svg"}" alt="${l.name}">       <p>${l.name}</p>       <p>Happiness: +${l.happinessImpact || 0}</p>
    `;
ownedLuxuryGrid.appendChild(card);
});
}


function openHouseSelection() {
  const houses = player.ownedLuxury.filter(l => l.category === "Houses");

  if (houses.length === 0) {
    return showToast("You don’t own any houses yet!");
  }

  // Create modal container dynamically
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Select Your Home</h2>
      <div class="house-grid"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const grid = modal.querySelector(".house-grid");
  houses.forEach(house => {
    const card = document.createElement("div");
    card.className = "house-card";
    card.innerHTML = `
      <img src="assets/svgs/${house.image}" alt="${house.name}">
      <p>${house.name}</p>
      <button>Select</button>
    `;
    card.querySelector("button").onclick = () => {
      player.selectedHouse = house;
      setGameBackground(house.image);
      showToast(`${house.name} is now your home!`);
      modal.remove();
    };
    grid.appendChild(card);
  });

  modal.querySelector(".close").onclick = () => modal.remove();
}


// ===================== DOCTOR TAB ===================== //

function openDoctorTab() {
  const modal = document.getElementById("doctorModal");
  const grid = document.getElementById("doctor-choices");
  grid.innerHTML = "";

  const treatments = [
    { name: "Basic Checkup", cost: 500, healthGain: 10, happinessGain: 2 },
    { name: "Full Treatment", cost: 2000, healthGain: 30, happinessGain: 5 },
    { name: "Luxury Spa Therapy", cost: 5000, healthGain: 50, happinessGain: 10 },
  ];

  treatments.forEach(t => {
    const card = document.createElement("div");
    card.className = "doctor-card";
    card.innerHTML = `
      <h3>${t.name}</h3>
      <p>Cost: $${t.cost}</p>
      <p>Health: +${t.healthGain}</p>
      <p>Happiness: +${t.happinessGain}</p>
      <button>Heal</button>
    `;
    card.querySelector("button").onclick = () => healAtDoctor(t);
    grid.appendChild(card);
  });

  openModal(modal);
}

function healAtDoctor(treatment) {
  if (player.money < treatment.cost) return showToast("Not enough money!");
  player.money -= treatment.cost;
  player.health = Math.min(100, player.health + treatment.healthGain);
  player.happiness = Math.min(100, player.happiness + treatment.happinessGain);
  updateStats();
  showToast(`You received ${treatment.name}!`);
  closeModal(document.getElementById("doctorModal"));
}

// ===================== SAVE / LOAD SYSTEM ===================== //
function saveGame() {
  localStorage.setItem("businessLifeSave", JSON.stringify({ player, family }));
  showToast("Game saved!");
}

function loadGame() {
  const save = localStorage.getItem("businessLifeSave");
  if (!save) return showToast("No saved data found.");

  const data = JSON.parse(save);
  Object.assign(player, data.player);
  Object.assign(family, data.family);

  clampStats();
  updateStats();
  
  if (player.profession === "athlete") openSportsTab();
  else if (player.profession === "licensed") openLicensedTab();
  else if (player.profession === "entrepreneur") openBusinessTab();

  showToast("Game loaded successfully!");
}

// ===================== RESTART / SURRENDER ===================== //
function restartLife() {
  const confirmRestart = confirm("Restart your current life but keep your character?");
  if (!confirmRestart) return;

  player.money = 10000;
  player.health = 100;
  player.happiness = 50;
  player.reputation = 0;
  player.ownedBusinesses = [];
  player.ownedLuxury = [];

  clampStats();
  updateStats();
  showToast("Life restarted — new beginning!");
}

function surrenderLife() {
  const confirmSurrender = confirm("Surrender your life? This will erase all progress.");
  if (!confirmSurrender) return;

  localStorage.clear();
  player = {
    money: 10000,
    reputation: 0,
    health: 100,
    happiness: 50,
    age: 18,
    month: 1,
    profession: null,
    ownedBusinesses: [],
    ownedLuxury: []
  };

  family = { surname: "", father: {}, mother: {}, siblings: [] };

  clampStats();
  updateStats();
  showToast("You surrendered your life. Everything has been reset.");
}

// ===================== EVENT LISTENER ===================== //
document.getElementById("open-family-tab").addEventListener("click", () => {
  alert(`Father: ${family.father.name}\nMother: ${family.mother.name}\nSiblings: ${family.siblings.map(s => s.name).join(", ") || "None"}`);
});

document.getElementById("open-business-tab").addEventListener("click", async () => {
if (!businesses.length) await loadBusinesses();
openBusinessTab();
});

document.getElementById("open-luxury-tab").addEventListener("click", async () => {
if (Object.keys(luxuryItems).length === 0) await loadLuxuryItems();
openLuxuryTab();
});
document.addEventListener("DOMContentLoaded", () => {
 document.getElementById("menu-toggle").addEventListener("click", () => openModal(document.getElementById("MenuTab")));
 document.getElementById("close-modal").addEventListener("click", () => closeModal(document.getElementById("MenuTab")));
 document.getElementById("open-life-tab").addEventListener("click", openLifeTab);
 document.getElementById("open-sports-tab").addEventListener("click", openSportsTab);
 document.getElementById("open-licensed-tab").addEventListener("click", openLicensedTab);
 document.getElementById("close-life").addEventListener("click", closeLifeTab);
 document.getElementById("close-business").addEventListener("click", closeBusinessTab);
 document.getElementById("close-luxury").addEventListener("click", closeLuxuryTab);
 document.getElementById("advance-month").addEventListener("click", () => advanceTime("month"));
 document.getElementById("advance-year").addEventListener("click", () => advanceTime("year"));
 document.getElementById("open-character-tab").addEventListener("click", openCharacterTab);
 document.getElementById("menu-toggle").addEventListener("click", openMenuTab);
 document.getElementById("open-doctor-tab").addEventListener("click", openDoctorTab);
 document.getElementById("open-profession-btn").addEventListener("click", openProfessionSelection);
 document.getElementById("surrender-life").addEventListener("click", surrenderLife);
 document.getElementById("restart-life").addEventListener("click", restartLife);
 document.querySelectorAll(".toast").forEach(t => t.remove());
});





window.openProfessionSelection = openProfessionSelection;

// ===================== INITIALIZE ===================== //
(async function init() {
  generateFamily();
  clampStats();
  updateStats();
})();
// ===================== EXPORT FUNCTIONS ===================== //

export { 
  updateStats, 
  showToast, 
  openSportsTab, 
  openLicensedTab, 
  openBusinessTab, 
  displayOwnedLuxury 
};

