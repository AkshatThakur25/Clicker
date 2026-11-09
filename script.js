const $ = (id) => document.getElementById(id);

const currentCPS = $("currentCPS");
const totalClicks = $("totalClicks");
const bestCPS = $("bestCPS");
const lastCPS = $("lastCPS");
const averageCPS = $("averageCPS");
const bestCPSRight = $("bestCPSRight");
const bestStatCard = $("bestStatCard");
const bestRightStat = $("bestRightStat");
const languageSelect = $("languageSelect");
const languageWrap = document.querySelector(".language-wrap");
const timer = $("timer");
const progress = $("progress");
const clickButton = $("clickButton");
const startButton = $("startButton");
const restartButton = $("restartButton");
const scoresContainer = $("scores");
const scoresList = scoresContainer;
const clearScores = $("clearScores");
const customMode = $("customMode");
const customModal = $("customModal");
const closeModal = $("closeModal");
const applyCustom = $("applyCustom");
const customTime = $("customTime");

const resultModal = $("resultModal");
const resultClose = $("resultClose");
const resultTryAgain = $("resultTryAgain");
const resultAnimal = $("resultAnimal");
const resultTitle = $("resultTitle");
const resultCPS = $("resultCPS");
const resultMessage = $("resultMessage");
const resultNote = $("resultNote");

let testDuration = 1;
let clicks = 0;
let running = false;
let startTime = 0;
let animationFrame = null;

let personalData = JSON.parse(localStorage.getItem("clickerPersonal") || "null") || {
    best: 0,
    last: 0,
    attempts: [],
    totalTests: 0
};
// Keep a lifetime completed-test count separate from the recent attempts list.
// The attempts list is intentionally capped for averages/history, but progress must keep increasing.
personalData.attempts = Array.isArray(personalData.attempts) ? personalData.attempts : [];
personalData.totalTests = Math.max(Number(personalData.totalTests || 0), personalData.attempts.length);

let scores = JSON.parse(localStorage.getItem("clickerScores") || "null") || [];

