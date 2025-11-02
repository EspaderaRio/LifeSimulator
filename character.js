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
