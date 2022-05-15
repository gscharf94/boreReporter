let crews = parseJumbledJSON(crewsJSON);

function parseJumbledJSON(txt) {
  return JSON.parse(txt.replace(/&quot;/g, '"'));
}

function checkCredentials() {
  let username = document.getElementById('usernameInput').value;
  let password = document.getElementById('passwordInput').value;

  let correctCredentials = false;

  for (const crew of crews) {
    if (crew.crew_name == username && crew.password == password) {
      correctCredentials = true;
    }
  }

  if (correctCredentials) {
    document.cookie = `username=${username}; path=/`;
    window.location.replace('http://fiber1report.com/viewJobs');
  } else {
    alert('incorrect username or password');
  }
}

function redirectIfLoggedIn() {
  let cookie = document.cookie;
  if (cookie.split("=")[0] == "username") {
    window.location.replace('http://fiber1report.com/viewJobs');
  }
}

function setOnEnter() {
  let username = document.getElementById('usernameInput');
  let password = document.getElementById('passwordInput');

  let eles = [username, password];

  for (const ele of eles) {
    ele.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        document.getElementById('submit').click();
      }
    })
  }
}

redirectIfLoggedIn();
setOnEnter();