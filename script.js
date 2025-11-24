document.addEventListener("DOMContentLoaded", () => {

  // all carousels
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const prevBtn = carousel.querySelector(".arrow.prev");
    const nextBtn = carousel.querySelector(".arrow.next");

    const slots = Array.from(track.children);
    let activeIndex = slots.findIndex((s) => s.classList.contains("active"));
    if (activeIndex === -1) activeIndex = Math.floor(slots.length / 2);

    // update the slot states
    function updateSlots() {
      slots.forEach((s, i) => {
        s.classList.remove("active", "left", "right");
        if (i === activeIndex) s.classList.add("active");
        else if (i < activeIndex) s.classList.add("left");
        else s.classList.add("right");
      });
    }

    updateSlots();

    // click arrows
    prevBtn &&
      prevBtn.addEventListener("click", () => {
        activeIndex = Math.max(0, activeIndex - 1);
        updateSlots();
      });

    nextBtn &&
      nextBtn.addEventListener("click", () => {
        activeIndex = Math.min(slots.length - 1, activeIndex + 1);
        updateSlots();
      });

    // keyboard arrows
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        activeIndex = Math.max(0, activeIndex - 1);
        updateSlots();
      } else if (e.key === "ArrowRight") {
        activeIndex = Math.min(slots.length - 1, activeIndex + 1);
        updateSlots();
      }
    });

    // swipe on mobile
    let touchStartX = null;
    track.addEventListener(
      "touchstart",
      (ev) => {
        touchStartX = ev.touches[0].clientX;
      },
      { passive: true }
    );

    track.addEventListener("touchend", (ev) => {
      if (touchStartX === null) return;
      const dx = ev.changedTouches[0].clientX - touchStartX;

      if (Math.abs(dx) > 40) {
        if (dx < 0) activeIndex = Math.min(slots.length - 1, activeIndex + 1);
        else activeIndex = Math.max(0, activeIndex - 1);

        updateSlots();
      }

      touchStartX = null;
    });
  });

  /* -----------------------------
     hero title typewriter
  ----------------------------- */

  const el = document.querySelector(".hero-subtitle-text");

  if (el) {
    const phrases = [
      "Is it online culture?",
      "Is it resale markets?",
      "Or is Gen Z redefining fashion?"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeSpeed = 90;
    const deleteSpeed = 60;

    function typeLoop() {
      const current = phrases[phraseIndex];

      if (!deleting) {
        // typing
        charIndex++;
        el.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1400);
          return;
        }

        setTimeout(typeLoop, typeSpeed);
      } else {
        // deleting
        charIndex--;
        el.textContent = current.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeLoop, 500);
          return;
        }

        setTimeout(typeLoop, deleteSpeed);
      }
    }

    setTimeout(typeLoop, 600);
  }


  /* -----------------------------
     vega chart (scroll + draw)
  ----------------------------- */

  const chartTarget = document.querySelector("#comparisonTrendChart");

  if (chartTarget && window.vegaEmbed) {
    vegaEmbed("#comparisonTrendChart", {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",

      data: { url: "google_trends_thrifting_clean.csv" },

      background: "transparent",

      transform: [
        {
          fold: ["Thrift", "vintage clothing", "Poshmark"],
          as: ["Trend", "Interest"]
        }
      ],

      mark: { type: "line", point: true, strokeWidth: 2 },

      encoding: {
        x: {
          field: "Month",
          type: "temporal",
          title: "Year",
          axis: {
            format: "%Y",     // only show the year label
            tickCount: "year"
          }
        },
        y: {
          field: "Interest",
          type: "quantitative",
          title: "Search interest (0 to 100)"
        },
        color: {
          field: "Trend",
          type: "nominal",
          title: "Search term"
        },
        tooltip: [
          { field: "Month", type: "temporal", title: "Month" },
          { field: "Trend", type: "nominal", title: "Search term" },
          { field: "Interest", type: "quantitative", title: "Search interest" }
        ]
      },

      width: 1800,
      height: 360,

      config: {
        view: { stroke: "transparent" },

        axis: {
          labelColor: "#fcefe9",
          titleColor: "#fcefe9",
          gridColor: "rgba(252,239,233,0.2)",
          domainColor: "rgba(252,239,233,0.4)",
          tickColor: "rgba(252,239,233,0.4)",
          labelFont: "Bricolage Grotesque",
          titleFont: "Bricolage Grotesque"
        },

        legend: {
          labelColor: "#fcefe9",
          titleColor: "#fcefe9"
        },

        title: {
          color: "#fcefe9",
          font: "Bricolage Grotesque",
          fontSize: 16,
          fontWeight: 600
        }
      }
    }).then(() => {

      // reveal chart lines when in view
      function reveal() {
        const rect = chartTarget.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          chartTarget.classList.add("draw-lines");
          window.removeEventListener("scroll", reveal);
        }
      }

      window.addEventListener("scroll", reveal);
      reveal();
    });
  }

});
