document.addEventListener("DOMContentLoaded", function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointerFine = window.matchMedia("(pointer: fine)").matches;

  // --- Reveal-on-scroll, with stagger among sibling .reveal elements ---
  var revealEls = document.querySelectorAll(".reveal");
  function revealElement(el) {
    var parent = el.parentElement;
    var siblings = parent
      ? Array.prototype.filter.call(parent.children, function (c) {
          return c.classList.contains("reveal");
        })
      : [el];
    var idx = Math.max(siblings.indexOf(el), 0);
    el.style.transitionDelay = idx * 80 + "ms";
    el.classList.add("in-view");

    if (el.classList.contains("stats-band")) {
      animateStats(el);
    }
  }

  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  // --- Count-up numbers inside the stats band ---
  function animateStats(band) {
    var nums = band.querySelectorAll(".stat-card strong");
    nums.forEach(function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = "1";
      var target = parseInt(el.textContent, 10);
      if (isNaN(target)) return;
      if (reduceMotion) return;
      var duration = 1100;
      var start = null;
      el.textContent = "0";
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      window.requestAnimationFrame(step);
    });
  }

  // --- Scroll: header shrink, progress bar, parallax ---
  var shells = document.querySelectorAll(".site-shell");
  var header = document.querySelector(".site-header");
  var progressBar = document.querySelector(".scroll-progress");
  var ticking = false;

  function applyScrollEffects() {
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle("scrolled", y > 24);
    }

    if (progressBar) {
      var doc = document.documentElement;
      var max = (doc.scrollHeight || 0) - window.innerHeight;
      var progress = max > 0 ? Math.min(y / max, 1) : 0;
      progressBar.style.transform = "scaleX(" + progress + ")";
    }

    if (shells.length && !reduceMotion) {
      var py = Math.min(y * 0.06, 40) + "px";
      var py2 = Math.min(y * 0.1, 60) + "px";
      shells.forEach(function (el) {
        el.style.setProperty("--py", py);
        el.style.setProperty("--py2", py2);
      });
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(applyScrollEffects);
        ticking = true;
      }
    },
    { passive: true }
  );
  applyScrollEffects();

  // --- Magnetic buttons ---
  if (pointerFine && !reduceMotion) {
    var magnets = document.querySelectorAll(".button, .header-cta");
    magnets.forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var rect = btn.getBoundingClientRect();
        var dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
        var dy = (e.clientY - (rect.top + rect.height / 2)) * 0.3;
        dx = Math.max(-8, Math.min(8, dx));
        dy = Math.max(-8, Math.min(8, dy));
        btn.style.transform = "translate(" + dx + "px, " + (dy - 2) + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  // --- 3D tilt for hero photo, page picture and gallery figures ---
  if (pointerFine && !reduceMotion) {
    var tiltEls = document.querySelectorAll(".hero-photo, .page-picture, .gallery figure");
    tiltEls.forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var ry = (px - 0.5) * 14;
        var rx = (0.5 - py) * 14;
        el.style.setProperty("--rx", rx.toFixed(2) + "deg");
        el.style.setProperty("--ry", ry.toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
  }

  // --- Gallery lightbox ---
  var galleryFigures = document.querySelectorAll(".gallery figure");
  if (galleryFigures.length) {
    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML =
      '<div class="lightbox-box">' +
      '<button class="lightbox-close" type="button" aria-label="סגירה">✕</button>' +
      '<img src="" alt="" />' +
      '<div class="lightbox-caption"></div>' +
      "</div>";
    document.body.appendChild(overlay);

    var lbImg = overlay.querySelector("img");
    var lbCaption = overlay.querySelector(".lightbox-caption");
    var lbClose = overlay.querySelector(".lightbox-close");

    function openLightbox(figure) {
      var img = figure.querySelector("img");
      var caption = figure.querySelector("figcaption");
      if (!img) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt || "";
      lbCaption.textContent = caption ? caption.textContent : "";
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    galleryFigures.forEach(function (figure) {
      figure.addEventListener("click", function () {
        openLightbox(figure);
      });
    });

    lbClose.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  // --- Contact form: inline success state (no backend wired up) ---
  var contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      contactForm.classList.add("sent");
    });
  }
});
