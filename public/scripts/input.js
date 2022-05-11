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

let map = L.map('map').setView([65, -46], 2);
// let map = L.map('map').fitWorld();
L.tileLayer('http://192.168.86.36:3000/images/{job}/{page}/{z}/{x}/{y}.jpg', {
  attribution: `${jobName} - SH${pageId}`,
  maxZoom: 7,
  minZoom: 2,
  job: jobName,
  page: pageId,
  tileSize: 256,
  noWrap: true,
}).addTo(map);

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
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

let iconList = [dt20Icon, dt30Icon, dt36Icon, questionIcon, xIcon];

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
  date = new Date(dateStr);
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return `${month}/${day}/${year}`;
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

function generateVaultPopupHTML(workDate, crewName, vaultSize, vaultId, position) {
  let deleteArgs = "";
  if (vaultId !== -1) {
    deleteArgs = `deleteSavedVault(${vaultId})`;
  } else {
    deleteArgs = `deleteVault('${workDate}', '${crewName}', '${vaultSize}', '${position}')`;
  }

  let html = `
    <div style="display: grid;width:150px;">
      <h3 style="grid-column: 1;grid-row: 1;margin-top: 0;margin-bottom: 0;align-self: center;">${crewName}</h3>
      <h3 style="grid-column: 1;grid-row: 2;margin-top: 0;margin-bottom: 0;align-self: center;">${formatDate(workDate)}</h3>
      <h3 style="grid-column: 1;grid-row: 3;margin-top: 0;margin-bottom: 0;align-self: center;">${trans[vaultSize]}</h3>
      <a style="grid-column: 2;grid-row:1;margin: auto;text-align: right;" href="#"><img style="width:30%;align-self: center;" src="/images/icons/small_edit.png">Edit</a>
      <a onclick="${deleteArgs}" style="grid-column: 2;grid-row:3;margin: auto;text-align: right;" href="#"><img style="width:30%;align-self: center;" src="/images/icons/small_delete.png" >Delete</a>
    </div>
  `
  return html;
}

function generateBorePopupHTML(workDate, crewName, footage, rock) {
  let html = `
    <div style="display: grid; width:150px;">
      <h3 style="grid-column: 1; grid-row: 1;margin-top: 0;margin-bottom: 0;align-self: center;">${crewName}</h3>
      <h3 style="grid-column: 1; grid-row: 2;margin-top: 0;margin-bottom: 0;align-self: center;">${formatDate(workDate)}</h3>
      <h3 style="grid-column: 1; grid-row: 3;margin-top: 0;margin-bottom: 0;align-self: center;">${footage}ft</h3>
      <h3 style="grid-column: 1; grid-row: 4;margin-top: 0;margin-bottom: 0;align-self: center;">${(rock) ? "ROCK" : ""}</h3>
      <a style="grid-column: 2;grid-row:1;margin: auto;text-align: right;" href="#"><img style="width:30%;align-self: center;" src="/images/icons/small_edit.png">Edit</a>
      <a style="grid-column: 2;grid-row:3;margin: auto;text-align: right;" href="#"><img style="width:30%;align-self: center;" src="/images/icons/small_delete.png">Delete</a>
    </div>
  `
  return html;
}

function drawSavedBores() {
  for (const bore of savedBores) {
    let line = L.polyline(bore.position, { color: "red", weight: 7 });
    line.bindPopup(generateBorePopupHTML(bore.work_date, bore.crew_name, bore.footage, false));
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
    let line = L.polyline(bore.position, { color: "pink", weight: 4, dashArray: "8 8" });
    line.bindPopup(generateBorePopupHTML(bore.work_date, bore.crew_name, bore.footage, true));
    line.addTo(map);
    savedLines.push(line);
  }
}

function clearInputs() {
  let footageInput = document.getElementById('footageInput');
  footageInput.value = "";

  let vaultInput = document.getElementById('vaultType');
  vaultInput.value = -1;
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
}

function addVault() {
  if (addingVault || addingBore || addingRock) {
    return;
  }
  addingVault = true;
  addingBore = false;
  addingRock = false;
  toggleInputVisibility(0);

  document.getElementById('addBore').style.color = "lightgray";
  document.getElementById('addRock').style.color = "lightgray";
}

