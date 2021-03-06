setInputsHidden();
clearInputs();


let crewName = document.cookie.split("=")[1];
checkLogin();


let addingBore = false;
let addingVault = false;
let addingRock = false;
savedBores = parseJumbledJSON(savedBores);
savedVaults = parseJumbledJSON(savedVaults);
savedRocks = parseJumbledJSON(savedRocks);

let renderer = L.canvas({ padding: 0.1, tolerance: 15 });

let map = L.map('map').setView([65, -46], 3);
L.tileLayer('http://192.168.86.36:3000/images/{job}/{page}/{z}/{x}/{y}.jpg', {
  attribution: `${jobName} - SH${pageId}`,
  maxZoom: 7,
  minZoom: 2,
  job: jobName,
  page: pageId,
  tileSize: 256,
  noWrap: true,
}).addTo(map);

L.simpleMapScreenshoter().addTo(map);

function getWeeklyTotalsDate(dateStr) {
  let [month, day, year] = dateStr.split("-");
  let comparisonDate = new Date(Number(year), Number(month) - 1, Number(day));

  let totals = {
    bore: 0,
    rock: 0,
    dt20: 0,
    dt30: 0,
    dt36: 0,
  };

  let bores = [...savedBores, ...postedBores, ...savedRocks];
  for (const bore of bores) {
    let boreDate = new Date(bore.work_date);
    boreDate.setHours(0, 0, 0, 0);
    if (boreDate.valueOf() < comparisonDate.valueOf()) {
      continue;
    }
    if (bore.rock) {
      totals.rock += Number(bore.footage);
    } else {
      totals.bore += Number(bore.footage);
    }
  }

  for (const vault of savedVaults) {
    let vaultDate = new Date(vault.work_date);
    vaultDate.setHours(0, 0, 0, 0);
    if (vaultDate.valueOf() < comparisonDate.valueOf()) {
      continue;
    }

    if (vault.vault_size == 0) {
      totals.dt20 += 1;
    } else if (vault.vault_size == 1) {
      totals.dt30 += 1;
    } else if (vault.vault_size == 2) {
      totals.dt36 += 1;
    } else {
      console.log('something weird going on... getWeeklyTotals()');
    }
  }

  for (const vault of postedVaults) {
    let vaultDate = new Date(vault.work_date);
    vaultDate.setHours(0, 0, 0, 0);
    if (vaultDate.valueOf() < comparisonDate.valueOf()) {
      continue;
    }

    if (vault.size == "DT20") {
      totals.dt20 += 1;
    } else if (vault.size == "DT30") {
      totals.dt30 += 1;
    } else if (vault.size == "DT36") {
      totals.dt36 += 1;
    } else {
      console.log('something weird going on... getWeeklyTotals()');
    }
  }

  return totals;

}

function getWeeklyTotals() {
  let totals = {
    bore: 0,
    rock: 0,
    dt20: 0,
    dt30: 0,
    dt36: 0,
  };

  let bores = [...savedBores, ...postedBores, ...savedRocks];
  for (const bore of bores) {
    if (olderThanMonday(bore.work_date)) {
      continue;
    }
    if (bore.rock) {
      totals.rock += Number(bore.footage);
    } else {
      totals.bore += Number(bore.footage);
    }
  }

  for (const vault of savedVaults) {
    if (olderThanMonday(vault.work_date)) {
      continue;
    }

    if (vault.vault_size == 0) {
      totals.dt20 += 1;
    } else if (vault.vault_size == 1) {
      totals.dt30 += 1;
    } else if (vault.vault_size == 2) {
      totals.dt36 += 1;
    } else {
      console.log('something weird going on... getWeeklyTotals()');
    }
  }

  for (const vault of postedVaults) {
    if (olderThanMonday(vault.workDate)) {
      continue;
    }

    if (vault.size == "DT20") {
      totals.dt20 += 1;
    } else if (vault.size == "DT30") {
      totals.dt30 += 1;
    } else if (vault.size == "DT36") {
      totals.dt36 += 1;
    } else {
      console.log('something weird going on... getWeeklyTotals()');
    }
  }

  return totals;
}

