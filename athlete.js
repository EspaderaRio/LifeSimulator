// ===================== ATHLETE TAB (Expanded) ===================== //
function chooseSportSpecialization() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  const availableSports = Object.keys(player.sportsSkills || {});
  
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Choose Your Sport</h2>
      <div class="career-grid">
        ${availableSports.map(s => `<button data-sport="${s}">${capitalize(s)}</button>`).join("")}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelectorAll("[data-sport]").forEach(btn => {
    btn.onclick = () => {
      const sport = btn.dataset.sport;
      const skill = player.sportsSkills[sport];
      if (skill.level >= 5 && skill.stamina >= 50) {
        player.subProfession = sport;
        showToast(`🏅 You signed as a professional ${capitalize(sport)} player!`);
        updateStats();
        modal.remove();
        openSportsTab(sport);
      } else {
        showToast("⚡ You’re not fit enough to play professionally!");
      }
    };
  });
}

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
