let authMode = "login";
let userState = {
  isLoggedIn: false,
  activePlan: "free",
  email: "",
  pendingPlan: null
};

const EMAIL_VERIFY_TTL_MS = 10 * 60 * 1000; // demo: 10 min

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
    navActions.innerHTML = `
      <div class="profile-group">
        <span class="plan-tag">${userState.activePlan.toUpperCase()}</span>
        <button class="profile-icon" onclick="alert('Profile settings coming soon!')">Profile</button>
      </div>
    `;
  }
}

// --- Subscription Logic ---
function renderSubscriptions() {
  const plans = ["free", "pro", "team"];
  plans.forEach((plan) => {
    const container = document.querySelector(`#plan-${plan} .plan-action`);
    if (!container) return;

    if (userState.activePlan === plan) {
      container.innerHTML = `
        <div class="active-badge">Active Plan</div>
        ${plan !== "free" ? `<button class="btn ghost small full cancel-btn" onclick="cancelSubscription()">Cancel Subscription</button>` : ""}
      `;
    } else {
      const isPrimary = plan === "pro" ? "primary" : "";
      container.innerHTML = `<button class="btn ${isPrimary} full" onclick="subscribeToPlan('${plan}')">${plan === "free" ? "Switch to Free" : "Subscribe"}</button>`;
    }
  });
}

function subscribeToPlan(planId) {
  if (!userState.isLoggedIn) {
    setMsg("Please log in first.");
    showLogin("login");
    return;
  }

  if (!isEmailVerified(userState.email)) {
    userState.pendingPlan = planId;
    showVerifyModal();
    setVerifyMsg("Verify your email to continue.");
    return;
  }

  userState.activePlan = planId;
  renderSubscriptions();
  renderNav();
}

function cancelSubscription() {
  if (confirm("Cancel and return to Free?")) {
    userState.activePlan = "free";
    renderSubscriptions();
    renderNav();
  }
}

// --- Auth ---
function handleAuthSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById("email");
  const email = (emailInput?.value || "").trim().toLowerCase();
  if (!email) {
    setMsg("Please enter a valid email.");
    return;
  }

  userState.email = email;
  userState.isLoggedIn = true;
  renderNav();

  if (authMode === "signup") {
    setMsg("Account created. Verify your email before subscribing.");
  } else {
    setMsg("Success! Logging you in...");
  }

  setTimeout(closeAuth, 700);
}

function dummyOAuth(provider) {
  userState.isLoggedIn = true;
  if (!userState.email) userState.email = `${provider}_user@example.com`;
  renderNav();
  setMsg(`${provider} login successful.`);
  setTimeout(closeAuth, 700);
}

// --- Verify Modal ---
function showVerifyModal() {
  const emailText = document.getElementById("verifyEmailText");
  emailText.textContent = `Email: ${userState.email || "(missing)"}`;
  document.getElementById("verifyCodeInput").value = "";
  setVerifyMsg("");
  document.getElementById("verifyModal").classList.remove("hidden");
}

function closeVerifyModal() {
  document.getElementById("verifyModal").classList.add("hidden");
}

function sendVerificationCode() {
  if (!userState.email) {
    setVerifyMsg("No email found. Please log in again.");
    return;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const store = getVerificationStore();
  store[userState.email] = {
    verified: false,
    code,
    expiresAt: Date.now() + EMAIL_VERIFY_TTL_MS
  };
  setVerificationStore(store);

  // Frontend-only demo: code is shown in UI instead of being emailed.
  setVerifyMsg(`Demo code: ${code} (expires in 10 minutes)`);
}

function verifyEmailCode() {
  const inputCode = (document.getElementById("verifyCodeInput").value || "").trim();
  const store = getVerificationStore();
  const record = store[userState.email];

  if (!record) {
    setVerifyMsg("Send a code first.");
    return;
  }

  if (Date.now() > record.expiresAt) {
    setVerifyMsg("Code expired. Send a new code.");
    return;
  }

  if (inputCode !== record.code) {
    setVerifyMsg("Invalid code.");
    return;
  }

  record.verified = true;
  delete record.code;
  delete record.expiresAt;
  store[userState.email] = record;
  setVerificationStore(store);
  setVerifyMsg("Email verified.");

  if (userState.pendingPlan) {
    const selectedPlan = userState.pendingPlan;
    userState.pendingPlan = null;
    userState.activePlan = selectedPlan;
    renderSubscriptions();
    renderNav();
  }

  setTimeout(closeVerifyModal, 500);
}

function isEmailVerified(email) {
  if (!email) return false;
  const store = getVerificationStore();
  return Boolean(store[email]?.verified);
}

function getVerificationStore() {
  try {
    return JSON.parse(localStorage.getItem("verification_store") || "{}");
  } catch {
    return {};
  }
}

function setVerificationStore(store) {
  localStorage.setItem("verification_store", JSON.stringify(store));
}

// --- Helpers ---
function showLogin(mode = "login") {
  authMode = mode;
  document.getElementById("authModal").classList.remove("hidden");
  renderAuthMode();
}

function closeAuth() {
  document.getElementById("authModal").classList.add("hidden");
}

function renderAuthMode() {
  document.getElementById("authTitle").textContent = authMode === "login" ? "Log in" : "Create account";
  document.getElementById("authSubmitBtn").textContent = authMode === "login" ? "Log in" : "Sign up";
  document.getElementById("switchText").textContent = authMode === "login" ? "Don't have an account?" : "Already have an account?";
  document.getElementById("switchLink").textContent = authMode === "login" ? "Sign up" : "Log in";
}

function toggleAuthMode() {
  authMode = authMode === "login" ? "signup" : "login";
  renderAuthMode();
  setMsg("");
}

function setMsg(text) {
  document.getElementById("authMsg").textContent = text;
}

function setVerifyMsg(text) {
  document.getElementById("verifyMsg").textContent = text;
}

function scrollToSection(id) {
  showPage("landing");
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
