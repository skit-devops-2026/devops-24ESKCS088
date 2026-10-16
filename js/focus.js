// ========================================
// STORAGE
// ========================================

function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        alert("Unable to save data in this browser.");
    }
}


// ========================================
// ELEMENTS
// ========================================

const timerDisplay = document.getElementById("timerDisplay");
const timerHeading = document.getElementById("timerHeading");
const timerLabel = document.getElementById("timerLabel");
const timerMessage = document.getElementById("timerMessage");
const timerStatus = document.getElementById("timerStatus");
const statusBadge = document.getElementById("statusBadge");
const timerCircle = document.getElementById("timerCircle");

const durationInput = document.getElementById("durationInput");
const applyDurationBtn = document.getElementById("applyDurationBtn");

const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const finishBtn = document.getElementById("finishBtn");

const sessionForm = document.getElementById("sessionForm");
const subjectInput = document.getElementById("subjectInput");
const topicInput = document.getElementById("topicInput");
const studyGoal = document.getElementById("studyGoal");
const clearDetailsBtn = document.getElementById("clearDetailsBtn");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const changeGoalBtn = document.getElementById("changeGoalBtn");


// ========================================
// TIMER SETTINGS
// ========================================

const defaultDurations = {
    focus: 25,
    short: 5,
    long: 15
};

let durations = loadData("focusDurations", defaultDurations);

durations = {
    focus: validDuration(durations.focus, 25),
    short: validDuration(durations.short, 5),
    long: validDuration(durations.long, 15)
};

function validDuration(value, fallback) {
    const number = Number(value);

    return Number.isInteger(number) &&
        number >= 1 &&
        number <= 180
        ? number
        : fallback;
}

let currentMode = "focus";

let totalSeconds = durations.focus * 60;
let remainingSeconds = totalSeconds;

let timerInterval = null;
let isRunning = false;
let endTime = null;
let sessionStartTime = null;

let sessionData = {
    subject: "",
    topic: "",
    goal: ""
};

let sessions = loadData("focusSessions", []);

let dailyGoal = Number(loadData("focusDailyGoal", 240));

if (!Number.isFinite(dailyGoal) || dailyGoal < 1) {
    dailyGoal = 240;
}


// ========================================
// TIME AND DATE HELPERS
// ========================================

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0");
}

function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getTodaySessions() {
    const today = getDateKey();

    return sessions.filter(session => session.date === today);
}

function stopInterval() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}


// ========================================
// TIMER DISPLAY
// ========================================

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);

    const progress = totalSeconds > 0
        ? remainingSeconds / totalSeconds
        : 1;

    const degrees = progress * 360;

    timerCircle.style.background =
        `conic-gradient(#6c63ff ${degrees}deg, #ecebff ${degrees}deg)`;

    if (isRunning) {
        timerMessage.textContent = "Stay focused!";
    } else if (remainingSeconds === 0) {
        timerMessage.textContent = "Time is up!";
    } else {
        timerMessage.textContent = "Ready to focus?";
    }
}

function updateStatus(text) {
    statusBadge.textContent = "● " + text;
    timerStatus.textContent = text;
}


// ========================================
// SELECT TIMER MODE
// ========================================

function setMode(mode) {
    if (isRunning || sessionStartTime !== null) {
        alert("Finish or reset your current session before changing modes.");
        return;
    }

    if (!durations[mode]) {
        return;
    }

    currentMode = mode;

    totalSeconds = durations[mode] * 60;
    remainingSeconds = totalSeconds;

    timerHeading.textContent = {
        focus: "Focus Session",
        short: "Short Break",
        long: "Long Break"
    }[mode];

    timerLabel.textContent = {
        focus: "FOCUS TIME",
        short: "SHORT BREAK",
        long: "LONG BREAK"
    }[mode];

    durationInput.value = durations[mode];

    document.querySelectorAll(".mode-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );
    });

    startPauseBtn.textContent = "▶ Start";

    updateStatus("Ready");
    updateTimerDisplay();
}

document.querySelectorAll(".mode-btn").forEach(button => {
    button.addEventListener("click", () => {
        setMode(button.dataset.mode);
    });
});


// ========================================
// CHANGE TIMER DURATION
// ========================================

