setInputsHidden();
clearInputs();


const crewName = document.cookie.split("=")[1];
let addingBore = false;
let addingVault = false;
let addingRock = false;
savedBores = parseJumbledJSON(savedBores);
savedVaults = parseJumbledJSON(savedVaults);

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

drawSavedBores();
drawSavedVaults();

function drawSavedBores() {
  for (const bore of savedBores) {
    console.log(bore);
    let line = L.polyline(bore.position, { color: "red", weight: 5 });
    line.bindPopup(`FTG: ${bore.footage}ft CREW: ${bore.crew_name} DATE: ${bore.work_date}`);
    line.addTo(map);
    savedLines.push(line);
  }
}

function drawSavedVaults() {
  for (const vault of savedVaults) {
    let marker = L.marker(vault.position);
    marker.bindPopup(`SIZE: ${vault.vault_size} CREW: ${vault.crew_name} DATE: ${vault.work_date}`);
    marker.addTo(map);
    savedMarkers.push(marker);
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
  document.getElementById('addVault').style.color = "lightgray";
}

function finishPlacing() {
  if (currentMarker != 0) {
    let typeOfBox = document.getElementById('vaultType').value;
    if (typeOfBox == -1) {
      alert('Please select box size');
      return;
    }

    let trans = {
      0: 'DT20',
      1: 'DT30',
      2: 'DT36',
    };


    if (confirm(`Confirm placing ${trans[typeOfBox]}?`)) {
      currentMarker.dragging.disable();
      let vault = {
        position: currentMarker.getLatLng(),
        size: trans[typeOfBox],
      };
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

    if (confirm(`Confirm placing ${footage}ft bore?`)) {
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
      currentLine = 0;
      currentLineMarkers = [];

      addingBore = false;
      addingVault = false;

      toggleInputVisibility(1);

      document.getElementById('addBox').style.color = "black";
      document.getElementById('addBore').style.color = "black";
      document.getElementById('undo').style.color = "lightgray";
    }
  }


  clearInputs();
}

function updatePolyline(color, weight) {
  if (currentLine != 0) {
    map.removeLayer(currentLine);
  }

  let points = [];
  for (const marker of currentLineMarkers) {
    points.push(marker.getLatLng());
  }
  currentLine = L.polyline(points, { color: color, weight: weight });
  currentLine.addTo(map);
}

function clickHandler(event) {
  let position = map.mouseEventToLatLng(event.originalEvent);
  if (addingVault) {
    currentMarker = L.marker(position, { draggable: 'true' });
    currentMarker.addTo(map);
    addingVault = false;

    document.getElementById('addBox').style.color = "lightgray";
    document.getElementById('undo').style.color = "black";
  }
  if (addingBore) {
    let lineMarker = L.marker(position, { draggable: 'true' });
    lineMarker.addTo(map);
    currentLineMarkers.push(lineMarker);
    lineMarker.on('drag', (event) => {
      updatePolyline('blue', 7);
    });

    if (currentLineMarkers.length > 1) {
      updatePolyline('blue', 7);
    }
  }
  if (addingRock) {
    let lineMarker = L.marker(position, { draggable: 'true' });
    lineMarker.addTo(map);
    currentLineMarkers.push(lineMarker);
    lineMarker.on('drag', (event) => {
      updatePolyline('yellow', 4);
    });

    if (currentLineMarkers.length > 1) {
      updatePolyline('yellow', 4);
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


function sendRequest(body) {
  let req = new XMLHttpRequest();
  req.open("POST", "http://192.168.86.36:3000/inputData");
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
    sendRequest(postObj);
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
    sendRequest(postObj);
  }
}


map.on('click', (event) => clickHandler(event));