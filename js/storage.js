(function (global) {
  const STORAGE_KEY = "privacy-credit-center-v1";
  const PERSON_IDS = ["person1", "person2"];
  function defaultLabels() {
    return { person1: "Person 1", person2: "Person 2" };
  }
  const BROKER_STATUSES = [
    "Just named",
    "Listing found but not removed",
    "Submitted / pending verification",
    "Confirmed opted out",
  ];
  const FREEZE_STATUSES = ["Not started", "Submitted", "Confirmed", "Temporarily lifted"];
  const CATALOG_STATUSES = ["Not started", "Submitted", "Confirmed"];

  function emptyFreezes() {
    const freezes = {};
    const orgs = global.FREEZE_ORGS || [];
    orgs.forEach(function (org) {
      freezes[org.id] = { status: "Not started", date: "", notes: "" };
    });
    return freezes;
  }

  function emptyBrokers() {
    const brokers = {};
    (global.BROKERS || []).forEach(function (b) {
      brokers[b.name] = "Just named";
    });
    return brokers;
  }

  function emptyProfile() {
    return {
      legalName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      email: "",
      phone: "",
      last4: "",
      dob: "",
      freezes: emptyFreezes(),
      brokers: emptyBrokers(),
      catalog: {},
      disputes: [],
    };
  }

  function defaultState() {
    return {
      version: 1,
      activePerson: "person1",
      labels: defaultLabels(),
      people: {
        person1: emptyProfile(),
        person2: emptyProfile(),
      },
    };
  }

  function migrate(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== "object") return base;
    const labels = defaultLabels();
    if (raw.labels && typeof raw.labels === "object") {
      PERSON_IDS.forEach(function (id) {
        const v = String(raw.labels[id] || "").trim().slice(0, 40);
        if (v) labels[id] = v;
      });
    }
    const next = {
      version: 1,
      activePerson: raw.activePerson === "person2" ? "person2" : "person1",
      labels: labels,
      people: {
        person1: Object.assign(emptyProfile(), (raw.people && raw.people.person1) || {}),
        person2: Object.assign(emptyProfile(), (raw.people && raw.people.person2) || {}),
      },
    };
    PERSON_IDS.forEach(function (id) {
      const p = next.people[id];
      p.freezes = Object.assign(emptyFreezes(), p.freezes || {});
      p.brokers = Object.assign(emptyBrokers(), p.brokers || {});
      p.catalog = p.catalog || {};
      p.disputes = Array.isArray(p.disputes) ? p.disputes : [];
      if (p.last4 && !/^\d{0,4}$/.test(String(p.last4))) p.last4 = "";
    });
    return next;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return migrate(JSON.parse(raw));
    } catch (err) {
      console.warn("Could not read saved data", err);
      return defaultState();
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = load();

  const Store = {
    PERSON_IDS: PERSON_IDS,
    BROKER_STATUSES: BROKER_STATUSES,
    FREEZE_STATUSES: FREEZE_STATUSES,
    CATALOG_STATUSES: CATALOG_STATUSES,
    getState: function () { return state; },
    persist: function () { save(state); },
    activeId: function () { return state.activePerson; },
    personLabel: function (id) {
      const labels = state.labels || defaultLabels();
      return labels[id] || defaultLabels()[id] || id;
    },
    activeLabel: function () { return this.personLabel(state.activePerson); },
    profile: function () { return state.people[state.activePerson]; },
    setActive: function (id) {
      if (PERSON_IDS.indexOf(id) === -1) return;
      state.activePerson = id;
      save(state);
      document.dispatchEvent(new CustomEvent("person-change", { detail: id }));
    },
    setLabel: function (id, label) {
      if (PERSON_IDS.indexOf(id) === -1) return;
      if (!state.labels) state.labels = defaultLabels();
      const cleaned = String(label || "").trim().slice(0, 40);
      state.labels[id] = cleaned || defaultLabels()[id];
      save(state);
      document.dispatchEvent(new CustomEvent("person-change", { detail: state.activePerson }));
    },
    updateProfile: function (patch) {
      Object.assign(state.people[state.activePerson], patch);
      save(state);
    },
    setFreeze: function (orgId, patch) {
      const cur = state.people[state.activePerson].freezes[orgId] || { status: "Not started", date: "", notes: "" };
      state.people[state.activePerson].freezes[orgId] = Object.assign({}, cur, patch);
      save(state);
    },
    setBroker: function (name, status) {
      state.people[state.activePerson].brokers[name] = status;
      save(state);
    },
    setCatalog: function (key, status) {
      state.people[state.activePerson].catalog[key] = status;
      save(state);
    },
    addDispute: function (item) {
      state.people[state.activePerson].disputes.unshift(item);
      save(state);
    },
    updateDispute: function (id, patch) {
      const list = state.people[state.activePerson].disputes;
      const i = list.findIndex(function (d) { return d.id === id; });
      if (i >= 0) {
        list[i] = Object.assign({}, list[i], patch);
        save(state);
      }
    },
    removeDispute: function (id) {
      const p = state.people[state.activePerson];
      p.disputes = p.disputes.filter(function (d) { return d.id !== id; });
      save(state);
    },
    progressSummary: function (scope) {
      // Counts and dates only. Never includes names, addresses, emails, phones,
      // last-4 digits, notes, account numbers, or report numbers.
      function summarize(profile) {
        const freezeList = global.FREEZE_ORGS || [];
        const freezeMap = (profile && profile.freezes) || {};
        const freezes = {
          total: freezeList.length,
          confirmed: 0,
          submitted: 0,
          temporarilyLifted: 0,
          notStarted: 0,
          items: [],
        };
        freezeList.forEach(function (org) {
          const rec = freezeMap[org.id] || { status: "Not started", date: "" };
          const status = rec.status || "Not started";
          if (status === "Confirmed") freezes.confirmed++;
          else if (status === "Submitted") freezes.submitted++;
          else if (status === "Temporarily lifted") freezes.temporarilyLifted++;
          else freezes.notStarted++;
          if (status !== "Not started" || rec.date) {
            freezes.items.push({
              bureau: org.id,
              status: status,
              date: rec.date || "",
            });
          }
        });

        const brokerList = global.BROKERS || [];
        const brokerMap = (profile && profile.brokers) || {};
        const brokers = {
          total: brokerList.length,
          confirmedOptedOut: 0,
          submittedPending: 0,
          listingFound: 0,
          justNamed: 0,
        };
        brokerList.forEach(function (b) {
          const s = brokerMap[b.name] || "Just named";
          if (s === "Confirmed opted out") brokers.confirmedOptedOut++;
          else if (s === "Submitted / pending verification") brokers.submittedPending++;
          else if (s === "Listing found but not removed") brokers.listingFound++;
          else brokers.justNamed++;
        });

        const disputesList = (profile && profile.disputes) || [];
        const disputes = {
          total: disputesList.length,
          draft: 0,
          sentAwaiting: 0,
          resultsReceived: 0,
          resolved: 0,
          closed: 0,
          datesSent: [],
          followUpDates: [],
        };
        disputesList.forEach(function (d) {
          const st = d.status || "";
          if (st === "Draft") disputes.draft++;
          else if (st === "Sent / awaiting response") disputes.sentAwaiting++;
          else if (st === "Results received") disputes.resultsReceived++;
          else if (st === "Resolved") disputes.resolved++;
          else if (st === "Closed") disputes.closed++;
          if (d.dateSent) disputes.datesSent.push(d.dateSent);
          if (d.dueDate) disputes.followUpDates.push(d.dueDate);
        });
        disputes.datesSent.sort();
        disputes.followUpDates.sort();

        return { freezes: freezes, optOuts: brokers, disputes: disputes };
      }

      function combine(parts) {
        const out = {
          freezes: { total: 0, confirmed: 0, submitted: 0, temporarilyLifted: 0, notStarted: 0 },
          optOuts: { total: 0, confirmedOptedOut: 0, submittedPending: 0, listingFound: 0, justNamed: 0 },
          disputes: { total: 0, draft: 0, sentAwaiting: 0, resultsReceived: 0, resolved: 0, closed: 0, datesSent: [], followUpDates: [] },
        };
        parts.forEach(function (part) {
          ["confirmed", "submitted", "temporarilyLifted", "notStarted"].forEach(function (k) {
            out.freezes[k] += part.freezes[k];
          });
          out.freezes.total += part.freezes.total;
          ["confirmedOptedOut", "submittedPending", "listingFound", "justNamed"].forEach(function (k) {
            out.optOuts[k] += part.optOuts[k];
          });
          out.optOuts.total += part.optOuts.total;
          ["draft", "sentAwaiting", "resultsReceived", "resolved", "closed", "total"].forEach(function (k) {
            out.disputes[k] += part.disputes[k];
          });
          out.disputes.datesSent = out.disputes.datesSent.concat(part.disputes.datesSent);
          out.disputes.followUpDates = out.disputes.followUpDates.concat(part.disputes.followUpDates);
        });
        out.disputes.datesSent.sort();
        out.disputes.followUpDates.sort();
        return out;
      }

      const selected = summarize(state.people[state.activePerson]);
      const allParts = Object.keys(state.people).map(function (id) {
        return summarize(state.people[id]);
      });
      const payload = {
        type: "progress-summary",
        version: 1,
        generatedAt: new Date().toISOString(),
        note: "Counts and dates only. No names, addresses, emails, phone numbers, account numbers, or report numbers are included. This file is optional and is shared only if you choose to send it.",
        scope: scope === "all" ? "all-profiles-combined-and-unlabeled" : "selected-profile-unlabeled",
      };
      if (scope === "all") {
        payload.combined = combine(allParts);
        payload.profiles = allParts.map(function (part, i) {
          return { label: "profile-" + (i + 1), counts: part };
        });
      } else {
        payload.profile = { label: "selected-profile", counts: selected };
      }
      return payload;
    },
    exportProgressSummary: function (scope) {
      return JSON.stringify(this.progressSummary(scope), null, 2);
    },
    exportJSON: function () {

      return JSON.stringify(state, null, 2);
    },
    importJSON: function (text) {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") throw new Error("That file is not a valid backup.");
      state = migrate(parsed);
      save(state);
      document.dispatchEvent(new CustomEvent("person-change", { detail: state.activePerson }));
    },
    resetAll: function () {
      state = defaultState();
      save(state);
      document.dispatchEvent(new CustomEvent("person-change", { detail: state.activePerson }));
    },
    counts: {
      brokers: function (personId) {
        const id = personId || state.activePerson;
        const map = state.people[id].brokers || {};
        const list = global.BROKERS || [];
        const counts = { total: list.length, done: 0, pending: 0, todo: 0 };
        list.forEach(function (b) {
          const s = map[b.name] || "Just named";
          if (s === "Confirmed opted out") counts.done++;
          else if (s === "Submitted / pending verification") counts.pending++;
          else counts.todo++;
        });
        return counts;
      },
      freezes: function (personId) {
        const id = personId || state.activePerson;
        const map = state.people[id].freezes || {};
        const list = global.FREEZE_ORGS || [];
        const counts = { total: list.length, done: 0, pending: 0, todo: 0, lifted: 0 };
        list.forEach(function (o) {
          const s = (map[o.id] && map[o.id].status) || "Not started";
          if (s === "Confirmed") counts.done++;
          else if (s === "Submitted") counts.pending++;
          else if (s === "Temporarily lifted") counts.lifted++;
          else counts.todo++;
        });
        return counts;
      },
    },
  };

  global.Store = Store;
})(window);
