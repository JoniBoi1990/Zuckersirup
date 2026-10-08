/**
 * Interaktives Lernlabor: Glukosesirup DE ~44
 * JavaScript Logic: Tabs, Kinetics Simulator, DE Calculator, Stepper
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthGate();
  initTabs();
  initKineticsSimulator();
  initDeCalculator();
  initTitrationStepper();
});

/* ==========================================================================
   1. AUTHENTICATION / PASSWORD GATE (DE44%)
   ========================================================================== */
const LAB_PASSWORD = "DE44%";

function isLabUnlocked() {
  return sessionStorage.getItem('lab_unlocked_de44') === 'true';
}

function initAuthGate() {
  const inputLabPassword = document.getElementById('inputLabPassword');
  const btnSubmitPassword = document.getElementById('btnSubmitPassword');
  const unlockFeedback = document.getElementById('unlockFeedback');
  const passwordGateSection = document.getElementById('passwordGateSection');
  const badgeStatusDot = document.getElementById('badgeStatusDot');
  const headerAuthText = document.getElementById('headerAuthText');
  const btnRelockLab = document.getElementById('btnRelockLab');

  function updateLockUI(unlocked) {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId !== 'tab-startseite') {
        const lockIcon = btn.querySelector('.lock-icon');
        if (unlocked) {
          btn.classList.remove('is-locked');
          if (lockIcon) lockIcon.style.display = 'none';
        } else {
          btn.classList.add('is-locked');
          if (lockIcon) lockIcon.style.display = 'inline-block';
        }
      }
    });

    if (badgeStatusDot && headerAuthText) {
      if (unlocked) {
        badgeStatusDot.classList.remove('locked');
        badgeStatusDot.classList.add('unlocked');
        headerAuthText.textContent = 'Labor freigeschaltet';
        if (btnRelockLab) btnRelockLab.classList.remove('hidden');
      } else {
        badgeStatusDot.classList.remove('unlocked');
        badgeStatusDot.classList.add('locked');
        headerAuthText.textContent = 'Planungsphase';
        if (btnRelockLab) btnRelockLab.classList.add('hidden');
      }
    }
  }

  // Initial check
  updateLockUI(isLabUnlocked());

  // Password submission
  function handleUnlock() {
    if (!inputLabPassword) return;
    const entered = inputLabPassword.value.trim();

    if (entered === LAB_PASSWORD) {
      sessionStorage.setItem('lab_unlocked_de44', 'true');
      updateLockUI(true);

      if (passwordGateSection) {
        passwordGateSection.classList.remove('shake');
        passwordGateSection.classList.add('unlocked-pulse');
      }

      if (unlockFeedback) {
        unlockFeedback.className = 'unlock-feedback success';
        unlockFeedback.textContent = '🎉 Passwort bestätigt! Der Kinetik-Simulator und alle Analytik-Module wurden freigeschaltet.';
      }

      // Automatically switch to the Kinetics tab after a short celebration
      setTimeout(() => {
        const kinetikBtn = document.querySelector('.nav-btn[data-tab="tab-kinetik"]');
        if (kinetikBtn) {
          kinetikBtn.click();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 900);

    } else {
      if (passwordGateSection) {
        passwordGateSection.classList.remove('shake');
        void passwordGateSection.offsetWidth; // trigger reflow
        passwordGateSection.classList.add('shake');
      }
      if (unlockFeedback) {
        unlockFeedback.className = 'unlock-feedback error';
        unlockFeedback.textContent = '❌ Ungültiges Passwort. Besprecht euren Syntheseplan zuerst mit der Lehrkraft.';
      }
      inputLabPassword.focus();
    }
  }

  if (btnSubmitPassword) {
    btnSubmitPassword.addEventListener('click', handleUnlock);
  }

  if (inputLabPassword) {
    inputLabPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUnlock();
      }
    });
  }

  // Relock button
  if (btnRelockLab) {
    btnRelockLab.addEventListener('click', () => {
      sessionStorage.removeItem('lab_unlocked_de44');
      updateLockUI(false);
      if (inputLabPassword) inputLabPassword.value = '';
      if (unlockFeedback) {
        unlockFeedback.className = 'unlock-feedback';
        unlockFeedback.textContent = '';
      }
      const startBtn = document.querySelector('.nav-btn[data-tab="tab-startseite"]');
      if (startBtn) startBtn.click();
    });
  }
}

/* ==========================================================================
   2. TAB NAVIGATION
   ========================================================================== */
