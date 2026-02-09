const state = {
  substances: {},
  combos: {},
  interactions: {
    "low risk & synergy": {
      image: "LRS.png",
      text: "These drugs work together to cause an effect greater than the sum of its parts, and are not likely to cause adverse or undesirable reactions when used carefully.",
    },
    "low risk & no synergy": {
      image: "LRNS.png",
      text: "This combination is usually lower risk and does not create meaningful synergy.",
    },
    "low risk & decrease": {
      image: "LRD.png",
      text: "Effects are additive. The combination is unlikely to cause adverse or undesirable reactions beyond expected effects.",
    },
    caution: {
      image: "C.png",
      text: "These combinations are not usually physically harmful, but may produce undesirable effects like discomfort or overstimulation.",
    },
    unsafe: {
      image: "U.png",
      text: "There is considerable risk of physical harm when taking these combinations, and they should be avoided where possible.",
    },
    dangerous: {
      image: "D.png",
      text: "These combinations are considered extremely harmful and should always be avoided.",
    },
    "serotonin syndrome": {
      image: "U.png",
      text: "This combination carries a strong serotonergic risk. Avoid due to potential serotonin syndrome.",
    },
    fallback: {
      image: "LRNS.png",
      text: "No interaction details available.",
    },
  },
  addEmos: {
    "Oral oder nasal": "Oral oder nasal",
    Oral: "Oral",
    Inhalation: "Inhalation",
    "Nasal oder intravenos, seltener auch oral": "Nasal, intravenos, seltener auch oral",
    "Nasal oder intravenoes, seltener auch oral": "Nasal, intravenos, seltener auch oral",
    "Oral oder sublingual": "Oral oder sublingual",
    "Nasal, intravenos oder geraucht als Crack": "Nasal, intravenos oder geraucht als Crack",
    "Nasal, intravenoes oder geraucht als Crack": "Nasal, intravenos oder geraucht als Crack",
    "Oral (gekaute Pilze, als Tee oder als Pulver in Kapseln)": "Oral (gekaute Pilze, als Tee oder als Pulver in Kapseln)",
  },
};

const dosisOrder = ["Leichte Dosis", "Mittlere Dosis", "Hohe Dosis"];
const wirkOrder = ["Wirkungseintritt", "Peak", "Wirkdauer"];

async function bootstrap() {
  bindNavigation();
  initSidebarToggle();
  try {
    const [subsRes, comboRes] = await Promise.all([
      fetch("assets/data/substances.json"),
      fetch("assets/data/combo_beta.json"),
    ]);
    state.substances = await subsRes.json();
    state.combos = await comboRes.json();
    initSubstances();
    initCombos();
  } catch (error) {
    showDataLoadError();
  }
  initDonate();
}

function bindNavigation() {
  const shell = document.querySelector(".app-shell");
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((node) => node.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".page").forEach((node) => node.classList.remove("active"));
      const page = document.querySelector(`.page[data-page="${btn.dataset.page}"]`);
      if (page) {
        page.classList.add("active");
        window.scrollTo({ top: 0, behavior: "auto" });
      }
      if (shell) {
        shell.classList.remove("drawer-open");
      }
    });
  });
}

function initSidebarToggle() {
  const shell = document.querySelector(".app-shell");
  const close = document.getElementById("sidebar-close");
  const open = document.getElementById("sidebar-open");
  const overlay = document.getElementById("sidebar-overlay");
  if (!shell || !close || !open || !overlay) return;
  close.addEventListener("click", () => {
    shell.classList.remove("drawer-open");
  });
  open.addEventListener("click", () => {
    shell.classList.toggle("drawer-open");
  });
  overlay.addEventListener("click", () => {
    shell.classList.remove("drawer-open");
  });
}

function initSubstances() {
  const select = document.getElementById("substance-select");
  const names = Object.keys(state.substances).sort((a, b) => a.localeCompare(b, "de"));
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  select.addEventListener("change", (event) => renderSubstance(event.target.value));
  renderSubstance(names[0]);
}

