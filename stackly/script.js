const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userStoreKey = "stacklyUsers";
const sessionKey = "stacklyLoggedInUser";
const profileStoreKey = "stacklyProfiles";

document.addEventListener("DOMContentLoaded", () => {
  setupPreloader();
  setupNavigation();
  setupAnchorNavigation();
  setupFooterYear();
  setupPasswordToggles();
  setupContactForm();
  setupSignupForm();
  setupLoginForm();
  setupProfilePage();
  setupCounters();
  setupTechCarousel();
  setupFiltersAndSorting();
  setupPricingToggle();
  setupHashDetails();
  setupShareButtons();
});

function setupPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const hidePreloader = () => {
    document.body.classList.remove("preloader-active");
    preloader.classList.add("preloader-hidden");
    setTimeout(() => preloader.remove(), 400);
  };

  window.addEventListener("load", () => setTimeout(hidePreloader, 450), { once: true });
  setTimeout(hidePreloader, 1600);
}

function setupNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const authArea = document.getElementById("authArea");
  const currentPage = document.body.dataset.page;

  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      menuToggle.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu(menuToggle, navMenu));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu(menuToggle, navMenu);
    });
  }

  if (!authArea) return;

  const activeUser = getActiveUser();
  if (activeUser) {
    authArea.innerHTML = `
      <a class="nav-cta" href="contact.html">Get Started</a>
      <a class="login-link" href="profile.html">Profile</a>
      <span class="user-pill">Hi, ${escapeHtml(activeUser.name)}</span>
      <button class="logout-btn" type="button" id="logoutBtn">Logout</button>
    `;
    const logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) logoutButton.addEventListener("click", logout);
    return;
  }

  authArea.innerHTML = `
    <a class="login-link" href="login.html">Login</a>
    <a class="nav-cta" href="contact.html">Get Started</a>
  `;
}

function setupAnchorNavigation() {
  const scrollToHash = (hash, updateHistory = true) => {
    if (!hash || hash === "#") return false;

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return false;

    const parentDetails = target.tagName.toLowerCase() === "details" ? target : target.closest("details");
    if (parentDetails) parentDetails.open = true;

    const header = document.querySelector(".site-header");
    const headerOffset = header ? header.offsetHeight + 18 : 18;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top, behavior: "smooth" });
    if (updateHistory) history.pushState(null, "", hash);
    return true;
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (scrollToHash(link.getAttribute("href"))) event.preventDefault();
    });
  });

  if (window.location.hash) {
    setTimeout(() => scrollToHash(window.location.hash, false), 80);
  }

  window.addEventListener("hashchange", () => scrollToHash(window.location.hash, false));
}

function setupFooterYear() {
  document.querySelectorAll("#year").forEach((item) => {
    item.textContent = new Date().getFullYear();
  });
}

function closeMenu(menuToggle, navMenu) {
  if (!menuToggle || !navMenu) return;
  navMenu.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
}

function setupPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;

      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      button.textContent = shouldShow ? "Hide" : "Show";
    });
  });
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get("service");
  const serviceSelect = document.getElementById("serviceInterest");
  if (requestedService && serviceSelect) {
    const match = Array.from(serviceSelect.options).find((option) => option.value === requestedService || option.textContent === requestedService);
    if (match) {
      serviceSelect.value = match.value || match.textContent;
    } else {
      const option = document.createElement("option");
      option.value = requestedService;
      option.textContent = requestedService;
      serviceSelect.append(option);
      serviceSelect.value = requestedService;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("contactName");
    const email = document.getElementById("contactEmail");
    const phone = document.getElementById("contactPhone");
    const service = document.getElementById("serviceInterest");
    const message = document.getElementById("contactMessage");
    const recaptcha = document.getElementById("recaptchaCheck");
    const status = document.getElementById("contactStatus");
    const submitButton = form.querySelector('button[type="submit"]');

    clearFormErrors(form);
    if (status) {
      status.style.color = "var(--success)";
      status.textContent = "";
    }

    let isValid = true;

    if (!name || !name.value.trim()) {
      setError(name, "Full name is required.");
      isValid = false;
    }

    if (!email || !emailPattern.test(email.value.trim())) {
      setError(email, "Enter a valid email address.");
      isValid = false;
    }

    if (phone && phone.value.trim() && phone.value.replace(/\D/g, "").length < 7) {
      setError(phone, "Enter a valid phone number or leave it blank.");
      isValid = false;
    }

    if (service && !service.value) {
      setError(service, "Select a service interest.");
      isValid = false;
    }

    if (!message || message.value.trim().length < 10) {
      setError(message, "Message must be at least 10 characters.");
      isValid = false;
    }

    if (recaptcha && !recaptcha.checked) {
      setError(recaptcha, "Please complete the verification checkbox.");
      isValid = false;
    }

    if (!isValid) {
      if (status) {
        status.style.color = "var(--error)";
        status.textContent = "Please correct the highlighted fields.";
      }
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    if (status) {
      status.style.color = "var(--success)";
      status.textContent = "Sending your request...";
    }

    setTimeout(() => {
      if (status) {
        status.style.color = "var(--success)";
        status.textContent = `Message sent successfully. A confirmation email has been prepared for ${email.value.trim()}.`;
      }
      form.reset();
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    }, 450);
  });
}

function setupSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("signupName");
    const email = document.getElementById("signupEmail");
    const password = document.getElementById("signupPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const status = document.getElementById("signupStatus");
    const users = getUsers();

    clearFormErrors(form);
    status.textContent = "";
    let isValid = true;
    const normalizedEmail = email.value.trim().toLowerCase();

    if (!name.value.trim()) {
      setError(name, "Name is required.");
      isValid = false;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError(email, "Enter a valid email address.");
      isValid = false;
    } else if (users.some((user) => user.email === normalizedEmail)) {
      setError(email, "This email is already registered.");
      isValid = false;
    }

    if (password.value.length < 6) {
      setError(password, "Password must be at least 6 characters.");
      isValid = false;
    }

    if (password.value !== confirmPassword.value) {
      setError(confirmPassword, "Passwords do not match.");
      isValid = false;
    }

    if (!isValid) return;

    users.push({
      name: name.value.trim(),
      email: normalizedEmail,
      password: password.value
    });

    localStorage.setItem(userStoreKey, JSON.stringify(users));
    status.textContent = "Account created. Redirecting to login...";
    form.reset();

    setTimeout(() => {
      window.location.href = "login.html";
    }, 700);
  });
}

function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    const status = document.getElementById("loginStatus");
    const normalizedEmail = email.value.trim().toLowerCase();

    clearFormErrors(form);
    status.textContent = "";
    let isValid = true;

    if (!emailPattern.test(normalizedEmail)) {
      setError(email, "Enter a valid email address.");
      isValid = false;
    }

    if (!password.value) {
      setError(password, "Password is required.");
      isValid = false;
    }

    if (!isValid) return;

    const user = getUsers().find((item) => item.email === normalizedEmail);
    if (!user) {
      status.style.color = "var(--error)";
      status.textContent = "No registered user found for this email.";
      return;
    }

    if (user.password !== password.value) {
      status.style.color = "var(--error)";
      status.textContent = "Incorrect password.";
      return;
    }

    localStorage.setItem(sessionKey, JSON.stringify({ name: user.name, email: user.email }));
    status.style.color = "var(--success)";
    status.textContent = "Login successful. Redirecting...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  });
}

