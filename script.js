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


const openCareerTab = document.getElementById("career-toggle");
const openMenuTab = document.getElementById("menu-toggle");
const closeMenuTab = document.getElementById("close-menu");
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
  // If player already has a profession, open its tab
  if (player.profession) {
    switch (player.profession) {
      case "entrepreneur": return openBusinessTab(player.subProfession);
      case "athlete": return openSportsTab(player.subProfession);
      case "licensed": return openLicensedTab(player.subProfession);
      case "celebrity": return openCelebrityTab(player.subProfession);
      case "model": return openModelTab(player.subProfession);
      case "freelancer": return openFreelancerTab(player.subProfession);
      default: return showToast("No profession tab found.");
    }
  }

  // Otherwise show profession selection modal
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Choose Your Profession</h2>
      <p class="desc">Pick one profession path. You can resign or retire later.</p>
      <div class="profession-grid">
        <button id="choose-entrepreneur"><img src="assets/buttons/business.svg"><span>Entrepreneur</span></button>
        <button id="choose-athlete"><img src="assets/buttons/athlete.svg"><span>Athlete</span></button>
        <button id="choose-licensed"><img src="assets/buttons/licensed.svg"><span>Licensed</span></button>
        <button id="choose-celebrity"><img src="assets/buttons/celebrity.svg"><span>Celebrity</span></button>
        <button id="choose-model"><img src="assets/buttons/model.svg"><span>Model</span></button>
        <button id="choose-freelancer"><img src="assets/buttons/freelancer.svg"><span>Freelancer</span></button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();

  // Helper function to select profession
  const selectProfession = (prof, displayName, openTabFn) => {
    player.profession = prof.toLowerCase(); // lowercase for logic
    player.professionDisplay = displayName; // for UI display
    player.subProfession = null;
    player.retired = false;
    showToast(`You became a ${displayName}!`);
    updateStats();
    modal.remove();
    openTabFn();
  };

  // Bind profession buttons
  modal.querySelector("#choose-entrepreneur").onclick = () =>
    selectProfession("entrepreneur", "Entrepreneur", openBusinessTab);
  modal.querySelector("#choose-athlete").onclick = () =>
    selectProfession("athlete", "Athlete", openSportsTab);
  modal.querySelector("#choose-licensed").onclick = () =>
    selectProfession("licensed", "Licensed Professional", openLicensedTab);
  modal.querySelector("#choose-celebrity").onclick = () =>
    selectProfession("celebrity", "Celebrity", openCelebrityTab);
  modal.querySelector("#choose-model").onclick = () =>
    selectProfession("model", "Model", openModelTab);
  modal.querySelector("#choose-freelancer").onclick = () =>
    selectProfession("freelancer", "Freelancer", openFreelancerTab);
}

// ===================== RETIREMENT ===================== //
function openRetirementOption() {
  if (!player.profession) return showToast("You don't have a profession yet.");

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${player.profession} Options</h2>
      <p>Would you like to resign or retire?</p>
      <div class="option-buttons">
        <button id="resign">Resign</button>
        <button id="retire">Retire</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector("#resign").onclick = () => {
    player.profession = null;
    player.subProfession = null;
    showToast("You resigned. You can now choose a new profession.");
    updateStats();
    modal.remove();
  };

  modal.querySelector("#retire").onclick = () => {
    player.retired = true;
    player.happiness += 10;
    player.health += 5;
    player.reputation += 5;
    player.profession = null;
    player.subProfession = null;
    showToast("You retired honorably. You can now choose a new path later.");
    updateStats();
    modal.remove();
  };
}