function addBore() {
  if (addingBore || addingVault || addingRock) {
    return;
  }
  addingBore = true;
  addingVault = false;
  addingRock = false;
  toggleInputVisibility(1);

  document.getElementById('addBox').style.color = "lightgray";
  document.getElementById('addRock').style.color = "lightgray";
}

function addRock() {
  if (addingBore || addingVault || addingRock) {
    return;
  }

  addingRock = true;
  addingBore = false;
  addingVault = false;
  toggleInputVisibility(1);

  document.getElementById('addBox').style.color = "lightgray";
  document.getElementById('addBore').style.color = "lightgray";
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
      };
      let pos = [vault.position.lat, vault.position.lng];
      currentMarker.bindPopup(generateVaultPopupHTML(new Date(), crewName, typeOfBox, -1, pos));
      submittedMarkers.push(vault);
      currentMarker = 0;

      addingBore = false;
      addingVault = false;

      toggleInputVisibility(0);

      document.getElementById('addBox').style.color = "black";
      document.getElementById('addBore').style.color = "black";
      document.getElementById('undo').style.color = "lightgray";
    }
  }

  if (currentLine != 0) {
    let footage = document.getElementById('footageInput').value;
    let boreType = 0;
    if (addingRock) {
      boreType = 'rock';
    } else if (addingBore) {
      boreType = "regular";
    } else {
      console.log('problem');
      return;
    }
    if (isNaN(footage) || footage == "") {
      alert('Footage must be a number');
      return;
    }

    if (confirm(`Confirm placing ${footage}ft bore? ${(addingRock) ? "ROCK" : ""}`)) {
      let linePoints = [];
      for (const marker of currentLineMarkers) {
        linePoints.push(marker.getLatLng());
      }
      let bore = {
        points: linePoints,
        footage: footage,
        jobName: jobName,
        pageId: pageId,
        boreType: boreType,
      };
      submittedBores.push(bore);
      for (const marker of currentLineMarkers) {
        map.removeLayer(marker);
      }

      currentLine.bindPopup(generateBorePopupHTML(new Date(), crewName, footage, (addingRock) ? true : false));

      currentLine = 0;
      currentLineMarkers = [];

      addingBore = false;
      addingVault = false;
      addingRock = false;

      toggleInputVisibility(1);

      document.getElementById('addBox').style.color = "black";
      document.getElementById('addBore').style.color = "black";
      document.getElementById('addRock').style.color = "black";
      document.getElementById('undo').style.color = "lightgray";
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
  currentLine = L.polyline(points, { color: color, weight: weight, dashArray: dashArray });
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

  document.getElementById('addBox').style.color = "black";
  document.getElementById('addBore').style.color = "black";
  document.getElementById('addRock').style.color = "black";
  document.getElementById('undo').style.color = "lightgray";

  document.getElementById('vaultTypeLabel').style.visibility = "hidden";
  document.getElementById('vaultType').style.visibility = "hidden";
  document.getElementById('footageInputLabel').style.visibility = "hidden";
  document.getElementById('footageInput').style.visibility = "hidden";
}


function sendRequest(body, url) {
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
    };
    sendRequest(postObj, "inputData");
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
    }
    sendRequest(postObj, "inputData");
    postedBores.push(bore);
  }

  submittedMarkers = [];
  submittedBores = [];
}

// map.on('zoomend', () => {
//   let zoomLevel = map.getZoom();
//   console.log(`zoomlevel: ${zoomLevel}`);
//   if (zoomLevel == 5 || zoomLevel == 6) {
//     console.log('this happens..');
//     dt20Icon.options.iconSize = [25, 25];
//     dt20Icon.options.iconAnchor = [12, 12];
//   }
//   if (zoomLevel == 3 || zoomLevel == 4) {
//     dt20Icon.options.iconSize = [12, 12];
//     dt20Icon.options.iconAnchor = [6, 6];
//   }

//   if (zoomLevel == 7) {
//     dt20Icon.options.iconSize = [60, 60];
//     dt20Icon.options.iconAnchor = [30, 30];
//   }
//   for (const marker of savedMarkers) {
//     marker.setIcon(dt20Icon);
//   }
// });
map.on('click', (event) => clickHandler(event));