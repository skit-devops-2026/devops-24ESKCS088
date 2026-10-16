// ======================================
// STORAGE HELPERS
// ======================================

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

        alert("Unable to save calendar data in this browser.");

    }

}


// ======================================
// ELEMENTS
// ======================================

const monthYear = document.getElementById("monthYear");

const calendarDays = document.getElementById("calendarDays");

const prevMonthBtn = document.getElementById("prevMonthBtn");

const nextMonthBtn = document.getElementById("nextMonthBtn");

const todayBtn = document.getElementById("todayBtn");

const addEventBtn = document.getElementById("addEventBtn");

const eventModal = document.getElementById("eventModal");

const detailsModal = document.getElementById("detailsModal");

const eventForm = document.getElementById("eventForm");

const modalTitle = document.getElementById("modalTitle");

const closeModalBtn = document.getElementById("closeModalBtn");

const cancelBtn = document.getElementById("cancelBtn");

const closeDetailsBtn = document.getElementById("closeDetailsBtn");

const categoryFilter = document.getElementById("categoryFilter");

const upcomingEvents = document.getElementById("upcomingEvents");

const editEventBtn = document.getElementById("editEventBtn");

const deleteEventBtn = document.getElementById("deleteEventBtn");

const eventDetailsBody = document.getElementById("eventDetailsBody");


// ======================================
// FORM ELEMENTS
// ======================================

const eventTitle = document.getElementById("eventTitle");

const eventCategory = document.getElementById("eventCategory");

const eventPriority = document.getElementById("eventPriority");

const eventDate = document.getElementById("eventDate");

const startTime = document.getElementById("startTime");

const endTime = document.getElementById("endTime");

const eventSubject = document.getElementById("eventSubject");

const eventDescription = document.getElementById("eventDescription");


// ======================================
// CALENDAR STATE
// ======================================

let currentDate = new Date();

currentDate.setHours(12, 0, 0, 0);

let currentView = "month";

let selectedEventId = null;

let editingEventId = null;

let events = loadData("studyPlannerCalendarEvents", []);

if (!Array.isArray(events)) {
    events = [];
}


// ======================================
// DATE HELPERS
// ======================================

function dateKey(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function parseDate(value) {

    const parts = value.split("-").map(Number);

    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2],
        12,
        0,
        0,
        0
    );

}


function formatDate(value) {

    if (!value) {
        return "Not specified";
    }

    return parseDate(value).toLocaleDateString("en-IN", {

        day: "numeric",

        month: "long",

        year: "numeric"

    });

}


function sameDay(dateA, dateB) {

    return dateKey(dateA) === dateKey(dateB);

}


function getMonthStart(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
        12
    );

}


function getMonthEnd(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        12
    );

}


// ======================================
// CATEGORY STYLING
// ======================================

function getCategoryClass(category) {

    const classes = {

        Task: "task-event",

        Exam: "exam-event",

        Study: "study-event",

        Personal: "personal-event",

        Other: "other-event"

    };

    return classes[category] || "other-event";

}


function getCategoryBackground(category) {

    const classes = {

        Task: "task-event",

        Exam: "exam-event",

        Study: "study-event",

        Personal: "personal-event",

        Other: "other-event"

    };

    return classes[category] || "other-event";

}


// ======================================
// FILTER EVENTS
// ======================================

function getVisibleEvents() {

    const selectedCategory = categoryFilter.value;

    return events.filter(event => {

        if (
            selectedCategory !== "All" &&
            event.category !== selectedCategory
        ) {

            return false;

        }

        return true;

    });

}


function getEventsForDate(date) {

    const key = dateKey(date);

    return getVisibleEvents()

        .filter(event => event.date === key)

        .sort((a, b) => {

            const timeA = a.startTime || "99:99";

            const timeB = b.startTime || "99:99";

            return timeA.localeCompare(timeB);

        });

}


// ======================================
// RENDER CALENDAR
// ======================================