function setupProfilePage() {
  const guestPanel = document.getElementById("profileGuest");
  const dashboard = document.getElementById("profileDashboard");
  const form = document.getElementById("profileForm");

  if (!guestPanel || !dashboard || !form) return;

  const activeUser = getActiveUser();
  if (!activeUser) return;

  const profile = getProfile(activeUser.email);
  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");
  const companyInput = document.getElementById("profileCompany");
  const roleInput = document.getElementById("profileRole");
  const status = document.getElementById("profileStatus");

  guestPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");

  nameInput.value = profile.name || activeUser.name || "";
  emailInput.value = activeUser.email || "";
  companyInput.value = profile.company || "";
  roleInput.value = profile.role || "";
  updateProfileHeader(nameInput.value, activeUser.email);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormErrors(form);
    status.textContent = "";

    const updatedName = nameInput.value.trim();
    if (!updatedName) {
      setError(nameInput, "Name is required.");
      return;
    }

    const updatedProfile = {
      name: updatedName,
      company: companyInput.value.trim(),
      role: roleInput.value.trim()
    };

    saveProfile(activeUser.email, updatedProfile);
    updateStoredUser(activeUser.email, updatedName);
    localStorage.setItem(sessionKey, JSON.stringify({ name: updatedName, email: activeUser.email }));
    updateProfileHeader(updatedName, activeUser.email);
    updateUserPill(updatedName);
    status.style.color = "var(--success)";
    status.textContent = "Profile saved successfully.";
  });
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const animate = (counter) => {
    if (counter.dataset.counted === "true") return;
    counter.dataset.counted = "true";

    const target = Number(counter.dataset.counter);
    const hasDecimal = String(counter.dataset.counter).includes(".");
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = target * progress;
      counter.textContent = hasDecimal ? value.toFixed(1) : Math.round(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  counters.forEach((counter) => observer.observe(counter));
}

function setupTechCarousel() {
  const carousel = document.getElementById("techCarousel");
  if (!carousel) return;

  let paused = false;
  const pause = () => { paused = true; };
  const resume = () => { paused = false; };

  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", resume);
  carousel.addEventListener("touchstart", pause, { passive: true });
  carousel.addEventListener("touchend", () => setTimeout(resume, 1200), { passive: true });

  setInterval(() => {
    if (paused || carousel.scrollWidth <= carousel.clientWidth) return;

    const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 8;
    carousel.scrollTo({
      left: atEnd ? 0 : carousel.scrollLeft + 180,
      behavior: "smooth"
    });
  }, 2600);
}

function setupFiltersAndSorting() {
  setupServiceFilters();
  setupPortfolioFilters();
  setupBlogFilters();
}

function setupServiceFilters() {
  const catalog = document.getElementById("serviceCatalog");
  if (!catalog) return;

  const cards = Array.from(catalog.querySelectorAll("[data-category]"));
  const search = document.getElementById("serviceSearch");
  const buttons = document.querySelectorAll(".filter-btn[data-filter]");
  let activeFilter = "all";

  const apply = () => {
    const query = search ? search.value.trim().toLowerCase() : "";
    cards.forEach((card) => {
      const category = card.dataset.category.toLowerCase();
      const keywords = `${card.textContent} ${card.dataset.keywords || ""}`.toLowerCase();
      const matchesFilter = activeFilter === "all" || category.includes(activeFilter.toLowerCase());
      const matchesQuery = !query || keywords.includes(query);
      card.classList.toggle("hidden-by-filter", !(matchesFilter && matchesQuery));
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      apply();
    });
  });

  if (search) search.addEventListener("input", apply);
}

function setupPortfolioFilters() {
  const grid = document.getElementById("portfolioGrid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".portfolio-card"));
  const buttons = document.querySelectorAll(".filter-btn[data-filter]");
  const sort = document.getElementById("portfolioSort");
  let activeFilter = "all";

  const apply = () => {
    cards.forEach((card) => {
      const matchesFilter = activeFilter === "all" || card.dataset.industry === activeFilter;
      card.classList.toggle("hidden-by-filter", !matchesFilter);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      apply();
    });
  });

  if (sort) {
    sort.addEventListener("change", () => {
      const sorted = [...cards].sort((a, b) => {
        if (sort.value === "industry") return a.dataset.industry.localeCompare(b.dataset.industry);
        if (sort.value === "impact") return Number(b.dataset.impact) - Number(a.dataset.impact);
        return cards.indexOf(a) - cards.indexOf(b);
      });
      sorted.forEach((card) => grid.append(card));
      apply();
    });
  }
}

function setupBlogFilters() {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".blog-card"));
  const search = document.getElementById("blogSearch");
  const buttons = document.querySelectorAll(".filter-btn[data-filter]");
  const sort = document.getElementById("blogSort");
  let activeFilter = "all";

  const apply = () => {
    const query = search ? search.value.trim().toLowerCase() : "";
    cards.forEach((card) => {
      const category = card.dataset.category;
      const text = `${card.textContent} ${card.dataset.keywords || ""}`.toLowerCase();
      const matchesFilter = activeFilter === "all" || category === activeFilter;
      const matchesQuery = !query || text.includes(query);
      card.classList.toggle("hidden-by-filter", !(matchesFilter && matchesQuery));
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      apply();
    });
  });

  if (search) search.addEventListener("input", apply);

  if (sort) {
    sort.addEventListener("change", () => {
      const sorted = [...cards].sort((a, b) => {
        if (sort.value === "oldest") return new Date(a.dataset.date) - new Date(b.dataset.date);
        if (sort.value === "popular") return Number(b.dataset.popularity) - Number(a.dataset.popularity);
        return new Date(b.dataset.date) - new Date(a.dataset.date);
      });
      sorted.forEach((card) => grid.append(card));
      apply();
    });
  }
}

