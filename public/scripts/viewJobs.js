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





setUsernameHeader();