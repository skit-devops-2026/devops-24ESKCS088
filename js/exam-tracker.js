// ===============================================
// EXAM TRACKER - JavaScript
// This file handles: saving exams, showing exams,
// countdown days, syllabus checklist, and dark mode.
// ===============================================


// -----------------------------------------------
// STEP 1: Get all the exams we already saved
// (localStorage saves data even after refreshing the page)
// -----------------------------------------------

let exams = JSON.parse(localStorage.getItem("examList")) || [];


// -----------------------------------------------
// STEP 2: Get references to HTML elements we will use
// -----------------------------------------------

const examListSection = document.getElementById("examListSection");
const emptyMessage = document.getElementById("emptyMessage");

const totalExamsCount = document.getElementById("totalExamsCount");
const thisWeekCount = document.getElementById("thisWeekCount");
const upcomingCount = document.getElementById("upcomingCount");
const completedCount = document.getElementById("completedCount");

const examModal = document.getElementById("examModal");
const addExamButton = document.getElementById("addExamButton");
const closeModalButton = document.getElementById("closeModalButton");
const examForm = document.getElementById("examForm");
const streakBadge = document.getElementById("streakBadge");
const celebrationToast = document.getElementById("celebrationToast");


// -----------------------------------------------
// STEP 3: Save the exams array into localStorage
// We call this function every time something changes
// -----------------------------------------------

function saveExams() {
    localStorage.setItem("examList", JSON.stringify(exams));
}


// -----------------------------------------------
// STEP 4: Work out how many days are left for an exam
// Returns a positive number if exam is in the future,
// 0 if it is today, and a negative number if it already passed.
// -----------------------------------------------

function getDaysLeft(examDate) {

    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignore time, only compare dates

    const examDay = new Date(examDate);
    examDay.setHours(0, 0, 0, 0);

    const oneDayInMs = 1000 * 60 * 60 * 24;

    const diffInDays = Math.round((examDay - today) / oneDayInMs);

    return diffInDays;
}


// -----------------------------------------------
// STEP 5: Decide the countdown badge text + color class
// based on how many days are left
// -----------------------------------------------

function getCountdownInfo(daysLeft) {

    if (daysLeft < 0) {
        return { text: "Completed", className: "done" };
    }

    if (daysLeft === 0) {
        return { text: "Today!", className: "urgent" };
    }

    if (daysLeft <= 3) {
        return { text: daysLeft + " days left", className: "urgent" };
    }

    if (daysLeft <= 7) {
        return { text: daysLeft + " days left", className: "soon" };
    }

    return { text: daysLeft + " days left", className: "later" };
}


// -----------------------------------------------
// STEP 6: Work out how many topics are done for one exam
// and return the percentage (0 to 100)
// -----------------------------------------------

function getSyllabusProgress(exam) {

    if (!exam.topics || exam.topics.length === 0) {
        return 0;
    }

    const doneCount = exam.topics.filter(function (topic) {
        return topic.done === true;
    }).length;

    const percentage = Math.round((doneCount / exam.topics.length) * 100);

    return percentage;
}


// -----------------------------------------------
// STEP 6B: UNIQUE FEATURE - "Readiness Score"
//
// This compares how much time is left with how much
// syllabus is actually done, and tells the student if
// they are ahead, on track, or falling behind.
//
// We assume a student ideally starts preparing 14 days
// before an exam. So at any point, we can calculate an
// "expected progress" and compare it to "actual progress".
// -----------------------------------------------

function getReadiness(exam, daysLeft) {

    // If exam already happened, no readiness needed
    if (daysLeft < 0) {
        return null;
    }

    const PREP_WINDOW_DAYS = 14; // assumed ideal prep time
    const actualProgress = getSyllabusProgress(exam);

    // How many days have "passed" out of our 14 day prep window
    const daysUsed = PREP_WINDOW_DAYS - daysLeft;

    // Expected progress if student prepared evenly (0 to 100)
    let expectedProgress = Math.round((daysUsed / PREP_WINDOW_DAYS) * 100);

    // Keep expectedProgress between 0 and 100
    if (expectedProgress < 0) expectedProgress = 0;
    if (expectedProgress > 100) expectedProgress = 100;

    const difference = actualProgress - expectedProgress;

    // Decide the readiness label based on the difference
    if (actualProgress >= 100) {
        return { label: "Fully Ready 🎉", className: "ready-great" };
    }

    if (difference >= 10) {
        return { label: "Ahead of Schedule 🚀", className: "ready-great" };
    }

    if (difference >= -10) {
        return { label: "On Track ✅", className: "ready-ok" };
    }

    if (difference >= -30) {
        return { label: "Catching Up ⚠️", className: "ready-warn" };
    }

    return { label: "Critical - Study Now 🔥", className: "ready-critical" };
}