function initTabs() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.tab-panel');
  const passwordGateSection = document.getElementById('passwordGateSection');
  const inputLabPassword = document.getElementById('inputLabPassword');
  const unlockFeedback = document.getElementById('unlockFeedback');

  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-tab');

      // Intercept clicks on locked tabs
      if (btn.classList.contains('is-locked') && !isLabUnlocked()) {
        e.preventDefault();
        
        // Switch to startseite first if not already there
        const startBtn = document.querySelector('.nav-btn[data-tab="tab-startseite"]');
        const startPanel = document.getElementById('tab-startseite');
        
        navBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        if (startBtn) startBtn.classList.add('active');
        if (startPanel) startPanel.classList.add('active');

        // Scroll to password gate
        if (passwordGateSection) {
          passwordGateSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          passwordGateSection.classList.remove('shake');
          void passwordGateSection.offsetWidth; // trigger reflow
          passwordGateSection.classList.add('shake');
        }

        if (unlockFeedback) {
          unlockFeedback.className = 'unlock-feedback error';
          unlockFeedback.textContent = '🔒 Dieses Modul ist geschützt. Bitte gebt zuerst das Freischalt-Passwort eurer Lehrkraft ein.';
        }

        if (inputLabPassword) {
          setTimeout(() => inputLabPassword.focus(), 400);
        }
        return;
      }

      // Normal tab switch
      navBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   2. KINETICS SIMULATOR
   ========================================================================== */