const translations = {
    en: {
        heroTitle: 'How Fast Can You <span>Click?</span>', heroText: 'Test your clicks per second (CPS) and<br>challenge yourself to get a higher score!',
        tagline: 'Click. Measure. Improve.', currentCps: 'Current CPS', totalClicks: 'Total Clicks', bestCps: 'Best CPS', yourStats: 'Your Stats',
        lastCps: 'Last CPS', averageCps: 'Average CPS', highScores: 'High Scores', clear: 'Clear', custom: 'Custom', clickHere: 'CLICK HERE',
        customTimeTitle: 'Custom Time', customTimeText: 'Choose a test duration from 1 to 60 seconds.', apply: 'Apply', yourCps: 'Your CPS', tryAgain: 'Try Again', start: 'Start', restart: 'Restart', running: 'Running', takeItEasy: 'Take It Easy!', takeItEasyMsg: 'Don’t worry... everyone starts somewhere!', takeItEasyNote: 'Keep practicing and you’ll get faster with time.', niceStart: 'Nice Start!', niceStartMsg: 'You’re getting there!', niceStartNote: 'A little more practice and those clicks will get faster.', niceClicking: 'Nice Clicking!', niceClickingMsg: 'That’s a solid CPS!', niceClickingNote: 'Keep going and see if you can beat your best.', wow: 'WOW! What a CPS!', wowMsg: 'That was seriously fast!', wowNote: 'You’ve got some crazy clicking speed. Can you beat it again?'
    },
    hi: {
        heroTitle: 'आप कितनी तेज़ी से <span>क्लिक कर सकते हैं?</span>', heroText: 'अपने क्लिक प्रति सेकंड (CPS) की जाँच करें और<br>अपना स्कोर बेहतर करने की चुनौती लें!',
        tagline: 'क्लिक करें। मापें। सुधारें।', currentCps: 'वर्तमान CPS', totalClicks: 'कुल क्लिक', bestCps: 'सर्वश्रेष्ठ CPS', yourStats: 'आपके आँकड़े',
        lastCps: 'पिछला CPS', averageCps: 'औसत CPS', highScores: 'उच्च स्कोर', clear: 'साफ़ करें', custom: 'कस्टम', clickHere: 'यहाँ क्लिक करें',
        customTimeTitle: 'कस्टम समय', customTimeText: '1 से 60 सेकंड के बीच टेस्ट की अवधि चुनें।', apply: 'लागू करें', yourCps: 'आपका CPS', tryAgain: 'फिर कोशिश करें', start: 'शुरू करें', restart: 'पुनः शुरू करें', running: 'चल रहा है', takeItEasy: 'आराम से!', takeItEasyMsg: 'चिंता मत करें... हर कोई कहीं से शुरुआत करता है!', takeItEasyNote: 'अभ्यास करते रहें और समय के साथ आपकी गति बढ़ेगी।', niceStart: 'अच्छी शुरुआत!', niceStartMsg: 'आप सही दिशा में हैं!', niceStartNote: 'थोड़ा और अभ्यास करें और आपके क्लिक तेज़ होंगे।', niceClicking: 'शानदार क्लिकिंग!', niceClickingMsg: 'यह एक अच्छा CPS है!', niceClickingNote: 'जारी रखें और देखें क्या आप अपना सर्वश्रेष्ठ तोड़ सकते हैं।', wow: 'वाह! क्या CPS है!', wowMsg: 'यह सच में बहुत तेज़ था!', wowNote: 'आपकी क्लिकिंग स्पीड कमाल की है। क्या आप इसे फिर से हरा सकते हैं?'
    },
    fr: {
        heroTitle: 'À quelle vitesse pouvez-vous <span>cliquer&nbsp;?</span>', heroText: 'Testez vos clics par seconde (CPS) et<br>défiez-vous pour obtenir un meilleur score !',
        tagline: 'Cliquez. Mesurez. Progressez.', currentCps: 'CPS actuel', totalClicks: 'Clics totaux', bestCps: 'Meilleur CPS', yourStats: 'Vos statistiques',
        lastCps: 'Dernier CPS', averageCps: 'CPS moyen', highScores: 'Meilleurs scores', clear: 'Effacer', custom: 'Personnalisé', clickHere: 'CLIQUEZ ICI',
        customTimeTitle: 'Temps personnalisé', customTimeText: 'Choisissez une durée de test de 1 à 60 secondes.', apply: 'Appliquer', yourCps: 'Votre CPS', tryAgain: 'Réessayer', start: 'Démarrer', restart: 'Redémarrer', running: 'En cours', takeItEasy: 'Doucement !', takeItEasyMsg: 'Ne vous inquiétez pas... tout le monde commence quelque part !', takeItEasyNote: 'Continuez à pratiquer et vous deviendrez plus rapide avec le temps.', niceStart: 'Bon début !', niceStartMsg: 'Vous progressez !', niceStartNote: 'Encore un peu de pratique et vos clics seront plus rapides.', niceClicking: 'Belle performance !', niceClickingMsg: 'C’est un CPS solide !', niceClickingNote: 'Continuez et voyez si vous pouvez battre votre record.', wow: 'WAOUH ! Quel CPS !', wowMsg: 'C’était vraiment rapide !', wowNote: 'Votre vitesse de clic est impressionnante. Pouvez-vous faire encore mieux ?'
    },
    es: {
        heroTitle: '¿Qué tan rápido puedes <span>hacer clic?</span>', heroText: 'Pon a prueba tus clics por segundo (CPS) y<br>¡desafíate a conseguir una puntuación más alta!',
        tagline: 'Haz clic. Mide. Mejora.', currentCps: 'CPS actual', totalClicks: 'Clics totales', bestCps: 'Mejor CPS', yourStats: 'Tus estadísticas',
        lastCps: 'Último CPS', averageCps: 'CPS promedio', highScores: 'Mejores puntuaciones', clear: 'Borrar', custom: 'Personalizado', clickHere: 'HAZ CLIC AQUÍ',
        customTimeTitle: 'Tiempo personalizado', customTimeText: 'Elige una duración de prueba de 1 a 60 segundos.', apply: 'Aplicar', yourCps: 'Tu CPS', tryAgain: 'Intentar de nuevo', start: 'Iniciar', restart: 'Reiniciar', running: 'En curso', takeItEasy: '¡Tómalo con calma!', takeItEasyMsg: 'No te preocupes... ¡todos empiezan en algún lugar!', takeItEasyNote: 'Sigue practicando y serás más rápido con el tiempo.', niceStart: '¡Buen comienzo!', niceStartMsg: '¡Vas por buen camino!', niceStartNote: 'Un poco más de práctica y tus clics serán más rápidos.', niceClicking: '¡Buen ritmo!', niceClickingMsg: '¡Es un CPS sólido!', niceClickingNote: 'Sigue así y mira si puedes superar tu mejor marca.', wow: '¡WOW! ¡Qué CPS!', wowMsg: '¡Eso fue realmente rápido!', wowNote: 'Tienes una velocidad de clic increíble. ¿Puedes superarla otra vez?'
    }
};

