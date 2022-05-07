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
    window.location.replace('http://192.168.86.36:3000/viewJobs');
  } else {
    alert('incorrect username or password');
  }
}

function redirectIfLoggedIn() {
  let cookie = document.cookie;
  if (cookie.split("=")[0] == "username") {
    window.location.replace('http://192.168.86.36:3000/viewJobs');
  }
}

redirectIfLoggedIn();