function generateTotalsPopup(totals) {
  let row = 1;
  console.log(`generating totals`);
  console.log(totals);
  let html = ""
  html += `<p class="totalsHeader" style="grid-row: ${row++}; grid-column: 1 / span 3; text-align: center;">SH${pageId}</p>`;
  html += (totals.bore !== 0) ? `<p class="totalsHeader" style="grid-row: ${row}; grid-column: 1">A1=&nbsp;&nbsp;&nbsp;&nbsp;</p><p class="totalsValue" style="grid-row: ${row}; grid-column: 2;">${totals.bore - totals.rock}'</p><img class="totalsBoreImage" style="grid-row: ${row++}; grid-column: 3" src="/images/icons/a1.png">` : ``;
  html += (totals.rock !== 0) ? `<p class="totalsHeader" style="grid-row: ${row}; grid-column: 1">I9=&nbsp;&nbsp;&nbsp;&nbsp;</p><p class="totalsValue" style="grid-row: ${row}; grid-column: 2;">${totals.rock}'</p><img class="totalsBoreImage" style="grid-row: ${row++}; grid-column: 3" src="/images/icons/i9.png">` : ``;
  html += (totals.dt20 !== 0) ? `<p class="totalsHeader" style="grid-row: ${row}; grid-column: 1">DT20=&nbsp;&nbsp;</p><p class="totalsValue style="grid-row: ${row}; grid-column: 2;"">${totals.dt20}&nbsp;</p><img class="totalsVaultImage" style="grid-row: ${row++}; grid-column: 3" src="/images/icons/DT20.png">` : ``;
  html += (totals.dt30 !== 0) ? `<p class="totalsHeader" style="grid-row: ${row}; grid-column: 1">DT30=&nbsp;&nbsp;</p><p class="totalsValue style="grid-row: ${row}; grid-column: 2;"">${totals.dt30}&nbsp;</p><img class="totalsVaultImage" style="grid-row: ${row++}; grid-column: 3" src="/images/icons/DT30.png">` : ``;
  html += (totals.dt36 !== 0) ? `<p class="totalsHeader" style="grid-row: ${row}; grid-column: 1">DT36=&nbsp;&nbsp;</p><p class="totalsValue style="grid-row: ${row}; grid-column: 2;"">${totals.dt36}&nbsp;</p><img class="totalsVaultImage" style="grid-row: ${row++}; grid-column: 3" src="/images/icons/DT36.png">` : ``;
  let monday = getMonday();
  let day = String(monday.getDate()).padStart(2, "0");
  let month = String(monday.getMonth() + 1).padStart(2, "0");
  let year = monday.getFullYear();
  let mondayDateStr = `${month}-${day}-${year}`;
  monday.setDate(monday.getDate() + 5);
  day = String(monday.getDate()).padStart(2, "0");
  month = String(monday.getMonth() + 1).padStart(2, "0");
  year = monday.getFullYear();
  let saturdayDateStr = `${month}-${day}-${year}`;
  html += `<p class="totalsHeader" style="grid-row: ${row++}; grid-column: 1 / span 3;">${mondayDateStr} -> ${saturdayDateStr}</p>`
  let popup = L.popup({
    closeButton: false,
    className: 'totalsPopup',
    autoClose: false,
    autoPan: false,
    closeOnClick: false,
  })
    .setLatLng([0, 0])
    .setContent(`<div class="totalsContainer" style="display: grid;">${html}</div>`)
    .openOn(map);
  stylePopups();
  makeDraggable(popup);
}

