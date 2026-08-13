const googleAnalyticsId = "G-C78WSMZ4J5";
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() {
  window.dataLayer.push(arguments);
};
window.gtag("js", new Date());
window.gtag("config", googleAnalyticsId);

const googleAnalyticsScript = document.createElement("script");
googleAnalyticsScript.async = true;
googleAnalyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
document.head.appendChild(googleAnalyticsScript);

const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];

function renderProjectRegistry() {
  const caseGrid = document.querySelector(".case-grid");
  if (caseGrid && projects.length) {
    caseGrid.innerHTML = projects
      .map(
        (project, index) => `
          <a class="case-card${index === 0 ? " featured" : ""}"
            href="${project.href}"
            data-tags="${project.keywords}"
            aria-label="查看${project.title}案例">
            <div class="case-visual snapshot-visual ${project.visualClass}" aria-hidden="true">
              <img src="${project.image}" alt="" />
            </div>
            <div class="case-body">
              <p class="case-index">${String(index + 1).padStart(2, "0")}</p>
              <h3>${project.title}</h3>
              <p>${project.summary}</p>
              <div class="tag-list compact">
                ${project.tags.map((tag) => `<span>${tag}</span>`).join("")}
              </div>
            </div>
          </a>`
      )
      .join("");

    document.querySelectorAll(".tag-list a").forEach((link) => {
      if (link.textContent.trim().endsWith("Case Studies")) {
        link.textContent = `${projects.length} Case Studies`;
      }
    });
  }

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const currentIndex = projects.findIndex((project) => project.href === currentPath);
  const nextSection = document.querySelector(".next-case");
  if (currentIndex >= 0 && nextSection) {
    const nextProject = projects[(currentIndex + 1) % projects.length];
    const title = nextSection.querySelector("h2");
    const summary = title?.nextElementSibling;
    const link = nextSection.querySelector(".next-case-link");
    if (title) title.textContent = nextProject.title;
    if (summary) summary.textContent = nextProject.nextSummary;
    if (link) {
      link.href = nextProject.href;
      const label = link.querySelector("span");
      const action = link.querySelector("strong");
      if (label) label.textContent = "NEXT";
      if (action) action.textContent = currentIndex === projects.length - 1 ? "回到 Case 01 →" : "閱讀下一篇 →";
    }
  }
}

renderProjectRegistry();

const loaderMarkup = `
  <section class="portfolio-loader" role="status" aria-live="polite" aria-label="作品集內容載入中">
    <span class="sr-only">作品集內容載入中</span>
    <div class="portfolio-loader__grid" aria-hidden="true">
      <article class="portfolio-skeleton portfolio-skeleton--featured" style="--skeleton-index: 0">
        <div class="portfolio-skeleton__media skeleton-shape"></div>
        <div class="portfolio-skeleton__body">
          <span class="portfolio-skeleton__eyebrow skeleton-shape"></span>
          <span class="portfolio-skeleton__title skeleton-shape"></span>
          <span class="portfolio-skeleton__copy skeleton-shape"></span>
          <span class="portfolio-skeleton__copy portfolio-skeleton__copy--short skeleton-shape"></span>
        </div>
      </article>
      <article class="portfolio-skeleton" style="--skeleton-index: 1">
        <div class="portfolio-skeleton__media skeleton-shape"></div>
        <div class="portfolio-skeleton__body">
          <span class="portfolio-skeleton__eyebrow skeleton-shape"></span>
          <span class="portfolio-skeleton__title skeleton-shape"></span>
          <span class="portfolio-skeleton__copy skeleton-shape"></span>
          <span class="portfolio-skeleton__copy portfolio-skeleton__copy--short skeleton-shape"></span>
        </div>
      </article>
      <article class="portfolio-skeleton" style="--skeleton-index: 2">
        <div class="portfolio-skeleton__media skeleton-shape"></div>
        <div class="portfolio-skeleton__body">
          <span class="portfolio-skeleton__eyebrow skeleton-shape"></span>
          <span class="portfolio-skeleton__title skeleton-shape"></span>
          <span class="portfolio-skeleton__copy skeleton-shape"></span>
          <span class="portfolio-skeleton__copy portfolio-skeleton__copy--short skeleton-shape"></span>
        </div>
      </article>
    </div>
  </section>`;

let hasSeenLoader = false;
try {
  hasSeenLoader = sessionStorage.getItem("alice-portfolio-loaded") === "true";
} catch (error) {
  hasSeenLoader = false;
}

const revealBootedPage = () => {
  window.requestAnimationFrame(() => {
    document.documentElement.classList.remove("portfolio-booting");
  });
};

