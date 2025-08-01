// Deteksi halaman game
if (window.location.pathname.includes("game.html")) {
  const params = new URLSearchParams(window.location.search);
  const game = params.get("game");

  const gameNames = {
    mlbb: "Mobile Legends",
    ff: "Free Fire",
    pubg: "PUBG Mobile"
  };

  document.getElementById("game-title").textContent = `Top Up ${gameNames[game] || "Game"}`;

  document.getElementById("topup-form").addEventListener("submit", function(e) {
    e.preventDefault();
    document.getElementById("result").classList.remove("hidden");
    this.reset();
  });
}