// ===================== ATHLETE TAB (Expanded) ===================== //
function openSportsTab(currentSport = null) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  // If player already picked a sub-profession (specific sport)
  if (currentSport || player.subProfession) {
    return openSpecificSportTab(currentSport || player.subProfession);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Sports Career</h2>
      <p>Select your sport specialization:</p>
      <div class="sports-grid">
        <button data-sport="basketball">🏀 Basketball</button>
        <button data-sport="boxing">🥊 Boxing</button>
        <button data-sport="swimming">🏊 Swimming</button>
        <button data-sport="soccer">⚽ Soccer</button>
        <button data-sport="tennis">🎾 Tennis</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelectorAll("[data-sport]").forEach(btn => {
    btn.onclick = () => {
      player.profession = "athlete";
      player.subProfession = btn.dataset.sport;
      // Initialize sport skill data if not yet
      if (!player.sportsSkills) player.sportsSkills = {};
      if (!player.sportsSkills[btn.dataset.sport]) {
        player.sportsSkills[btn.dataset.sport] = {
          strength: 10,
          endurance: 10,
          skill: 10,
          fame: 0,
          level: 1,
          matchesPlayed: 0,
          wins: 0,
          losses: 0
        };
      }
      modal.remove();
      openSpecificSportTab(btn.dataset.sport);
    };
  });
}

function openSpecificSportTab(sport) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const sData = {
    basketball: { cost: 500, basePay: 1500 },
    boxing: { cost: 800, basePay: 2500 },
    swimming: { cost: 600, basePay: 1800 },
    soccer: { cost: 700, basePay: 2000 },
    tennis: { cost: 750, basePay: 2200 }
  };

  const s = sData[sport];
  const stats = player.sportsSkills[sport];
  const totalSkill = Math.floor((stats.strength + stats.endurance + stats.skill) / 3);
  const winRate = (stats.wins / Math.max(1, stats.matchesPlayed) * 100).toFixed(1);

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${capitalize(sport)} Career</h2>
      <p><strong>Level:</strong> ${stats.level} | <strong>Skill:</strong> ${totalSkill}</p>
      <p><strong>Wins:</strong> ${stats.wins} | <strong>Losses:</strong> ${stats.losses} | <strong>Win Rate:</strong> ${winRate}%</p>
      <p><strong>Fame:</strong> ${stats.fame}</p>
      <hr>
      <p>Train to improve skills or Play to earn money and fame.</p>
      <div class="button-group">
        <button id="train-btn">🏋️ Train ($${s.cost})</button>
        <button id="play-btn">🎮 Play Match</button>
        <button id="retire-btn">🚪 Retire</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  // TRAIN ACTION
  modal.querySelector("#train-btn").onclick = () => {
    if (player.money < s.cost) return showToast("Not enough money to train!");
    player.money -= s.cost;
    player.health -= 5;
    player.happiness += 3;

    // Improve random skill
    const rand = Math.random();
    if (rand < 0.33) stats.strength += 2;
    else if (rand < 0.66) stats.endurance += 2;
    else stats.skill += 2;

    if (totalSkill >= stats.level * 30) {
      stats.level++;
      showToast(`🏅 You leveled up to Level ${stats.level}!`);
    } else {
      showToast("💪 Training improved your stats!");
    }

    updateStats();
    modal.remove();
    openSpecificSportTab(sport);
  };

  // PLAY MATCH ACTION
  modal.querySelector("#play-btn").onclick = () => {
    modal.remove();
    openMatchTab(sport);
  };

  // RETIRE
  modal.querySelector("#retire-btn").onclick = () => {
    modal.remove();
    openRetirementOption();
  };
}

