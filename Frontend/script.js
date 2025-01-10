"use strict";

const socket = io("https://i9stattracker-h2hpadgbh7ayhwd3.centralus-01.azurewebsites.net");
const getTeamLink = "https://i9stattracker-h2hpadgbh7ayhwd3.centralus-01.azurewebsites.net/players";

async function fetchTeam() {
  try {
    const res = await fetch(getTeamLink, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}, ${res.statusText}`);
    }
    const team = await res.json();
    populateTeam(team);
  } catch (error) {
    console.error("Failed to fetch team:", error);
  }
}

function populateTeam(team) {
  const teamContainer = document.getElementById("team-container");
  teamContainer.innerHTML = ""; // Clear existing content

  team.forEach((player) => {
    const playerCard = `
      <div class="col-12 col-md-6 mb-3" id="${player.Player}">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${player.Player}</h5>
            <p class="card-text">Points: <span id="points${player.Player}">${player.points}</span></p>
            <p class="card-text">Steals: <span id="steals${player.Player}">${player.steals}</span></p>
            <p class="card-text">Rebounds: <span id="rebounds${player.Player}">${player.rebounds}</span></p>
            <p class="card-text">Assists: <span id="assists${player.Player}">${player.assists}</span></p>
            <button class="btn btn-primary" data-stat="points">Add Point</button>
            <button class="btn btn-primary" data-stat="steals">Add Steal</button>
            <button class="btn btn-primary" data-stat="rebounds">Add Rebound</button>
            <button class="btn btn-primary" data-stat="assists">Add Assist</button>
          </div>
        </div>
      </div>
    `;
    teamContainer.insertAdjacentHTML("beforeend", playerCard);
  });

  document.querySelectorAll(".btn-primary").forEach((button) => {
    button.addEventListener("click", () => {
      const statType = button.getAttribute("data-stat");
      const playerName = button.closest(".col-12").id;
      updateStat(playerName, statType);
    });
  });
}

export async function updateStat(playerName, statType) {
  const statElement = document.getElementById(statType + playerName);
  const currentStat = parseInt(statElement.innerText, 10);
  const updatedStat = currentStat + 1;

  const parcel = {
    playerName: playerName,
    statType: statType,
    statValue: updatedStat,
  };

  try {
    const res = await fetch("https://i9stattracker-h2hpadgbh7ayhwd3.centralus-01.azurewebsites.net/updateStats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parcel }),
    });

    const responseText = await res.text();
    if (res.ok) {
      statElement.innerText = updatedStat;
    } else {
      console.error("Failed to update stat:", responseText);
    }
  } catch (error) {
    console.error("Failed to update stat:", error);
  }
}

// Listen for real-time updates from the server
socket.on("statUpdated", (data) => {
  const { playerName, statType, statValue } = data;
  const statElement = document.getElementById(statType + playerName);
  if (statElement) {
    statElement.innerText = statValue;
  }
});

// Fetch and populate the team on page load
await fetchTeam();
