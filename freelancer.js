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
