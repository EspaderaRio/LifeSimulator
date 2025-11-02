// ===================== ACTING TAB ===================== //
function openActingTab() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  const a = player.actingSkill;

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>🎭 Acting Career</h2>
      <p><strong>Level:</strong> ${a.level}</p>
      <p><strong>Fame:</strong> ${a.fame}</p>
      <p><strong>Experience:</strong> ${a.experience}</p>
      <hr>
      <p>Train to improve acting or audition for new roles!</p>
      <div class="button-group">
        <button id="train-acting">🎓 Take Acting Class ($500)</button>
        <button id="audition">🎬 Audition</button>
        <button id="retire-acting">🚪 Retire</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  // TRAINING
  modal.querySelector("#train-acting").onclick = () => {
    if (player.money < 500) return showToast("Not enough money!");
    player.money -= 500;
    player.actingSkill.experience += 10;
    if (a.experience >= a.level * 50) {
      a.level++;
      a.experience = 0;
      showToast(`🎭 Acting Skill leveled up to Level ${a.level}!`);
    } else {
      showToast("📚 You improved your acting ability!");
    }
    updateStats();
    modal.remove();
    openActingTab();
  };

  // AUDITION
  modal.querySelector("#audition").onclick = () => {
    const success = Math.random() < (0.4 + a.level * 0.05);
    const fameGain = success ? 10 + a.level * 2 : 3;
    const moneyGain = success ? 2000 + a.level * 500 : 500;
    const happiness = success ? 5 : -2;
    
    player.money += moneyGain;
    player.happiness += happiness;
    a.fame += fameGain;
    player.reputation += fameGain / 2;

    showToast(success ? "🎬 You landed a role and gained fame!" : "😞 Audition failed, better luck next time!");
    updateStats();
    modal.remove();
    openActingTab();
  };

  // RETIRE
  modal.querySelector("#retire-acting").onclick = () => {
    modal.remove();
    openRetirementOption();
  };
}