function renderCalendar() {

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    monthYear.textContent = currentDate.toLocaleDateString("en-US", {

        month: "long",

        year: "numeric"

    });


    calendarDays.innerHTML = "";


    calendarDays.classList.toggle(
        "week-view",
        currentView === "week"
    );

    calendarDays.classList.toggle(
        "day-view",
        currentView === "day"
    );


    let dates = [];


    if (currentView === "month") {

        const firstDay = new Date(year, month, 1, 12);

        const mondayOffset = (firstDay.getDay() + 6) % 7;

        const gridStart = new Date(year, month, 1 - mondayOffset, 12);


        for (let i = 0; i < 42; i++) {

            const date = new Date(gridStart);

            date.setDate(gridStart.getDate() + i);

            dates.push(date);

        }

    } else if (currentView === "week") {

        const mondayOffset = (currentDate.getDay() + 6) % 7;

        const monday = new Date(currentDate);

        monday.setDate(currentDate.getDate() - mondayOffset);

        for (let i = 0; i < 7; i++) {

            const date = new Date(monday);

            date.setDate(monday.getDate() + i);

            dates.push(date);

        }

    } else {

        dates = [new Date(currentDate)];

    }


    dates.forEach(date => {

        const cell = document.createElement("div");

        cell.className = "day-cell";

        if (date.getMonth() !== month && currentView === "month") {

            cell.classList.add("other-month");

        }


        if (sameDay(date, new Date())) {

            cell.classList.add("today");

        }


        const dayNumber = document.createElement("div");

        dayNumber.className = "day-number";

        dayNumber.textContent = date.getDate();


        const dayEvents = document.createElement("div");

        dayEvents.className = "day-events";


        const dateEvents = getEventsForDate(date);

        const maxEvents = currentView === "month" ? 3 : 10;


        dateEvents.slice(0, maxEvents).forEach(event => {

            const chip = document.createElement("button");

            chip.type = "button";

            chip.className =
                "event-chip " + getCategoryClass(event.category);

            chip.textContent = event.startTime
                ? `${event.startTime} ${event.title}`
                : event.title;

            chip.title = event.title;

            chip.addEventListener("click", function (e) {

                e.stopPropagation();

                openEventDetails(event.id);

            });


            dayEvents.appendChild(chip);

        });


        if (dateEvents.length > maxEvents) {

            const more = document.createElement("div");

            more.className = "more-events";

            more.textContent =
                `+${dateEvents.length - maxEvents} more`;

            dayEvents.appendChild(more);

        }


        cell.appendChild(dayNumber);

        cell.appendChild(dayEvents);


        cell.addEventListener("click", function () {

            openAddEventModal(dateKey(date));

        });


        calendarDays.appendChild(cell);

    });


    updateStatistics();

    renderUpcomingEvents();

}


// ======================================
// NAVIGATION
// ======================================

prevMonthBtn.addEventListener("click", function () {

    if (currentView === "day") {

        currentDate.setDate(currentDate.getDate() - 1);

    } else if (currentView === "week") {

        currentDate.setDate(currentDate.getDate() - 7);

    } else {

        currentDate.setDate(1);

        currentDate.setMonth(currentDate.getMonth() - 1);

    }

    renderCalendar();

});


nextMonthBtn.addEventListener("click", function () {

    if (currentView === "day") {

        currentDate.setDate(currentDate.getDate() + 1);

    } else if (currentView === "week") {

        currentDate.setDate(currentDate.getDate() + 7);

    } else {

        currentDate.setDate(1);

        currentDate.setMonth(currentDate.getMonth() + 1);

    }

    renderCalendar();

});


todayBtn.addEventListener("click", function () {

    currentDate = new Date();

    currentDate.setHours(12, 0, 0, 0);

    renderCalendar();

});


// ======================================
// CHANGE VIEW
// ======================================