applyDurationBtn.addEventListener("click", function () {
    if (isRunning || sessionStartTime !== null) {
        alert("Finish or reset your current session before changing time.");
        return;
    }

    const minutes = Number(durationInput.value);

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
        alert("Enter a duration between 1 and 180 minutes.");
        return;
    }

    durations[currentMode] = minutes;

    saveData("focusDurations", durations);

    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;

    updateTimerDisplay();

    updateStatus("Duration updated");

});


// ========================================
// SAVE SESSION DETAILS
// ========================================

sessionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (isRunning || sessionStartTime !== null) {
        alert("Finish or reset the current session before changing details.");
        return;
    }

    sessionData = {
        subject: subjectInput.value.trim(),
        topic: topicInput.value.trim(),
        goal: studyGoal.value.trim()
    };

    updateStatus("Details saved");

    alert("Session details saved!");
});

clearDetailsBtn.addEventListener("click", function () {
    if (isRunning || sessionStartTime !== null) {
        alert("Finish or reset the current session before clearing details.");
        return;
    }

    subjectInput.value = "";
    topicInput.value = "";
    studyGoal.value = "";

    sessionData = {
        subject: "",
        topic: "",
        goal: ""
    };

    updateStatus("Details cleared");
});


// ========================================
// START AND PAUSE
// ========================================

startPauseBtn.addEventListener("click", function () {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

function startTimer() {
    if (remainingSeconds <= 0) {
        alert("Reset the timer before starting again.");
        return;
    }

    if (sessionStartTime === null) {
        sessionData = {
            subject: subjectInput.value.trim(),
            topic: topicInput.value.trim(),
            goal: studyGoal.value.trim()
        };

        sessionStartTime = Date.now();
    }

    isRunning = true;

    endTime = Date.now() + remainingSeconds * 1000;

    startPauseBtn.textContent = "⏸ Pause";

    updateStatus("Running");

    stopInterval();

    timerInterval = setInterval(function () {
        remainingSeconds = Math.max(
            0,
            Math.ceil((endTime - Date.now()) / 1000)
        );

        updateTimerDisplay();

        if (remainingSeconds === 0) {
            completeTimer();
        }
    }, 250);
}

function pauseTimer() {
    if (!isRunning) {
        return;
    }

    remainingSeconds = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
    );

    stopInterval();

    isRunning = false;
    endTime = null;

    startPauseBtn.textContent = "▶ Resume";

    updateStatus("Paused");
    updateTimerDisplay();
}


// ========================================
// RESET TIMER
// ========================================

resetBtn.addEventListener("click", function () {
    if (sessionStartTime !== null) {
        const confirmed = confirm(
            "Reset this session? Its time will not be saved."
        );

        if (!confirmed) {
            return;
        }
    }

    stopInterval();

    isRunning = false;
    endTime = null;
    sessionStartTime = null;

    remainingSeconds = totalSeconds;

    startPauseBtn.textContent = "▶ Start";

    updateStatus("Ready");
    updateTimerDisplay();
});


// ========================================
// FINISH SESSION
// ========================================

finishBtn.addEventListener("click", function () {
    if (sessionStartTime === null) {
        alert("Start a session first.");
        return;
    }

    const confirmed = confirm("Finish and save this session?");

    if (!confirmed) {
        return;
    }

    if (isRunning && endTime !== null) {
        remainingSeconds = Math.max(
            0,
            Math.ceil((endTime - Date.now()) / 1000)
        );
    }

    stopInterval();

    isRunning = false;
    endTime = null;

    saveSession(
        remainingSeconds === 0 ? "Completed" : "Interrupted"
    );

    remainingSeconds = totalSeconds;

    startPauseBtn.textContent = "▶ Start";

    updateStatus("Session saved");
    updateTimerDisplay();
});


// ========================================
// COMPLETE SESSION
// ========================================

function completeTimer() {
    stopInterval();

    isRunning = false;
    remainingSeconds = 0;
    endTime = null;

    startPauseBtn.textContent = "▶ Start";

    if (currentMode === "focus") {
        saveSession("Completed");
    }

    updateStatus("Time completed");
    updateTimerDisplay();

    alert("Timer finished! Great work.");
}


// ========================================
// SAVE SESSION TO HISTORY
// ========================================

function saveSession(status) {
    if (sessionStartTime === null) {
        return;
    }

    const startedAt = sessionStartTime;
    const elapsedSeconds = Math.max(
        0,
        Math.floor(
            (Date.now() - startedAt) / 1000 -
            (totalSeconds - remainingSeconds)
        )
    );

    // Calculate actual active time from the original duration.
    // Pauses do not count toward focus time.
    const activeSeconds = Math.max(
        0,
        totalSeconds - remainingSeconds
    );

    if (activeSeconds > 0) {
        const session = {
            id: Date.now(),
            subject: sessionData.subject || "General Focus",
            topic: sessionData.topic || "",
            goal: sessionData.goal || "",
            date: getDateKey(new Date(startedAt)),
            startTime: new Date(startedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            }),
            seconds: activeSeconds,
            duration: Math.floor(activeSeconds / 60),
            status: status
        };

        sessions.push(session);

        saveData("focusSessions", sessions);
    }

    sessionStartTime = null;

    renderHistory();
    updateStatistics();
}


