(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-site-nav]");

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    navigation.dataset.open = "false";
    document.body.classList.remove("nav-open");
  };

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(willOpen));
      navigation.dataset.open = String(willOpen);
      document.body.classList.toggle("nav-open", willOpen);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) closeMenu();
    });
  }

  const heroReveal = document.querySelector("[data-hero-reveal]");
  if (heroReveal && window.matchMedia("(hover: none)").matches) {
    const toggleHero = () => {
      const revealed = heroReveal.classList.toggle("is-revealed");
      if (!revealed) heroReveal.blur();
    };
    heroReveal.addEventListener("click", (event) => {
      if (!event.target.closest("a, button, input")) toggleHero();
    });
    heroReveal.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleHero();
    });
  }

  document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
    const tabs = [...tabGroup.querySelectorAll('[role="tab"]')];
    const panels = [...tabGroup.querySelectorAll('[role="tabpanel"]')];

    const selectTab = (selectedTab) => {
      tabs.forEach((tab) => {
        const selected = tab === selectedTab;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== selectedTab.getAttribute("aria-controls");
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(tab));
      tab.addEventListener("keydown", (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        tabs[nextIndex].focus();
        selectTab(tabs[nextIndex]);
      });
    });
  });

  const demoRange = document.querySelector("[data-demo-range]");
  const demoStage = document.querySelector("[data-demo-stage]");
  const demoOutput = document.querySelector("[data-demo-output]");

  if (demoRange && demoStage && demoOutput) {
    const updateDemo = () => {
      const value = Number(demoRange.value);
      demoStage.style.setProperty("--demo-level", String(value));
      demoOutput.value = String(value).padStart(2, "0");
      demoOutput.textContent = String(value).padStart(2, "0");
    };
    demoRange.addEventListener("input", updateDemo);
    updateDemo();
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const initResearchCluster = (cluster) => {
    const summary = cluster.querySelector("summary");
    const panel = cluster.querySelector(".research-cluster__panel");
    if (!summary || !panel || reduceMotion) return;

    if (!panel.querySelector(":scope > .research-cluster__panel-inner")) {
      const inner = document.createElement("div");
      inner.className = "research-cluster__panel-inner";
      while (panel.firstChild) inner.appendChild(panel.firstChild);
      panel.appendChild(inner);
    }

    cluster.classList.add("is-animated");
    cluster.open = true;
    summary.setAttribute("aria-expanded", "false");

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      const next = !cluster.classList.contains("is-expanded");
      cluster.classList.toggle("is-expanded", next);
      summary.setAttribute("aria-expanded", String(next));
    });
  };

  document.querySelectorAll(".research-cluster").forEach(initResearchCluster);

  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  };

  const bindMemberInspect = (root, members) => {
    const detail = root.querySelector("[data-member-detail]");
    const detailHex = root.querySelector("[data-member-detail-hex]");
    const detailName = root.querySelector("[data-member-detail-name]");
    const detailMeta = root.querySelector("[data-member-detail-meta]");

    const inspectMember = (member) => {
      if (!detail || !detailHex || !detailName || !detailMeta) return;
      const hex = member.querySelector(".member-hex");
      const heading = member.querySelector("h3");
      const meta = member.querySelector(".member-card__meta");
      const headingCopy = heading ? heading.cloneNode(true) : null;
      headingCopy?.querySelector(".member-card__external")?.remove();

      detailHex.replaceChildren();
      if (hex) detailHex.innerHTML = hex.innerHTML;
      detailName.textContent = headingCopy?.textContent.trim() || "";
      detailMeta.replaceChildren();
      if (meta) detailMeta.append(...[...meta.children].map((node) => node.cloneNode(true)));

      root.classList.add("is-inspecting");
      detail.setAttribute("aria-hidden", "false");
    };

    const clearInspection = () => {
      root.classList.remove("is-inspecting");
      if (detail) detail.setAttribute("aria-hidden", "true");
    };

    members.forEach((member) => {
      const hex = member.querySelector(".member-hex");
      if (!hex) return;
      hex.addEventListener("pointerenter", () => inspectMember(member));
      hex.addEventListener("pointerleave", clearInspection);
      member.addEventListener("focus", () => inspectMember(member));
      member.addEventListener("blur", clearInspection);
    });
  };

  const initMemberConstellation = (root) => {
    const orbit = root.querySelector(".member-constellation__orbit");
    const members = [...root.querySelectorAll(".member-constellation__member")];
    const slots = ["north", "upper-right", "lower-right", "lower-left", "upper-left"];

    if (!orbit || members.length === 0) {
      root.classList.add("is-ready");
      return;
    }

    shuffle(members).forEach((member, index) => {
      orbit.appendChild(member);
      slots.forEach((slot) => member.classList.remove(`member-constellation__member--${slot}`));
      if (slots[index]) member.classList.add(`member-constellation__member--${slots[index]}`);
    });

    const durationMs = 72000;
    root.style.setProperty("--orbit-delay", `${-Math.random() * durationMs}ms`);
    bindMemberInspect(root, members);
    root.classList.add("is-ready");
  };

  const initMemberStack = (root) => {
    const pile = root.querySelector(".member-stack__pile");
    const members = [...root.querySelectorAll(".member-stack__member")];

    if (!pile || members.length === 0) {
      root.classList.add("is-ready");
      return;
    }

    shuffle(members).forEach((member, index) => {
      pile.appendChild(member);
      [...member.classList].forEach((cls) => {
        if (cls.startsWith("member-stack__member--s")) member.classList.remove(cls);
      });
      member.classList.add(`member-stack__member--s${index + 1}`);
    });

    bindMemberInspect(root, members);
    root.classList.add("is-ready");
  };

  document.querySelectorAll("[data-member-constellation]").forEach(initMemberConstellation);
  document.querySelectorAll("[data-member-stack]").forEach(initMemberStack);

  const initProjectCatalog = (root) => {
    const cards = [...root.querySelectorAll("[data-project-card]")];
    const searchInput = root.querySelector("[data-project-search]");
    const countEl = root.querySelector("[data-project-count]");
    const emptyEl = root.querySelector("[data-project-empty]");
    const grid = root.querySelector("[data-project-grid]");
    const params = new URLSearchParams(window.location.search);
    const state = {
      q: (params.get("q") || "").trim(),
      area: params.get("area") || "",
      status: params.get("status") || "",
      keywords: (params.get("keyword") || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    };

    const setExclusive = (group, attr, value) => {
      group.querySelectorAll(`[${attr}]`).forEach((chip) => {
        chip.classList.toggle("is-active", (chip.getAttribute(attr) || "") === value);
      });
    };

    const syncChips = () => {
      const areaGroup = root.querySelector('[data-filter-group="area"]');
      const statusGroup = root.querySelector('[data-filter-group="status"]');
      if (areaGroup) setExclusive(areaGroup, "data-filter-area", state.area);
      if (statusGroup) setExclusive(statusGroup, "data-filter-status", state.status);
      root.querySelectorAll("[data-filter-keyword]").forEach((chip) => {
        chip.classList.toggle("is-active", state.keywords.includes(chip.getAttribute("data-filter-keyword") || ""));
      });
    };

    const writeUrl = () => {
      const next = new URLSearchParams();
      if (state.q) next.set("q", state.q);
      if (state.area) next.set("area", state.area);
      if (state.status) next.set("status", state.status);
      if (state.keywords.length) next.set("keyword", state.keywords.join(","));
      const query = next.toString();
      const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, "", url);
    };

    const apply = () => {
      const query = state.q.toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const haystack = card.dataset.search || "";
        const keywords = (card.dataset.keywords || "").split("|").filter(Boolean);
        const show = (!query || haystack.includes(query))
          && (!state.area || (card.dataset.area || "").split("|").includes(state.area))
          && (!state.status || card.dataset.status === state.status)
          && state.keywords.every((keyword) => keywords.includes(keyword));
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (countEl) {
        const total = cards.length;
        countEl.textContent = visible === total
          ? `${total} project${total === 1 ? "" : "s"}`
          : `${visible} of ${total} projects`;
      }
      if (emptyEl) emptyEl.hidden = visible !== 0;
      if (grid) grid.hidden = visible === 0;
      writeUrl();
    };

    if (searchInput) {
      searchInput.value = state.q;
      searchInput.addEventListener("input", () => {
        state.q = searchInput.value.trim();
        apply();
      });
    }

    root.querySelectorAll("[data-filter-area]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const value = chip.getAttribute("data-filter-area") || "";
        state.area = state.area === value ? "" : value;
        syncChips();
        apply();
      });
    });

    root.querySelectorAll("[data-filter-status]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const value = chip.getAttribute("data-filter-status") || "";
        state.status = state.status === value ? "" : value;
        syncChips();
        apply();
      });
    });

    root.querySelectorAll("[data-filter-keyword]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const keyword = chip.getAttribute("data-filter-keyword") || "";
        state.keywords = state.keywords.includes(keyword)
          ? state.keywords.filter((item) => item !== keyword)
          : [...state.keywords, keyword];
        syncChips();
        apply();
      });
    });

    syncChips();
    apply();
  };

  document.querySelectorAll("[data-project-catalog]").forEach(initProjectCatalog);

  const initPublicationTicker = (root) => {
    const track = root.querySelector(".publication-ticker__track");
    const group = track?.querySelector(".publication-ticker__group");
    if (!track || !group || group.children.length === 0) return;

    const seed = [...group.children];
    while (group.scrollWidth < root.clientWidth && group.children.length < 48) {
      seed.forEach((node) => {
        const clone = node.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.tabIndex = -1;
        group.appendChild(clone);
      });
    }

    [...track.querySelectorAll(".publication-ticker__group")].slice(1).forEach((node) => node.remove());
    const clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "-1");
      link.setAttribute("aria-hidden", "true");
    });
    track.appendChild(clone);
    track.style.animationDuration = `${Math.max(36, Math.round(group.scrollWidth / 24))}s`;
  };

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-publication-ticker]").forEach(initPublicationTicker);
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
})();