document.querySelectorAll(".view-btn").forEach(button => {

    button.addEventListener("click", function () {

        currentView = button.dataset.view;

        document.querySelectorAll(".view-btn").forEach(btn => {

            btn.classList.toggle("active", btn === button);

        });

        renderCalendar();

    });

});


// ======================================
// FILTER
// ======================================

categoryFilter.addEventListener("change", function () {

    renderCalendar();

});


// ======================================
// MODAL HELPERS
// ======================================

function openModal(modal) {

    modal.classList.add("show");

}


function closeModal(modal) {

    modal.classList.remove("show");

}


function getTodayKey() {

    return dateKey(new Date());

}


// ======================================
// ADD EVENT MODAL
// ======================================

addEventBtn.addEventListener("click", function () {

    openAddEventModal(getTodayKey());

});


function openAddEventModal(date = getTodayKey()) {

    eventForm.reset();

    editingEventId = null;

    modalTitle.textContent = "Add New Event";

    eventDate.value = date;

    eventCategory.value = "Task";

    eventPriority.value = "Medium";

    openModal(eventModal);

    eventTitle.focus();

}


closeModalBtn.addEventListener("click", function () {

    closeModal(eventModal);

});


cancelBtn.addEventListener("click", function () {

    closeModal(eventModal);

});


closeDetailsBtn.addEventListener("click", function () {

    closeModal(detailsModal);

});


eventModal.addEventListener("click", function (event) {

    if (event.target === eventModal) {

        closeModal(eventModal);

    }

});


detailsModal.addEventListener("click", function (event) {

    if (event.target === detailsModal) {

        closeModal(detailsModal);

    }

});


document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeModal(eventModal);

        closeModal(detailsModal);

    }

});


// ======================================
// SAVE EVENT
// ======================================

eventForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const title = eventTitle.value.trim();

    const date = eventDate.value;

    const start = startTime.value;

    const end = endTime.value;


    if (!title || !date) {

        alert("Please enter an event title and date.");

        return;

    }


    if (start && end && end <= start) {

        alert("End time must be later than start time.");

        return;

    }


    const eventData = {

        title: title,

        category: eventCategory.value,

        priority: eventPriority.value,

        date: date,

        startTime: start,

        endTime: end,

        subject: eventSubject.value.trim(),

        description: eventDescription.value.trim()

    };


    if (editingEventId !== null) {

        const index = events.findIndex(
            item => item.id === editingEventId
        );

        if (index !== -1) {

            events[index] = {

                ...events[index],

                ...eventData

            };

        }

    } else {

        events.push({

            id: Date.now(),

            ...eventData,

            createdAt: new Date().toISOString()

        });

    }


    saveData("studyPlannerCalendarEvents", events);


    closeModal(eventModal);

    renderCalendar();

});


// ======================================
// EVENT DETAILS
// ======================================

function openEventDetails(id) {

    const event = events.find(item => item.id === id);

    if (!event) {

        return;

    }


    selectedEventId = id;


    document.getElementById("detailsTitle").textContent = event.title;

    document.getElementById("detailsCategory").textContent =
        event.category + " · " + event.priority + " Priority";


    eventDetailsBody.innerHTML = "";


    const details = [

        ["Date", formatDate(event.date)],

        ["Start Time", event.startTime || "Not specified"],

        ["End Time", event.endTime || "Not specified"],

        ["Subject / Project", event.subject || "Not specified"],

        ["Description", event.description || "No description added"]

    ];


    details.forEach(([label, value]) => {

        const row = document.createElement("div");

        row.className = "detail-row";


        const heading = document.createElement("strong");

        heading.textContent = label;


        const paragraph = document.createElement("p");

        paragraph.textContent = value;


        row.append(heading, paragraph);

        eventDetailsBody.appendChild(row);

    });


    openModal(detailsModal);

}


// ======================================
// EDIT EVENT
// ======================================

