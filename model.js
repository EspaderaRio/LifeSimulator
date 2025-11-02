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
