const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach((element) => revealObserver.observe(element));

document.querySelectorAll("main > .section").forEach((section) => {
  section.classList.add("section-enter");
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("entered");

    entry.target.querySelectorAll(".reveal").forEach((element, index) => {
      element.style.transitionDelay = `${160 + Math.min(index * 110, 550)}ms`;
      element.classList.remove("reveal-tilt-left", "reveal-tilt-right");
      if (index % 3 === 1) element.classList.add("reveal-tilt-right");
      if (index % 3 === 2) element.classList.add("reveal-tilt-left");
    });

    sectionObserver.unobserve(entry.target);
  });
}, { threshold: 0.08 });

document.querySelectorAll("main > .section").forEach((section) => {
  sectionObserver.observe(section);
});


const parallaxElements = document.querySelectorAll("[data-speed]");
let ticking = false;

function updateParallax() {
  parallaxElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const speed = Number(element.dataset.speed);
    const offset = (rect.top - window.innerHeight / 2) * speed;
    element.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
}, { passive: true });

const cursor = document.querySelector(".cursor");
const cursorDot = document.querySelector(".cursor-dot");

if (window.matchMedia("(pointer:fine)").matches) {
  let cursorX = 0;
  let cursorY = 0;
  let dotX = 0;
  let dotY = 0;

  window.addEventListener("mousemove", (event) => {
    dotX = event.clientX;
    dotY = event.clientY;
  });

  function animateCursor() {
    cursorX += (dotX - cursorX) * 0.12;
    cursorY += (dotY - cursorY) * 0.12;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll("a, button, .project-card").forEach((element) => {
    element.addEventListener("mouseenter", () => cursor.classList.add("active"));
    element.addEventListener("mouseleave", () => cursor.classList.remove("active"));
  });
}

const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

menuButton.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

if (window.matchMedia("(pointer:fine)").matches) {
  document.querySelectorAll(".project-card").forEach((card) => {
    const image = card.querySelector(".project-image");
    if (!image) return;

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      image.classList.add("tilt-active");
      image.style.transform =
        `translateZ(18px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      image.classList.remove("tilt-active");
      image.style.transform = "translateZ(0) rotateX(0deg) rotateY(0deg)";
    });
  });
}