if (!hasSeenLoader) {
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) siteHeader.insertAdjacentHTML("afterend", loaderMarkup);
  else document.body.insertAdjacentHTML("afterbegin", loaderMarkup);
  document.body.classList.add("portfolio-is-loading");
  revealBootedPage();
  const loader = document.querySelector(".portfolio-loader");
  const finishLoading = () => {
    if (!loader || loader.classList.contains("is-complete")) return;
    loader.classList.add("is-complete");
    document.body.classList.remove("portfolio-is-loading");
    window.requestAnimationFrame(() => layoutKeywordCloud());
    try {
      sessionStorage.setItem("alice-portfolio-loaded", "true");
    } catch (error) {
      // Storage may be unavailable in private or local-file browsing.
    }
    window.setTimeout(() => loader.remove(), 300);
  };
  const loadingDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 720;
  window.addEventListener("load", () => window.setTimeout(finishLoading, loadingDelay), { once: true });
  window.setTimeout(finishLoading, loadingDelay + 1800);
} else {
  revealBootedPage();
}

const cards = document.querySelectorAll(
  ".case-card, .proof-grid > *, .method-grid > *, .visual-tile"
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.12 }
);

cards.forEach((card) => {
  card.classList.add("reveal");
  observer.observe(card);
});

const keywordButtons = document.querySelectorAll(".keyword-cloud [data-key]");
const caseGrid = document.querySelector(".case-grid");
const caseCards = document.querySelectorAll(".case-card");
let selectedKeyword = "";

function setKeyword(key) {
  if (!caseGrid) return;
  caseGrid.classList.add("has-keyword");
  keywordButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.key === key);
    button.setAttribute("aria-pressed", String(button.dataset.key === key));
  });
  caseCards.forEach((card) => {
    const tags = card.dataset.tags || "";
    card.classList.toggle("is-related", tags.includes(key));
  });
}

function clearKeyword() {
  if (!caseGrid) return;
  selectedKeyword = "";
  caseGrid.classList.remove("has-keyword");
  keywordButtons.forEach((button) => button.classList.remove("is-active"));
  keywordButtons.forEach((button) => button.setAttribute("aria-pressed", "false"));
  caseCards.forEach((card) => card.classList.remove("is-related"));
}