// ========================================
// HISTORY
// ========================================

function renderHistory() {
    const todaySessions = getTodaySessions();

    historyList.innerHTML = "";

    if (todaySessions.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <span>📚</span>
                <h3>No sessions yet</h3>
                <p>Your saved sessions will appear here.</p>
            </div>
        `;

        return;
    }

    todaySessions.slice().reverse().forEach(session => {
        const item = document.createElement("div");
        item.className = "history-item";

        const info = document.createElement("div");
        info.className = "history-info";

        const icon = document.createElement("div");
        icon.className = "history-icon";
        icon.textContent = "📚";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = session.subject || "General Focus";

        const description = document.createElement("p");

        description.textContent = [
            session.topic,
            session.goal,
            session.startTime
        ].filter(Boolean).join(" · ") || "No additional details";

        details.append(title, description);
        info.append(icon, details);

        const status = document.createElement("div");
        status.className = "history-status";

        const duration = document.createElement("strong");
        duration.textContent = session.duration > 0
            ? `${session.duration} min`
            : `${session.seconds} sec`;

        const label = document.createElement("span");
        label.textContent = session.status;

        if (session.status !== "Completed") {
            label.classList.add("interrupted");
        }

        status.append(duration, label);

        item.append(info, status);
        historyList.appendChild(item);
    });
}


// ========================================
// STATISTICS
// ========================================

function updateStatistics() {
    const todaySessions = getTodaySessions();

    const seconds = todaySessions.reduce(
        (total, session) => total + (session.seconds || 0),
        0
    );

    const minutes = Math.floor(seconds / 60);

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    document.getElementById("totalFocus").textContent =
        hours > 0
            ? `${hours}h ${remainingMinutes}m`
            : `${minutes} min`;

    const completed = todaySessions.filter(
        session => session.status === "Completed"
    ).length;

    document.getElementById("totalSessions").textContent = completed;

    document.getElementById("goalText").textContent =
        `${(minutes / 60).toFixed(1)} / ${(dailyGoal / 60).toFixed(1)} hrs`;

    const progress = Math.min(
        (minutes / dailyGoal) * 100,
        100
    );

    document.getElementById("goalProgress").style.width =
        progress + "%";
}


// ========================================
// CHANGE DAILY GOAL
// ========================================

changeGoalBtn.addEventListener("click", function () {
    const currentHours = dailyGoal / 60;

    const input = prompt(
        "Enter your daily focus goal in hours (0.5 to 24):",
        currentHours
    );

    if (input === null) {
        return;
    }

    const hours = Number(input);

    if (!Number.isFinite(hours) || hours < 0.5 || hours > 24) {
        alert("Enter a goal between 0.5 and 24 hours.");
        return;
    }

    dailyGoal = Math.round(hours * 60);

    saveData("focusDailyGoal", dailyGoal);

    updateStatistics();
});


// ========================================
// CLEAR TODAY'S HISTORY
// ========================================

clearHistoryBtn.addEventListener("click", function () {
    const confirmed = confirm("Delete all of today's focus history?");

    if (!confirmed) {
        return;
    }

    const today = getDateKey();

    sessions = sessions.filter(
        session => session.date !== today
    );

    saveData("focusSessions", sessions);

    renderHistory();
    updateStatistics();
});


// ========================================
// INITIALIZE
// ========================================

durationInput.value = durations.focus;

updateTimerDisplay();
renderHistory();
updateStatistics();
updateStatus("Ready");