function olderThanMonday(date) {
  date = new Date(date);
  date.setHours(0, 0, 0, 0);

  if (date.valueOf() < getMonday().valueOf()) {
    return true;
  } else {
    return false;
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

function hideBoresDate(dateStr) {
  let [month, day, year] = dateStr.split("-");
  let comparisonDate = new Date(Number(year), Number(month) - 1, Number(day));
  let bores = [...savedBores, ...postedBores, ...savedRocks];
  console.log(`comparison date: ${comparisonDate}`);
  for (const bore of bores) {
    let date = new Date(bore.work_date);
    console.log(`comparing: ${date}`);
    if (date.valueOf() < comparisonDate.valueOf()) {
      map.removeLayer(bore.line);
      bore.hidden = true;
    }
  }
}


function hideOldBores() {
  let bores = [...savedBores, ...postedBores, ...savedRocks];
  for (const bore of bores) {
    let date = new Date(bore.work_date);
    if (date.valueOf() < getMonday().valueOf()) {
      map.removeLayer(bore.line);
      bore.hidden = true;
    }
  }
}

function hideVaultsDate(dateStr) {
  let [month, day, year] = dateStr.split("-");
  let comparisonDate = new Date(Number(year), Number(month) - 1, Number(day));
  let vaults = [...savedVaults, ...postedVaults];
  for (const vault of vaults) {
    let date = new Date(vault.work_date);
    if (date.valueOf() < comparisonDate.valueOf()) {
      map.removeLayer(vault.marker);
      vault.hidden = true;
    }
  }
}

function hideOldVaults() {
  let vaults = [...savedVaults, ...postedVaults];
  for (const vault of vaults) {
    let date = new Date(vault.work_date);
    if (date.valueOf() < getMonday().valueOf()) {
      map.removeLayer(vault.marker);
      vault.hidden = true;
    }
  }
}

function createPopup(footage, latLng, rock) {
  let popup = L.popup({
    closeButton: false,
    className: `asBuiltPopup ${(rock) ? "rockPopup" : ""}`,
    autoClose: false,
    autoPan: false,
    closeOnClick: false,
  })
    .setLatLng(latLng)
    .setContent(`<p class="asBuiltNumberHeader">${footage}'</p>`)
    .openOn(map);
  stylePopups();
  makeDraggable(popup);
  return popup;
}

function getAveragePoint(points) {
  let totals = points.reduce((prev, curr) => {
    return {
      lat: prev.lat + curr.lat,
      lng: prev.lng + curr.lng,
    }
  });

  return {
    lat: totals.lat / points.length,
    lng: totals.lng / points.length,
  };
}

function generateBoreLabels() {
  let bores = [...savedBores, ...postedBores, ...savedRocks];
  for (const bore of bores) {
    if (!bore.hidden) {
      let latLng = getAveragePoint(bore.line._latlngs);
      latLng = [latLng.lat, latLng.lng];
      if (bore.rock) {
        bore.boreLabel = createPopup(bore.footage, latLng, true);
      } else {
        bore.boreLabel = createPopup(bore.footage, latLng, false);
      }
    }
  }
}

function makeDraggable(popup) {
  let pos = map.latLngToLayerPoint(popup.getLatLng());
  L.DomUtil.setPosition(popup._wrapper.parentNode, pos);
  let draggable = new L.Draggable(popup._container, popup._wrapper);
  draggable.enable();

  draggable.on('dragend', function () {
    let pos = map.layerPointToLatLng(this._newPos);
    popup.setLatLng(pos);
  });
}

map.attributionControl.setPrefix(false);

let dt20Icon = L.icon({
  iconUrl: "/images/icons/DT20.png",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

let dt30Icon = L.icon({
  iconUrl: "/images/icons/DT30.png",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

let dt36Icon = L.icon({
  iconUrl: "/images/icons/DT36.png",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

let questionIcon = L.icon({
  iconUrl: "/images/icons/question.png",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

let xIcon = L.icon({
  iconUrl: "/images/icons/x.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

let iconList = [dt20Icon, dt30Icon, dt36Icon, questionIcon];

let currentBore = 0;

let points = [];
let currentLineMarkers = [];
let currentLine = 0;
let currentMarker = 0;

let savedMarkers = [];
let savedLines = [];

let submittedMarkers = [];
let submittedBores = [];
let submittedRock = [];

let postedBores = [];
let postedVaults = [];

let currentlyHidingVaults = false;
let currentlyHidingBores = false;

let trans = {
  0: 'DT20',
  1: 'DT30',
  2: 'DT36',
};

let iconTrans = {
  0: dt20Icon,
  1: dt30Icon,
  2: dt36Icon,
};

drawSavedBores();
drawSavedVaults();
drawSavedRocks();

function checkLogin() {
  if (crewName == undefined) {
    alert('you are logged out, please log back in');
    window.location.href = "http://192.168.86.36:3000";
  }
}

function formatDate(dateStr) {
  date = new Date(`${dateStr}`);
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

function stylePopups() {
  let popups = document.querySelectorAll('.asBuiltPopup>.leaflet-popup-content-wrapper>.leaflet-popup-content');
  for (const ele of popups) {
    ele.style.padding = "3px";
    ele.style.width = "fit-content";
  }
  let totalsPopup = document.querySelector('.totalsPopup>.leaflet-popup-content-wrapper>.leaflet-popup-content');
  if (totalsPopup) {
    totalsPopup.style.width = "fit-content";
  }

}

function deleteSavedVault(id) {
  // if (!confirm('Are you sure you want to delete the vault?')) {
  //   return;
  // }

  let tmpArray = [];
  for (const vault of savedVaults) {
    if (vault.id == id) {
      map.removeLayer(vault.marker);
    } else {
      tmpArray.push(vault);
    }
  }
  savedVaults = tmpArray;

  let obj = {
    type: "vault",
    id: id,
  }
  sendRequest(obj, "deleteData");
}

function deleteBore(workDate, crewName, footage, points, rock) {
  points = points.split(",").map((val) => { return parseFloat(val); });
  let parsedPoints = [];
  for (let i = 0; i < points.length; i += 2) {
    let pos = [points[i], points[i + 1]];
    parsedPoints.push(pos);
  }

  let tmpArray = [];

  for (const bore of postedBores) {
    if (bore.points.length == parsedPoints.length) {
      let equal = true;
      for (let i = 0; i < parsedPoints.length; i++) {
        if (bore.points[i][0] !== parsedPoints[i][0] || bore.points[i][1] !== parsedPoints[i][1]) {
          equal = false;
          break;
        }
      }
      if (equal) {
        map.removeLayer(bore.line);
      } else {
        tmpArray.push(bore);
      }
    }
  }

  postedBores = tmpArray;

  let obj = {
    workDate: workDate,
    crewName: crewName,
    footage: footage,
    points: parsedPoints,
    jobName: jobName,
    pageNumber: pageId,
    rock: rock,
    id: -1,
    type: "bore",
  }

  let reqObj = { ...obj };
  sendRequest(reqObj, "deleteData");
}

function deleteSavedBore(id, rock) {
  let tmpArray = [];
  if (rock) {
    for (const rock of savedRocks) {
      if (id == rock.id) {
        map.removeLayer(rock.line);
      } else {
        tmpArray.push(rock);
      }
    }
    savedRocks = tmpArray;
  } else {
    for (const bore of savedBores) {
      if (id == bore.id) {
        map.removeLayer(bore.line);
      } else {
        tmpArray.push(bore);
      }
    }
    savedBores = tmpArray;
  }

  let obj = {
    type: "bore",
    id: id,
    rock: rock,
  }

  let reqObj = { ...obj }
  sendRequest(reqObj, "deleteData");
}

function toggleVaultVisibility() {
  let vaults = [...savedVaults, ...postedVaults];
  if (!currentlyHidingVaults) {
    for (const vault of vaults) {
      map.removeLayer(vault.marker);
      vault.hidden = true;
    }
    currentlyHidingVaults = true;
  } else {
    for (const vault of vaults) {
      vault.marker.addTo(map);
      vault.hidden = false;
    }
    currentlyHidingVaults = false;
  }
}

function toggleBoreVisibility() {
  let bores = [...savedBores, ...postedBores];
  if (!currentlyHidingBores) {
    for (const bore of bores) {
      map.removeLayer(bore.line);
      bore.hidden = true;
    }
    currentlyHidingBores = true;
  } else {
    for (const bore of bores) {
      bore.line.addTo(map);
      bore.hidden = false;
    }
    currentlyHidingBores = false;
  }
}

function deleteVault(workDate, crewName, vaultSize, position) {
  // if (!confirm('Are you sure you want to delete the vault?')) {
  //   return;
  // }

  position = position.split(",").map((val) => { return parseFloat(val); });

  let tmpArray = [];
  for (const marker of postedVaults) {
    if (position[0] == marker.position.lat && position[1] == marker.position.lng) {
      map.removeLayer(marker.marker);
    } else {
      tmpArray.push(marker);
    }
  }
  postedVaults = tmpArray;

  let obj = {
    workDate: workDate,
    crewName: crewName,
    vaultSize: vaultSize,
    position: position,
    jobName: jobName,
    pageNumber: pageId,
    type: "vault",
    id: -1,
  }

  sendRequest(obj, "deleteData");
}

function goBack() {
  if (currentLine !== 0 || currentMarker !== 0) {
    if (confirm('Are you sure you want to go back? There are unsubmitted bores/vaults.')) {
      window.location.href = "http://192.168.86.36:3000/viewJobs";
    }
  } else {
    window.location.href = "http://192.168.86.36:3000/viewJobs";
  }
}

function generateVaultPopupHTML(workDate, vaultCrewName, vaultSize, vaultId, position) {
  let deleteArgs = "";
  if (vaultId !== -1) {
    if (vaultCrewName !== crewName) {
      deleteArgs = `alert('You are logged in as: ${crewName}. Only ${vaultCrewName} can delete this vault.')`;
    } else {
      deleteArgs = `deleteSavedVault(${vaultId})`;
    }
  } else {
    deleteArgs = `deleteVault('${workDate}', '${vaultCrewName}', '${vaultSize}', '${position}')`;
  }

  let html = `
    <div style="display: grid;width:150px;">
      <h3 style="grid-column: 1;grid-row: 1;margin-top: 0;margin-bottom: 0;align-self: center;">${vaultCrewName}</h3>
      <h3 style="grid-column: 1;grid-row: 2;margin-top: 0;margin-bottom: 0;align-self: center;">${formatDate(workDate)}</h3>
      <h3 style="grid-column: 1;grid-row: 3;margin-top: 0;margin-bottom: 0;align-self: center;">${trans[vaultSize]}</h3>
      <a style="visibility: hidden;grid-column: 2;grid-row:1;margin: auto;text-align: right;" href="#"><img style="width:30%;align-self: center;" src="/images/icons/small_edit.png">Edit</a>
      <a onclick="${deleteArgs}" style="grid-column: 2;grid-row:3;margin: auto;text-align: right;" href="#"><img style="width:30%;align-self: center;" src="/images/icons/small_delete.png" >Delete</a>
    </div>
  `
  return html;
}

function generateBorePopupHTML(workDate, boreCrewName, footage, rock, boreId, points) {
  let deleteArgs = "";
  if (boreId !== -1) {
    if (boreCrewName !== crewName) {
      deleteArgs = `alert('You are logged in as: ${crewName}. Only ${boreCrewName} can delete this bore.')`;
    } else {
      deleteArgs = `deleteSavedBore(${boreId}, ${rock})`;
    }
  } else {
    deleteArgs = `deleteBore('${workDate}', '${boreCrewName}', '${footage}', '${points}', ${rock})`
  }
  let html = `
    <div style="display: grid; width:150px;">
      <h3 style="grid-column: 1; grid-row: 1;margin-top: 0;margin-bottom: 0;align-self: center;">${boreCrewName}</h3>
      <h3 style="grid-column: 1; grid-row: 2;margin-top: 0;margin-bottom: 0;align-self: center;">${formatDate(workDate)}</h3>
      <h3 style="grid-column: 1; grid-row: 3;margin-top: 0;margin-bottom: 0;align-self: center;">${footage}ft</h3>
      <h3 style="grid-column: 1; grid-row: 4;margin-top: 0;margin-bottom: 0;align-self: center;">${(rock) ? "ROCK" : ""}</h3>
      <a style="visibility: hidden; grid-column: 2;grid-row:1;margin: auto;text-align: right;" href="#"><img style="width:30%;align-self: center;" src="/images/icons/small_edit.png">Edit</a>
      <a onclick="${deleteArgs}" style="grid-column: 2;grid-row:3;margin: auto;text-align: right;" href="#"><img style="width:30%;align-self: center;" src="/images/icons/small_delete.png">Delete</a>
    </div>
  `
  return html;
}

function drawSavedBores() {
  for (const bore of savedBores) {
    let lineColor = (crewName == bore.crew_name) ? "blue" : "#ffa500";
    let line = L.polyline(bore.position, { color: lineColor, weight: 7, renderer: renderer });
    bore.line = line;
    line.bindPopup(generateBorePopupHTML(bore.work_date, bore.crew_name, bore.footage, false, bore.id, bore.position));
    line.addTo(map);
    savedLines.push(line);
  }
}

function drawSavedVaults() {
  for (const vault of savedVaults) {
    let marker = L.marker(vault.position, { icon: iconTrans[vault.vault_size] });
    marker.bindPopup(generateVaultPopupHTML(vault.work_date, vault.crew_name, vault.vault_size, vault.id, -1));
    marker.addTo(map);
    vault.marker = marker;
    savedMarkers.push(marker);
  }
}

function drawSavedRocks() {
  for (const bore of savedRocks) {
    let lineColor = (crewName == bore.crew_name) ? "green" : "red";
    let line = L.polyline(bore.position, { color: lineColor, weight: 5, dashArray: "8 8", renderer: renderer });
    bore.line = line;
    line.bindPopup(generateBorePopupHTML(bore.work_date, bore.crew_name, bore.footage, true, bore.id, bore.position));
    line.addTo(map);
    savedLines.push(line);
  }
}

function clearInputs() {
  let footageInput = document.getElementById('footageInput');
  footageInput.value = "";

  let vaultInput = document.getElementById('vaultType');
  vaultInput.value = -1;

  let dateInput = document.getElementById('dateInput');
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  let day = String(currentDate.getDate()).padStart(2, "0");
  let month = String(currentDate.getMonth() + 1).padStart(2, "0");
  let year = currentDate.getFullYear();
  dateInput.value = `${year}-${month}-${day}`;
}

function parseJumbledJSON(txt) {
  return JSON.parse(txt.replace(/&quot;/g, '"'));
}

function setInputsHidden() {
  let vaultTypeLabel = document.getElementById('vaultTypeLabel');
  let vaultTypeInput = document.getElementById('vaultType');

  let footageLabel = document.getElementById('footageInputLabel');
  let footageInput = document.getElementById('footageInput');

  let arr = [vaultTypeLabel, vaultTypeInput, footageLabel, footageInput];
  for (const ele of arr) {
    ele.style.visibility = "hidden";
  }

  let dateInput = document.getElementById('dateInput');
  dateInput.style.visibility = "hidden";
}

function toggleInputVisibility(option) {
  // 0 = vault inputs
  // 1 = footage inputs
  // 2 = both

  let vaultTypeLabel = document.getElementById('vaultTypeLabel');
  let vaultTypeInput = document.getElementById('vaultType');

  let footageLabel = document.getElementById('footageInputLabel');
  let footageInput = document.getElementById('footageInput');
  let arr = [];
  if (option == 0) {
    arr = [vaultTypeLabel, vaultTypeInput];
  } else if (option == 1) {
    arr = [footageLabel, footageInput];
  } else {
    arr = [vaultTypeLabel, vaultTypeInput, footageLabel, footageInput];
  }

  for (const ele of arr) {
    if (ele.style.visibility == "hidden") {
      ele.style.visibility = "visible";
    } else {
      ele.style.visibility = "hidden";
    }
  }

  let dateInput = document.getElementById('dateInput');
  if (dateInput.style.visibility == "hidden") {
    dateInput.style.visibility = "visible";
  } else if (dateInput.style.visibility == "visible") {
    dateInput.style.visibility = "hidden";
  }
}

function addVault() {
  if (addingVault || addingBore || addingRock) {
    return;
  }
  addingVault = true;
  addingBore = false;
  addingRock = false;
  toggleInputVisibility(0);

  document.getElementById('addBore').style.color = "#939393";
  document.getElementById('addBore').style.backgroundColor = "#616161";
  document.getElementById('addRock').style.color = "#939393";
  document.getElementById('addRock').style.backgroundColor = '#616161';
}

function addBore() {
  if (addingBore || addingVault || addingRock) {
    return;
  }
  addingBore = true;
  addingVault = false;
  addingRock = false;
  toggleInputVisibility(1);

  document.getElementById('addBox').style.color = "#939393";
  document.getElementById('addBox').style.backgroundColor = "#616161";
  document.getElementById('addRock').style.color = "#939393";
  document.getElementById('addRock').style.backgroundColor = "#616161";
}

function addRock() {
  if (addingBore || addingVault || addingRock) {
    return;
  }

  addingRock = true;
  addingBore = false;
  addingVault = false;
  toggleInputVisibility(1);

  document.getElementById('addBox').style.color = "#939393";
  document.getElementById('addBox').style.backgroundColor = "#616161";
  document.getElementById('addBore').style.color = "#939393";
  document.getElementById('addBore').style.backgroundColor = "#616161";
}

function getDateInput() {
  let dateInput = document.getElementById('dateInput');
  let val = dateInput.value;
  return new Date(`${val}T00:00:00`);
}

function finishPlacing() {
  checkLogin();
  if (currentMarker != 0) {
    let typeOfBox = document.getElementById('vaultType').value;
    if (typeOfBox == -1) {
      alert('Please select box size');
      return;
    }



    if (confirm(`Confirm placing ${trans[typeOfBox]}?`)) {
      currentMarker.dragging.disable();
      currentMarker.setIcon(iconTrans[typeOfBox]);
      let vault = {
        position: currentMarker.getLatLng(),
        size: trans[typeOfBox],
        marker: currentMarker,
        workDate: getDateInput(),
        hidden: false,
      };
      let pos = [vault.position.lat, vault.position.lng];
      currentMarker.bindPopup(generateVaultPopupHTML(getDateInput(), crewName, typeOfBox, -1, pos));
      submittedMarkers.push(vault);
      currentMarker = 0;

      addingBore = false;
      addingVault = false;

      toggleInputVisibility(0);

      document.getElementById('addBox').style.color = "white";
      document.getElementById('addBox').style.backgroundColor = "#0a0a61";
      document.getElementById('addBore').style.color = "white";
      document.getElementById('addBore').style.backgroundColor = "#0a0a61";
      document.getElementById('addRock').style.color = "white";
      document.getElementById('addRock').style.backgroundColor = "#0a0a61";
      document.getElementById('undo').style.color = "white";
    }
  }

  if (currentLine != 0) {
    let footage = document.getElementById('footageInput').value;
    let boreType = (addingRock) ? 'rock' : 'regular'

    if (isNaN(footage) || footage == "") {
      alert('Footage must be a number');
      return;
    }

    if (confirm(`Confirm placing ${footage}ft bore? ${(addingRock) ? "ROCK" : ""}`)) {
      let linePoints = [];
      for (const marker of currentLineMarkers) {
        let pos = marker.getLatLng()
        linePoints.push([pos.lat, pos.lng]);
      }
      let bore = {
        points: linePoints,
        footage: footage,
        jobName: jobName,
        pageId: pageId,
        boreType: boreType,
        line: currentLine,
        id: -1,
        workDate: getDateInput(),
        hidden: false,
      };
      submittedBores.push(bore);
      for (const marker of currentLineMarkers) {
        map.removeLayer(marker);
      }

      currentLine.bindPopup(generateBorePopupHTML(getDateInput(), crewName, footage, addingRock, -1, bore.points));

      currentLine = 0;
      currentLineMarkers = [];

      addingBore = false;
      addingVault = false;
      addingRock = false;

      toggleInputVisibility(1);

      document.getElementById('addBox').style.color = "white";
      document.getElementById('addBox').style.backgroundColor = "#0a0a61";
      document.getElementById('addBore').style.color = "white";
      document.getElementById('addBore').style.backgroundColor = "#0a0a61";
      document.getElementById('addRock').style.color = "white";
      document.getElementById('addRock').style.backgroundColor = "#0a0a61";
      document.getElementById('undo').style.color = "white";
    }
  }

  sendPost();
  clearInputs();
}

function updatePolyline(color, weight, dashArray) {
  if (currentLine != 0) {
    map.removeLayer(currentLine);
  }

  let points = [];
  for (const marker of currentLineMarkers) {
    points.push(marker.getLatLng());
  }
  currentLine = L.polyline(points, { color: color, weight: weight, dashArray: dashArray, renderer: renderer });
  currentLine.addTo(map);
}

function clickHandler(event) {
  let position = map.mouseEventToLatLng(event.originalEvent);
  if (addingVault) {
    currentMarker = L.marker(position, { draggable: 'true', icon: questionIcon });
    currentMarker.addTo(map);
    addingVault = false;

    document.getElementById('addBox').style.color = "lightgray";
    document.getElementById('undo').style.color = "black";
  }
  if (addingBore) {
    let lineMarker = L.marker(position, { draggable: 'true', icon: xIcon });
    lineMarker.addTo(map);
    currentLineMarkers.push(lineMarker);
    lineMarker.on('drag', (event) => {
      updatePolyline('blue', 7, "");
    });

    if (currentLineMarkers.length > 1) {
      updatePolyline('blue', 7, "");
    }
  }
  if (addingRock) {
    let lineMarker = L.marker(position, { draggable: 'true', icon: xIcon });
    lineMarker.addTo(map);
    currentLineMarkers.push(lineMarker);
    lineMarker.on('drag', (event) => {
      updatePolyline('green', 4, "8 8");
    });

    if (currentLineMarkers.length > 1) {
      updatePolyline('green', 4, "8 8");
    }
  }
}

function undoButton() {
  clearInputs();
  if (currentMarker != 0) {
    map.removeLayer(currentMarker);
  }
  if (currentLine != 0) {
    map.removeLayer(currentLine);
  }
  for (const marker of currentLineMarkers) {
    map.removeLayer(marker);
  }

  currentMarker = 0;
  currentLine = 0;
  currentLineMarkers = [];

  addingBore = false;
  addingVault = false;
  addingRock = false;

  document.getElementById('addBox').style.color = "white";
  document.getElementById('addBox').style.backgroundColor = "#0a0a61";
  document.getElementById('addBore').style.color = "white";
  document.getElementById('addBore').style.backgroundColor = "#0a0a61";
  document.getElementById('addRock').style.color = "white";
  document.getElementById('addRock').style.backgroundColor = "#0a0a61";
  document.getElementById('undo').style.color = "lightgray";

  document.getElementById('vaultTypeLabel').style.visibility = "hidden";
  document.getElementById('vaultType').style.visibility = "hidden";
  document.getElementById('footageInputLabel').style.visibility = "hidden";
  document.getElementById('footageInput').style.visibility = "hidden";
  document.getElementById('dateInput').style.visibility = "hidden";
}


function sendRequest(body, url) {
  // for some reason can't send line object request
  body.line = undefined;
  body.marker = undefined;

  let req = new XMLHttpRequest();
  req.open("POST", `http://192.168.86.36:3000/${url}`);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(JSON.stringify(body));
}

function sendPost() {
  for (const vault of submittedMarkers) {
    let postObj = {
      objType: "vault",
      position: vault.position,
      size: vault.size,
      jobName: jobName,
      crew: crewName,
      pageNumber: pageId,
      marker: vault.marker,
      workDate: vault.workDate,
      hidden: false,
    };
    let reqObj = { ...postObj }
    sendRequest(reqObj, "inputData");
    postedVaults.push(vault);
  }

  for (const bore of submittedBores) {
    let postObj = {
      objType: "bore",
      points: bore.points,
      footage: bore.footage,
      jobName: jobName,
      crew: crewName,
      pageNumber: pageId,
      boreType: bore.boreType,
      line: bore.line,
      workDate: bore.workDate,
      rock: (bore.boreType == "rock") ? true : false,
      hidden: false,
    }
    let reqObj = { ...postObj };
    sendRequest(reqObj, "inputData");
    postedBores.push(postObj);
  }

  submittedMarkers = [];
  submittedBores = [];
}

map.on('zoomend', () => {
  let zoomLevel = map.getZoom();
  for (const icon of iconList) {
    if (zoomLevel == 3) {
      icon.options.iconSize = [12, 12];
      icon.options.iconAnchor = [6, 6];
    } else if (zoomLevel == 4) {
      icon.options.iconSize = [16, 16];
      icon.options.iconAnchor = [8, 8];
    } else if (zoomLevel == 5) {
      icon.options.iconSize = [20, 20];
      icon.options.iconAnchor = [10, 10];
    } else if (zoomLevel == 6) {
      icon.options.iconSize = [30, 30];
      icon.options.iconAnchor = [15, 15];
    } else if (zoomLevel == 7) {
      icon.options.iconSize = [40, 40];
      icon.options.iconAnchor = [20, 20];
    }
  }

  if (currentMarker !== 0) {
    currentMarker.setIcon(questionIcon);
  }

  for (const vault of savedVaults) {
    let vTrans = {
      0: dt20Icon,
      1: dt30Icon,
      2: dt36Icon,
    };
    vault.marker.setIcon(vTrans[vault.vault_size]);
  }

  for (const vault of postedVaults) {
    let vTrans = {
      "DT20": dt20Icon,
      "DT30": dt30Icon,
      "DT36": dt36Icon,
    };
    vault.marker.setIcon(vTrans[vault.size]);
  }
})

map.on('click', (event) => clickHandler(event));