keywordButtons.forEach((button) => {
  button.addEventListener("mouseenter", () => setKeyword(button.dataset.key));
  button.addEventListener("focus", () => setKeyword(button.dataset.key));
  button.addEventListener("mouseleave", () => {
    if (selectedKeyword) setKeyword(selectedKeyword);
    else clearKeyword();
  });
  button.addEventListener("blur", () => {
    if (selectedKeyword) setKeyword(selectedKeyword);
    else clearKeyword();
  });
  button.addEventListener("click", () => {
    selectedKeyword = selectedKeyword === button.dataset.key ? "" : button.dataset.key;
    if (selectedKeyword) {
      setKeyword(selectedKeyword);
      window.setTimeout(() => {
        caseGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else clearKeyword();
  });
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectedKeyword = selectedKeyword === button.dataset.key ? "" : button.dataset.key;
      if (selectedKeyword) {
        setKeyword(selectedKeyword);
        window.setTimeout(() => {
          caseGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      } else clearKeyword();
    }
    if (event.key === "Escape") clearKeyword();
  });
});

keywordButtons.forEach((button) => {
  button.setAttribute("aria-label", `篩選與${button.dataset.key}相關的作品`);
  button.setAttribute("aria-pressed", "false");
});

const keywordCloud = document.querySelector(".keyword-cloud");

function layoutKeywordCloud() {
  if (!keywordCloud) return;

  const words = Array.from(keywordCloud.querySelectorAll(".kw, .kw-fill"));
  const width = keywordCloud.clientWidth;
  const isNarrow = width < 620;
  const height = isNarrow ? 560 : 430;
  const gap = isNarrow ? 2 : 3;

  keywordCloud.style.height = `${height}px`;

  const sizeFor = (word, index) => {
    if (word.classList.contains("kw-large")) return isNarrow ? 46 : 62;
    if (word.classList.contains("kw-strong")) return isNarrow ? 31 : 43;
    if (word.classList.contains("kw-vertical")) return isNarrow ? 27 : 34;
    if (word.classList.contains("kw-focus")) return isNarrow ? 23 : 29;
    if (word.classList.contains("kw-fill-feature")) return isNarrow ? 22 : 29;
    if (word.classList.contains("kw-mid") || word.classList.contains("kw-fill-mid")) {
      return isNarrow ? 14 : 16;
    }
    if (word.classList.contains("kw-small")) return isNarrow ? 13 : 15;
    if (word.classList.contains("kw-fill-tiny")) return isNarrow ? 10 : 11;
    if (word.classList.contains("kw-micro") || word.classList.contains("kw-fill")) {
      return isNarrow ? 11 : 13 + (index % 3);
    }
    return isNarrow ? 13 : 15;
  };

  const anchorMap = {
    "UI/UX": [0.0, 0.0],
    複雜系統: [0.0, 0.08],
    資料視覺化: [0.34, 0.03],
    監測資料: [0.42, 0.19],
    "AI 協作": [0.02, 0.34],
    水利: [0.0, 0.29],
    環境監測: [0.28, 0.32],
    設備管理: [1.0, 0.16],
    通知平台: [1.0, 0.38],
    儀表板: [0.43, 0.48],
    後台流程: [0.0, 0.74],
    系統設計: [1.0, 0.68],
    wireframe: [0.52, 0.86],
    流程圖: [0.44, 0.84],
    權限: [0.21, 0.86],
    警示: [0.56, 0.86],
    分頁: [1.0, 0.84],
    場域: [0.0, 0.57],
    ICON: [0.16, 0.57],
    狀態色: [0.68, 0.62],
    圖表: [0.66, 0.84],
    元件: [0.02, 0.86],
    B2B: [0.88, 0.77],
    工程交付: [0.21, 0.20],
    前期規劃: [0.08, 0.56],
    設計系統: [0.28, 0.04],
    RADIUS: [0.33, 0.12],
    FIGMA: [0.61, 0.57],
    FILTER: [0.68, 0.62],
    TABLE: [0.76, 0.05],
    MAP: [0.49, 0.53],
    層級: [0.24, 0.24],
    交付: [0.62, 0.24],
    斷點: [0.73, 0.67],
    色彩規劃: [0.36, 0.42],
    "WCAG 2.1": [1.0, 0.30],
    標準字: [1.0, 0.50],
    "material design": [0.70, 0.58],
    "ARIA LABEL": [1.0, 0.08],
    contrast: [0.86, 0.12],
    "font scale": [1.0, 0.23],
    mincho: [0.80, 0.26],
    "layout density": [1.0, 0.58],
    "hover state": [0.78, 0.64],
    "empty state": [1.0, 0.73],
    "error copy": [0.82, 0.77],
    "line height": [1.0, 0.92],
  };

  const edgeAlign = {
    "UI/UX": "left",
    複雜系統: "left",
    "AI 協作": "left",
    水利: "left",
    後台流程: "left",
    場域: "left",
    元件: "left",
    設備管理: "right",
    通知平台: "right",
    系統設計: "right",
    分頁: "right",
    "WCAG 2.1": "right",
    標準字: "right",
    B2B: "right",
    "ARIA LABEL": "right",
    "font scale": "right",
    "layout density": "right",
    "empty state": "right",
    "line height": "right",
  };

  words.forEach((word, index) => {
    word.style.display = "";
    word.style.position = "absolute";
    word.style.left = "0";
    word.style.top = "0";
    word.style.right = "auto";
    word.style.bottom = "auto";
    word.style.margin = "0";
    word.style.fontSize = `${sizeFor(word, index)}px`;
    word.style.visibility = "hidden";
  });

  const items = words
    .map((word, index) => ({
      word,
      index,
      text: word.textContent.trim(),
      anchored: Boolean(anchorMap[word.textContent.trim()]),
      weight:
        (word.classList.contains("kw-large") ? 6 : 0) +
        (word.classList.contains("kw-strong") ? 5 : 0) +
        (word.classList.contains("kw-fill-feature") ? 4 : 0) +
        (word.classList.contains("kw-focus") ? 4 : 0) +
        (word.classList.contains("kw-vertical") ? 3 : 0) +
        (word.classList.contains("kw-mid") || word.classList.contains("kw-fill-mid") ? 2 : 0),
    }))
    .sort((a, b) => b.weight - a.weight || a.index - b.index);

  const rects = [];

  const intersects = (a, b) =>
    !(
      a.x + a.w + gap <= b.x ||
      b.x + b.w + gap <= a.x ||
      a.y + a.h + gap <= b.y ||
      b.y + b.h + gap <= a.y
    );

  const fits = (x, y, w, h) => {
    if (x < 0 || y < 0 || x + w > width || y + h > height) return false;
    return !rects.some((rect) => intersects({ x, y, w, h }, rect));
  };

  const placeNear = (item, targetX, targetY, w, h, edge) => {
    const step = isNarrow ? 5 : 6;
    const maxRadius = Math.max(width, height);
    for (let radius = 0; radius <= maxRadius; radius += step) {
      for (let dy = -radius; dy <= radius; dy += step) {
        if (edge) {
          const x = edge === "right" ? width - w : 0;
          const yOptions = [targetY + dy, targetY - dy];
          for (const y of yOptions) {
            const py = Math.round(y);
            if (fits(x, py, w, h)) return [x, py];
          }
        }
        const options = [
          [targetX - radius, targetY + dy],
          [targetX + radius, targetY + dy],
          [targetX + dy, targetY - radius],
          [targetX + dy, targetY + radius],
        ];
        for (const [x, y] of options) {
          const px = Math.round(x);
          const py = Math.round(y);
          if (fits(px, py, w, h)) return [px, py];
        }
      }
    }
    return null;
  };

  const scanPlace = (item, w, h) => {
    const step = isNarrow ? 5 : 6;
    const offset = (item.index * 17) % step;
    for (let y = offset; y <= height - h; y += step) {
      for (let x = (item.index * 29) % step; x <= width - w; x += step) {
        if (fits(x, y, w, h)) return [x, y];
      }
    }
    return null;
  };

  items.forEach((item) => {
    const { word, text } = item;
    const w = Math.ceil(word.offsetWidth);
    const h = Math.ceil(word.offsetHeight);
    const anchor = anchorMap[text];
    const edge = edgeAlign[text];
    const target = anchor
      ? [anchor[0] * Math.max(width - w, 0), anchor[1] * Math.max(height - h, 0)]
      : [
          ((item.index * 37) % 100) * 0.01 * Math.max(width - w, 0),
          ((item.index * 23) % 100) * 0.01 * Math.max(height - h, 0),
        ];
    const position = placeNear(item, target[0], target[1], w, h, edge) || scanPlace(item, w, h);
    if (!position) {
      word.style.display = "none";
      return;
    }
    word.style.display = "";
    word.style.left = `${position[0]}px`;
    word.style.top = `${position[1]}px`;
    word.style.visibility = "visible";
    rects.push({ x: position[0], y: position[1], w, h });
  });
}

layoutKeywordCloud();
window.addEventListener("resize", layoutKeywordCloud);

const siteNav = document.querySelector(".site-nav");

if (siteNav) {
  const siteNavLinks = Array.from(siteNav.querySelectorAll("a"));
  const isCasePage = document.body.classList.contains("case-story-page");

  const setActiveSiteNav = (hash) => {
    siteNavLinks.forEach((link) => {
      const linkHash = new URL(link.href, window.location.href).hash;
      const active = linkHash === hash;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", isCasePage ? "page" : "location");
      else link.removeAttribute("aria-current");
    });
  };

  if (isCasePage) {
    setActiveSiteNav("#work");
  } else {
    const homeSections = siteNavLinks
      .map((link) => {
        const hash = new URL(link.href, window.location.href).hash;
        const section = hash ? document.querySelector(hash) : null;
        return section ? { hash, section } : null;
      })
      .filter(Boolean);

    const updateActiveSiteNav = () => {
      const marker = window.scrollY + window.innerHeight * 0.58;
      let current = homeSections[0]?.hash || "#work";

      homeSections.forEach(({ hash, section }) => {
        if (section.offsetTop <= marker) current = hash;
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = homeSections.at(-1)?.hash || current;
      }

      setActiveSiteNav(current);
    };

    siteNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const hash = new URL(link.href, window.location.href).hash;
        if (hash) setActiveSiteNav(hash);
      });
    });

    updateActiveSiteNav();
    window.addEventListener("scroll", updateActiveSiteNav, { passive: true });
      window.addEventListener("resize", updateActiveSiteNav);
  }

}

const caseAnchorNav = document.querySelector(".case-anchor-nav");

if (caseAnchorNav) {
  const anchorLinks = Array.from(caseAnchorNav.querySelectorAll("a[href^='#']"));
  const sectionMap = new Map(
    anchorLinks
      .map((link) => {
        const target = document.querySelector(link.getAttribute("href"));
        return target ? [target.id, link] : null;
      })
      .filter(Boolean)
  );

  const setActiveAnchor = (id) => {
    anchorLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  anchorLinks.forEach((link) => {
    link.addEventListener("click", () => {
      link.classList.add("is-pressed");
      window.setTimeout(() => link.classList.remove("is-pressed"), 220);
    });
  });

  const anchorObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visibleEntry && sectionMap.has(visibleEntry.target.id)) {
        setActiveAnchor(visibleEntry.target.id);
      }
    },
    {
      rootMargin: "-42% 0px -48% 0px",
      threshold: [0, 0.2, 0.6],
    }
  );

  sectionMap.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) anchorObserver.observe(section);
  });

  setActiveAnchor("top");
}