function initKineticsSimulator() {
  const sliderTime = document.getElementById('sliderTime');
  const sliderH2so4 = document.getElementById('sliderH2so4');
  const sliderTemp = document.getElementById('sliderTemp');

  const valTime = document.getElementById('valTime');
  const valH2so4 = document.getElementById('valH2so4');
  const valTemp = document.getElementById('valTemp');

  const displayDeValue = document.getElementById('displayDeValue');
  const deProgressBar = document.getElementById('deProgressBar');
  const deStatusBadge = document.getElementById('deStatusBadge');

  const tubeLiquid = document.getElementById('tubeLiquid');
  const iodineText = document.getElementById('iodineText');

  const segOligo = document.getElementById('segOligo');
  const segTri = document.getElementById('segTri');
  const segMal = document.getElementById('segMal');
  const segGlc = document.getElementById('segGlc');

  const caohNeeded = document.getElementById('caohNeeded');
  const caohMoles = document.getElementById('caohMoles');
  const caohSuspDesc = document.getElementById('caohSuspDesc');
  const gypsumYield = document.getElementById('gypsumYield');
  const btnReset = document.getElementById('btnResetKinetics');
  const btnSimulateStop = document.getElementById('btnSimulateStop');

  function updateKinetics() {
    const time = parseFloat(sliderTime.value);
    const h2so4 = parseFloat(sliderH2so4.value);
    const temp = parseFloat(sliderTemp.value);

    valTime.textContent = `${time} Min.`;
    valH2so4.textContent = `${h2so4.toFixed(2)} mol/L`;
    valTemp.textContent = `${temp} °C ${temp >= 99 ? '(Sieden)' : ''}`;

    // Rate scaling factor: Arrhenius rule (approx. doubling per 10 K) + linear acid catalysis
    // Diprotic sulfuric acid at 0.25 mol/L gives equivalent catalytic hydronium activity
    const kAcid = h2so4 / 0.25;
    const kTemp = Math.pow(2.0, (temp - 100) / 10.0);
    const effectiveTime = time * kAcid * kTemp;

    // DE value model: starts around 1.5, hits 43.8 at t_eff = 45 min
    let de = 1.5 + (98.5 * (1.0 - Math.exp(-Math.pow(effectiveTime / 72.0, 1.15))));
    if (de > 99.5) de = 99.5;
    if (effectiveTime <= 0.05) de = 1.2;

    displayDeValue.textContent = de.toFixed(1);
    deProgressBar.style.width = `${Math.min(de, 100)}%`;

    // Status Badge & Target Zone
    if (de < 15) {
      deStatusBadge.textContent = 'Native Stärke / Amylodextrine';
      deStatusBadge.className = 'status-pill';
      deStatusBadge.style.color = '#38bdf8';
      deStatusBadge.style.borderColor = '#38bdf8';
    } else if (de < 35) {
      deStatusBadge.textContent = 'Maltodextrine (DE < 35)';
      deStatusBadge.className = 'status-pill';
      deStatusBadge.style.color = '#a78bfa';
      deStatusBadge.style.borderColor = '#a78bfa';
    } else if (de >= 40 && de <= 48) {
      deStatusBadge.textContent = '🎯 ZIELKORRIDOR: Konfiseursirup (DE ~44)';
      deStatusBadge.className = 'status-pill target';
    } else if (de < 70) {
      deStatusBadge.textContent = 'Hoher Glukosegehalt (DE > 50)';
      deStatusBadge.className = 'status-pill';
      deStatusBadge.style.color = '#f59e0b';
      deStatusBadge.style.borderColor = '#f59e0b';
    } else {
      deStatusBadge.textContent = 'Überhydrolysiert (HMF-Gefahr)';
      deStatusBadge.className = 'status-pill';
      deStatusBadge.style.color = '#f43f5e';
      deStatusBadge.style.borderColor = '#f43f5e';
    }

    // Iodine Test Color & Tube
    if (effectiveTime < 10) {
      tubeLiquid.style.background = '#0a1128';
      iodineText.textContent = 'Tiefblau / Schwarz (Intakte Amylose-Helices)';
    } else if (effectiveTime < 22) {
      tubeLiquid.style.background = '#4a154b';
      iodineText.textContent = 'Dunkelviolett (Amylodextrine, DP > 30)';
    } else if (effectiveTime < 35) {
      tubeLiquid.style.background = '#78281f';
      iodineText.textContent = 'Rotbraun (Erythrodextrine, DP 12–30)';
    } else if (effectiveTime < 42) {
      tubeLiquid.style.background = '#a16207';
      iodineText.textContent = 'Hellbraun (Achroodextrine, Umschlag naht!)';
    } else {
      tubeLiquid.style.background = '#eab308';
      iodineText.textContent = 'Reines Gelb (Iod-Eigenfarbe, NEGATIV! Keine Helices)';
    }


    // Carbohydrate fractions
    let fracGlc = Math.max(1, Math.min(85, Math.round(de * 0.44)));
    let fracMal = Math.max(1, Math.min(30, Math.round(de * 0.32)));
    let fracTri = Math.max(1, Math.min(18, Math.round(de * 0.25)));
    let fracOligo = Math.max(2, 100 - (fracGlc + fracMal + fracTri));

    segOligo.style.width = `${fracOligo}%`;
    segOligo.textContent = `${fracOligo}% Oligo`;
    segTri.style.width = `${fracTri}%`;
    segTri.textContent = `${fracTri}% DP3`;
    segMal.style.width = `${fracMal}%`;
    segMal.textContent = `${fracMal}% Mal`;
    segGlc.style.width = `${fracGlc}%`;
    segGlc.textContent = `${fracGlc}% Glc`;

    // Ca(OH)₂ suspension needed for neutralization & gypsum yield of 100 mL batch
    // H₂SO₄ + Ca(OH)₂ -> CaSO₄ · 2 H₂O↓
    // n(H₂SO₄) = h2so4 * 0.1 L
    // M(Ca(OH)₂) = 74.09 g/mol; M(CaSO₄ · 2 H₂O) = 172.17 g/mol
    const molesAcid = h2so4 * 0.1;
    const massCaoh = molesAcid * 74.09;
    const volSusp = h2so4 * 100.0;
    const massGypsum = molesAcid * 172.17;

    if (caohNeeded) caohNeeded.textContent = `${massCaoh.toFixed(2)} g`;
    if (caohMoles) caohMoles.textContent = `${molesAcid.toFixed(3)} mol`;
    if (caohSuspDesc) caohSuspDesc.textContent = `in ca. ${volSusp.toFixed(0)} mL H₂O frisch suspendieren`;
    if (gypsumYield) {
      gypsumYield.textContent = `Fällt ca. ${massGypsum.toFixed(1)} g weißen Gips (CaSO₄ · 2 H₂O↓) aus, der per Nutsche abfiltriert wird.`;
    }
  }

  [sliderTime, sliderH2so4, sliderTemp].forEach(slider => {
    slider.addEventListener('input', updateKinetics);
  });

  btnReset.addEventListener('click', () => {
    sliderTime.value = 45;
    sliderH2so4.value = 0.25;
    sliderTemp.value = 100;
    updateKinetics();
  });

  btnSimulateStop.addEventListener('click', () => {
    const time = sliderTime.value;
    const de = displayDeValue.textContent;
    const h2so4 = parseFloat(sliderH2so4.value);
    const molesAcid = h2so4 * 0.1;
    const massCaoh = (molesAcid * 74.09).toFixed(2);
    const volSusp = (h2so4 * 100.0).toFixed(0);
    const massGypsum = (molesAcid * 172.17).toFixed(1);
    alert(`🛑 Reaktionsstopp & Fällung simuliert!\n\nDurch Zugabe einer frisch angerührten Suspension von ${massCaoh} g Ca(OH)₂ (in ca. ${volSusp} mL H₂O, n = ${molesAcid.toFixed(3)} mol) wurde die Säure neutralisiert (pH ≈ 6,5).\nEs fallen ca. ${massGypsum} g weißer Gips (CaSO₄ · 2 H₂O↓) aus, der über eine Nutsche/Faltenfilter restlos abfiltriert werden kann.\nDie Hydrolyse wurde bei t = ${time} Min. mit einem DE-Wert von ${de} erfolgreich eingefroren!`);
  });

  updateKinetics();
}

