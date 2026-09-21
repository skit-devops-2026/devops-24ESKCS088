// ===============================
// GET HTML ELEMENTS
// ===============================

const taskModal = document.getElementById("taskModal");

const addTaskButton = document.getElementById("addTaskButton");
const clearCompletedButton = document.getElementById("clearCompletedButton");

const closeModal = document.getElementById("closeModal");

const cancelButton = document.getElementById("cancelButton");

const taskForm = document.getElementById("taskForm");

const modalTitle = document.getElementById("modalTitle");


// Form inputs

const taskTitle = document.getElementById("taskTitle");

const taskDescription = document.getElementById("taskDescription");

const taskSubject = document.getElementById("taskSubject");

const taskCategory = document.getElementById("taskCategory");

const taskPriority = document.getElementById("taskPriority");

const taskStatus = document.getElementById("taskStatus");

const taskDate = document.getElementById("taskDate");

const taskTime = document.getElementById("taskTime");

const taskDuration = document.getElementById("taskDuration");


// Task display

const taskContainer = document.getElementById("taskContainer");


// Search and filters

const searchInput = document.getElementById("searchInput");

const subjectFilter = document.getElementById("subjectFilter");

const priorityFilter = document.getElementById("priorityFilter");

const statusFilter = document.getElementById("statusFilter");

const categoryFilter = document.getElementById("categoryFilter");

const sortSelect = document.getElementById("sortSelect");


// Statistics

const totalTasks = document.getElementById("totalTasks");

const pendingTasks = document.getElementById("pendingTasks");

const progressTasks = document.getElementById("progressTasks");

const completedTasks = document.getElementById("completedTasks");

const overdueTasks = document.getElementById("overdueTasks");

const progressBar = document.getElementById("progressBar");

const progressPercent = document.getElementById("progressPercent");

const progressText = document.getElementById("progressText");


// ===============================
// TASK ARRAY
// ===============================

// Get tasks from localStorage

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];


// This variable tells us whether
// we are adding or editing a task

let editingTaskId = null;


// ===============================
// OPEN MODAL
// ===============================

clearCompletedButton.addEventListener("click", function () {

    clearCompletedTasks();

});


addTaskButton.addEventListener("click", function () {

    editingTaskId = null;

    modalTitle.textContent = "Add New Task";

    taskForm.reset();

    taskModal.classList.remove("hidden");

});


// ===============================
// CLOSE MODAL
// ===============================

closeModal.addEventListener("click", closeTaskModal);

cancelButton.addEventListener("click", closeTaskModal);


function closeTaskModal() {

    taskModal.classList.add("hidden");

    taskForm.reset();

    editingTaskId = null;

}


// ===============================
// ADD / EDIT TASK
// ===============================

taskForm.addEventListener("submit", function (event) {

    // Prevent page refresh

    event.preventDefault();


    // Create task object

    const taskData = {

        title: taskTitle.value.trim(),

        description: taskDescription.value.trim(),

        subject: taskSubject.value,

        category: taskCategory.value,

        priority: taskPriority.value,

        status: taskStatus.value,

        date: taskDate.value,

        time: taskTime.value,

        duration: taskDuration.value

    };


    // Check if we are editing

    if (editingTaskId !== null) {

        tasks = tasks.map(function (task) {

            if (task.id === editingTaskId) {

                return {

                    ...task,

                    ...taskData

                };

            }

            return task;

        });

    }

    else {

        // Create new task

        const newTask = {

            id: Date.now(),

            ...taskData,

            createdAt: new Date().toISOString()

        };


        tasks.push(newTask);

    }


    // Save tasks

    saveTasks();


    // Update page

    displayTasks();

    updateStatistics();


    // Close modal

    closeTaskModal();

});


// ===============================
// SAVE TASKS
// ===============================

function saveTasks() {

    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );

}


// ===============================
// DISPLAY TASKS
// ===============================