editEventBtn.addEventListener("click", function () {

    const event = events.find(item => item.id === selectedEventId);

    if (!event) {

        return;

    }


    editingEventId = event.id;


    eventTitle.value = event.title;

    eventCategory.value = event.category;

    eventPriority.value = event.priority;

    eventDate.value = event.date;

    startTime.value = event.startTime || "";

    endTime.value = event.endTime || "";

    eventSubject.value = event.subject || "";

    eventDescription.value = event.description || "";


    modalTitle.textContent = "Edit Event";


    closeModal(detailsModal);

    openModal(eventModal);

});


// ======================================
// DELETE EVENT
// ======================================

deleteEventBtn.addEventListener("click", function () {

    const event = events.find(item => item.id === selectedEventId);

    if (!event) {

        return;

    }


    const confirmed = confirm(
        `Are you sure you want to delete "${event.title}"?`
    );


    if (!confirmed) {

        return;

    }


    events = events.filter(
        item => item.id !== selectedEventId
    );


    saveData("studyPlannerCalendarEvents", events);


    closeModal(detailsModal);

    renderCalendar();

});


// ======================================
// UPCOMING EVENTS
// ======================================

function renderUpcomingEvents() {

    upcomingEvents.innerHTML = "";


    const today = getTodayKey();

    const selectedCategory = categoryFilter.value;


    const upcoming = events

        .filter(event => {

            return event.date >= today &&

                (

                    selectedCategory === "All" ||

                    event.category === selectedCategory

                );

        })

        .sort((a, b) => {

            const dateComparison = a.date.localeCompare(b.date);

            if (dateComparison !== 0) {

                return dateComparison;

            }

            return (a.startTime || "99:99").localeCompare(
                b.startTime || "99:99"
            );

        })

        .slice(0, 8);


    if (upcoming.length === 0) {

        upcomingEvents.innerHTML = `

            <div class="no-upcoming">

                <div style="font-size: 30px;">📅</div>

                <p>No upcoming events.</p>

                <p>Click Add Event to plan your schedule.</p>

            </div>

        `;

        return;

    }


    upcoming.forEach(event => {

        const date = parseDate(event.date);


        const item = document.createElement("div");

        item.className = "upcoming-item";


        const dateBox = document.createElement("div");

        dateBox.className = "upcoming-date";


        const day = document.createElement("strong");

        day.textContent = date.getDate();


        const month = document.createElement("span");

        month.textContent = date.toLocaleDateString("en-US", {

            month: "short"

        });


        dateBox.append(day, month);


        const info = document.createElement("div");

        info.className = "upcoming-info";


        const title = document.createElement("h3");

        title.textContent = event.title;


        const time = document.createElement("p");

        time.textContent = event.startTime

            ? `${event.startTime}${event.endTime ? " – " + event.endTime : ""}`

            : "Time not specified";


        const category = document.createElement("span");

        category.className =
            "upcoming-category " +
            getCategoryBackground(event.category);

        category.textContent = event.category;


        info.append(title, time, category);


        item.append(dateBox, info);


        item.addEventListener("click", function () {

            openEventDetails(event.id);

        });


        upcomingEvents.appendChild(item);

    });

}


// ======================================
// STATISTICS
// ======================================

function updateStatistics() {

    const firstDay = dateKey(getMonthStart(currentDate));

    const lastDay = dateKey(getMonthEnd(currentDate));


    const monthEvents = events.filter(event => {

        return event.date >= firstDay && event.date <= lastDay;

    });


    document.getElementById("totalEvents").textContent =
        monthEvents.length;


    document.getElementById("totalTasks").textContent =

        monthEvents.filter(event => {

            return event.category === "Task";

        }).length;


    const today = getTodayKey();


    document.getElementById("totalExams").textContent =

        events.filter(event => {

            return event.category === "Exam" && event.date >= today;

        }).length;

}


// ======================================
// INITIALIZE
// ======================================

renderCalendar();