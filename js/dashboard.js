// ================= QUOTES =================

let quotes = [

    "Success is the sum of small efforts, repeated day in and day out.",

    "The secret of getting ahead is getting started.",

    "Don't watch the clock; do what it does. Keep going.",

    "Small progress is still progress.",

    "Believe you can and you're halfway there.",

    "Your future is created by what you do today.",

    "Focus on your goals, not your obstacles.",

    "Study today, succeed tomorrow."

];


// Select a random quote

let randomNumber = Math.floor(Math.random() * quotes.length);

document.getElementById("dailyQuote").innerText =
    '"' + quotes[randomNumber] + '"';


// ================= DATE =================

let today = new Date();

let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
};

let dateText = today.toLocaleDateString("en-IN", options);

document.getElementById("todayDate").innerText = dateText;


// ================= TASK PROGRESS =================

// Example data for now

let totalTasks = 10;

let completedTasks = 6;

let remainingTasks = totalTasks - completedTasks;

let progress =
    (completedTasks / totalTasks) * 100;


// Update task numbers

document.getElementById("completedTasks").innerText =
    completedTasks;

document.getElementById("remainingTasks").innerText =
    remainingTasks + " tasks remaining";


// Update progress bar

document.getElementById("taskProgress").style.width =
    progress + "%";