function displayTasks() {

    taskContainer.innerHTML = "";


    let filteredTasks = [...tasks];


    // ===========================
    // SEARCH
    // ===========================

    const searchValue =
        searchInput.value.toLowerCase().trim();


    if (searchValue !== "") {

        filteredTasks = filteredTasks.filter(function (task) {

            return (

                task.title.toLowerCase().includes(searchValue)

                ||

                task.description.toLowerCase().includes(searchValue)

                ||

                task.subject.toLowerCase().includes(searchValue)

            );

        });

    }


    // ===========================
    // SUBJECT FILTER
    // ===========================

    if (subjectFilter.value !== "all") {

        filteredTasks = filteredTasks.filter(function (task) {

            return task.subject === subjectFilter.value;

        });

    }


    // ===========================
    // PRIORITY FILTER
    // ===========================

    if (priorityFilter.value !== "all") {

        filteredTasks = filteredTasks.filter(function (task) {

            return task.priority === priorityFilter.value;

        });

    }


    // ===========================
    // STATUS FILTER
    // ===========================

    if (statusFilter.value !== "all") {

        filteredTasks = filteredTasks.filter(function (task) {

            return task.status === statusFilter.value;

        });

    }


    // ===========================
    // CATEGORY FILTER
    // ===========================

    if (categoryFilter.value !== "all") {

        filteredTasks = filteredTasks.filter(function (task) {

            return task.category === categoryFilter.value;

        });

    }


    // ===========================
    // SORT
    // ===========================

    if (sortSelect.value === "newest") {

        filteredTasks.sort(function (a, b) {

            return b.id - a.id;

        });

    }


    if (sortSelect.value === "oldest") {

        filteredTasks.sort(function (a, b) {

            return a.id - b.id;

        });

    }


    if (sortSelect.value === "date") {

        filteredTasks.sort(function (a, b) {

            return new Date(a.date) - new Date(b.date);

        });

    }


    if (sortSelect.value === "priority") {

        const priorityOrder = {

            High: 1,

            Medium: 2,

            Low: 3

        };


        filteredTasks.sort(function (a, b) {

            return (
                priorityOrder[a.priority]
                -
                priorityOrder[b.priority]
            );

        });

    }


    // ===========================
    // NO TASKS
    // ===========================

    if (filteredTasks.length === 0) {

        taskContainer.innerHTML = `

            <div class="empty-message">

                <div style="font-size:40px;">
                    📝
                </div>

                <h3>
                    No tasks found
                </h3>

                <p>
                    Add a new task or change your filters.
                </p>

            </div>

        `;

        return;

    }


    // ===========================
    // CREATE SECTIONS
    // ===========================

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const tomorrow = new Date(today);

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const sections = {

        overdue: [],

        today: [],

        tomorrow: [],

        upcoming: [],

        completed: []

    };


    filteredTasks.forEach(function (task) {

        const taskDate = new Date(task.date);

        taskDate.setHours(0, 0, 0, 0);


        if (task.status === "Completed") {

            sections.completed.push(task);

        }

        else if (taskDate < today) {

            sections.overdue.push(task);

        }

        else if (taskDate.getTime() === today.getTime()) {

            sections.today.push(task);

        }

        else if (
            taskDate.getTime()
            ===
            tomorrow.getTime()
        ) {

            sections.tomorrow.push(task);

        }

        else {

            sections.upcoming.push(task);

        }

    });


    // ===========================
    // DISPLAY EACH SECTION
    // ===========================

    addSection(
        "⚠️ Overdue",
        sections.overdue
    );


    addSection(
        "📌 Today's Tasks",
        sections.today
    );


    addSection(
        "📅 Tomorrow",
        sections.tomorrow
    );


    addSection(
        "🗓️ Upcoming",
        sections.upcoming
    );


    addSection(
        "✅ Completed",
        sections.completed
    );

}


// ===============================
// ADD SECTION
// ===============================