function renderSubstance(name) {
  const data = state.substances[name];
  if (!data) return;

  setText("substance-name", name);
  setText("substance-desc", asText(data.Beschreibung));
  setText("dose-comment", asText(data["Dosierung Kommentar"] || data["Dosierung comment"] || data.comment));
  setText("konsumform", formatKonsumform(asText(data.Konsumform)));
  setText("erscheinungsform", safeCapitalize(asText(data.Erscheinungsform)));
  setText("toleranz", asText(data.Toleranz));
  renderRichText("saferuse", asText(data["VIVID Safer-Use Tipps"]));

  renderDoseTable(data);
  renderDurationTable(data);
  renderWirkung(data);
  renderKombinationen(data);
}

function renderDoseTable(data) {
  const byMode = data.dose_dict || {
    Oral: {
      "Leichte Dosis": data["Dosierung Oral Leichte Dosis"],
      "Mittlere Dosis": data["Dosierung Oral Mittlere Dosis"],
      "Hohe Dosis": data["Dosierung Oral Hohe Dosis"],
    },
    Nasal: {
      "Leichte Dosis": data["Dosierung Nasal Leichte Dosis"],
      "Mittlere Dosis": data["Dosierung Nasal Mittlere Dosis"],
      "Hohe Dosis": data["Dosierung Nasal Hohe Dosis"],
    },
    Inhaliert: {
      "Leichte Dosis": data["Dosierung Inhaliert Leichte Dosis"],
      "Mittlere Dosis": data["Dosierung Inhaliert Mittlere Dosis"],
      "Hohe Dosis": data["Dosierung Inhaliert Hohe Dosis"],
    },
    "Geraucht/Verdampft": {
      "Leichte Dosis": data["Dosierung Geraucht/Verdampft Leichte Dosis"],
      "Mittlere Dosis": data["Dosierung Geraucht/Verdampft Mittlere Dosis"],
      "Hohe Dosis": data["Dosierung Geraucht/Verdampft Hohe Dosis"],
    },
  };
  addMissingDoseRoutes(byMode, data);

  const modes = Object.keys(byMode).filter((mode) => hasAnyValue(dosisOrder.map((row) => byMode[mode]?.[row])));
  const html = createTable(modes, dosisOrder, byMode);
  document.getElementById("dose-table").innerHTML = html;
}

function renderDurationTable(data) {
  const byMode = data.wirkdauer_dict || {
    Oral: {
      Wirkungseintritt: data["Wirkdauer Oral Wirkungseintritt"],
      Peak: data["Wirkdauer Oral Peak"],
      Wirkdauer: data["Wirkdauer Oral Wirkdauer"],
    },
    Nasal: {
      Wirkungseintritt: data["Wirkdauer Nasal Wirkungseintritt"],
      Peak: data["Wirkdauer Nasal Peak"],
      Wirkdauer: data["Wirkdauer Nasal Wirkdauer"],
    },
    Inhaliert: {
      Wirkungseintritt: data["Wirkdauer Inhaliert Wirkungseintritt"],
      Peak: data["Wirkdauer Inhaliert Peak"],
      Wirkdauer: data["Wirkdauer Inhaliert Wirkdauer"],
    },
    "Geraucht/Verdampft": {
      Wirkungseintritt: data["Wirkdauer Geraucht/Verdampft Wirkungseintritt"],
      Peak: data["Wirkdauer Geraucht/Verdampft Peak"],
      Wirkdauer: data["Wirkdauer Geraucht/Verdampft Wirkdauer"],
    },
  };
  addMissingWirkRoutes(byMode, data);

  const modes = Object.keys(byMode).filter((mode) => hasAnyValue(wirkOrder.map((row) => byMode[mode]?.[row])));
  const html = createTable(modes, wirkOrder, byMode);
  document.getElementById("duration-table").innerHTML = html;
}

function createTable(columns, rows, model) {
  const header = `<thead><tr><th></th>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>`;
  const body = rows
    .map((row) => {
      const cells = columns.map((column) => `<td>${escapeHtml(displayValue(model[column]?.[row]))}</td>`).join("");
      return `<tr><th>${escapeHtml(row)}</th>${cells}</tr>`;
    })
    .join("");
  return `<div class="table-wrap"><table>${header}<tbody>${body}</tbody></table></div>`;
}

