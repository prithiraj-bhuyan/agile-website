let authMode = "login"; // "login" or "signup"

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// FIX: this must exist (your error was because it didn't)
function showLogin(mode = "login") {
  authMode = mode;
  const modal = document.getElementById("authModal");
  modal.classList.remove("hidden");
  renderAuthMode();
}

function closeAuth() {
  const modal = document.getElementById("authModal");
  modal.classList.add("hidden");
  clearMsg();
}

function toggleAuthMode() {
  authMode = authMode === "login" ? "signup" : "login";
  renderAuthMode();
  clearMsg();
}

function renderAuthMode() {
  const title = document.getElementById("authTitle");
  const submitBtn = document.getElementById("authSubmitBtn");
  const switchText = document.getElementById("switchText");
  const switchLink = document.getElementById("switchLink");

  if (authMode === "login") {
    title.textContent = "Log in";
    submitBtn.textContent = "Log in";
    switchText.textContent = "Don’t have an account?";
    switchLink.textContent = "Sign up";
  } else {
    title.textContent = "Create your account";
    submitBtn.textContent = "Sign up";
    switchText.textContent = "Already have an account?";
    switchLink.textContent = "Log in";
  }
}

function clearMsg() {
  const msg = document.getElementById("authMsg");
  msg.textContent = "";
}

function setMsg(text) {
  const msg = document.getElementById("authMsg");
  msg.textContent = text;
}

function dummyOAuth(provider) {
  // Dummy: simulate redirect + success
  const p = provider === "google" ? "Google" : "Apple";
  setMsg(`${p} authentication (dummy) successful ✅ You are now signed in to Fact Hub.`);
  // If you want, you can auto-close after a second:
  // setTimeout(closeAuth, 900);
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pw = document.getElementById("password").value;

  // Dummy auth: accept anything non-empty
  if (!email || !pw) {
    setMsg("Please enter email and password.");
    return;
  }

  if (authMode === "login") {
    setMsg(`Logged in (dummy) as ${email} ✅`);
  } else {
    setMsg(`Account created (dummy) for ${email} ✅`);
  }
}