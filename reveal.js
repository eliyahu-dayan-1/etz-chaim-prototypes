document.addEventListener("DOMContentLoaded", function () {
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
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

  var shells = document.querySelectorAll(".site-shell");
  if (shells.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ticking = false;
    var applyParallax = function () {
      var y = window.scrollY || window.pageYOffset;
      var py = Math.min(y * 0.06, 40) + "px";
      var py2 = Math.min(y * 0.1, 60) + "px";
      shells.forEach(function (el) {
        el.style.setProperty("--py", py);
        el.style.setProperty("--py2", py2);
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(applyParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    applyParallax();
  }
});
