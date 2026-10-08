/**
 * HelioForecast.AI - Frontend Logic & Real-Time ML Interaction
 */

// Global state
let currentFeatures = [];
let simDebounceTimer = null;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
    setupEventListeners();
  });
} else {
  initDashboard();
  setupEventListeners();
}

async function initDashboard() {
  await Promise.all([
    loadOverview(),
    loadModels(),
    loadFeatures()
  ]);
  // Run initial simulation calculation
  updateSimulation();
}

/* ==========================================================
   1. OVERVIEW & LIVE TELEMETRY
   ========================================================== */
async function loadOverview() {
  try {
    const res = await fetch("/api/overview");
    const data = await res.json();

    // NOAA GOES Primary Sensor
    if (data.noaa_telemetry) {
      const xray = data.noaa_telemetry;
      const classBadge = document.getElementById("goes-class-badge");
      const category = document.getElementById("goes-category");
      const timestamp = document.getElementById("goes-timestamp");

      if (classBadge) classBadge.textContent = xray.flux_class;
      if (category) category.textContent = xray.category;
      if (timestamp) timestamp.textContent = `Observed: ${xray.time_tag}`;

      // Update Spectrum Scale active segment
      updateFlareScale(xray.flux_class);
    }

    // Active Regions Cards
    if (data.active_regions) {
      renderActiveRegions(data.active_regions);
    }

    // Best Model Quick Stats
    if (data.best_model) {
      const tssEl = document.getElementById("best-tss-stat");
      const recEl = document.getElementById("best-recall-stat");
      if (tssEl) tssEl.textContent = data.best_model.tss.toFixed(3);
      if (recEl) recEl.textContent = `${(data.best_model.recall * 100).toFixed(1)}%`;
    }
  } catch (err) {
    console.error("Failed to load overview data:", err);
  }
}

function updateFlareScale(fluxClass) {
  const segments = document.querySelectorAll(".scale-segment");
  segments.forEach(s => s.classList.remove("active"));

  const letter = fluxClass.charAt(0).toUpperCase();
  const targetSeg = document.querySelector(`.scale-segment.seg-${letter.toLowerCase()}`);
  if (targetSeg) {
    targetSeg.classList.add("active");
  }

  const indicator = document.getElementById("scale-indicator-text");
  if (indicator) {
    const names = {
      A: "A-Class (Quiet)",
      B: "B-Class (Background)",
      C: "C-Class (Active Minor)",
      M: "M-Class (Major Radio Blackout Warning)",
      X: "X-Class (Extreme Radiation Storm)"
    };
    indicator.textContent = names[letter] || `${letter}-Class`;
  }
}