// -----------------------------------------------
// STEP 6C: UNIQUE FEATURE - "Focus Today" suggestion
//
// Looks at all upcoming exams and picks the ONE exam
// that most urgently needs attention right now, based on
// how close the exam is and how far behind the prep is.
// -----------------------------------------------

function getFocusExam() {

    // Only look at exams that have not happened yet
    const upcomingExams = exams.filter(function (exam) {
        return getDaysLeft(exam.date) >= 0;
    });

    if (upcomingExams.length === 0) {
        return null;
    }

    let bestExam = null;
    let bestUrgencyScore = -Infinity;

    upcomingExams.forEach(function (exam) {

        const daysLeft = getDaysLeft(exam.date);
        const progress = getSyllabusProgress(exam);

        // Higher score = more urgent
        // Fewer days left, lower progress, AND lower confidence = higher urgency
        const confidence = exam.confidence || 5;
        const urgencyScore = (100 - progress) + ((14 - daysLeft) * 2) + ((10 - confidence) * 2);

        if (urgencyScore > bestUrgencyScore) {
            bestUrgencyScore = urgencyScore;
            bestExam = exam;
        }

    });

    return bestExam;
}


// -----------------------------------------------
// STEP 6D: Show the "Focus Today" banner on the page
// -----------------------------------------------

function renderFocusBanner() {

    const focusBanner = document.getElementById("focusBanner");
    const focusExam = getFocusExam();

    if (!focusExam) {
        focusBanner.classList.add("hidden");
        return;
    }

    const daysLeft = getDaysLeft(focusExam.date);
    const progress = getSyllabusProgress(focusExam);

    focusBanner.classList.remove("hidden");

    focusBanner.innerHTML = `
        <span class="focus-icon">🎯</span>
        <div>
            <strong>Focus Today: ${focusExam.name}</strong>
            <p>${progress}% syllabus done • ${daysLeft === 0 ? "Exam is today!" : daysLeft + " days left"}</p>
        </div>
    `;
}


// -----------------------------------------------
// STEP 6E: UNIQUE FEATURE - "Study Streak"
//
// Counts how many days in a row the student has
// ticked off at least one topic. Motivates daily study.
// -----------------------------------------------

// Helper: get today's date as a simple "YYYY-MM-DD" text
function getTodayString() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

// This runs every time a topic gets marked as done
function updateStreak() {

    // Get the saved streak info, or start fresh
    let streakData = JSON.parse(localStorage.getItem("streakData")) || {
        count: 0,
        lastActiveDate: ""
    };

    const today = getTodayString();

    // If we already studied today, don't count it again
    if (streakData.lastActiveDate === today) {
        return;
    }

    // Work out yesterday's date to check if streak continues
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    if (streakData.lastActiveDate === yesterdayString) {
        // Studied yesterday too - streak continues!
        streakData.count = streakData.count + 1;
    } else {
        // Missed a day (or first time ever) - streak restarts
        streakData.count = 1;
    }

    streakData.lastActiveDate = today;

    localStorage.setItem("streakData", JSON.stringify(streakData));

    renderStreakBadge();
}

// Show the streak badge on the page
function renderStreakBadge() {

    const streakData = JSON.parse(localStorage.getItem("streakData")) || {
        count: 0,
        lastActiveDate: ""
    };

    if (streakData.count <= 0) {
        streakBadge.classList.add("hidden");
        return;
    }

    streakBadge.classList.remove("hidden");
    streakBadge.innerHTML = `🔥 ${streakData.count} day${streakData.count > 1 ? "s" : ""} streak`;
}


// -----------------------------------------------
// STEP 6F: UNIQUE FEATURE - "Completion Celebration"
//
// Shows a small celebration message when a student
// finishes 100% of an exam's syllabus.
// -----------------------------------------------

