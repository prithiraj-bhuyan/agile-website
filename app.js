let authMode = "login";
let userState = {
  isLoggedIn: false,
  activePlan: "free",
  email: "",
  fullName: "",
  bio: "",
  initials: "",
  verificationsUsed: 12,
  verificationsLimit: 50,
  memberSince: "February 2026",
  emailNotifications: true,
  autoCheck: true,
  pendingPlan: null
};

const EMAIL_VERIFY_TTL_MS = 10 * 60 * 1000; // demo: 10 min

// --- Page & UI Rendering ---
function showPage(pageId) {
  const landing = document.getElementById("landing-page");
  const subscriptions = document.getElementById("subscription-page");
  const product = document.getElementById("product-page");
  const profile = document.getElementById("profile-page");

  // Hide all pages
  landing.classList.add("hidden");
  subscriptions.classList.add("hidden");
  product.classList.add("hidden");
  profile.classList.add("hidden");

  // Show requested page
  if (pageId === "subscriptions") {
    subscriptions.classList.remove("hidden");
    renderSubscriptions();
    window.scrollTo(0, 0);
  } else if (pageId === "product") {
    product.classList.remove("hidden");
    window.scrollTo(0, 0);
  } else if (pageId === "profile") {
    if (!userState.isLoggedIn) {
      showLogin('login');
      return;
    }
    profile.classList.remove("hidden");
    renderProfile();
    window.scrollTo(0, 0);
  } else {
    landing.classList.remove("hidden");
  }
}

function renderNav() {
  const navActions = document.querySelector(".nav-actions");
  if (userState.isLoggedIn) {
    // Show Profile Icon/Button instead of Login/Signup
    navActions.innerHTML = `
      <div class="profile-group">
        <span class="plan-tag">${userState.activePlan.toUpperCase()}</span>
        <button class="profile-icon" onclick="showPage('profile')" title="View Profile">
          ${userState.initials || '👤'}
        </button>
      </div>
    `;
  } else {
    navActions.innerHTML = `
      <button class="btn ghost" onclick="showLogin('login')">Log in</button>
      <button class="btn primary" onclick="showLogin('signup')">Sign up</button>
    `;
  }
}

// --- Subscription Logic ---
function renderSubscriptions() {
  const plans = ["free", "pro", "team"];
  
  plans.forEach(plan => {
    const container = document.querySelector(`#plan-${plan} .plan-action`);
    if (!container) return;

    if (userState.activePlan === plan && userState.isLoggedIn) {
      container.innerHTML = `
        <div class="active-badge">Active Plan</div>
        ${plan !== 'free' ? `<button class="btn ghost small full cancel-btn" onclick="cancelSubscription()">Cancel Subscription</button>` : ''}
      `;
    } else {
      const isPrimary = plan === "pro" ? "primary" : "";
      container.innerHTML = `<button class="btn ${isPrimary} full" onclick="subscribeToPlan('${plan}')">${plan === 'free' ? 'Downgrade to Free' : 'Subscribe'}</button>`;
    }
  });
}

function subscribeToPlan(planId) {
  // Check if user is logged in
  if (!userState.isLoggedIn) {
    showLogin('signup');
    setTimeout(() => {
      setMsg('Please log in or sign up to subscribe to a plan.');
    }, 100);
    return;
  }
  
  userState.activePlan = planId;
  renderSubscriptions();
  renderNav(); // Update the tag in the nav if needed
  
  // Show success message
  if (planId !== 'free') {
    alert(`Successfully subscribed to ${planId.toUpperCase()} plan! 🎉`);
  }
}

function cancelSubscription() {
  if (!userState.isLoggedIn) {
    showLogin('login');
    return;
  }
  
  if (confirm("Cancel and return to Free?")) {
    userState.activePlan = "free";
    renderSubscriptions();
    renderNav();
    alert("Subscription cancelled. You're now on the Free plan.");
  }
}

// --- Auth ---
function handleAuthSubmit(event) {
  event.preventDefault();
  
  // Capture user email
  const emailInput = document.getElementById("email");
  userState.email = (emailInput?.value || "").trim().toLowerCase();
  if (!userState.fullName) {
    userState.fullName = userState.email.split('@')[0];
  }
  userState.initials = getInitials(userState.fullName);
  
  userState.isLoggedIn = true; // Update state
  renderNav(); // Update UI to show profile
  setMsg("Success! Logging you in...");
  setTimeout(closeAuth, 1000);
}

