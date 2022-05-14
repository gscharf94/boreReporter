function setUsernameHeader() {
  let cookie = document.cookie;
  let username = cookie.split("=")[1];
  document.getElementById('usernameHeader').textContent = username;
}

function logoutRedirect() {
  let username = document.cookie.split("=")[1];
  document.cookie = `username=${username}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  window.location.replace("http://192.168.86.36:3000/");
}

function parseJumbledJSON(txt) {
  return JSON.parse(txt.replace(/&quot;/g, '"'));
}

function clearTable(tableId, loggedInCrew) {
  let table = document.getElementById(tableId);
  let rows = table.querySelectorAll('tr');

  for (let i = 1; i < rows.length; i++) {
    let cells = rows[i].querySelectorAll('td');
    if (cells[1].textContent !== loggedInCrew) {
      rows[i].style.display = "none";
    }
    if (!thisWeek(cells[4].textContent)) {
      rows[i].style.display = "none";
    }
  }
}

function calculateWeeklyTotals() {
  let boreTable = document.getElementById('weeklyBoresTable');
  let rows = boreTable.querySelectorAll('tr');
  let boreTotal = 0;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].style.display !== "none") {
      let cells = rows[i].querySelectorAll('td');
      let footage = Number(cells[0].textContent.slice(0, -2));
      boreTotal += footage;
    }
  }

  let boreHeader = document.getElementById('weeklyBoresHeader');
  boreHeader.textContent += ` ${boreTotal}ft`;

  let rockTable = document.getElementById('weeklyRocksTable');
  rows = rockTable.querySelectorAll('tr');
  let rockTotal = 0;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].style.display !== "none") {
      let cells = rows[i].querySelectorAll('td');
      let footage = Number(cells[0].textContent.slice(0, -2));
      rockTotal += footage;
    }
  }

  let rocksHeader = document.getElementById('weeklyRocksHeader');
  rocksHeader.textContent += ` ${rockTotal}ft`;

  let vaultTable = document.getElementById('weeklyVaultsTable');
  rows = vaultTable.querySelectorAll('tr');
  let vaultTotals = {
    "DT20": 0,
    "DT30": 0,
    "DT36": 0,
  };

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].style.display !== "none") {
      let cells = rows[i].querySelectorAll('td');
      vaultTotals[cells[0].textContent] += 1;
    }
  }

  let totalVaults = vaultTotals["DT20"] + vaultTotals["DT30"] + vaultTotals["DT36"];

  let vaultsHeader = document.getElementById('weeklyVaultsHeader');
  vaultsHeader.textContent += ` ${vaultTotals["DT20"]} / ${vaultTotals["DT30"]} / ${vaultTotals["DT36"]} - ${totalVaults}`
}

function clearData() {
  // clears wrong crew and not this week
  let loggedInCrew = document.cookie.split("=")[1];
  console.log(`loggedInCrew: ${loggedInCrew}`);

  let tables = ["weeklyBoresTable", "weeklyVaultsTable", "weeklyRocksTable"];
  for (const table of tables) {
    clearTable(table, loggedInCrew);
  }

}

function getMonday() {
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  let originalWeekday = currentDate.getDay();
  let currentDay = currentDate.getDate();
  let currentWeekday = currentDate.getDay();

  let delta = currentWeekday - 1;
  currentDate.setDate(currentDay - delta);
  if (originalWeekday == 0) {
    currentDate.setDate(currentDate.getDate() - 7);
  }
  return currentDate;
}

function thisWeek(dateStr) {
  let monday = getMonday();
  let mondayUTC = monday.valueOf();
  monday.setDate(monday.getDate() + 6);
  let saturdayUTC = monday.valueOf();

  let itemDate = new Date(dateStr);
  let itemUTC = itemDate.valueOf();
  if (itemUTC >= mondayUTC && itemUTC <= saturdayUTC) {
    return true;
  } else {
    return false;
  }
}

function viewProduction() {
  let loggedInCrew = document.cookie.split("=")[1];
  window.location.href = `http://192.168.86.36:3000/viewProduction/${loggedInCrew}`;
}

setUsernameHeader();
clearData();
calculateWeeklyTotals();