function showCelebration(examName) {

    celebrationToast.textContent = `🎉 Awesome! You finished the syllabus for "${examName}"!`;
    celebrationToast.classList.remove("hidden");
    celebrationToast.classList.add("show");

    // Hide it automatically after 3 seconds
    setTimeout(function () {
        celebrationToast.classList.remove("show");
        celebrationToast.classList.add("hidden");
    }, 3000);
}


// -----------------------------------------------
// STEP 7: Update the 4 stat cards at the top
// -----------------------------------------------

function updateStats() {

    let weekCount = 0;
    let upcoming = 0;
    let completed = 0;

    exams.forEach(function (exam) {

        const daysLeft = getDaysLeft(exam.date);

        if (daysLeft < 0) {
            completed = completed + 1;
        } else if (daysLeft <= 7) {
            weekCount = weekCount + 1;
            upcoming = upcoming + 1;
        } else {
            upcoming = upcoming + 1;
        }

    });

    totalExamsCount.textContent = exams.length;
    thisWeekCount.textContent = weekCount;
    upcomingCount.textContent = upcoming;
    completedCount.textContent = completed;
}


// -----------------------------------------------
// STEP 8: Build the HTML for one exam card
// -----------------------------------------------

function createExamCard(exam) {

    const daysLeft = getDaysLeft(exam.date);
    const countdown = getCountdownInfo(daysLeft);
    const progress = getSyllabusProgress(exam);
    const readiness = getReadiness(exam, daysLeft);

    // Create the main card container
    const card = document.createElement("div");
    card.className = "exam-card";
    card.setAttribute("data-subject", exam.subject);

    // Format the date nicely (e.g. 20 Aug 2026)
    const dateObj = new Date(exam.date);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    // Build the topics list HTML
    let topicsHtml = "";

    exam.topics.forEach(function (topic) {

        topicsHtml += `
            <div class="topic-item ${topic.done ? "done" : ""}">
                <input
                    type="checkbox"
                    ${topic.done ? "checked" : ""}
                    onchange="toggleTopic('${exam.id}', '${topic.id}')"
                >
                <span>${topic.name}</span>
                <button class="remove-topic" onclick="removeTopic('${exam.id}', '${topic.id}')">✖</button>
            </div>
        `;

    });

    // Put everything together
    card.innerHTML = `

        <div class="exam-card-top">

            <div>
                <h3>${exam.name}</h3>

                <div class="exam-meta">
                    <span class="badge subject-badge" data-subject="${exam.subject}">
                        📚 ${exam.subject}
                    </span>
                    <span>📅 ${formattedDate}</span>
                    ${exam.time ? `<span>⏰ ${exam.time}</span>` : ""}
                    ${exam.venue ? `<span>📍 ${exam.venue}</span>` : ""}
                </div>
            </div>

            <div style="display:flex; align-items:center; gap:10px;">
                <span class="countdown-badge ${countdown.className}">
                    ${countdown.text}
                </span>

                <button class="delete-exam-button" onclick="deleteExam('${exam.id}')">
                    🗑
                </button>
            </div>

        </div>

        <div class="syllabus-section">

            <div class="syllabus-progress-label">
                <span>Syllabus Progress</span>
                <span>${progress}%</span>
            </div>

            ${readiness ? `<span class="readiness-badge ${readiness.className}">${readiness.label}</span>` : ""}

            <div class="syllabus-progress-bar-track">
                <div class="syllabus-progress-bar-fill" style="width: ${progress}%;"></div>
            </div>

            <div class="topic-list">
                ${topicsHtml}
            </div>

            <div class="add-topic-row">
                <input type="text" id="topicInput-${exam.id}" placeholder="Add a topic/chapter...">
                <button onclick="addTopic('${exam.id}')">Add</button>
            </div>

            <div class="confidence-row">
                <label>
                    <span>💪 Confidence Level</span>
                    <span>${exam.confidence || 5}/10 <span class="confidence-emoji">${getConfidenceEmoji(exam.confidence || 5)}</span></span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value="${exam.confidence || 5}"
                    onchange="updateConfidence('${exam.id}', this.value)"
                >
            </div>

        </div>

    `;

    return card;
}


// -----------------------------------------------
// STEP 9: Render (draw) all exam cards on the page
// -----------------------------------------------

function renderExams() {

    // Clear the current list first
    examListSection.innerHTML = "";

    if (exams.length === 0) {
        emptyMessage.classList.add("show");
    } else {
        emptyMessage.classList.remove("show");
    }

    // Sort exams so the nearest exam date comes first
    const sortedExams = [...exams].sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    sortedExams.forEach(function (exam) {
        const card = createExamCard(exam);
        examListSection.appendChild(card);
    });

    updateStats();
    renderFocusBanner();
}