function setupPricingToggle() {
  const toggle = document.getElementById("billingToggle");
  const prices = document.querySelectorAll(".price-value");
  if (!toggle || !prices.length) return;

  const update = () => {
    const annual = toggle.checked;
    prices.forEach((price) => {
      const monthly = Number(price.dataset.monthly);
      const value = annual ? Math.round(monthly * 0.8) : monthly;
      price.textContent = value.toLocaleString();
      const suffix = price.parentElement.querySelector("small");
      if (suffix) suffix.textContent = annual ? "/month billed annually" : "/month";
    });
  };

  toggle.addEventListener("change", update);
  update();
}

function setupHashDetails() {
  const openTarget = () => {
    if (!window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return;

    if (target.tagName.toLowerCase() === "details") {
      target.open = true;
    }
  };

  window.addEventListener("hashchange", openTarget);
  openTarget();
}

function setupShareButtons() {
  document.querySelectorAll("[data-share], [data-copy-link]").forEach((button) => {
    button.addEventListener("click", async () => {
      const article = button.closest("article[id]");
      const url = article ? `${window.location.origin}${window.location.pathname}#${article.id}` : window.location.href;
      const title = article ? article.querySelector("h2")?.textContent || document.title : document.title;

      if (button.hasAttribute("data-copy-link")) {
        try {
          await navigator.clipboard.writeText(url);
          button.textContent = "Copied";
          setTimeout(() => { button.textContent = "Copy Link"; }, 1200);
        } catch {
          window.prompt("Copy this link", url);
        }
        return;
      }

      const target = button.dataset.share;
      const encodedUrl = encodeURIComponent(url);
      const encodedTitle = encodeURIComponent(title);
      const shareUrls = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
      };

      const shareUrl = shareUrls[target];
      if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
    });
  });
}

function setError(input, message) {
  if (!input) return;
  const group = input.closest(".form-group");
  const error = group ? group.querySelector(".error-message") : null;
  if (error) error.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearFormErrors(form) {
  form.querySelectorAll(".error-message").forEach((error) => {
    error.textContent = "";
  });
  form.querySelectorAll("[aria-invalid]").forEach((input) => {
    input.removeAttribute("aria-invalid");
  });
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(userStoreKey)) || [];
  } catch {
    return [];
  }
}

function getActiveUser() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey));
  } catch {
    return null;
  }
}

function getProfile(email) {
  try {
    const profiles = JSON.parse(localStorage.getItem(profileStoreKey)) || {};
    return profiles[email] || {};
  } catch {
    return {};
  }
}

function saveProfile(email, profile) {
  const profiles = JSON.parse(localStorage.getItem(profileStoreKey)) || {};
  profiles[email] = profile;
  localStorage.setItem(profileStoreKey, JSON.stringify(profiles));
}

function updateStoredUser(email, name) {
  const users = getUsers();
  const user = users.find((item) => item.email === email);

  if (!user) return;

  user.name = name;
  localStorage.setItem(userStoreKey, JSON.stringify(users));
}

function updateProfileHeader(name, email) {
  const greeting = document.getElementById("profileGreeting");
  const emailText = document.getElementById("profileEmailText");
  const avatar = document.getElementById("profileAvatar");

  if (greeting) greeting.textContent = `Welcome back, ${name}`;
  if (emailText) emailText.textContent = email;
  if (avatar) avatar.textContent = getInitials(name);
}

function updateUserPill(name) {
  const userPill = document.querySelector(".user-pill");
  if (userPill) userPill.textContent = `Hi, ${name}`;
}

function getInitials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join("");
  return initials.toUpperCase() || "S";
}

function logout() {
  localStorage.removeItem(sessionKey);
  window.location.href = "index.html";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };
    return replacements[character];
  });
}
