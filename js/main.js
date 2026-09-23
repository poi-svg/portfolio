/* ============================================================
   页面逻辑：项目渲染、导航菜单、当前区高亮、滚动浮现
   ============================================================ */
(function () {
  "use strict";

  var LAYOUTS = ["a", "b", "c", "d"];

  /* ---------- 渲染项目列表 ---------- */
  function renderWorks() {
    var list = document.getElementById("worksList");
    if (!list) return;

    list.innerHTML = WORKS.map(function (work, i) {
      var layout = work.layout || LAYOUTS[i % LAYOUTS.length];
      var stack = work.stack
        .map(function (s) { return "<li>" + s + "</li>"; })
        .join("");

      return (
        '<article class="project layout-' + layout + ' reveal">' +
          '<div class="project-media">' +
            '<img src="' + work.image + '" alt="' + work.name + '" loading="lazy">' +
          "</div>" +
          '<div class="project-head">' +
            '<div class="project-topline">' +
              '<span class="project-index">' + String(i + 1).padStart(2, "0") + "</span>" +
              '<span class="project-date">' + work.date + "</span>" +
            "</div>" +
            '<span class="project-tag">' + work.category + "</span>" +
            '<h3 class="project-name">' + work.name + "</h3>" +
          "</div>" +
          '<div class="project-detail">' +
            '<p class="project-intro">' + work.intro + "</p>" +
            '<ul class="project-stack">' + stack + "</ul>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    var count = document.getElementById("projectCount");
    if (count) count.textContent = "(" + String(WORKS.length).padStart(2, "0") + ")";
  }

  /* ---------- 移动端菜单 ---------- */
  function initNav() {
    var header = document.getElementById("siteHeader");
    var toggle = document.getElementById("navToggle");
    if (!header || !toggle) return;

    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // 点击导航链接后自动收起菜单
    document.querySelectorAll("#siteNav a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 滚动时高亮当前区域对应的导航项 ---------- */
  function initActiveNav() {
    var links = document.querySelectorAll("#siteNav a[data-nav]");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = new Map();
    links.forEach(function (l) { map.set(l.getAttribute("href").slice(1), l); });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove("active"); });
          var link = map.get(entry.target.id);
          if (link) link.classList.add("active");
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    map.forEach(function (_link, id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- 滚动浮现（轻量，一次性） ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 深浅色主题切换 + localStorage 记忆 ---------- */
  function initTheme() {
    var root = document.documentElement;
    var toggle = document.getElementById("themeToggle");
    var meta = document.querySelector('meta[name="theme-color"]');
    var STORAGE_KEY = "theme";

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (toggle) {
        toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      }
      // 同步移动端浏览器地址栏颜色
      if (meta) {
        meta.setAttribute("content", theme === "dark" ? "#14130e" : "#f5f2ea");
      }
    }

    // 页面加载时恢复上次选择（head 中的内联脚本已提前设置，这里同步按钮状态）
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    apply(saved === "dark" ? "dark" : "light");

    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
  }

  renderWorks();
  initNav();
  initActiveNav();
  initReveal();
  initTheme();
})();