// -----------------------------------------------
// STEP 10: Add a new exam (called when the form is submitted)
// -----------------------------------------------

examForm.addEventListener("submit", function (e) {

    e.preventDefault(); // stop the page from refreshing

    const newExam = {
        id: Date.now().toString(), // simple unique id using current time
        name: document.getElementById("examName").value,
        subject: document.getElementById("examSubject").value,
        date: document.getElementById("examDate").value,
        time: document.getElementById("examTime").value,
        venue: document.getElementById("examVenue").value,
        topics: [],
        confidence: 5, // starts in the middle (1 = low, 10 = high)
        celebrated: false
    };

    exams.push(newExam);

    saveExams();
    renderExams();

    examForm.reset();
    examModal.classList.add("hidden");

});


// -----------------------------------------------
// STEP 11: Delete an exam
// -----------------------------------------------

function deleteExam(examId) {

    const confirmDelete = confirm("Are you sure you want to delete this exam?");

    if (!confirmDelete) {
        return;
    }

    exams = exams.filter(function (exam) {
        return exam.id !== examId;
    });

    saveExams();
    renderExams();
}


// -----------------------------------------------
// STEP 12: Add a topic to an exam's syllabus checklist
// -----------------------------------------------

function addTopic(examId) {

    const input = document.getElementById("topicInput-" + examId);
    const topicName = input.value.trim();

    if (topicName === "") {
        return;
    }

    const exam = exams.find(function (exam) {
        return exam.id === examId;
    });

    exam.topics.push({
        id: Date.now().toString(),
        name: topicName,
        done: false
    });

    saveExams();
    renderExams();
}


// -----------------------------------------------
// STEP 13: Tick / untick a topic as done
// -----------------------------------------------

function toggleTopic(examId, topicId) {

    const exam = exams.find(function (exam) {
        return exam.id === examId;
    });

    const topic = exam.topics.find(function (topic) {
        return topic.id === topicId;
    });

    topic.done = !topic.done;

    // If the topic was just marked as done, count it towards today's streak
    if (topic.done) {
        updateStreak();
    }

    // Check if the whole syllabus just became 100% complete
    const newProgress = getSyllabusProgress(exam);

    if (newProgress === 100 && !exam.celebrated) {
        exam.celebrated = true;
        showCelebration(exam.name);
    } else if (newProgress < 100) {
        // Allow the celebration to show again later if topics are unchecked and redone
        exam.celebrated = false;
    }

    saveExams();
    renderExams();
    renderStreakBadge();
}


// -----------------------------------------------
// STEP 14: Remove a single topic from the checklist
// -----------------------------------------------

function removeTopic(examId, topicId) {

    const exam = exams.find(function (exam) {
        return exam.id === examId;
    });

    exam.topics = exam.topics.filter(function (topic) {
        return topic.id !== topicId;
    });

    saveExams();
    renderExams();
}


// -----------------------------------------------
// STEP 14B: UNIQUE FEATURE - Update confidence level
// -----------------------------------------------

function updateConfidence(examId, newValue) {

    const exam = exams.find(function (exam) {
        return exam.id === examId;
    });

    exam.confidence = parseInt(newValue);

    saveExams();
    renderExams();
}

// Small helper: pick an emoji that matches the confidence number
function getConfidenceEmoji(confidence) {

    if (confidence >= 8) {
        return "😄";
    }

    if (confidence >= 5) {
        return "🙂";
    }

    if (confidence >= 3) {
        return "😕";
    }

    return "😟";
}

addExamButton.addEventListener("click", function () {
    examModal.classList.remove("hidden");
});

closeModalButton.addEventListener("click", function () {
    examModal.classList.add("hidden");
});

// Also close the popup if user clicks outside the white box
examModal.addEventListener("click", function (e) {
    if (e.target === examModal) {
        examModal.classList.add("hidden");
    }
});


// -----------------------------------------------
// STEP 16: Dark / Light theme
// (No toggle button on this page - dark mode is
// controlled from the Dashboard. We just check here
// if dark mode was turned on there, and apply it.)
// -----------------------------------------------

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}


// -----------------------------------------------
// STEP 18: Run this once when the page first loads
// -----------------------------------------------

renderExams();