function addMissingDoseRoutes(byMode, data) {
  const routes = [
    { label: "Oral", key: "Dosierung Oral" },
    { label: "Nasal", key: "Dosierung Nasal" },
    { label: "Inhaliert", key: "Dosierung Inhaliert" },
    { label: "Geraucht/Verdampft", key: "Dosierung Geraucht/Verdampft" },
  ];
  routes.forEach((route) => {
    if (byMode[route.label]) return;
    const routeData = {
      "Leichte Dosis": data[`${route.key} Leichte Dosis`],
      "Mittlere Dosis": data[`${route.key} Mittlere Dosis`],
      "Hohe Dosis": data[`${route.key} Hohe Dosis`],
    };
    if (hasAnyValue(Object.values(routeData))) {
      byMode[route.label] = routeData;
    }
  });
}

function addMissingWirkRoutes(byMode, data) {
  const routes = [
    { label: "Oral", key: "Wirkdauer Oral" },
    { label: "Nasal", key: "Wirkdauer Nasal" },
    { label: "Inhaliert", key: "Wirkdauer Inhaliert" },
    { label: "Geraucht/Verdampft", key: "Wirkdauer Geraucht/Verdampft" },
  ];
  routes.forEach((route) => {
    if (byMode[route.label]) return;
    const routeData = {
      Wirkungseintritt: data[`${route.key} Wirkungseintritt`],
      Peak: data[`${route.key} Peak`],
      Wirkdauer: data[`${route.key} Wirkdauer`],
    };
    if (hasAnyValue(Object.values(routeData))) {
      byMode[route.label] = routeData;
    }
  });
}

function renderWirkung(data) {
  const pos = data["Wirkung Positiv"] || parseSegment(data.Wirkung, "positiv");
  const neutral = data["Wirkung Neutral"] || parseSegment(data.Wirkung, "neutral");
  const neg = data["Wirkung Negativ"] || parseSegment(data.Wirkung, "negativ");

  setText("wirkung-positiv", asText(pos));
  setText("wirkung-neutral", asText(neutral));
  setText("wirkung-negativ", asText(neg));
}

function renderKombinationen(data) {
  const up = data["Kombinationen Verstarkt"] || data["Kombinationen Verstärkt"] || parseSegment(data.Kombinationen, "verstarkt") || parseSegment(data.Kombinationen, "verstärkt");
  const down = data["Kombinationen Verringert"] || parseSegment(data.Kombinationen, "verringert");
  const warn = data["Kombinationen Gefahrlich"] || data["Kombinationen Gefährlich"] || parseSegment(data.Kombinationen, "gefahrlich") || parseSegment(data.Kombinationen, "gefährlich");

  setText("combo-up", asText(up));
  setText("combo-down", asText(down));
  setText("combo-warning", asText(warn));
}

function parseSegment(text, keyword) {
  if (!text) return "";
  const normalizedKeyword = normalizeText(keyword);
  const parts = String(text)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const clean = removeEmojiCodes(part);
    if (normalizeText(clean).includes(normalizedKeyword)) {
      const index = clean.indexOf(":");
      if (index < 0) return clean;
      const afterFirst = clean.slice(index + 1).trim();
      const secondIndex = afterFirst.indexOf(":");
      return secondIndex >= 0 ? afterFirst.slice(secondIndex + 1).trim() : afterFirst;
    }
  }

  return "";
}

