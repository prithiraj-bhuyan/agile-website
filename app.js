let authMode = "login"; 
let isLoggedIn = false;

// Page Navigation
function showPage(pageId) {
  const landing = document.getElementById("landing-page");
  const subscriptions = document.getElementById("subscription-page");

  if (pageId === "subscriptions") {
    landing.classList.add("hidden");
    subscriptions.classList.remove("hidden");
    window.scrollTo(0, 0);
  } else {
    landing.classList.remove("hidden");
    subscriptions.classList.add("hidden");
  }
}

function scrollToSection(id) {
  showPage('landing');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Authentication Logic
function showLogin(mode = "login") {
  if (isLoggedIn) return;
  authMode = mode;
  const modal = document.getElementById("authModal");
  modal.classList.remove("hidden");
  renderAuthMode();
}

function closeAuth() {
  document.getElementById("authModal").classList.add("hidden");
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
  const switchLink = document.getElementById("switchLink");
  const switchText = document.getElementById("switchText");

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

function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pw = document.getElementById("password").value;

  // Check for Dummy User
  if (email === "cool.boy@gmail.com" && pw === "password") {
    isLoggedIn = true;
    updateUIForAuth();
    setMsg("Logged in successfully! ✅");
    setTimeout(closeAuth, 800);
  } else {
    setMsg("Invalid email or password. Hint: cool.boy@gmail.com / password");
  }
}

function updateUIForAuth() {
  const navActions = document.getElementById("nav-actions");
  navActions.innerHTML = `
    <div class="user-profile">
      <span class="user-name">cool boy</span>
      <div class="user-avatar">CB</div>
    </div>
  `;
}

// Subscription Logic
function handleSubscribe(plan, btnElement) {
  if (!isLoggedIn) {
    showLogin('login');
    return;
  }

  const originalText = btnElement.textContent;
  btnElement.textContent = "Processing...";
  btnElement.disabled = true;

  setTimeout(() => {
    btnElement.textContent = "Subscribed ✅";
    btnElement.style.background = "rgba(50, 213, 131, 0.2)";
    btnElement.style.color = "#b9f6d7";
    btnElement.style.borderColor = "rgba(50, 213, 131, 0.3)";
  }, 1000);
}

// Utility Helpers
function setMsg(text) {
  document.getElementById("authMsg").textContent = text;
}

function clearMsg() {
  document.getElementById("authMsg").textContent = "";
}

function dummyOAuth(provider) {
  setMsg("Redirecting to Google...");
  setTimeout(() => {
    isLoggedIn = true;
    updateUIForAuth();
    closeAuth();
  }, 1000);
}