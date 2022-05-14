const tableIds = [
  "boresTable",
  "rocksTable",
  "vaultsTable",
];

function clearInputs() {
  let ids = [
    "startDateInput",
    "endDateInput",
  ];

  for (const id of ids) {
    document.getElementById(id).value = ""
  }

  document.getElementById('filterCrewInput').value = "-1";
  document.getElementById('filterJobInput').value = "-1";
}

function updateTotals() {
  let boresTotalElement = document.getElementById('totalBoresValue');
  let rocksTotalElement = document.getElementById('totalRocksValue');
  let vaultsTotalElement = document.getElementById('totalVaultsValue');

  let boresTotal = 0;
  let rocksTotal = 0;

  let vaultsTotal = {
    'DT20': 0,
    'DT30': 0,
    'DT36': 0,
  };

  let boreRows = document.getElementById('boresTable').querySelectorAll('tr');
  for (let i = 1; i < boreRows.length; i++) {
    if (boreRows[i].style.display !== "none") {
      let cells = boreRows[i].querySelectorAll('td');
      let footage = Number(cells[0].textContent.slice(0, -2));
      boresTotal += footage;
    }
  }

  let rockRows = document.getElementById('rocksTable').querySelectorAll('tr');
  for (let i = 1; i < rockRows.length; i++) {
    if (rockRows[i].style.display !== "none") {
      let cells = rockRows[i].querySelectorAll('td');
      let footage = Number(cells[0].textContent.slice(0, -2));
      rocksTotal += footage;
    }
  }

  let vaultRows = document.getElementById('vaultsTable').querySelectorAll('tr');
  for (let i = 1; i < vaultRows.length; i++) {
    if (vaultRows[i].style.display !== "none") {
      let cells = vaultRows[i].querySelectorAll('td');
      let vaultSize = cells[0].textContent;
      vaultsTotal[vaultSize] += 1;
    }
  }

  boresTotalElement.textContent = `${boresTotal}ft`;
  rocksTotalElement.textContent = `${rocksTotal}ft`;
  vaultsTotalElement.textContent = `${vaultsTotal["DT20"]} / ${vaultsTotal["DT30"]} / ${vaultsTotal["DT36"]}`;
}

function compareDates(start, end, date) {
  let startDate = new Date(start);
  let endDate = new Date(end);
  let itemDate = new Date(date);

  let startUTC = startDate.valueOf();
  let endUTC = endDate.valueOf();
  let itemUTC = itemDate.valueOf();

  if (itemUTC >= startUTC && itemUTC <= endUTC) {
    return true;
  } else {
    return false;
  }
}

function getSelectValues() {
  let crews = [];
  let jobs = [];

  for (const tableId of tableIds) {
    let table = document.getElementById(tableId);
    let rows = table.querySelectorAll('tr');
    for (let i = 1; i < rows.length; i++) {
      let cells = rows[i].querySelectorAll('td');
      let rowCrew = cells[1].textContent;
      let rowJob = cells[2].textContent;
      if (!crews.includes(rowCrew)) {
        crews.push(rowCrew);
      }
      if (!jobs.includes(rowJob)) {
        jobs.push(rowJob);
      }
    }
  }
  return { jobs: jobs, crews: crews };
}

function goBack() {
  window.location.href = `http://192.168.86.36:3000/viewJobs`;
}


function addOptions(vals) {
  let crewSelect = document.getElementById('filterCrewInput');
  let jobSelect = document.getElementById('filterJobInput');

  let emptyOption = document.createElement('option');
  emptyOption.value = "-1";
  emptyOption.innerHTML = "---";

  crewSelect.appendChild(emptyOption);
  jobSelect.appendChild(emptyOption.cloneNode(true));

  for (const crew of vals.crews) {
    let option = document.createElement('option');
    option.value = crew;
    option.innerHTML = crew;
    crewSelect.appendChild(option);
  }

  for (const job of vals.jobs) {
    let option = document.createElement('option');
    option.value = job;
    option.innerHTML = job;
    jobSelect.appendChild(option);
  }
}

function filterItems() {
  let vals = {
    crew: document.getElementById('filterCrewInput').value,
    job: document.getElementById('filterJobInput').value,
    start: document.getElementById('startDateInput').value,
    end: document.getElementById('endDateInput').value,
  }

  for (const tableId of tableIds) {
    let table = document.getElementById(tableId);
    let rows = table.querySelectorAll('tr');
    for (let i = 1; i < rows.length; i++) {
      let cells = rows[i].querySelectorAll('td');

      let row = {
        crew: cells[1].textContent,
        job: cells[2].textContent,
        date: cells[4].textContent,
      }

      let comparisons = {
        crew: true,
        job: true,
        date: true,
      }

      if (row.crew == vals.crew || vals.crew == -1) {
        comparisons.crew = true;
      } else {
        comparisons.crew = false;
      }

      if (row.job == vals.job || vals.job == -1) {
        comparisons.job = true;
      } else {
        comparisons.job = false;
      }

      if (vals.start !== "" && vals.end !== "") {
        if (compareDates(`${vals.start}T00:00:00`, `${vals.end}T00:00:00`, row.date)) {
          comparisons.date = true;
        } else {
          comparisons.date = false;
        }
      }

      if (comparisons.crew && comparisons.job && comparisons.date) {
        rows[i].style.display = "table-row";
      } else {
        rows[i].style.display = "none";
      }
    }
  }

  updateTotals();
}

addOptions(getSelectValues())
clearInputs();
updateTotals();