(function (global) {
  function pillClass(status) {
    if (!status) return "pill";
    if (/confirmed|opted out/i.test(status) && !/not/i.test(status)) return "pill ok";
    if (/submitted|pending/i.test(status)) return "pill pending";
    if (/listing found|disputed|lifted/i.test(status)) return "pill warn";
    if (/verified/i.test(status) && !/not/i.test(status)) return "pill ok";
    if (/user-reported/i.test(status)) return "pill pending";
    if (/unknown/i.test(status)) return "pill";
    return "pill";
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function linkify(url, label) {
    if (!url) return "";
    const text = label || url.replace(/^https?:\/\//, "");
    if (url.indexOf("mailto:") === 0) {
      return '<a href="' + escapeHtml(url) + '">' + escapeHtml(url.slice(7)) + "</a>";
    }
    return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(text) + "</a>";
  }

  function currentPage() {
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    return file || "index.html";
  }

  function renderHeader() {
    const header = document.getElementById("site-header");
    if (!header) return;
    const page = currentPage();
    const active = Store.activeId();
    const nav = [
      ["index.html", "Home"],
      ["credit.html", "Credit center"],
      ["optout.html", "Opt-out queue"],
      ["agencies.html", "Agencies & forms"],
      ["settings.html", "Your info & backup"],
      ["terms.html", "Terms & About"],
    ];
    const switchButtons = Store.PERSON_IDS.map(function (id) {
      return '<button type="button" data-person="' + id + '" aria-pressed="' + (active === id) + '">' + escapeHtml(Store.personLabel(id)) + "</button>";
    }).join("");
    header.innerHTML =
      '<div class="header-inner">' +
      '<div class="header-top">' +
      '<a class="logo" href="index.html">Privacy &amp; Credit Command Center<span>Freezes, disputes, and opt-outs</span></a>' +
      '<div class="person-switch" role="group" aria-label="Whose records to show">' +
      switchButtons +
      "</div></div>" +
      '<nav class="main-nav" aria-label="Main">' +
      nav.map(function (item) {
        const cur = item[0] === page ? ' aria-current="page"' : "";
        return '<a href="' + item[0] + '"' + cur + ">" + item[1] + "</a>";
      }).join("") +
      "</nav></div>" +
      '<p class="privacy-strip">Nothing you type is sent to a server. It stays in this browser, on this device, unless you export a backup file. <a href="settings.html">Your info &amp; backup</a></p>' +
      '<p class="legal-banner">This is an education and personal-organization tool only. It is not legal, credit-repair, or tax advice, and it does not guarantee any result. Check every step with the official agency or company before you act. <a href="terms.html">Terms &amp; About</a></p>';

    header.querySelectorAll(".person-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        Store.setActive(btn.getAttribute("data-person"));
      });
    });
  }

  function statusSelect(current, options, onChange) {
    const sel = document.createElement("select");
    options.forEach(function (opt) {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      if (opt === current) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () { onChange(sel.value); });
    return sel;
  }

  function rejectFullSsn(input) {
    const raw = (input.value || "").replace(/\D/g, "");
    if (raw.length > 4) {
      input.value = "";
      const warn = input.parentElement.querySelector(".ssn-warn") || document.createElement("div");
      warn.className = "ssn-warn";
      warn.textContent = "Do not enter a full Social Security number. Only the last 4 digits are allowed, and only for a printed letter.";
      if (!warn.parentElement) input.parentElement.appendChild(warn);
      return false;
    }
    input.value = raw;
    const existing = input.parentElement.querySelector(".ssn-warn");
    if (existing && raw.length <= 4) existing.remove();
    return true;
  }

  function addDaysISO(iso, days) {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + days);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function todayISO() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function downloadText(filename, text, type) {
    const blob = new Blob([text], { type: type || "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function uid() {
    return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  global.UI = {
    pillClass: pillClass,
    escapeHtml: escapeHtml,
    linkify: linkify,
    renderHeader: renderHeader,
    statusSelect: statusSelect,
    rejectFullSsn: rejectFullSsn,
    addDaysISO: addDaysISO,
    formatDate: formatDate,
    todayISO: todayISO,
    downloadText: downloadText,
    uid: uid,
  };

  document.addEventListener("DOMContentLoaded", function () {
    UI.renderHeader();
  });
  document.addEventListener("person-change", function () {
    UI.renderHeader();
  });
})(window);