function dummyOAuth(provider) {
  userState.email = `user@${provider}.com`;
  userState.fullName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
  userState.initials = getInitials(userState.fullName);
  userState.isLoggedIn = true; 
  renderNav(); 
  setMsg(`${provider} login successful! ✅`);
  setTimeout(closeAuth, 1000);
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

// --- Profile Functions ---
function renderProfile() {
  // Update profile display
  document.getElementById("profileDisplayName").textContent = userState.fullName || "User";
  document.getElementById("profileEmail").textContent = userState.email || "user@example.com";
  document.getElementById("profilePlanBadge").textContent = `${userState.activePlan.toUpperCase()} PLAN`;
  
  // Update initials
  const initials = getInitials(userState.fullName || userState.email);
  userState.initials = initials;
  document.getElementById("profileInitials").textContent = initials;
  document.getElementById("profileAvatarLarge").style.background = 
    "linear-gradient(135deg, var(--accent), var(--accent2))";
  
  // Populate form fields
  document.getElementById("fullName").value = userState.fullName || "";
  document.getElementById("emailInput").value = userState.email || "";
  document.getElementById("bio").value = userState.bio || "";
  
  // Update subscription info
  document.getElementById("currentPlanDisplay").textContent = 
    userState.activePlan.charAt(0).toUpperCase() + userState.activePlan.slice(1);
  
  const verificationText = userState.activePlan === 'free' 
    ? `${userState.verificationsUsed} / ${userState.verificationsLimit}`
    : "Unlimited";
  document.getElementById("verificationsUsed").textContent = verificationText;
  document.getElementById("memberSince").textContent = userState.memberSince;
  
  // Update preferences
  document.getElementById("emailNotifications").checked = userState.emailNotifications;
  document.getElementById("autoCheck").checked = userState.autoCheck;
}

function updateProfile(event) {
  event.preventDefault();
  
  // Get form values
  userState.fullName = document.getElementById("fullName").value;
  userState.email = document.getElementById("emailInput").value;
  userState.bio = document.getElementById("bio").value;
  
  // Update initials
  userState.initials = getInitials(userState.fullName || userState.email);
  
  // Re-render profile and nav
  renderProfile();
  renderNav();
  
  // Show success message
  alert("Profile updated successfully!");
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function confirmLogout() {
  if (confirm("Are you sure you want to log out?")) {
    // Reset all user state to defaults
    userState = {
      isLoggedIn: false,
      activePlan: "free",
      email: "",
      fullName: "",
      bio: "",
      initials: "",
      verificationsUsed: 12,
      verificationsLimit: 50,
      memberSince: "February 2026",
      emailNotifications: true,
      autoCheck: true,
      pendingPlan: null
    };
    
    renderNav();
    showPage('landing');
    alert("✓ Successfully logged out!");
  }
}

function confirmDeleteAccount() {
  if (confirm("⚠️ WARNING: This will permanently delete your account and all data. This action cannot be undone. Are you sure?")) {
    if (confirm("Last chance! Delete your account permanently?")) {
      // Reset all user state to defaults
      userState = {
        isLoggedIn: false,
        activePlan: "free",
        email: "",
        fullName: "",
        bio: "",
        initials: "",
        verificationsUsed: 12,
        verificationsLimit: 50,
        memberSince: "February 2026",
        emailNotifications: true,
        autoCheck: true,
        pendingPlan: null
      };
      
      // Update UI
      renderNav();
      showPage('landing');
      
      // Show confirmation
      alert("✓ Account deleted successfully. We're sorry to see you go!");
    }
  }
}

// --- Preference Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {
  // Email Notifications Toggle
  const emailNotifToggle = document.getElementById('emailNotifications');
  if (emailNotifToggle) {
    emailNotifToggle.addEventListener('change', function() {
      userState.emailNotifications = this.checked;
    });
  }
  
  // Auto-Check Toggle
  const autoCheckToggle = document.getElementById('autoCheck');
  if (autoCheckToggle) {
    autoCheckToggle.addEventListener('change', function() {
      userState.autoCheck = this.checked;
    });
  }
});