/* ==========================================================================
   3. DE CALCULATOR (SCHOORL INTERPOLATION & DRY MASS)
   ========================================================================== */
function initDeCalculator() {
  const btnToggleBrix = document.getElementById('btnToggleBrix');
  const btnToggleGravi = document.getElementById('btnToggleGravi');
  const brixSection = document.getElementById('brixInputSection');
  const graviSection = document.getElementById('graviInputSection');

  let activeMethod = 'brix';

  btnToggleBrix.addEventListener('click', () => {
    activeMethod = 'brix';
    btnToggleBrix.classList.add('active');
    btnToggleGravi.classList.remove('active');
    brixSection.classList.remove('hidden');
    graviSection.classList.add('hidden');
    calculateDe();
  });

  btnToggleGravi.addEventListener('click', () => {
    activeMethod = 'gravi';
    btnToggleGravi.classList.add('active');
    btnToggleBrix.classList.remove('active');
    graviSection.classList.remove('hidden');
    brixSection.classList.add('hidden');
    calculateDe();
  });

  // Official Schoorl Table for D-Glucose with 0.1 M Thiosulfate (mL diff -> mg Glucose)
  const schoorlTable = [
    { ml: 0.0, mg: 0.0 },
    { ml: 1.0, mg: 2.4 },
    { ml: 2.0, mg: 4.8 },
    { ml: 3.0, mg: 7.2 },
    { ml: 4.0, mg: 9.7 },
    { ml: 5.0, mg: 12.2 },
    { ml: 6.0, mg: 14.7 },
    { ml: 7.0, mg: 17.2 },
    { ml: 8.0, mg: 19.8 },
    { ml: 9.0, mg: 22.4 },
    { ml: 10.0, mg: 25.0 },
    { ml: 11.0, mg: 27.6 },
    { ml: 12.0, mg: 30.3 },
    { ml: 13.0, mg: 33.0 },
    { ml: 14.0, mg: 35.7 },
    { ml: 15.0, mg: 38.5 },
    { ml: 16.0, mg: 41.3 },
    { ml: 17.0, mg: 44.1 },
    { ml: 18.0, mg: 46.9 },
    { ml: 19.0, mg: 49.7 },
    { ml: 20.0, mg: 52.6 },
    { ml: 21.0, mg: 55.5 },
    { ml: 22.0, mg: 58.5 }
  ];

  function interpolateGlucose(deltaV) {
    if (deltaV <= 0) return 0.0;
    if (deltaV >= 22.0) return 58.5 + (deltaV - 22.0) * 3.0;

    for (let i = 0; i < schoorlTable.length - 1; i++) {
      const p1 = schoorlTable[i];
      const p2 = schoorlTable[i + 1];
      if (deltaV >= p1.ml && deltaV <= p2.ml) {
        const factor = (deltaV - p1.ml) / (p2.ml - p1.ml);
        return p1.mg + factor * (p2.mg - p1.mg);
      }
    }
    return 0.0;
  }

  function calculateDe() {
    const mSirup = parseFloat(document.getElementById('inSirupMass').value) || 2.15;
    const v1 = parseFloat(document.getElementById('inVol1').value) || 100.0;
    const al1 = parseFloat(document.getElementById('inAliquot1').value) || 10.0;
    const v2 = parseFloat(document.getElementById('inVol2').value) || 100.0;
    const al2 = parseFloat(document.getElementById('inTitrationVol').value) || 25.0;

    const vBlind = parseFloat(document.getElementById('inVBlind').value) || 25.05;
    const vProbe = parseFloat(document.getElementById('inVProbe').value) || 13.65;

    // 1. Delta V
    const deltaV = Math.max(0, vBlind - vProbe);
    const mgGlucose = interpolateGlucose(deltaV);

    // 2. Dry mass fraction w_TS
    let wTs = 0.58;
    if (activeMethod === 'brix') {
      const brix = parseFloat(document.getElementById('inBrix').value) || 58.0;
      wTs = brix / 100.0;
    } else {
      const m0 = parseFloat(document.getElementById('inM0').value) || 24.1205;
      const m1 = parseFloat(document.getElementById('inM1').value) || 26.2705;
      const m2 = parseFloat(document.getElementById('inM2').value) || 25.3675;
      const syrupWeighed = m1 - m0;
      const dryWeighed = m2 - m0;
      wTs = syrupWeighed > 0 ? dryWeighed / syrupWeighed : 0.58;
    }

    // 3. Syrup in aliquot and dry substance in aliquot
    // m(Aliquot) = mSirup * (al1 / v1) * (al2 / v2)
    const mAliquotG = mSirup * (al1 / v1) * (al2 / v2);
    const mAliquotMg = mAliquotG * 1000.0;
    const mTsMg = mAliquotMg * wTs;

    // 4. DE
    const de = mTsMg > 0 ? (mgGlucose / mTsMg) * 100.0 : 0.0;

    // Update UI elements
    const resDeValue = document.getElementById('resDeValue');
    const resDeText = document.getElementById('resDeText');
    const calcBadge = document.getElementById('calcBadge');

    resDeValue.textContent = de.toFixed(1);

    if (de >= 41.5 && de <= 46.5) {
      calcBadge.textContent = 'Perfekte Punktlandung!';
      calcBadge.className = 'badge badge-success';
      resDeText.innerHTML = `🎯 <strong>Exzellentes Ergebnis (${de.toFixed(1)} DE):</strong> Perfekte Landung im Konfiseursirup-Standardbereich (DE 42–46). Ideal für stabile Bonbonmassen ohne Auskristallisation.`;
      resDeValue.style.color = '#10b981';
    } else if (de >= 38.0 && de <= 50.0) {
      calcBadge.textContent = 'Zielbereich erreicht';
      calcBadge.className = 'badge badge-success';
      resDeText.innerHTML = `✅ <strong>Guter Zielbereich (${de.toFixed(1)} DE):</strong> Leicht an der Grenze, aber voll im industriellen Toleranzfenster für Medium Conversion Sirupe.`;
      resDeValue.style.color = '#38bdf8';
    } else if (de < 38.0) {
      calcBadge.textContent = 'Unterhydrolysiert';
      calcBadge.className = 'badge badge-warning';
      resDeText.innerHTML = `⚠️ <strong>Zu geringer Abbau (${de.toFixed(1)} DE):</strong> Der Sirup enthält noch zu viele hochmolekulare Dextrine. Kochzeit war zu kurz oder Neutralisation erfolgte verfrüht.`;
      resDeValue.style.color = '#f59e0b';
    } else {
      calcBadge.textContent = 'Überhydrolysiert';
      calcBadge.className = 'badge badge-warning';
      resDeText.innerHTML = `⚠️ <strong>Zu weit gespalten (${de.toFixed(1)} DE):</strong> Hoher Glukosegehalt (kristallisationsanfällig). Gefahr thermischer Zersetzung / HMF-Bildung prüfen.`;
      resDeValue.style.color = '#f43f5e';
    }

    // Step-by-step math strings
    document.getElementById('mathDeltaV').textContent = `${vBlind.toFixed(2)} - ${vProbe.toFixed(2)} = ${deltaV.toFixed(2)}`;
    document.getElementById('mathGlucose').textContent = mgGlucose.toFixed(2);
    document.getElementById('mathTs').textContent = `${mAliquotMg.toFixed(2)} mg · ${wTs.toFixed(3)} = ${mTsMg.toFixed(2)}`;
    document.getElementById('mathDeFormula').textContent = `${mgGlucose.toFixed(2)} / ${mTsMg.toFixed(2)}`;
    document.getElementById('mathFinal').textContent = de.toFixed(2);
  }

  document.getElementById('btnCalculateDe').addEventListener('click', calculateDe);

  const inputs = document.querySelectorAll('#deCalcForm input');
  inputs.forEach(input => {
    input.addEventListener('input', calculateDe);
  });

  calculateDe();
}

/* ==========================================================================
   4. TITRATION STEPPER
   ========================================================================== */
function initTitrationStepper() {
  const stepBtns = document.querySelectorAll('.step-nav-btn');
  const stepContents = document.querySelectorAll('.step-content');

  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.getAttribute('data-step');

      stepBtns.forEach(b => b.classList.remove('active'));
      stepContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeStep = document.getElementById(`rxStep${step}`);
      if (activeStep) {
        activeStep.classList.add('active');
      }
    });
  });
}