function renderActiveRegions(regions) {
  const container = document.getElementById("regions-container");
  if (!container) return;

  if (!regions || regions.length === 0) {
    container.innerHTML = `<div class="region-card"><p>No active regions currently detected near central solar disk.</p></div>`;
    return;
  }

  container.innerHTML = regions.map(ar => {
    const pct = ar.prob_pct;
    const isCritical = pct >= 60;
    const isQuiet = pct < 20;
    const riskClass = isCritical ? "critical" : (isQuiet ? "quiet" : "elevated");

    // Circumference for r=42 is ~264
    const radius = 42;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (pct / 100) * circ;

    return `
      <div class="region-card ${riskClass}">
        <div class="region-card-top">
          <span class="ar-num-title">NOAA AR ${ar.noaa_ar}</span>
          <span class="risk-pill ${riskClass}">${ar.risk_level} Risk</span>
        </div>

        <div class="region-card-body">
          <div class="gauge-wrapper">
            <svg class="gauge-svg" viewBox="0 0 100 100">
              <circle class="gauge-bg" cx="50" cy="50" r="${radius}"></circle>
              <circle class="gauge-progress" cx="50" cy="50" r="${radius}" 
                style="stroke: ${ar.risk_color}; stroke-dasharray: ${circ}; stroke-dashoffset: ${offset};"></circle>
            </svg>
            <div class="gauge-center-text">
              <span class="gauge-pct" style="color: ${ar.risk_color};">${pct}%</span>
              <span class="gauge-sub">24h PROB</span>
            </div>
          </div>

          <div class="region-details">
            <span class="region-time">Telemetry: ${ar.t_rec}</span>
            <p class="region-notes">${ar.notes || "SDO SHARP vector magnetogram telemetry evaluated."}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ==========================================================
   2. MODEL BENCHMARKS TABLE
   ========================================================== */
async function loadModels() {
  try {
    const res = await fetch("/api/models");
    const data = await res.json();
    const tbody = document.getElementById("models-tbody");
    if (!tbody || !data.models) return;

    tbody.innerHTML = data.models.map(m => {
      const isWinner = m.is_best;
      return `
        <tr class="${isWinner ? 'winner-row' : ''}">
          <td>
            <strong>${m.model}</strong>
            ${isWinner ? '<span class="badge-winner">WINNER</span>' : ''}
          </td>
          <td><strong>${m.tss.toFixed(3)}</strong></td>
          <td>${m.hss.toFixed(3)}</td>
          <td>${(m.recall * 100).toFixed(1)}%</td>
          <td>${(m.precision * 100).toFixed(1)}%</td>
          <td>${(m.accuracy * 100).toFixed(1)}%</td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Failed to load models data:", err);
  }
}

/* ==========================================================
   3. PHYSICS FEATURE EXPLORER
   ========================================================== */
async function loadFeatures() {
  try {
    const res = await fetch("/api/features");
    const data = await res.json();
    currentFeatures = data.features || [];

    const container = document.getElementById("features-container");
    if (!container || currentFeatures.length === 0) return;

    // Max importance for relative bar width
    const maxImp = Math.max(...currentFeatures.map(f => f.importance), 0.1);

    container.innerHTML = currentFeatures.map(feat => {
      const widthPct = Math.max((feat.importance / maxImp) * 100, 3);
      return `
        <div class="feature-bar-row" title="${feat.cheat_sheet} • Click to read physics description" onclick="toggleFeatureDetail('${feat.code}')">
          <div class="bar-meta">
            <span class="bar-code">${feat.code}</span>
            <span class="bar-name-sub">${feat.cheat_sheet}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${widthPct}%;"></div>
          </div>
          <span class="bar-val">${feat.importance.toFixed(3)}</span>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Failed to load features data:", err);
  }
}

function toggleFeatureDetail(code) {
  const feat = currentFeatures.find(f => f.code === code);
  if (!feat) return;
  alert(`FEATURE: ${feat.code} (${feat.name})\n\nPLAIN ENGLISH:\n"${feat.cheat_sheet}"\n\nPHYSICS:\n${feat.description}\n\nUNITS: ${feat.unit || 'dimensionless'}\nMODEL COEFFICIENT: ${feat.importance}`);
}

/* ==========================================================
   4. INTERACTIVE SIMULATOR LOGIC
   ========================================================== */
function setupEventListeners() {
  // Sync Button
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", handleRefresh);
  }

  // Simulator Sliders
  const sliders = [
    { id: "sl-r-val", badge: "val-r-val", format: v => Number(v).toFixed(2) },
    { id: "sl-totusjh", badge: "val-totusjh", format: v => Math.round(v) },
    { id: "sl-totpot", badge: "val-totpot", format: v => `${Number(v).toFixed(1)} × 10²²` },
    { id: "sl-area", badge: "val-area", format: v => Math.round(v) },
    { id: "sl-meanshr", badge: "val-meanshr", format: v => `${Number(v).toFixed(1)}°` }
  ];

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const badge = document.getElementById(s.badge);
    if (el) {
      el.addEventListener("input", () => {
        if (badge) badge.textContent = s.format(el.value);
        triggerDebouncedSim();
      });
    }
  });

  // Simulator Presets
  const presetButtons = document.querySelectorAll(".btn-preset");
  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      presetButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyPreset(btn.dataset.preset);
    });
  });
}

function applyPreset(preset) {
  const setVal = (id, badgeId, val, fmt) => {
    const el = document.getElementById(id);
    const badge = document.getElementById(badgeId);
    if (el) el.value = val;
    if (badge) badge.textContent = fmt ? fmt(val) : val;
  };

  if (preset === "quiet") {
    setVal("sl-r-val", "val-r-val", 1.2, v => Number(v).toFixed(2));
    setVal("sl-totusjh", "val-totusjh", 65, v => Math.round(v));
    setVal("sl-totpot", "val-totpot", 0.8, v => `${Number(v).toFixed(1)} × 10²²`);
    setVal("sl-area", "val-area", 85, v => Math.round(v));
    setVal("sl-meanshr", "val-meanshr", 19.5, v => `${Number(v).toFixed(1)}°`);
  } else if (preset === "moderate") {
    setVal("sl-r-val", "val-r-val", 3.16, v => Number(v).toFixed(2));
    setVal("sl-totusjh", "val-totusjh", 420, v => Math.round(v));
    setVal("sl-totpot", "val-totpot", 5.1, v => `${Number(v).toFixed(1)} × 10²²`);
    setVal("sl-area", "val-area", 285, v => Math.round(v));
    setVal("sl-meanshr", "val-meanshr", 28.5, v => `${Number(v).toFixed(1)}°`);
  } else if (preset === "explosive") {
    setVal("sl-r-val", "val-r-val", 4.95, v => Number(v).toFixed(2));
    setVal("sl-totusjh", "val-totusjh", 2600, v => Math.round(v));
    setVal("sl-totpot", "val-totpot", 12.5, v => `${Number(v).toFixed(1)} × 10²²`);
    setVal("sl-area", "val-area", 1450, v => Math.round(v));
    setVal("sl-meanshr", "val-meanshr", 46.0, v => `${Number(v).toFixed(1)}°`);
  }

  triggerDebouncedSim();
}

function triggerDebouncedSim() {
  clearTimeout(simDebounceTimer);
  simDebounceTimer = setTimeout(updateSimulation, 120);
}

async function updateSimulation() {
  const rVal = parseFloat(document.getElementById("sl-r-val")?.value || 3.16);
  const totusjh = parseFloat(document.getElementById("sl-totusjh")?.value || 415);
  const totpot = parseFloat(document.getElementById("sl-totpot")?.value || 5.1) * 1e22;
  const area = parseFloat(document.getElementById("sl-area")?.value || 282);
  const meanshr = parseFloat(document.getElementById("sl-meanshr")?.value || 28.3);

  const payload = {
    R_VALUE: rVal,
    TOTUSJH: totusjh,
    TOTPOT: totpot,
    AREA_ACR: area,
    MEANSHR: meanshr
  };

  try {
    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    const probPct = result.probability_pct;
    const probDisp = document.getElementById("sim-prob-display");
    const tierBadge = document.getElementById("sim-tier-badge");
    const titleEl = document.getElementById("sim-status-title");
    const descEl = document.getElementById("sim-status-desc");
    const fillCircle = document.getElementById("meter-fill-circle");
    const driversList = document.getElementById("sim-drivers-list");

    if (probDisp) probDisp.textContent = `${probPct}%`;
    if (tierBadge) {
      tierBadge.textContent = `${result.risk_tier} Risk`;
      tierBadge.style.color = result.color;
      tierBadge.style.background = `${result.color}22`;
    }
    if (titleEl) titleEl.textContent = result.badge;
    if (descEl) {
      if (probPct >= 70) {
        descEl.textContent = "High concentration of opposite-polarity magnetic flux along sharp inversion lines, with intense field twist capable of immediate reconnection.";
      } else if (probPct >= 30) {
        descEl.textContent = "Moderate shear and energy accumulation. Heightened vigilance recommended for solar active region growth.";
      } else {
        descEl.textContent = "Potential field configuration with minimal non-neutralized current or stress. Flare probability remains low.";
      }
    }

    // SVG radial fill: radius = 82, circumference = 2 * PI * 82 ≈ 515.2
    if (fillCircle) {
      const circ = 515.2;
      const offset = circ - (probPct / 100) * circ;
      fillCircle.style.strokeDashoffset = offset;
      fillCircle.style.stroke = result.color;
    }

    // Top drivers
    if (driversList && result.top_drivers) {
      driversList.innerHTML = result.top_drivers.map(d => `
        <li>
          <span><strong>${d.feature}</strong> (${d.description})</span>
          <span style="font-family: var(--font-mono); color: ${d.impact > 0 ? '#ff9d00' : '#9cb1d1'};">
            ${d.impact > 0 ? '+' : ''}${d.impact.toFixed(2)}
          </span>
        </li>
      `).join("");
    }
  } catch (err) {
    console.error("Simulation prediction failed:", err);
  }
}

/* ==========================================================
   5. SYNC / REFRESH HANDLER
   ========================================================== */
async function handleRefresh() {
  const btn = document.getElementById("refresh-btn");
  const icon = btn?.querySelector(".spin-target");
  if (icon) icon.classList.add("spin-anim");
  if (btn) btn.disabled = true;

  try {
    const res = await fetch("/api/refresh-live", { method: "POST" });
    const data = await res.json();
    await loadOverview();
  } catch (err) {
    console.error("Refresh error:", err);
  } finally {
    if (icon) icon.classList.remove("spin-anim");
    if (btn) btn.disabled = false;
  }
}

/* ==========================================================
   6. LIGHTBOX MODAL
   ========================================================== */
function openLightbox(src, caption) {
  const modal = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-caption");
  if (modal && img) {
    img.src = src;
    if (cap) cap.textContent = caption || "";
    modal.classList.add("active");
  }
}

function closeLightbox() {
  const modal = document.getElementById("lightbox-modal");
  if (modal) modal.classList.remove("active");
}
