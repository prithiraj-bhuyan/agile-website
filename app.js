let authMode = "login"; 
let userState = {
  isLoggedIn: false,
  activePlan: "free" 
};

// --- Page & UI Rendering ---
function showPage(pageId) {
  const landing = document.getElementById("landing-page");
  const subscriptions = document.getElementById("subscription-page");

  if (pageId === "subscriptions") {
    landing.classList.add("hidden");
    subscriptions.classList.remove("hidden");
    renderSubscriptions();
    window.scrollTo(0, 0);
  } else {
    landing.classList.remove("hidden");
    subscriptions.classList.add("hidden");
  }
}

function renderNav() {
  const navActions = document.querySelector(".nav-actions");
  if (userState.isLoggedIn) {
    // Show Profile Icon/Button instead of Login/Signup
    navActions.innerHTML = `
      <div class="profile-group">
        <span class="plan-tag">${userState.activePlan.toUpperCase()}</span>
        <button class="profile-icon" onclick="alert('Profile settings coming soon!')">👤</button>
      </div>
    `;
  }
}

// --- Subscription Logic ---
function renderSubscriptions() {
  const plans = ["free", "pro", "team"];
  plans.forEach(plan => {
    const container = document.querySelector(`#plan-${plan} .plan-action`);
    if (!container) return;

    if (userState.activePlan === plan) {
      container.innerHTML = `
        <div class="active-badge">Active Plan</div>
        ${plan !== 'free' ? `<button class="btn ghost small full cancel-btn" onclick="cancelSubscription()">Cancel Subscription</button>` : ''}
      `;
    } else {
      const isPrimary = plan === "pro" ? "primary" : "";
      container.innerHTML = `<button class="btn ${isPrimary} full" onclick="subscribeToPlan('${plan}')">${plan === 'free' ? 'Switch to Free' : 'Subscribe'}</button>`;
    }
  });
}

function subscribeToPlan(planId) {
  userState.activePlan = planId;
  renderSubscriptions();
  renderNav(); // Update the tag in the nav if needed
}

function cancelSubscription() {
  if (confirm("Cancel and return to Free?")) {
    userState.activePlan = "free";
    renderSubscriptions();
    renderNav();
  }
}

// --- Auth Functions (FIXED) ---
function handleAuthSubmit(event) {
  event.preventDefault();
  userState.isLoggedIn = true; // Update state
  renderNav(); // Update UI to show profile
  setMsg("Success! Logging you in...");
  setTimeout(closeAuth, 1000);
}

function dummyOAuth(provider) {
  userState.isLoggedIn = true; 
  renderNav(); 
  setMsg(`${provider} login successful! ✅`);
  setTimeout(closeAuth, 1000);
}

// Helpers
function showLogin(mode = "login") {
  authMode = mode;
  document.getElementById("authModal").classList.remove("hidden");
  renderAuthMode();
}
function closeAuth() { document.getElementById("authModal").classList.add("hidden"); }
function renderAuthMode() {
  document.getElementById("authTitle").textContent = authMode === "login" ? "Log in" : "Create account";
  document.getElementById("authSubmitBtn").textContent = authMode === "login" ? "Log in" : "Sign up";
}
function setMsg(t) { document.getElementById("authMsg").textContent = t; }
function scrollToSection(id) {
  showPage('landing');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}