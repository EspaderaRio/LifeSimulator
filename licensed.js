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