function addSection(title, sectionTasks) {

    if (sectionTasks.length === 0) {

        return;

    }


    const section = document.createElement("div");

    section.className = "task-section";


    section.innerHTML = `

        <div class="section-heading">

            <h2>
                ${title}
            </h2>

            <span class="section-count">
                ${sectionTasks.length}
            </span>

        </div>

    `;


    sectionTasks.forEach(function (task) {

        section.appendChild(
            createTaskCard(task)
        );

    });


    taskContainer.appendChild(section);

}


// ===============================
// CREATE TASK CARD
// ===============================

function createTaskCard(task) {

    const card = document.createElement("div");

    card.className = "task-card";

    card.setAttribute("data-subject", task.subject);


    // Completed class

    if (task.status === "Completed") {

        card.classList.add("completed");

    }


    // Check overdue

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const taskDate = new Date(task.date);

    taskDate.setHours(0, 0, 0, 0);


    if (
        taskDate < today
        &&
        task.status !== "Completed"
    ) {

        card.classList.add("overdue");

    }


    // Priority class

    let priorityClass = "";


    if (task.priority === "High") {

        priorityClass = "priority-high";

    }

    else if (task.priority === "Medium") {

        priorityClass = "priority-medium";

    }

    else {

        priorityClass = "priority-low";

    }


    // Format date

    const formattedDate =
        formatDate(task.date);


    card.innerHTML = `

        <input
            type="checkbox"
            class="task-checkbox"
            ${task.status === "Completed" ? "checked" : ""}
        >


        <div class="task-info">

            <div class="task-title">
                ${task.title}
            </div>


            <div class="task-description">

                ${task.description || "No description"}

            </div>


            <div class="task-meta">

                <span class="badge subject-badge" data-subject="${task.subject}">
                    📚 ${task.subject}
                </span>

                <span class="badge category-badge">
                    📂 ${task.category}
                </span>

                <span class="badge ${priorityClass}">
                    ${task.priority}
                </span>

                <span class="badge status-badge">
                    ${task.status}
                </span>

                <span class="badge category-badge">
                    ⏱️ ${task.duration}
                </span>

            </div>

        </div>


        <div class="task-date">

            📅 ${formattedDate}

            <br>

            ${task.time ? "🕐 " + task.time : ""}

        </div>


        <div class="task-actions">

            <button
                class="edit-button"
                title="Edit"
            >
                ✏️
            </button>


            <button
                class="delete-button"
                title="Delete"
            >
                🗑️
            </button>

        </div>

    `;


    // ===========================
    // CHECKBOX
    // ===========================

    const checkbox =
        card.querySelector(".task-checkbox");


    checkbox.addEventListener(
        "change",
        function () {

            toggleComplete(task.id);

        }
    );


    // ===========================
    // EDIT BUTTON
    // ===========================

    card.querySelector(".edit-button")
        .addEventListener(
            "click",
            function () {

                editTask(task.id);

            }
        );


    // ===========================
    // DELETE BUTTON
    // ===========================

    card.querySelector(".delete-button")
        .addEventListener(
            "click",
            function () {

                deleteTask(task.id);

            }
        );


    return card;

}


// ===============================
// EDIT TASK
// ===============================

function editTask(id) {

    const task =
        tasks.find(function (task) {

            return task.id === id;

        });


    if (!task) {

        return;

    }


    editingTaskId = id;


    modalTitle.textContent =
        "Edit Task";


    taskTitle.value =
        task.title;


    taskDescription.value =
        task.description;


    taskSubject.value =
        task.subject;


    taskCategory.value =
        task.category;


    taskPriority.value =
        task.priority;


    taskStatus.value =
        task.status;


    taskDate.value =
        task.date;


    taskTime.value =
        task.time;


    taskDuration.value =
        task.duration;


    taskModal.classList.remove("hidden");

}


// ===============================
// DELETE TASK
// ===============================

function deleteTask(id) {

    const answer =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!answer) {

        return;

    }


    tasks = tasks.filter(function (task) {

        return task.id !== id;

    });


    saveTasks();

    displayTasks();

    updateStatistics();

}


// ===============================
// CLEAR COMPLETED TASKS
// ===============================

