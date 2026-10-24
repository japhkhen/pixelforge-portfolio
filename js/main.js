(function () {
  "use strict";

  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = year;
  });

  const greeting = document.querySelector("[data-greeting]");
  if (greeting) {
    const hour = new Date().getHours();
    greeting.textContent = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  }

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector("#nav-panel");
  if (header && toggle && panel) {
    const label = toggle.querySelector(".sr-only");
    const setOpen = (open) => {
      header.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "Close menu" : "Open menu";
    };
    toggle.addEventListener("click", () => setOpen(!header.classList.contains("open")));
    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (header.classList.contains("open") && !header.contains(event.target)) setOpen(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 880) setOpen(false);
    });
  }

  const glow = document.querySelector(".cursor-glow");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (glow && finePointer) {
    window.addEventListener("pointermove", (event) => {
      glow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      glow.classList.add("on");
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealNodes = document.querySelectorAll(".reveal, .skill, .timeline");
  const markIn = (node) => {
    node.classList.add("in");
    node.querySelectorAll(".bar").forEach((bar) => bar.classList.add("in"));
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach(markIn);
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          markIn(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );
    revealNodes.forEach((node) => observer.observe(node));
  }

  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".project").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-grid .project");
  const emptyNote = document.querySelector("#filter-empty");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      let shown = 0;
      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.kind === filter;
        card.hidden = !match;
        if (match) shown += 1;
      });
      if (emptyNote) emptyNote.hidden = shown !== 0;
    });
  });

  const form = document.querySelector("#contact-form");
  if (!form) return;

  const success = document.querySelector("#success-card");
  const preview = document.querySelector("#message-preview");
  const sendLink = document.querySelector("#send-whatsapp");
  const editButton = document.querySelector("#edit-message");
  const select = form.querySelector("#interest");
  const interest = new URLSearchParams(window.location.search).get("interest");
  if (interest && select && select.querySelector(`option[value="${CSS.escape(interest)}"]`)) {
    select.value = interest;
  }

  const fields = {
    name: form.querySelector("#name"),
    email: form.querySelector("#email"),
    phone: form.querySelector("#phone"),
    interest: select,
    message: form.querySelector("#message"),
    website: form.querySelector("#website")
  };

  const setError = (input, message) => {
    const field = input.closest(".field");
    const error = field.querySelector(".error");
    error.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
    field.classList.toggle("invalid", Boolean(message));
  };

  const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

  let tried = false;
  const validate = () => {
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const phone = fields.phone.value.trim();
    const message = fields.message.value.trim();
    const digits = phone.replace(/\D/g, "");
    let valid = true;
    let first = null;

    const fail = (input, message) => {
      setError(input, message);
      valid = false;
      first = first || input;
    };

    if (name.length < 2) fail(fields.name, "Please tell me your name.");
    else setError(fields.name, "");

    if (!emailOk(email)) fail(fields.email, "That email does not look quite right.");
    else setError(fields.email, "");

    if (phone && (digits.length < 10 || digits.length > 15)) {
      fail(fields.phone, "Use a phone number with at least 10 digits, or leave this blank.");
    } else setError(fields.phone, "");

    if (!fields.interest.value) fail(fields.interest, "Choose what you need, even if you are not sure yet.");
    else setError(fields.interest, "");

    if (message.length < 20) fail(fields.message, "Tell me a little about the project — at least a sentence.");
    else if (message.length > 1000) fail(fields.message, "Please keep the note under 1000 characters.");
    else setError(fields.message, "");

    return { valid, first, name, email, phone, message };
  };

  const liveCheck = (event) => {
    if (!tried || !event.target.closest(".field")) return;
    validate();
  };
  form.addEventListener("input", liveCheck);
  form.addEventListener("change", liveCheck);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    tried = true;
    const result = validate();
    if (!result.valid) {
      result.first.focus();
      return;
    }

    const choice = fields.interest.options[fields.interest.selectedIndex].text;
    const lines = [
      "Hello PixelForge,",
      "",
      `My name is ${result.name}.`,
      `Email: ${result.email}`,
      result.phone ? `Phone: ${result.phone}` : null,
      `I need: ${choice}`,
      "",
      result.message
    ].filter((line) => line !== null);

    preview.textContent = lines.join("\n");
    const bot = fields.website && fields.website.value.trim();
    sendLink.hidden = Boolean(bot);
    if (!bot) {
      sendLink.href = `https://wa.me/233244031014?text=${encodeURIComponent(lines.join("\n"))}`;
    }
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  editButton.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    fields.name.focus();
  });
})();
