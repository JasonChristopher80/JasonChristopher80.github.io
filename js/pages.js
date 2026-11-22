(function (global) {
  function el(html) {
    const d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }

  function renderHome() {
    const root = document.getElementById("page-root");
    if (!root) return;
    const who = Store.activeLabel();
    const f = Store.counts.freezes();
    const b = Store.counts.brokers();
    const disputes = Store.profile().disputes || [];
    const openDisputes = disputes.filter(function (d) { return d.status !== "Closed" && d.status !== "Resolved"; }).length;
    root.innerHTML =
      '<section class="hero">' +
      "<h1>Welcome, " + UI.escapeHtml(who) + "</h1>" +
      '<p class="lead">This is an education and personal-organization tool for credit freezes, credit disputes, and data-broker opt-outs. Use the switch at the top to move between Person 1 and Person 2, or rename those labels in Your info &amp; backup. Each person can use this in their own browser, or you can keep a separate backup file.</p>' +
      '<div class="btn-row">' +
      '<a class="btn" href="credit.html">Open the Credit center</a>' +
      '<a class="btn secondary" href="optout.html">Work the opt-out queue</a>' +
      '<a class="btn secondary" href="settings.html">Add your name and address</a>' +
      '<a class="btn secondary" href="terms.html">Terms &amp; About</a>' +
      "</div></section>" +
      '<div class="callout warn"><strong class="lead-in">Education and personal-organization tool only</strong>This site is a pilot for organizing privacy, credit-freeze, opt-out, and due-diligence steps. It is not legal, credit-repair, or tax advice. It makes no legal claims and does not guarantee any result. Check every form, address, and deadline with the official agency or company. You can optionally export a counts-only progress summary from <a href="settings.html">Your info &amp; backup</a> if you want to share how the tool is being used.</div>' +
      '<div class="stats">' +
      '<div class="stat"><b>' + f.done + " / " + f.total + "</b><span>Freezes confirmed for " + UI.escapeHtml(who) + "</span></div>" +
      '<div class="stat"><b>' + openDisputes + "</b><span>Open dispute letters being tracked</span></div>" +
      '<div class="stat"><b>' + b.todo + "</b><span>Broker opt-outs still to do</span></div>" +
      '<div class="stat"><b>' + b.done + "</b><span>Brokers confirmed opted out</span></div>" +
      "</div>" +
      '<div class="grid grid-2">' +
      '<article class="card featured"><h2>Credit center</h2><p>Place or check freezes at Equifax, Experian, TransUnion, Innovis, ChexSystems, NCTUE, LexisNexis, and The Work Number, plus OptOutPrescreen. Then build a factual dispute letter, including a § 605B identity-theft block if you have a real FTC report number.</p><p class="card-meta">This is the main workspace. Freeze and dispute statuses start blank until you update them.</p><p><a class="btn" href="credit.html">Go to freezes and disputes</a></p></article>' +
      '<article class="card"><h2>Opt-out queue</h2><p>107 companies, with a separate status for each person. Filter by category, method, photo-ID, or search. Open the official link when you are ready. Mark a row done only when you have a confirmation.</p><p><a class="btn secondary" href="optout.html">Open the queue</a></p></article>' +
      '<article class="card"><h2>Agencies and forms</h2><p>FTC, CFPB, IRS, SEC, OSHA, Maryland, Treasury, and a plain-language forms guide. Status is saved in this browser for the person now selected.</p><p><a class="btn secondary" href="agencies.html">Open agencies and forms</a></p></article>' +
      "</div>" +
      '<div class="callout warn" style="margin-top:20px"><strong class="lead-in">Two clocks people often mix up</strong>The statute of limitations is the deadline for filing a lawsuit. The FCRA reporting period is how long a bureau may generally list a negative item (usually 7 years, or 10 years for a bankruptcy). One clock ending does not automatically take an item off a credit report. And a false identity-theft report is illegal — only claim that an item is identity theft if it truly is not yours and you have a genuine FTC IdentityTheft.gov report when a block letter asks for one.</div>';
  }

  function renderCredit() {
    const root = document.getElementById("page-root");
    if (!root) return;
    const who = Store.activeLabel();
    const profile = Store.profile();
    const fcounts = Store.counts.freezes();

    const orgCards = (FREEZE_ORGS || []).map(function (org) {
      const st = (profile.freezes && profile.freezes[org.id]) || { status: "Not started", date: "", notes: "" };
      const links = [];
      if (org.freezeUrl) links.push(UI.linkify(org.freezeUrl, "Official freeze or opt-out page"));
      if (org.portalUrl) links.push(UI.linkify(org.portalUrl, "Consumer portal"));
      if (org.disputeUrl) links.push(UI.linkify(org.disputeUrl, "Dispute or disclosure page"));
      if (org.fraudAlertUrl) links.push(UI.linkify(org.fraudAlertUrl, "Fraud alert"));
      if (org.optOutUrl) links.push(UI.linkify(org.optOutUrl, "Marketing opt-out"));
      const src = (org.sources || []).map(function (s) { return UI.linkify(s.url, s.label); }).join(" · ");
      return (
        '<article class="org-card" id="freeze-' + org.id + '">' +
        "<h3>" + UI.escapeHtml(org.name) + ' <span class="' + UI.pillClass(st.status) + '">' + UI.escapeHtml(st.status) + "</span></h3>" +
        '<p class="kind">' + UI.escapeHtml(org.kind) + "</p>" +
        "<p>" + UI.escapeHtml(org.purpose) + "</p>" +
        "<p><strong>Phone:</strong> " + UI.escapeHtml(org.phone || "See official page") +
        (org.disputePhone ? " · Dispute phone: " + UI.escapeHtml(org.disputePhone) : "") +
        (org.tty ? " · TTY: " + UI.escapeHtml(org.tty) : "") +
        (org.emailContact ? " · Email: " + UI.escapeHtml(org.emailContact) : "") + "</p>" +
        (org.freezeMail ? "<p><strong>Freeze / request mail:</strong> " + UI.escapeHtml(org.freezeMail) + "</p>" : "") +
        (org.disputeMail ? "<p><strong>Dispute mail:</strong> " + UI.escapeHtml(org.disputeMail) + "</p>" : "") +
        "<p><strong>How to thaw or lift:</strong> " + UI.escapeHtml(org.thaw) + "</p>" +
        (org.mailNote ? '<p class="small muted">' + UI.escapeHtml(org.mailNote) + "</p>" : "") +
        '<p class="small">Links: ' + links.join(" · ") + "</p>" +
        (src ? '<p class="small muted">Address sources: ' + src + "</p>" : "") +
        '<div class="freeze-status">' +
        '<label class="field">Status for ' + UI.escapeHtml(who) +
        '<select data-freeze-status="' + org.id + '">' + Store.FREEZE_STATUSES.map(function (s) {
          return '<option' + (s === st.status ? " selected" : "") + ">" + s + "</option>";
        }).join("") + "</select></label>" +
        '<label class="field">Date placed, submitted, or lifted' +
        '<input type="date" data-freeze-date="' + org.id + '" value="' + UI.escapeHtml(st.date || "") + '"></label>' +
        '<label class="field">Notes (no Social Security numbers or full account numbers)' +
        '<input type="text" data-freeze-notes="' + org.id + '" value="' + UI.escapeHtml(st.notes || "") + '" maxlength="300"></label>' +
        "</div></article>"
      );
    }).join("");

    const typeOptions = Letters.ITEM_TYPES.map(function (t) {
      return '<option value="' + t.id + '">' + UI.escapeHtml(t.label) + "</option>";
    }).join("");
    const bureauOptions = (FREEZE_ORGS || []).filter(function (o) { return o.disputeMail || o.id === "nctue" || o.id === "chexsystems" || o.id === "innovis" || o.id === "lexisnexis"; })
      .concat([])
      .map(function (o) {
        return '<option value="' + o.id + '">' + UI.escapeHtml(o.name) + "</option>";
      }).join("");

    root.innerHTML =
      "<h1>Credit center</h1>" +
      '<p class="lead">For ' + UI.escapeHtml(who) + ". First pull official reports, then finish freezes, then dispute only specific inaccuracies. Keep any recent account that should stay on the report.</p>" +
      '<nav class="toc" aria-label="On this page">' +
      '<a href="#reports">Official reports</a><a href="#freezes">Freeze checklist</a><a href="#notes">Important notes</a><a href="#builder">Dispute letter builder</a><a href="#tracker">Dispute tracker</a>' +
      "</nav>" +
      '<section class="callout info" id="reports"><strong class="lead-in">Start with official reports</strong>Get free Equifax, Experian, and TransUnion reports at ' +
      UI.linkify("https://www.annualcreditreport.com", "AnnualCreditReport.com") +
      ", the only official free annual-report site. Reports are free at least weekly. Save the PDFs before you dispute. Do not use look-alike score sites.</section>" +
      '<div class="stats">' +
      '<div class="stat"><b>' + fcounts.done + "</b><span>Confirmed freezes</span></div>" +
      '<div class="stat"><b>' + fcounts.pending + "</b><span>Submitted</span></div>" +
      '<div class="stat"><b>' + fcounts.lifted + "</b><span>Temporarily lifted</span></div>" +
      '<div class="stat"><b>' + fcounts.todo + "</b><span>Not started</span></div>" +
      "</div>" +
      '<section id="freezes"><h2>Freeze checklist</h2>' +
      '<p class="muted">A freeze at one company does not freeze the others. Placing, lifting, and removing a freeze is free at these companies. Temporarily lift (thaw) a freeze before you apply for credit, a bank account, a job-income check, or new utility service, depending on which file the company will use.</p>' +
      '<div class="grid">' + orgCards + "</div></section>" +
      '<section class="callout warn" id="notes" style="margin-top:24px"><strong class="lead-in">Plain-English notes before you dispute</strong>' +
      "<p>The <strong>statute of limitations</strong> is the deadline for bringing a lawsuit. The <strong>FCRA reporting period</strong> is how long a bureau may generally list a negative item: usually 7 years, and up to 10 years for a bankruptcy (15 U.S.C. § 1681c). Those are not the same clock. An item can still be on a report after a lawsuit deadline has passed, and it should generally come off after the reporting period ends.</p>" +
      "<p>A bureau generally has <strong>30 days from receipt</strong> of a complete dispute to investigate (FCRA § 611, 15 U.S.C. § 1681i). That can be extended by 15 days if you send more information during the investigation. If you mail the letter, the clock starts when they receive it, so add mailing time when you pick a follow-up date.</p>" +
      "<p><strong>A false identity-theft report is illegal.</strong> Only claim that an item is not yours, or request a § 605B block, if that is true. A § 605B letter requires a real FTC IdentityTheft.gov report number. Ordinary errors (wrong balance, obsolete item, dismissed bankruptcy still reporting accurately as to whose case it was) are § 611 disputes, not automatic identity-theft claims.</p></section>" +
      '<section id="builder" style="margin-top:24px"><h2>Dispute letter builder</h2>' +
      '<div class="card">' +
      '<p>This writes a factual FCRA § 611 dispute letter you can copy or print. It can also add a § 605B identity-theft block if you have an FTC report number. Fill in only facts you can stand behind. Add your name and address under <a href="settings.html">Your info &amp; backup</a> so the letter is complete. Do not type a full Social Security number or a full account number anywhere on this site.</p>' +
      '<div class="toolbar">' +
      '<label class="field">Bureau<select id="letter-bureau">' + bureauOptions + "</select></label>" +
      '<label class="field">Item type<select id="letter-type">' + typeOptions + "</select></label>" +
      '<label class="field">Date of letter (also used as “date sent”)<input type="date" id="letter-date"></label>' +
      "</div>" +
      '<div class="toolbar">' +
      '<label class="field">Furnisher or creditor name (as on the report)<input type="text" id="letter-furnisher" maxlength="120"></label>' +
      '<label class="field">Last 4 of account only (optional)<input type="text" id="letter-acct" inputmode="numeric" maxlength="4" autocomplete="off"><span class="hint">Never enter a full account number.</span></label>' +
      '<label class="field">Date related to the item (optional)<input type="text" id="letter-item-date" maxlength="40" placeholder="For example, dismissal date"></label>' +
      "</div>" +
      '<label class="field">Your explanation (facts only)<textarea id="letter-explain" placeholder="What is wrong, and what the enclosed documents show. Do not invent details."></textarea></label>' +
      '<label class="field" style="margin-top:12px"><span><input type="checkbox" id="letter-605b"> Also create a § 605B identity-theft block version</span><span class="hint">Use this only if the item is not yours and you already have a genuine FTC IdentityTheft.gov report.</span></label>' +
      '<label class="field" id="ftc-wrap"><span>FTC IdentityTheft.gov report number</span><input type="text" id="letter-ftc" maxlength="40" autocomplete="off"><span class="hint">Required for a § 605B letter. Leave blank and uncheck the box if you are only sending a § 611 accuracy dispute.</span></label>' +
      '<div class="btn-row">' +
      '<button type="button" class="btn" id="btn-generate">Generate letter</button>' +
      '<button type="button" class="btn secondary" id="btn-copy">Copy letter</button>' +
      '<button type="button" class="btn secondary" id="btn-print">Print letter</button>' +
      '<button type="button" class="btn secondary" id="btn-save-track">Save to tracker with due date</button>' +
      "</div>" +
      '<div id="evidence-box" class="callout info hidden"></div>' +
      '<label class="field">Letter<pre class="letter" id="letter-out" tabindex="0">Generate a letter to see it here.</pre></label>' +
      '<p class="small muted" id="due-note"></p>' +
      "</div></section>" +
      '<section id="tracker" style="margin-top:24px"><h2>Dispute tracker</h2>' +
      '<p class="muted">Dates are stored only in this browser for ' + UI.escapeHtml(who) + '. The suggested response due date is 30 days after the date sent, plus 5 days for mail, because the legal clock runs from the bureau’s receipt.</p>' +
      '<div id="tracker-table"></div></section>';

    document.getElementById("letter-date").value = UI.todayISO();

    root.querySelectorAll("[data-freeze-status]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        Store.setFreeze(sel.getAttribute("data-freeze-status"), { status: sel.value });
        renderCredit();
      });
    });
    root.querySelectorAll("[data-freeze-date]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        Store.setFreeze(inp.getAttribute("data-freeze-date"), { date: inp.value });
      });
    });
    root.querySelectorAll("[data-freeze-notes]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        Store.setFreeze(inp.getAttribute("data-freeze-notes"), { notes: inp.value });
      });
    });

    const acct = document.getElementById("letter-acct");
    acct.addEventListener("input", function () {
      const raw = (acct.value || "").replace(/\D/g, "");
      if (raw.length > 4) {
        acct.value = "";
        alert("Enter only the last 4 digits of an account, never the full number.");
      } else acct.value = raw;
    });

    function currentLetterOpts() {
      const bureauId = document.getElementById("letter-bureau").value;
      const org = (FREEZE_ORGS || []).find(function (o) { return o.id === bureauId; });
      const use605B = document.getElementById("letter-605b").checked;
      return {
        profile: Store.profile(),
        org: org,
        itemType: document.getElementById("letter-type").value,
        dateSent: document.getElementById("letter-date").value,
        furnisher: document.getElementById("letter-furnisher").value.trim(),
        accountLast4: document.getElementById("letter-acct").value.trim(),
        itemDate: document.getElementById("letter-item-date").value.trim(),
        explanation: document.getElementById("letter-explain").value.trim(),
        use605B: use605B,
        ftcNumber: document.getElementById("letter-ftc").value.trim(),
      };
    }

    function generate() {
      const opts = currentLetterOpts();
      if (opts.use605B && !opts.ftcNumber) {
        alert("A § 605B identity-theft block letter needs an FTC IdentityTheft.gov report number. Uncheck the box to generate a regular § 611 dispute, or enter the report number if you have a genuine one.");
        return null;
      }
      const built = Letters.buildLetter(opts);
      document.getElementById("letter-out").textContent = built.text;
      const ev = document.getElementById("evidence-box");
      ev.classList.remove("hidden");
      ev.innerHTML = "<strong class=\"lead-in\">Evidence checklist for this letter</strong><ul>" +
        built.evidence.map(function (x) { return "<li>" + UI.escapeHtml(x) + "</li>"; }).join("") +
        "</ul><p class=\"small\">Mail copies, not originals. Send the letter to the bureau’s dispute address shown in the letter, not the freeze address, unless they are the same.</p>";
      const sent = opts.dateSent || UI.todayISO();
      const due = UI.addDaysISO(sent, 35);
      document.getElementById("due-note").textContent =
        "If you mail this on " + UI.formatDate(sent) + ", a practical follow-up date is " + UI.formatDate(due) +
        " (30-day investigation period plus 5 days for mail). The legal 30-day clock starts when the bureau receives a complete dispute.";
      return { opts: opts, built: built, due: due, sent: sent };
    }

    document.getElementById("btn-generate").addEventListener("click", function () { generate(); });
    document.getElementById("btn-copy").addEventListener("click", function () {
      const text = document.getElementById("letter-out").textContent;
      if (!text || text.indexOf("Generate a letter") === 0) { generate(); }
      const latest = document.getElementById("letter-out").textContent;
      navigator.clipboard.writeText(latest).then(function () {
        alert("Letter copied. Paste it into a document or email, then print or mail it yourself.");
      }).catch(function () {
        alert("Copy was blocked by the browser. Select the letter text and copy it manually.");
      });
    });
    document.getElementById("btn-print").addEventListener("click", function () {
      if (document.getElementById("letter-out").textContent.indexOf("Generate a letter") === 0) generate();
      window.print();
    });
    document.getElementById("btn-save-track").addEventListener("click", function () {
      const result = generate();
      if (!result) return;
      Store.addDispute({
        id: UI.uid(),
        bureau: result.opts.org ? result.opts.org.name : "",
        bureauId: result.opts.org ? result.opts.org.id : "",
        itemType: result.built.typeLabel,
        furnisher: result.opts.furnisher,
        dateSent: result.sent,
        dueDate: result.due,
        status: "Sent / awaiting response",
        use605B: !!result.opts.use605B,
        ftcNumber: result.opts.use605B ? result.opts.ftcNumber : "",
        notes: result.opts.explanation,
      });
      renderTracker();
      alert("Saved to the tracker for " + Store.activeLabel() + ".");
    });

    function renderTracker() {
      const list = Store.profile().disputes || [];
      const box = document.getElementById("tracker-table");
      if (!list.length) {
        box.innerHTML = "<p class=\"muted\">No dispute letters are being tracked yet for " + UI.escapeHtml(Store.activeLabel()) + ".</p>";
        return;
      }
      box.innerHTML = '<div class="table-wrap"><table class="data"><thead><tr><th>Bureau</th><th>Item</th><th>Sent</th><th>Follow up</th><th>Status</th><th></th></tr></thead><tbody>' +
        list.map(function (d) {
          return "<tr>" +
            "<td data-label=\"Bureau\">" + UI.escapeHtml(d.bureau) + (d.use605B ? ' <span class="pill warn">§ 605B</span>' : "") + "</td>" +
            "<td data-label=\"Item\">" + UI.escapeHtml(d.itemType) + (d.furnisher ? " — " + UI.escapeHtml(d.furnisher) : "") + "</td>" +
            "<td data-label=\"Sent\">" + UI.escapeHtml(d.dateSent || "") + "</td>" +
            "<td data-label=\"Follow up\">" + UI.escapeHtml(d.dueDate || "") + "</td>" +
            "<td data-label=\"Status\"><select data-dispute-status=\"" + d.id + "\">" +
            ["Draft", "Sent / awaiting response", "Results received", "Resolved", "Closed"].map(function (s) {
              return "<option" + (s === d.status ? " selected" : "") + ">" + s + "</option>";
            }).join("") + "</select></td>" +
            "<td data-label=\"\"><button type=\"button\" class=\"btn ghost\" data-dispute-del=\"" + d.id + "\">Remove</button></td>" +
            "</tr>";
        }).join("") + "</tbody></table></div>";
      box.querySelectorAll("[data-dispute-status]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          Store.updateDispute(sel.getAttribute("data-dispute-status"), { status: sel.value });
        });
      });
      box.querySelectorAll("[data-dispute-del]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (confirm("Remove this tracked dispute from this browser?")) {
            Store.removeDispute(btn.getAttribute("data-dispute-del"));
            renderTracker();
          }
        });
      });
    }
    renderTracker();
  }

  function renderOptout() {
    const root = document.getElementById("page-root");
    if (!root) return;
    const who = Store.activeLabel();
    const c = Store.counts.brokers();
    root.innerHTML =
      "<h1>Opt-out queue</h1>" +
      '<p class="lead">107 companies for ' + UI.escapeHtml(who) + ". Work one person at a time. Mark a company confirmed only when you have a confirmation screen or email. Photo-ID and phone-required rows are flagged so you can do those yourself.</p>" +
      '<div class="callout info"><strong class="lead-in">How to use this queue</strong>Open the official link, complete that company’s process, then change the status here. Cookie and footer ad-tech opt-outs apply only to this browser and can reset if cookies are cleared. People-search sites often need the exact listing URL and an email confirmation, and some relist later. PeopleConnect brands often share one login. Cite Maryland’s Online Data Privacy Act (effective October 1, 2025) when a form offers a state-law choice. Do not pay a look-alike service to finish a free opt-out.</div>' +
      '<div class="stats">' +
      '<div class="stat"><b>' + c.total + "</b><span>Companies in the queue</span></div>" +
      '<div class="stat"><b>' + c.todo + "</b><span>To do for " + UI.escapeHtml(who) + "</span></div>" +
      '<div class="stat"><b>' + c.pending + "</b><span>Submitted / pending</span></div>" +
      '<div class="stat"><b>' + c.done + "</b><span>Confirmed opted out</span></div>" +
      "</div>" +
      '<div class="toolbar">' +
      '<label class="field">Search<input type="search" id="q" placeholder="Name, method, or email"></label>' +
      '<label class="field">Category<select id="cat"><option value="all">All categories</option><option>People-search</option><option>Marketing &amp; specialty</option><option>Ad-tech (NAI)</option><option>Employment &amp; background</option></select></label>' +
      '<label class="field">Status<select id="st"><option value="all">All statuses</option>' +
      Store.BROKER_STATUSES.map(function (s) { return "<option>" + s + "</option>"; }).join("") +
      "</select></label>" +
      '<label class="field">Flags<select id="flag"><option value="all">Any method</option><option value="email">Email-only</option><option value="id">Photo ID often required</option><option value="phone">Phone involved</option><option value="hub">Shared hub</option></select></label>' +
      "</div>" +
      '<p class="muted" id="filter-count"></p>' +
      '<div class="table-wrap stack-cards" id="broker-table"></div>';

    function rows() {
      const q = (document.getElementById("q").value || "").trim().toLowerCase();
      const cat = document.getElementById("cat").value;
      const st = document.getElementById("st").value;
      const flag = document.getElementById("flag").value;
      const map = Store.profile().brokers || {};
      return (BROKERS || []).filter(function (b) {
        const status = map[b.name] || "Just named";
        if (cat !== "all" && b.category !== cat) return false;
        if (st !== "all" && status !== st) return false;
        if (flag === "email" && !(b.methodType === "email" || (b.emails && b.emails.length && (b.optOutUrl || "").indexOf("mailto:") === 0))) return false;
        if (flag === "id" && !b.needsPhotoId) return false;
        if (flag === "phone" && !b.needsPhone) return false;
        if (flag === "hub" && !b.isHub) return false;
        if (!q) return true;
        const hay = [b.name, b.category, b.family, b.methodType, b.methodDetail, (b.emails || []).join(" "), b.optOutUrl].join(" ").toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }

    function draw() {
      const list = rows();
      document.getElementById("filter-count").textContent = "Showing " + list.length + " of " + (BROKERS || []).length + " companies for " + who + ".";
      const html = '<table class="data"><thead><tr><th>Company</th><th>Category</th><th>Official link</th><th>Method</th><th>Flags</th><th>Status for ' + UI.escapeHtml(who) + "</th></tr></thead><tbody>" +
        list.map(function (b) {
          const status = (Store.profile().brokers || {})[b.name] || "Just named";
          const flags = [];
          if (b.needsPhotoId) flags.push('<span class="pill warn">Photo ID</span>');
          if (b.needsPhone) flags.push('<span class="pill pending">Phone</span>');
          if (b.needsEmail) flags.push('<span class="pill">Email confirm</span>');
          if (b.isHub) flags.push('<span class="pill">Shared hub</span>');
          if (b.searchNeeded) flags.push('<span class="pill">Search first</span>');
          return "<tr>" +
            "<td data-label=\"Company\"><strong>" + UI.escapeHtml(b.name) + "</strong>" +
            (b.family ? '<div class="small muted">' + UI.escapeHtml(b.family) + "</div>" : "") + "</td>" +
            "<td data-label=\"Category\">" + UI.escapeHtml(b.category) + "</td>" +
            "<td data-label=\"Official link\">" + UI.linkify(b.optOutUrl, b.optOutUrl && b.optOutUrl.indexOf("mailto:") === 0 ? b.optOutUrl.slice(7) : "Open official opt-out") + "</td>" +
            "<td data-label=\"Method\">" + UI.escapeHtml(b.methodType) +
            '<div class="small muted">' + UI.escapeHtml(b.methodDetail) + "</div></td>" +
            "<td data-label=\"Flags\">" + (flags.join(" ") || "—") + "</td>" +
            "<td data-label=\"Status\"><select data-broker=\"" + UI.escapeHtml(b.name) + "\">" +
            Store.BROKER_STATUSES.map(function (s) {
              return "<option" + (s === status ? " selected" : "") + ">" + s + "</option>";
            }).join("") + "</select></td></tr>";
        }).join("") + "</tbody></table>";
      document.getElementById("broker-table").innerHTML = html;
      document.getElementById("broker-table").querySelectorAll("[data-broker]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          Store.setBroker(sel.getAttribute("data-broker"), sel.value);
          const c2 = Store.counts.brokers();
          // update stats without full redraw of filters
        });
      });
    }
    ["q", "cat", "st", "flag"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", draw);
      document.getElementById(id).addEventListener("change", draw);
    });
    draw();
  }

  function catalogSection(title, id, rows) {
    const who = Store.activeLabel();
    return '<section id="' + id + '" style="margin-top:24px"><h2>' + UI.escapeHtml(title) + "</h2>" +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th>Purpose</th><th>Official link</th><th>Contact and method</th><th>Status for ' + UI.escapeHtml(who) + "</th></tr></thead><tbody>" +
      rows.map(function (r) {
        const key = id + ":" + r.name;
        const st = (Store.profile().catalog || {})[key] || "Not started";
        return "<tr><td data-label=\"Name\"><strong>" + UI.escapeHtml(r.name) + "</strong></td>" +
          "<td data-label=\"Purpose\">" + UI.escapeHtml(r.purpose) + "</td>" +
          "<td data-label=\"Official link\">" + UI.linkify(r.link, "Open official page") + "</td>" +
          "<td data-label=\"Contact and method\"><div>" + UI.escapeHtml(r.contact) + '</div><div class="small muted">' + UI.escapeHtml(r.method) + "</div></td>" +
          "<td data-label=\"Status\"><select data-cat-key=\"" + UI.escapeHtml(key) + "\">" +
          Store.CATALOG_STATUSES.map(function (s) { return "<option" + (s === st ? " selected" : "") + ">" + s + "</option>"; }).join("") +
          "</select></td></tr>";
      }).join("") + "</tbody></table></div></section>";
  }

  function renderAgencies() {
    const root = document.getElementById("page-root");
    if (!root) return;
    const C = global.CATALOG || {};
    root.innerHTML =
      "<h1>Agencies and forms</h1>" +
      '<p class="lead">Official government, Treasury, tracking, and account-setting links, plus a plain-language forms guide. Status is saved in this browser for ' + UI.escapeHtml(Store.activeLabel()) + ".</p>" +
      '<nav class="toc"><a href="#government">Government</a><a href="#treasury">Treasury</a><a href="#tracking">Phone and ads</a><a href="#tech">Big-tech settings</a><a href="#forms">Forms guide</a></nav>' +
      catalogSection("Government agencies and whistleblower filings", "government", C.government || []) +
      catalogSection("Treasury securities and savings bonds", "treasury", C.treasury || []) +
      catalogSection("Phone and ad tracking", "tracking", C.tracking || []) +
      catalogSection("Big tech accounts and ad settings", "tech", C.tech || []) +
      '<section id="forms" style="margin-top:28px"><h2>Forms guide</h2>' +
      '<div class="callout info"><strong class="lead-in">How these forms connect</strong>Start with evidence, then protection, then reports. Use Get Transcript or Form 4506-T for IRS transcripts as proof for credit disputes. If a tax return was filed in your name, Form 4506-F asks for a copy of that fraudulent return. Report non-tax identity theft at IdentityTheft.gov. Use Form 14039 only for tax-related identity theft the IRS does not already have, or when the IRS tells you to. An IP PIN helps stop a later fraudulent filing. Form 2848 lets a qualifying tax professional represent you; Form 8821 only lets someone receive records. To report suspected tax fraud without asking for money, use IRS Submit a Tip. To ask for a whistleblower award, use Form 211, and do not file the same claim both ways.</div>' +
      '<div class="grid" id="forms-list"></div></section>';

    document.getElementById("forms-list").innerHTML = (C.forms || []).map(function (f) {
      const links = (f.links || []).map(function (l) { return UI.linkify(l.url, l.label); }).join(" · ");
      return '<article class="card" id="form-' + UI.escapeHtml(f.id) + '"><h3>' + UI.escapeHtml(f.name) + "</h3>" +
        "<p>" + UI.escapeHtml(f.summary) + "</p>" +
        "<p><strong>When it applies:</strong> " + UI.escapeHtml(f.when) + "</p>" +
        "<p><strong>How:</strong> " + UI.escapeHtml(f.how) + "</p>" +
        "<p><strong>Watch for:</strong> " + UI.escapeHtml(f.watch) + "</p>" +
        (links ? "<p>" + links + "</p>" : "") + "</article>";
    }).join("");

    root.querySelectorAll("[data-cat-key]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        Store.setCatalog(sel.getAttribute("data-cat-key"), sel.value);
      });
    });
  }

  function renderSettings() {
    const root = document.getElementById("page-root");
    if (!root) return;
    const p = Store.profile();
    const who = Store.activeLabel();
    root.innerHTML =
      "<h1>Your info and backup</h1>" +
      '<p class="lead">These fields are for ' + UI.escapeHtml(who) + ". They are used to fill dispute letters. They are stored only in this browser’s localStorage, not on a server.</p>" +
      '<section class="card" style="margin-bottom:24px"><h2>Rename the people on this device</h2>' +
      '<p>The switch at the top starts as Person 1 and Person 2. You can rename those labels here. The names stay in this browser only and are not included in a counts-only progress summary.</p>' +
      '<div class="toolbar">' +
      '<label class="field">First profile label<input type="text" id="label-person1" maxlength="40" autocomplete="off"></label>' +
      '<label class="field">Second profile label<input type="text" id="label-person2" maxlength="40" autocomplete="off"></label>' +
      "</div>" +
      '<div class="btn-row"><button type="button" class="btn secondary" id="btn-save-labels">Save profile names</button></div></section>' +
      '<div class="callout danger"><strong class="lead-in">Do not enter a full Social Security number, a full account number, a password, or any other credential.</strong>The last 4 digits of a Social Security number are optional and are meant only for a letter you print or copy. If you type more than 4 digits, the field will be cleared.</div>' +
      '<form class="card" id="profile-form">' +
      '<div class="toolbar">' +
      '<label class="field">Full legal name (for letters)<input type="text" name="legalName" maxlength="120" autocomplete="name"></label>' +
      '<label class="field">Email (optional)<input type="email" name="email" maxlength="120" autocomplete="email"></label>' +
      '<label class="field">Phone (optional)<input type="tel" name="phone" maxlength="40" autocomplete="tel"></label>' +
      "</div>" +
      '<div class="toolbar">' +
      '<label class="field">Street address<input type="text" name="address1" maxlength="120" autocomplete="address-line1"></label>' +
      '<label class="field">Apartment or line 2<input type="text" name="address2" maxlength="80" autocomplete="address-line2"></label>' +
      "</div>" +
      '<div class="toolbar">' +
      '<label class="field">City<input type="text" name="city" maxlength="60" autocomplete="address-level2"></label>' +
      '<label class="field">State<input type="text" name="state" maxlength="2" autocomplete="address-level1" placeholder="MD"></label>' +
      '<label class="field">ZIP<input type="text" name="zip" maxlength="10" autocomplete="postal-code"></label>' +
      "</div>" +
      '<div class="toolbar">' +
      '<label class="field">Date of birth (optional, for letters)<input type="date" name="dob" autocomplete="bday"></label>' +
      '<label class="field">Last 4 of SSN only (optional)<input type="text" name="last4" inputmode="numeric" maxlength="4" autocomplete="off" id="last4"><span class="hint">Never enter the full number. Last 4 only, for a printed letter.</span></label>' +
      "</div>" +
      '<div class="btn-row"><button type="submit" class="btn">Save ' + UI.escapeHtml(who) + "’s info on this device</button></div>" +
      "</form>" +
      '<section style="margin-top:24px"><h2>Export and import</h2>' +
      '<p>Download a JSON backup of both people’s statuses, letters in the tracker, and the info you entered. Keep that file private, like a tax record. You can import it on another computer or browser. Do not email it to a shared inbox or put it in a public repository.</p>' +
      '<div class="btn-row">' +
      '<button type="button" class="btn" id="btn-export">Download backup JSON</button>' +
      '<label class="btn secondary" style="cursor:pointer">Import backup JSON<input type="file" id="import-file" accept="application/json,.json" class="hidden"></label>' +
      '<button type="button" class="btn danger" id="btn-reset">Erase all data in this browser</button>' +
      "</div></section>" +
      '<section style="margin-top:24px"><h2>Optional progress summary (counts only)</h2>' +
      '<p>If you want to show that this pilot tool is being used, you can download a <strong>progress summary</strong>. It includes counts and dates only: how many freezes are confirmed, submitted, or lifted; how many opt-outs are done or pending; and how many disputes are sent or resolved, plus the dates you entered. It does <strong>not</strong> include names, addresses, emails, phone numbers, account numbers, notes, or report numbers.</p>' +
      '<p>The full backup above is private and should stay on your device. Share a progress summary only if you choose to.</p>' +
      '<label class="field" style="margin:12px 0"><span><input type="checkbox" id="summary-all"> Include unlabeled counts for every profile on this device, plus a combined total</span><span class="hint">Leave unchecked to export only the person now selected, still without a name. Distinctive counts could still hint at which profile it is.</span></label>' +
      '<div class="btn-row">' +
      '<button type="button" class="btn" id="btn-summary-preview">Preview summary</button>' +
      '<button type="button" class="btn secondary" id="btn-summary-download">Download counts-only JSON</button>' +
      '<button type="button" class="btn secondary" id="btn-summary-copy">Copy summary</button>' +
      "</div>" +
      '<pre class="preview-box hidden" id="summary-preview" aria-live="polite"></pre>' +
      "</section>" +
      '<section class="callout info" style="margin-top:24px"><strong class="lead-in">How this site stores data</strong>This is a static website. There is no login and no database. The switch at the top chooses whose records you are updating. Person 1 and Person 2 each have their own profile, freeze checklist, opt-out statuses, and dispute tracker. You can rename those labels on this page. If you clear this browser’s site data, the information is gone unless you imported a backup. Read the <a href="terms.html">Terms &amp; About</a> page for the education-only notice.</section>';

    const form = document.getElementById("profile-form");
    ["legalName","email","phone","address1","address2","city","state","zip","dob","last4"].forEach(function (name) {
      form.elements[name].value = p[name] || "";
    });
    document.getElementById("label-person1").value = Store.personLabel("person1");
    document.getElementById("label-person2").value = Store.personLabel("person2");
    document.getElementById("btn-save-labels").addEventListener("click", function () {
      Store.setLabel("person1", document.getElementById("label-person1").value);
      Store.setLabel("person2", document.getElementById("label-person2").value);
      alert("Saved profile names on this device.");
    });
    const last4 = document.getElementById("last4");
    last4.addEventListener("input", function () { UI.rejectFullSsn(last4); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!UI.rejectFullSsn(last4)) return;
      const patch = {};
      ["legalName","email","phone","address1","address2","city","state","zip","dob","last4"].forEach(function (name) {
        patch[name] = form.elements[name].value.trim();
      });
      Store.updateProfile(patch);
      alert("Saved in this browser for " + Store.activeLabel() + ".");
    });
    document.getElementById("btn-export").addEventListener("click", function () {
      const stamp = UI.todayISO();
      UI.downloadText("command-center-backup-" + stamp + ".json", Store.exportJSON(), "application/json");
    });
    document.getElementById("import-file").addEventListener("change", function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          Store.importJSON(String(reader.result));
          alert("Backup imported. The person switch now shows the active person from that file.");
        } catch (err) {
          alert("Could not import that file. " + (err && err.message ? err.message : "Use a JSON file exported from this site."));
        }
      };
      reader.readAsText(file);
    });
    document.getElementById("btn-reset").addEventListener("click", function () {
      if (confirm("Erase all saved info, statuses, and dispute trackers for both people in this browser? This cannot be undone unless you have a backup file.")) {
        Store.resetAll();
      }
    });
    function summaryScope() {
      return document.getElementById("summary-all").checked ? "all" : "selected";
    }
    function showSummary() {
      const text = Store.exportProgressSummary(summaryScope());
      const box = document.getElementById("summary-preview");
      box.textContent = text;
      box.classList.remove("hidden");
      return text;
    }
    document.getElementById("btn-summary-preview").addEventListener("click", function () { showSummary(); });
    document.getElementById("btn-summary-download").addEventListener("click", function () {
      const text = showSummary();
      UI.downloadText("progress-summary-" + UI.todayISO() + ".json", text, "application/json");
    });
    document.getElementById("btn-summary-copy").addEventListener("click", function () {
      const text = showSummary();
      navigator.clipboard.writeText(text).then(function () {
        alert("Counts-only summary copied. Share it only if you want to.");
      }).catch(function () {
        alert("Copy was blocked. The preview is on the page so you can copy it manually.");
      });
    });
  }

  const pages = {
    home: renderHome,
    credit: renderCredit,
    optout: renderOptout,
    agencies: renderAgencies,
    settings: renderSettings,
  };

  function boot(name) {
    const run = function () {
      if (pages[name]) pages[name]();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
    document.addEventListener("person-change", run);
  }

  global.Pages = { boot: boot };
})(window);