function clearCompletedTasks() {

    const completedCount =
        tasks.filter(function (task) {

            return task.status === "Completed";

        }).length;


    if (completedCount === 0) {

        alert("No completed tasks to clear!");

        return;

    }


    const answer =
        confirm(
            "Remove all " + completedCount + " completed task(s)?"
        );


    if (!answer) {

        return;

    }


    tasks = tasks.filter(function (task) {

        return task.status !== "Completed";

    });


    saveTasks();

    displayTasks();

    updateStatistics();

}


// ===============================
// COMPLETE TASK
// ===============================

function toggleComplete(id) {

    tasks = tasks.map(function (task) {

        if (task.id === id) {

            if (task.status === "Completed") {

                task.status = "Pending";

            }

            else {

                task.status = "Completed";

            }

        }


        return task;

    });


    saveTasks();

    displayTasks();

    updateStatistics();

}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// ===============================
// UPDATE STATISTICS
// ===============================

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(function (task) {

            return task.status === "Completed";

        }).length;


    const pending =
        tasks.filter(function (task) {

            return task.status === "Pending";

        }).length;


    const inProgress =
        tasks.filter(function (task) {

            return task.status === "In Progress";

        }).length;


    // Calculate overdue

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const overdue =
        tasks.filter(function (task) {

            const date =
                new Date(task.date);

            date.setHours(0, 0, 0, 0);


            return (
                date < today
                &&
                task.status !== "Completed"
            );

        }).length;


    // Show numbers

    totalTasks.textContent =
        total;


    pendingTasks.textContent =
        pending;


    progressTasks.textContent =
        inProgress;


    completedTasks.textContent =
        completed;


    overdueTasks.textContent =
        overdue;


    // Progress percentage

    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


    progressBar.style.width =
        percentage + "%";


    progressPercent.textContent =
        percentage + "%";


    progressText.textContent =
        completed
        +
        " of "
        +
        total
        +
        " tasks completed";

}


// ===============================
// SEARCH EVENTS
// ===============================

searchInput.addEventListener(
    "input",
    displayTasks
);


subjectFilter.addEventListener(
    "change",
    displayTasks
);


priorityFilter.addEventListener(
    "change",
    displayTasks
);


statusFilter.addEventListener(
    "change",
    displayTasks
);


categoryFilter.addEventListener(
    "change",
    displayTasks
);


sortSelect.addEventListener(
    "change",
    displayTasks
);


// ===============================
// DARK MODE
// ===============================

const themeButton =
    document.getElementById(
        "themeButton"
    );


themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        if (
            document.body.classList.contains(
                "dark"
            )
        ) {

            themeButton.textContent =
                "☀️";

        }

        else {

            themeButton.textContent =
                "🌙";

        }

    }
);


// ===============================
// NOTIFICATION & PROFILE DROPDOWNS
// ===============================

const notifButton =
    document.getElementById("notifButton");

const notifMenu =
    document.getElementById("notifMenu");

const profileButton =
    document.getElementById("profileButton");

const profileMenu =
    document.getElementById("profileMenu");


function closeAllDropdowns(except) {

    if (notifMenu && notifMenu !== except) {
        notifMenu.classList.add("hidden");
    }

    if (profileMenu && profileMenu !== except) {
        profileMenu.classList.add("hidden");
    }

}


notifButton.addEventListener(
    "click",
    function (e) {

        e.stopPropagation();

        const willOpen = notifMenu.classList.contains("hidden");

        closeAllDropdowns();

        if (willOpen) {
            notifMenu.classList.remove("hidden");
        }

    }
);


profileButton.addEventListener(
    "click",
    function (e) {

        e.stopPropagation();

        const willOpen = profileMenu.classList.contains("hidden");

        closeAllDropdowns();

        if (willOpen) {
            profileMenu.classList.remove("hidden");
        }

    }
);


// Close dropdowns when clicking anywhere else

document.addEventListener(
    "click",
    function () {
        closeAllDropdowns();
    }
);


// ===============================
// INITIAL LOAD
// ===============================

displayTasks();

updateStatistics();