// ===================== MATCH SIMULATION ===================== //
function openMatchTab(sport) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  const stats = player.sportsSkills[sport];
  const sData = {
    basketball: { basePay: 1500 },
    boxing: { basePay: 2500 },
    swimming: { basePay: 1800 },
    soccer: { basePay: 2000 },
    tennis: { basePay: 2200 }
  };
  const s = sData[sport];

  const opponentSkill = Math.floor(Math.random() * (stats.level * 40 - stats.level * 10)) + stats.level * 10;
  const playerSkill = Math.floor((stats.strength + stats.skill + stats.endurance) / 3);

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${capitalize(sport)} Match</h2>
      <p>Your Skill: ${playerSkill}</p>
      <p>Opponent Skill: ${opponentSkill}</p>
      <button id="start-match-btn">🏁 Start Match</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector("#start-match-btn").onclick = () => {
    const outcome = playerSkill + Math.random() * 20 > opponentSkill + Math.random() * 20 ? "win" : "lose";
    const fameGain = outcome === "win" ? 5 + stats.level : 2;
    const moneyGain = outcome === "win" ? s.basePay + stats.level * 300 : s.basePay / 2;
    const happinessGain = outcome === "win" ? +5 : -2;

    stats.matchesPlayed++;
    if (outcome === "win") stats.wins++;
    else stats.losses++;
    stats.fame += fameGain;

    player.money += moneyGain;
    player.happiness += happinessGain;
    player.reputation += fameGain / 2;

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Match Result</h2>
        <p>You ${outcome === "win" ? "🏆 WON!" : "❌ LOST"} the ${sport} match!</p>
        <p>💰 Earned: $${moneyGain}</p>
        <p>🌟 Fame +${fameGain} | 😊 Happiness ${happinessGain >= 0 ? "+" : ""}${happinessGain}</p>
        <button id="back-btn">Back</button>
      </div>
    `;
    modal.querySelector(".close").onclick = () => modal.remove();
    modal.querySelector("#back-btn").onclick = () => {
      modal.remove();
      openSpecificSportTab(sport);
    };
    updateStats();
  };
}

// ===================== LICENSED TAB (Expanded) ===================== //
function openLicensedTab(current = null) {
  if (current || player.subProfession) {
    return openSpecificLicensedTab(current || player.subProfession);
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Licensed Professions</h2>
      <p>Select your licensed career:</p>
      <div class="career-grid">
        <button data-career="doctor">👨‍⚕️ Doctor</button>
        <button data-career="engineer">🧑‍💻 Engineer</button>
        <button data-career="lawyer">⚖️ Lawyer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelectorAll("[data-career]").forEach(btn => {
    btn.onclick = () => {
      player.profession = "licensed";
      player.subProfession = btn.dataset.career;

      // Initialize career stats if not yet
      if (!player.licensedSkills) player.licensedSkills = {};
      if (!player.licensedSkills[btn.dataset.career]) {
        player.licensedSkills[btn.dataset.career] = {
          level: 1,
          exp: 0,
          moneyEarned: 0,
          jobsDone: 0
        };
      }

      modal.remove();
      openSpecificLicensedTab(btn.dataset.career);
    };
  });
}

function openSpecificLicensedTab(career) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  // Career base data
  const data = {
    doctor: { health: -10, rep: +5, baseMoney: 5000, happiness: -3 },
    engineer: { health: -5, rep: +3, baseMoney: 4000, happiness: -2 },
    lawyer: { health: -7, rep: +4, baseMoney: 4500, happiness: -2 }
  };
  const c = data[career];
  const stats = player.licensedSkills[career];

  // Calculate level-based pay bonus
  const moneyEarned = c.baseMoney + stats.level * 500;

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${capitalize(career)}</h2>
      <p><strong>Level:</strong> ${stats.level} | <strong>Experience:</strong> ${stats.exp}/100</p>
      <p><strong>Jobs Completed:</strong> ${stats.jobsDone} | <strong>Total Earnings:</strong> $${stats.moneyEarned}</p>
      <hr>
      <p>Workload: Health ${c.health} | Reputation +${c.rep} | Money +${moneyEarned} | Happiness ${c.happiness}</p>
      <div class="button-group">
        <button id="work-btn">💼 Work</button>
        <button id="train-btn">📚 Attend Training</button>
        <button id="retire-btn">🚪 Resign/Retire</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  // WORK ACTION
  modal.querySelector("#work-btn").onclick = () => {
    player.health += c.health;
    player.reputation += c.rep;
    player.money += moneyEarned;
    player.happiness += c.happiness;

    stats.exp += 25; // Gain experience per job
    stats.jobsDone++;
    stats.moneyEarned += moneyEarned;

    // Level up
    if (stats.exp >= 100) {
      stats.level++;
      stats.exp = stats.exp - 100;
      showToast(`🏅 ${career} leveled up to Level ${stats.level}!`);
    } else {
      showToast(`💼 You completed a job as ${career}.`);
    }

    updateStats();
    modal.remove();
    openSpecificLicensedTab(career);
  };

  // TRAINING/CONFERENCE ACTION (Improves future work efficiency)
  modal.querySelector("#train-btn").onclick = () => {
    stats.exp += 15;
    player.money -= 500; // Cost of training
    player.happiness += 2;
    player.health -= 2;

    if (stats.exp >= 100) {
      stats.level++;
      stats.exp -= 100;
      showToast(`📚 ${career} leveled up to Level ${stats.level} via training!`);
    } else {
      showToast(`📚 Training improved your skills for ${career}.`);
    }

    updateStats();
    modal.remove();
    openSpecificLicensedTab(career);
  };

  // RETIRE / RESIGN
  modal.querySelector("#retire-btn").onclick = () => {
    modal.remove();
    openRetirementOption();
  };
}


// ===================== CELEBRITY TAB ===================== //
function openCelebrityTab(type = null) {
  if (type || player.subProfession) return openSpecificCelebrityTab(type || player.subProfession);

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Celebrity Career</h2>
      <p>Choose your stardom path:</p>
      <div class="career-grid">
        <button data-celeb="actor">🎬 Actor</button>
        <button data-celeb="musician">🎤 Musician</button>
        <button data-celeb="influencer">📱 Influencer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelectorAll("[data-celeb]").forEach(btn => {
    btn.onclick = () => {
      player.profession = "celebrity";
      player.subProfession = btn.dataset.celeb;

      if (!player.celebritySkills) player.celebritySkills = {};
      if (!player.celebritySkills[btn.dataset.celeb]) {
        player.celebritySkills[btn.dataset.celeb] = {
          level: 1,
          exp: 0,
          fame: 0,
          gigsDone: 0,
          moneyEarned: 0
        };
      }

      modal.remove();
      openSpecificCelebrityTab(btn.dataset.celeb);
    };
  });
}

function openSpecificCelebrityTab(type) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const data = {
    actor: { money: 5000, fame: 5, happy: 8, health: -3 },
    musician: { money: 4000, fame: 6, happy: 9, health: -4 },
    influencer: { money: 3000, fame: 4, happy: 7, health: -2 }
  };
  const c = data[type];
  const stats = player.celebritySkills[type];

  const levelBonus = stats.level * 500;
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${capitalize(type)}</h2>
      <p><strong>Level:</strong> ${stats.level} | <strong>EXP:</strong> ${stats.exp}/100</p>
      <p><strong>Gigs Done:</strong> ${stats.gigsDone} | <strong>Total Money:</strong> $${stats.moneyEarned}</p>
      <p>Income: $${c.money + levelBonus} | Fame +${c.fame} | Happiness +${c.happy}</p>
      <div class="button-group">
        <button id="perform-btn">🎤 Perform/Act</button>
        <button id="retire-btn">🚪 Resign/Retire</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector("#perform-btn").onclick = () => {
    player.money += c.money + levelBonus;
    player.reputation += c.fame;
    player.happiness += c.happy;
    player.health += c.health;

    stats.exp += 25;
    stats.fame += c.fame;
    stats.gigsDone++;
    stats.moneyEarned += c.money + levelBonus;

    if (stats.exp >= 100) {
      stats.level++;
      stats.exp -= 100;
      showToast(`🏆 ${type} leveled up to Level ${stats.level}!`);
    } else {
      showToast(`🎬 You completed a gig as ${type}!`);
    }

    updateStats();
    modal.remove();
    openSpecificCelebrityTab(type);
  };

  modal.querySelector("#retire-btn").onclick = () => {
    modal.remove();
    openRetirementOption();
  };
}

// ===================== MODEL TAB ===================== //
function openModelTab(type = null) {
  if (type || player.subProfession) return openSpecificModelTab(type || player.subProfession);

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Model Career</h2>
      <p>Select your modeling specialty:</p>
      <div class="career-grid">
        <button data-model="runway">💃 Runway</button>
        <button data-model="fashion">👗 Fashion</button>
        <button data-model="commercial">📸 Commercial</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelectorAll("[data-model]").forEach(btn => {
    btn.onclick = () => {
      player.profession = "model";
      player.subProfession = btn.dataset.model;

      if (!player.modelSkills) player.modelSkills = {};
      if (!player.modelSkills[btn.dataset.model]) {
        player.modelSkills[btn.dataset.model] = {
          level: 1,
          exp: 0,
          jobsDone: 0,
          moneyEarned: 0
        };
      }

      modal.remove();
      openSpecificModelTab(btn.dataset.model);
    };
  });
}

function openSpecificModelTab(type) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const data = {
    runway: { money: 4000, rep: 5, happy: 6, health: -3 },
    fashion: { money: 3500, rep: 4, happy: 7, health: -2 },
    commercial: { money: 3000, rep: 3, happy: 5, health: -1 }
  };
  const m = data[type];
  const stats = player.modelSkills[type];

  const levelBonus = stats.level * 300;
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${capitalize(type)} Model</h2>
      <p><strong>Level:</strong> ${stats.level} | <strong>EXP:</strong> ${stats.exp}/100</p>
      <p><strong>Jobs Done:</strong> ${stats.jobsDone} | <strong>Total Money:</strong> $${stats.moneyEarned}</p>
      <p>Income: $${m.money + levelBonus} | Reputation +${m.rep} | Happiness +${m.happy}</p>
      <div class="button-group">
        <button id="work-btn">📸 Work Shoot/Event</button>
        <button id="retire-btn">🚪 Resign/Retire</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector("#work-btn").onclick = () => {
    player.money += m.money + levelBonus;
    player.reputation += m.rep;
    player.happiness += m.happy;
    player.health += m.health;

    stats.exp += 25;
    stats.jobsDone++;
    stats.moneyEarned += m.money + levelBonus;

    if (stats.exp >= 100) {
      stats.level++;
      stats.exp -= 100;
      showToast(`🏆 ${type} model leveled up to Level ${stats.level}!`);
    } else {
      showToast(`📸 You completed a modeling job as ${type}!`);
    }

    updateStats();
    modal.remove();
    openSpecificModelTab(type);
  };

  modal.querySelector("#retire-btn").onclick = () => {
    modal.remove();
    openRetirementOption();
  };
}

// ===================== FREELANCER TAB ===================== //
function openFreelancerTab(type = null) {
  if (type || player.subProfession) return openSpecificFreelancerTab(type || player.subProfession);

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Freelancer Career</h2>
      <p>Select your field:</p>
      <div class="career-grid">
        <button data-free="developer">💻 Developer</button>
        <button data-free="artist">🎨 Artist</button>
        <button data-free="writer">✍️ Writer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelectorAll("[data-free]").forEach(btn => {
    btn.onclick = () => {
      player.profession = "freelancer";
      player.subProfession = btn.dataset.free;

      if (!player.freelancerSkills) player.freelancerSkills = {};
      if (!player.freelancerSkills[btn.dataset.free]) {
        player.freelancerSkills[btn.dataset.free] = {
          level: 1,
          exp: 0,
          projectsDone: 0,
          moneyEarned: 0
        };
      }

      modal.remove();
      openSpecificFreelancerTab(btn.dataset.free);
    };
  });
}

function openSpecificFreelancerTab(type) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const data = {
    developer: { money: 2500, happy: 4, rep: 2, health: -3 },
    artist: { money: 2000, happy: 6, rep: 3, health: -1 },
    writer: { money: 1800, happy: 5, rep: 2, health: -1 }
  };
  const f = data[type];
  const stats = player.freelancerSkills[type];

  const levelBonus = stats.level * 200;
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${capitalize(type)} Freelancer</h2>
      <p><strong>Level:</strong> ${stats.level} | <strong>EXP:</strong> ${stats.exp}/100</p>
      <p><strong>Projects Done:</strong> ${stats.projectsDone} | <strong>Total Money:</strong> $${stats.moneyEarned}</p>
      <p>Income: $${f.money + levelBonus} | Happiness +${f.happy} | Reputation +${f.rep}</p>
      <div class="button-group">
        <button id="work-btn">🖋️ Complete Project</button>
        <button id="retire-btn">🚪 Resign/Retire</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector("#work-btn").onclick = () => {
    player.money += f.money + levelBonus;
    player.happiness += f.happy;
    player.reputation += f.rep;
    player.health += f.health;

    stats.exp += 25;
    stats.projectsDone++;
    stats.moneyEarned += f.money + levelBonus;

    if (stats.exp >= 100) {
      stats.level++;
      stats.exp -= 100;
      showToast(`🏆 ${type} leveled up to Level ${stats.level}!`);
    } else {
      showToast(`🖋️ You completed a project as ${type}!`);
    }

    updateStats();
    modal.remove();
    openSpecificFreelancerTab(type);
  };

  modal.querySelector("#retire-btn").onclick = () => {
    modal.remove();
    openRetirementOption();
  };
}

// ===================== HELPER FUNCTION ===================== //
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// ===================== CONTROL MODAL ===================== //

openMenuTab.onclick = () => openModal(document.getElementById("MenuTab"));
closeMenuTab.onclick = () => closeModal(document.getElementById("MenuTab"));

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
const openLifeBtn = document.getElementById("life-toggle");
const closeLifeBtn = document.getElementById("close-life");

openLifeBtn.addEventListener("click", openLifeTab);
closeLifeBtn.addEventListener("click", closeLifeTab);

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
    card.innerHTML = `
      <img src="assets/svgs/${a.image || "default.svg"}" alt="${a.name}">
      <p>${a.name}</p>
      <p>Cost: $${a.cost}</p>
      <p>Stress: ${a.stressChange}</p>
      <p>Happiness: +${a.happinessChange}</p>
      <p>Reputation: +${a.reputationChange}</p>
      <button>Do Activity</button>
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
stress: 0,
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
const openBusinessBtn = document.getElementById("business-toggle");
const closeBusinessBtn = document.getElementById("close-business");

openBusinessBtn.addEventListener("click", openBusinessTab);
closeBusinessBtn.addEventListener("click", closeBusinessTab);

// ===================== BUSINESS TAB ===================== //
async function loadBusinesses() {
  try {
    const res = await fetch("businesses.json");
    if (!res.ok) throw new Error("Failed to load businesses.json");
    businesses = await res.json();
  } catch (err) {
    console.warn("⚠️ Using fallback businesses:", err);
    businesses = [
      { name: "Test Shop", cost: 1000, stressImpact: 2, reputationImpact: 2, image: "default.svg" }
    ];
  }
}



async function openBusinessTab() {
  // Only load once
  if (!businesses.length) {
    console.log("Loading businesses...");
    await loadBusinesses();
    console.log("Loaded:", businesses);
  }

  // Now render the cards
  businessChoices.innerHTML = "";

  businesses.forEach(b => {
    const card = document.createElement("div");
    card.className = "business-card";
    card.innerHTML = `
      <img src="assets/svgs/${b.image || "default.svg"}" alt="${b.name}">
      <p>${b.name}</p>
      <p>Cost: $${b.cost.toLocaleString()}</p>
      <p>Stress: +${b.stressImpact}</p>
      <p>Reputation: +${b.reputationImpact}</p>
      <button>Buy</button>
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
const openLuxuryBtn = document.getElementById("luxury-toggle");
const closeLuxuryBtn = document.getElementById("close-luxury");

openLuxuryBtn.addEventListener("click", async () => {
  if (!luxuryItems || Object.keys(luxuryItems).length === 0) {
    await loadLuxuryItems();
  }
  openLuxuryTab();
});

closeLuxuryBtn.addEventListener("click", closeLuxuryTab);

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
const openDoctorBtn = document.getElementById("open-doctor-tab");
const closeDoctorBtn = document.getElementById("close-doctor");

openDoctorBtn.addEventListener("click", openDoctorTab);
closeDoctorBtn.addEventListener("click", closeDoctorTab);

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

function closeDoctorTab() {
closeModal(doctorModal);
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

// ===================== FAMILY TAB ===================== //
const openFamilyBtn = document.getElementById("open-family-tab");

openFamilyBtn.addEventListener("click", openFamilyTab);

function openFamilyTab() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span id="close-family-tab" class="close-btn"><img src="assets/buttons/close.svg" alt="Close"></span>
      <h2>Your Family</h2>
      <p><strong>Father:</strong> ${family.father.name}</p>
      <p><strong>Mother:</strong> ${family.mother.name}</p>
      <p><strong>Siblings:</strong> ${family.siblings.map(s => s.name).join(", ") || "None"}</p>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close-btn").onclick = () => modal.remove();
}


// ===================== INITIAL LOAD ===================== //
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadBusinesses();      // Load business data
    await loadLuxuryItems();     // Load luxury data
  } catch (err) {
    console.error("Failed to load startup data:", err);
  }
});

document.addEventListener("DOMContentLoaded", () => {
 document.getElementById("menu-toggle").addEventListener("click", () => openModal(document.getElementById("MenuTab")));
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