function removeEmojiCodes(value) {
  return String(value).replace(/:[a-z_]+:/gi, "").trim();
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeKonsumform(value) {
  if (!value) return "-";
  const compact = decodeEmojiText(value).replace(/\s+/g, " ").trim();
  const matchKey = Object.keys(state.addEmos).find((key) => normalizeText(key) === normalizeText(compact));
  return safeCapitalize(state.addEmos[matchKey] || compact);
}

function formatKonsumform(value) {
  if (!value) return "-";
  const withEmoji = replaceEmojiCodes(value);
  const normalized = normalizeKonsumform(withEmoji);
  return normalized;
}

function replaceEmojiCodes(value) {
  return String(value)
    .replace(/:lips:/gi, "💋")
    .replace(/:pig_nose:/gi, "🐽")
    .replace(/:dash:/gi, "💨")
    .replace(/:syringe:/gi, "💉")
    .replace(/:tongue:/gi, "👅")
    .replace(/:fog:/gi, "🌫️")
    .replace(/:mushroom:/gi, "🍄")
    .replace(/:tea:/gi, "🍵")
    .replace(/:pill:/gi, "💊");
}

function decodeEmojiText(value) {
  return String(value)
    .replace(/:lips:/gi, " oral")
    .replace(/:pig_nose:/gi, " nasal")
    .replace(/:dash:/gi, " inhalation")
    .replace(/:syringe:/gi, " intravenos")
    .replace(/:tongue:/gi, " sublingual")
    .replace(/:fog:/gi, " geraucht")
    .replace(/:mushroom:/gi, " Pilze")
    .replace(/:tea:/gi, " Tee")
    .replace(/:pill:/gi, " Kapseln");
}

function initCombos() {
  const selectA = document.getElementById("combo-a");
  const selectB = document.getElementById("combo-b");
  const baseOptions = Object.keys(state.combos).sort((a, b) => a.localeCompare(b, "en"));

  baseOptions.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    selectA.appendChild(option);
  });

  selectA.addEventListener("change", () => {
    fillComboPartners(selectA.value, selectB);
    renderCombo();
  });
  selectB.addEventListener("change", renderCombo);

  fillComboPartners(baseOptions[0], selectB);
  renderCombo();
}

function fillComboPartners(source, targetSelect) {
  const options = Object.keys(state.combos[source] || {}).sort((a, b) => a.localeCompare(b, "en"));
  targetSelect.innerHTML = "";
  options.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    targetSelect.appendChild(option);
  });
}

function renderCombo() {
  const a = document.getElementById("combo-a").value;
  const b = document.getElementById("combo-b").value;
  const record = state.combos[a]?.[b];
  if (!record) return;

  const statusKey = normalizeText(record.status || "fallback");
  const config = state.interactions[statusKey] || state.interactions.fallback;

  setText("combo-title", `${titleCase(a)} + ${titleCase(b)}`);
  setText("combo-status", record.status || "Unknown");
  setText("combo-description", config.text);

  const image = document.getElementById("combo-image");
  image.src = `assets/img/${config.image}`;
  image.alt = config.text;

  const note = document.getElementById("combo-note");
  if (record.note) {
    note.textContent = `Note: ${record.note}`;
    note.hidden = false;
  } else {
    note.hidden = true;
    note.textContent = "";
  }
}

function initDonate() {
  const toggle = document.getElementById("bank-toggle");
  const details = document.getElementById("bank-details");
  toggle.addEventListener("click", () => {
    details.hidden = !details.hidden;
  });
}

function showDataLoadError() {
  const target = document.getElementById("substance-desc");
  if (target) {
    target.textContent =
      "Die Daten konnten nicht geladen werden. Bitte starte die Seite über einen lokalen Server, damit JSON-Dateien geladen werden dürfen.";
  }
}

function renderRichText(id, text) {
  const container = document.getElementById(id);
  if (!container) return;
  const source = String(text || "").trim();
  if (!source) {
    container.textContent = "-";
    return;
  }

  const lines = source.split(/\r?\n/);
  const fragments = [];
  let listItems = [];
  let paragraph = [];
  let quote = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    fragments.push(`<p>${escapeHtml(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    fragments.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  const flushQuote = () => {
    if (!quote.length) return;
    fragments.push(`<blockquote>${escapeHtml(quote.join(" "))}</blockquote>`);
    quote = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      return;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      quote.push(trimmed.replace(/^>\s?/, ""));
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      listItems.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }

    flushList();
    flushQuote();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  flushQuote();

  container.innerHTML = fragments.join("");
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = displayValue(value);
  }
}

function displayValue(value) {
  if (value === null || value === undefined) return "-";
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length ? text : "-";
}

function asText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function hasAnyValue(values) {
  return values.some((value) => value !== null && value !== undefined && String(value).trim() !== "");
}

function safeCapitalize(value) {
  const text = asText(value);
  if (!text) return "-";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function titleCase(value) {
  const text = asText(value);
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

document.addEventListener("DOMContentLoaded", bootstrap);