let currentLanguage = localStorage.getItem('clickerLanguage') || 'en';

function applyLanguage(lang) {
    currentLanguage = translations[lang] ? lang : 'en';
    localStorage.setItem('clickerLanguage', currentLanguage);
    const t = translations[currentLanguage];
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        if (t[key] !== undefined) el.innerHTML = t[key];
    });
    updateStartButton(running ? 'Running' : 'Start');
}

function getText(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
}

function format(value) {
    return Number(value || 0).toFixed(2);
}

function updateAchievements() {
    const attempts = personalData.attempts || [];
    const totalTests = Math.max(Number(personalData.totalTests || 0), attempts.length);
    const best = Number(personalData.best || 0);
    const maxClicks = Number(personalData.maxClicks || 0);
    const state = {
        first: totalTests >= 1,
        five: best >= 8,
        ten: best >= 15,
        fifteen: best >= 20,
        hundred: maxClicks >= 150,
        fiveTests: totalTests >= 10
    };

    document.querySelectorAll('.rank-tile').forEach((card) => {
        const threshold = Number(card.dataset.threshold || 0);
        const unlocked = best >= threshold;
        card.classList.toggle('locked', !unlocked);

        const footer = card.querySelector('.rank-footer');
        if (!footer) return;

        let status = footer.querySelector('.rank-status');
        if (!status) {
            status = document.createElement('b');
            status.className = 'rank-status';
            footer.prepend(status);
        }
        status.textContent = unlocked ? 'Unlocked' : `Reach ${format(threshold)} CPS`;

        // Only locked ranks get a Go for it button. Remove it completely when unlocked.
        let cta = footer.querySelector('.rank-cta');
        if (unlocked) {
            if (cta) cta.remove();
        } else if (!cta) {
            cta = document.createElement('button');
            cta.type = 'button';
            cta.className = 'rank-cta';
            cta.textContent = 'Go for it →';
            footer.appendChild(cta);
            cta.addEventListener('click', () => {
                const target = document.getElementById('clickButton');
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    });

    let unlockedCount = 0;
    document.querySelectorAll('.achievement-card').forEach((card) => {
        const unlocked = !!state[card.dataset.achievement];
        card.classList.toggle('unlocked', unlocked);
        if (unlocked) unlockedCount++;
    });

    const progressEl = $('achievementProgress');
    const rankCards = document.querySelectorAll('.rank-tile');
    const unlockedRanks = [...rankCards].filter(card => !card.classList.contains('locked')).length;
    if (progressEl) progressEl.textContent = `${unlockedRanks} / 5 ranks unlocked`;

    const bestCpsEl = $('progressBestCps');
    const testsEl = $('progressTests');
    const ranksEl = $('progressRanks');
    const achievementsEl = $('progressAchievements');
    if (bestCpsEl) bestCpsEl.textContent = format(best);
    if (testsEl) testsEl.textContent = totalTests;
    if (ranksEl) ranksEl.textContent = `${unlockedRanks} / 5`;
    if (achievementsEl) achievementsEl.textContent = `${unlockedCount} / 6`;
}

function savePersonalData() {
    localStorage.setItem("clickerPersonal", JSON.stringify(personalData));
}

function saveScores() {
    localStorage.setItem("clickerScores", JSON.stringify(scores));
}

function updatePersonalUI() {
    const hasCompletedTest = (personalData.attempts || []).length > 0;
    if (bestStatCard) bestStatCard.classList.toggle('best-hidden', !hasCompletedTest);
    if (bestRightStat) bestRightStat.classList.toggle('best-hidden', !hasCompletedTest);
    bestCPS.textContent = format(personalData.best);
    bestCPSRight.textContent = format(personalData.best);
    lastCPS.textContent = format(personalData.last);

    const attempts = personalData.attempts || [];
    const average = attempts.length
        ? attempts.reduce((sum, value) => sum + value, 0) / attempts.length
        : 0;

    averageCPS.textContent = format(average);
    updateAchievements();
}

function renderScores() {
    scoresList.innerHTML = "";

    // Only show scores the user has actually earned.
    // 1 test = 1 row, 2 tests = 2 rows ... 5+ tests = full 5 rows.
    const visibleScores = scores.slice(0, Math.min(scores.length, 5));

    visibleScores.forEach((score, index) => {
        const row = document.createElement("div");
        row.className = "score-row";

        row.innerHTML = `
            <span>#${index + 1}</span>
            <strong>${score.toFixed(2)} CPS</strong>
        `;

        scoresList.appendChild(row);
    });
}

function updateStartButton(label = "Start") {
    if (label === "Running") {
        startButton.innerHTML = `
            <span class="button-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="6" y="5" width="12" height="14" rx="2"></rect>
                </svg>
            </span>
            <span>${getText("running")}</span>
        `;
        return;
    }

    startButton.innerHTML = `
        <span class="button-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <polygon points="8,5 19,12 8,19"></polygon>
            </svg>
        </span>
        <span>${getText("start")}</span>
    `;
}

function setDuration(seconds) {
    testDuration = Math.max(1, Math.min(60, Number(seconds)));
    resetTest();

    document.querySelectorAll(".mode").forEach((button) => {
        button.classList.remove("active");
    });

    const matchingButton = document.querySelector(`.mode[data-time="${testDuration}"]`);
    if (matchingButton) matchingButton.classList.add("active");

    timer.textContent = `${format(testDuration)}s`;
}

function openCustomModal() {
    customModal.classList.remove("hidden");
    customTime.focus();
    customTime.select();
}

document.querySelectorAll(".mode").forEach((button) => {
    button.addEventListener("click", () => {
        if (button.dataset.time === "custom") {
            openCustomModal();
            return;
        }

        setDuration(Number(button.dataset.time));
    });
});

function startTest() {
    if (running) return;

    resultModal.classList.add("hidden");
    running = true;
    clicks = 0;
    startTime = performance.now();

    totalClicks.textContent = "0";
    currentCPS.textContent = "0.00";
    progress.style.width = "0%";

    clickButton.classList.add("running");
    updateStartButton("Running");
    updateTimer();
}

function updateTimer() {
    if (!running) return;

    const elapsed = (performance.now() - startTime) / 1000;
    const remaining = Math.max(testDuration - elapsed, 0);

    timer.textContent = `${format(remaining)}s`;
    progress.style.width = `${Math.min((elapsed / testDuration) * 100, 100)}%`;

    if (elapsed >= testDuration) {
        finishTest();
        return;
    }

    currentCPS.textContent = format(elapsed > 0 ? clicks / elapsed : 0);
    animationFrame = requestAnimationFrame(updateTimer);
}

function handleClick() {
    if (!running) return;

    clicks += 1;
    totalClicks.textContent = String(clicks);

    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > 0) {
        currentCPS.textContent = format(clicks / elapsed);
    }
}

function showResultPopup(cps) {
    resultCPS.textContent = format(cps);

    if (cps < 5) {
        resultAnimal.textContent = "🦥";
        resultTitle.textContent = getText("takeItEasy");
        resultMessage.textContent = getText("takeItEasyMsg");
        resultNote.textContent = getText("takeItEasyNote");
    } else if (cps < 8) {
        resultAnimal.textContent = "🐢";
        resultTitle.textContent = getText("niceStart");
        resultMessage.textContent = getText("niceStartMsg");
        resultNote.textContent = getText("niceStartNote");
    } else if (cps < 11) {
        resultAnimal.textContent = "⚡";
        resultTitle.textContent = getText("niceClicking");
        resultMessage.textContent = getText("niceClickingMsg");
        resultNote.textContent = getText("niceClickingNote");
    } else {
        resultAnimal.textContent = "🔥";
        resultTitle.textContent = getText("wow");
        resultMessage.textContent = getText("wowMsg");
        resultNote.textContent = getText("wowNote");
    }

    resultModal.classList.remove("hidden");
}

function finishTest() {
    if (!running) return;

    running = false;
    cancelAnimationFrame(animationFrame);

    const elapsed = Math.max((performance.now() - startTime) / 1000, 0.001);
    const finalCPS = clicks / elapsed;
    personalData.maxClicks = Math.max(Number(personalData.maxClicks || 0), clicks);

    personalData.last = finalCPS;
    personalData.totalTests = Math.max(Number(personalData.totalTests || 0), (personalData.attempts || []).length) + 1;
    personalData.attempts.push(finalCPS);

    if (personalData.attempts.length > 20) {
        personalData.attempts.shift();
    }

    if (finalCPS > personalData.best) {
        personalData.best = finalCPS;
    }

    scores.push(finalCPS);
    scores = [...scores].sort((a, b) => b - a).slice(0, 5);

    savePersonalData();
    saveScores();
    updatePersonalUI();
    renderScores();

    timer.textContent = `${format(testDuration)}s`;
    currentCPS.textContent = format(finalCPS);
    progress.style.width = "100%";
    clickButton.classList.remove("running");
    updateStartButton("Start");

    showResultPopup(finalCPS);
}

function resetTest() {
    running = false;
    cancelAnimationFrame(animationFrame);
    clicks = 0;

    totalClicks.textContent = "0";
    currentCPS.textContent = "0.00";
    progress.style.width = "0%";
    timer.textContent = `${format(testDuration)}s`;
    clickButton.classList.remove("running", "clicking");

    updateStartButton("Start");
}

startButton.addEventListener("click", startTest);

restartButton.addEventListener("click", () => {
    resultModal.classList.add("hidden");
    resetTest();
});

function triggerClickFeedback(clientX, clientY) {
    const rect = clickButton.getBoundingClientRect();
    const x = typeof clientX === "number" ? clientX - rect.left : rect.width / 2;
    const y = typeof clientY === "number" ? clientY - rect.top : rect.height / 2;

    clickButton.style.setProperty("--click-x", `${x}px`);
    clickButton.style.setProperty("--click-y", `${y}px`);
    clickButton.classList.remove("clicking");
    void clickButton.offsetWidth;
    clickButton.classList.add("clicking");

    setTimeout(() => clickButton.classList.remove("clicking"), 560);
}

clickButton.addEventListener("click", (event) => {
    if (!running) startTest();
    handleClick();
    triggerClickFeedback(event.clientX, event.clientY);
});

clearScores.addEventListener("click", () => {
    scores = [];
    saveScores();
    renderScores();
});

customMode.addEventListener("click", openCustomModal);
closeModal.addEventListener("click", () => customModal.classList.add("hidden"));

customModal.addEventListener("click", (event) => {
    if (event.target === customModal) {
        customModal.classList.add("hidden");
    }
});

applyCustom.addEventListener("click", () => {
    const seconds = Number(customTime.value);
    setDuration(seconds || 1);

    document.querySelectorAll(".mode").forEach((button) => {
        button.classList.remove("active");
    });
    customMode.classList.add("active");

    customModal.classList.add("hidden");
});

customTime.addEventListener("keydown", (event) => {
    if (event.key === "Enter") applyCustom.click();
});

document.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    if (document.activeElement === customTime) return;
    if (!resultModal.classList.contains("hidden")) return;

    event.preventDefault();
    if (!running) startTest();
    handleClick();
    triggerClickFeedback();
});

resultClose.addEventListener("click", () => {
    resultModal.classList.add("hidden");
    resetTest();
});

resultTryAgain.addEventListener("click", () => {
    // Close the result popup and reset the test.
    // The user starts manually when they are ready.
    resultModal.classList.add("hidden");
    resetTest();
});

resultModal.addEventListener("click", (event) => {
    if (event.target === resultModal) {
        resultModal.classList.add("hidden");
        resetTest();
    }
});

document.querySelectorAll('.rank-cta').forEach((button) => {
    button.addEventListener('click', () => {
        const target = document.getElementById('clickButton');
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => target.focus({ preventScroll: true }), 650);
    });
});


updatePersonalUI();
renderScores();
if (languageSelect) {
    languageSelect.value = currentLanguage;
    languageSelect.addEventListener("change", (event) => {
        if (languageWrap) {
            languageWrap.classList.remove("language-changing");
            void languageWrap.offsetWidth;
            languageWrap.classList.add("language-changing");
            setTimeout(() => languageWrap.classList.remove("language-changing"), 700);
        }
        applyLanguage(event.target.value);
    });
}
applyLanguage(currentLanguage);
timer.textContent = "1.00s";
updateStartButton("Start");
