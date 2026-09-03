// ==================================================
// GET DATA FROM LOCAL STORAGE
// ==================================================

let notes =
    JSON.parse(localStorage.getItem("studyNotes")) || [];


let subjects =
    JSON.parse(localStorage.getItem("studySubjects")) || [];


// Current filter
let currentFilter = "all";


// Display data when page opens
displaySubjects();
displayNotes();
updateStatistics();


// ==================================================
// OPEN NOTE POPUP
// ==================================================

function openNotePopup() {

    displaySubjectOptions();

    document.getElementById("notePopup").style.display =
        "flex";

}


// Close note popup

function closeNotePopup() {

    document.getElementById("notePopup").style.display =
        "none";

}


// ==================================================
// SHOW WRITE NOTE
// ==================================================

function showWriteNote() {

    document.getElementById("writeNoteSection")
        .classList.remove("hidden");


    document.getElementById("uploadFileSection")
        .classList.add("hidden");


    document.getElementById("writeButton")
        .classList.add("active");


    document.getElementById("uploadButton")
        .classList.remove("active");

}


// ==================================================
// SHOW UPLOAD FILE
// ==================================================

function showUploadNote() {

    document.getElementById("writeNoteSection")
        .classList.add("hidden");


    document.getElementById("uploadFileSection")
        .classList.remove("hidden");


    document.getElementById("uploadButton")
        .classList.add("active");


    document.getElementById("writeButton")
        .classList.remove("active");


    displaySubjectOptions();

}


// ==================================================
// SAVE NORMAL TEXT NOTE
// ==================================================

function saveTextNote() {

    let title =
        document.getElementById("noteTitle").value.trim();


    let subject =
        document.getElementById("noteSubject").value;


    let tags =
        document.getElementById("noteTags").value.trim();


    let content =
        document.getElementById("noteContent").value.trim();


    // Check title

    if (title === "") {

        alert("Please enter note title.");

        return;

    }


    // Check content

    if (content === "") {

        alert("Please write something in your note.");

        return;

    }


    // Create note

    let newNote = {

        id: Date.now(),

        type: "text",

        title: title,

        subject: subject,

        tags: tags,

        content: content,

        fileName: "",

        fileData: "",

        fileSize: "",

        pinned: false,

        favorite: false,

        date: new Date().toLocaleString()

    };


    // Add note

    notes.push(newNote);


    // Save

    saveNotes();


    // Clear form

    document.getElementById("noteTitle").value = "";

    document.getElementById("noteTags").value = "";

    document.getElementById("noteContent").value = "";


    closeNotePopup();


    displayNotes();

    updateStatistics();

}


// ==================================================
// FILE SELECTED
// ==================================================

function showSelectedFile() {

    let file =
        document.getElementById("fileInput").files[0];


    let selectedFile =
        document.getElementById("selectedFile");


    if (!file) {

        selectedFile.style.display = "none";

        return;

    }


    selectedFile.style.display = "block";


    selectedFile.innerHTML =

        "📎 <strong>" +
        file.name +
        "</strong><br>" +

        "<small>" +
        formatFileSize(file.size) +
        "</small>";

}


// ==================================================
// UPLOAD PDF / DOCX
// ==================================================

function uploadFile() {

    let file =
        document.getElementById("fileInput").files[0];


    let subject =
        document.getElementById("fileSubject").value;


    // Check file

    if (!file) {

        alert("Please select a PDF or DOCX file.");

        return;

    }


    // Check file type

    let fileName =
        file.name.toLowerCase();


    let type = "";


    if (fileName.endsWith(".pdf")) {

        type = "pdf";

    }

    else if (fileName.endsWith(".docx")) {

        type = "docx";

    }

    else {

        alert("Only PDF and DOCX files are allowed.");

        return;

    }


    // Read file

    let reader = new FileReader();


    reader.onload = function(event) {

        let fileData =
            event.target.result;


        let newNote = {

            id: Date.now(),

            type: type,

            title: file.name,

            subject: subject,

            tags: "",

            content: "",

            fileName: file.name,

            fileData: fileData,

            fileSize: formatFileSize(file.size),

            pinned: false,

            favorite: false,

            date: new Date().toLocaleString()

        };


        // Add file to notes

        notes.push(newNote);


        // Save

        saveNotes();


        // Reset file

        document.getElementById("fileInput").value = "";

        document.getElementById("selectedFile").style.display =
            "none";


        closeNotePopup();


        displayNotes();

        updateStatistics();

    };


    reader.readAsDataURL(file);

}


// ==================================================
// DISPLAY NOTES
// ==================================================

function displayNotes() {

    let container =
        document.getElementById("notesContainer");


    let search =
        document.getElementById("searchInput")
            .value
            .toLowerCase();


    let subject =
        document.getElementById("subjectFilter")
            .value;


    let type =
        document.getElementById("typeFilter")
            .value;


    // Filter notes

    let filteredNotes =
        notes.filter(function(note) {


            // Search

            let searchMatch =

                note.title
                    .toLowerCase()
                    .includes(search)

                ||

                note.content
                    .toLowerCase()
                    .includes(search)

                ||

                note.tags
                    .toLowerCase()
                    .includes(search);


            // Subject

            let subjectMatch =

                subject === "all"

                ||

                note.subject === subject;


            // Type

            let typeMatch =

                type === "all"

                ||

                note.type === type;


            // Button filter

            let buttonMatch = true;


            if (currentFilter === "text") {

                buttonMatch =
                    note.type === "text";

            }


            if (currentFilter === "pdf") {

                buttonMatch =
                    note.type === "pdf";

            }


            if (currentFilter === "docx") {

                buttonMatch =
                    note.type === "docx";

            }


            if (currentFilter === "pinned") {

                buttonMatch =
                    note.pinned === true;

            }


            if (currentFilter === "favorite") {

                buttonMatch =
                    note.favorite === true;

            }


            return (

                searchMatch &&

                subjectMatch &&

                typeMatch &&

                buttonMatch

            );

        });


    // Sort

    let sort =
        document.getElementById("sortFilter").value;


    if (sort === "newest") {

        filteredNotes.sort(function(a, b) {

            return b.id - a.id;

        });

    }


    if (sort === "oldest") {

        filteredNotes.sort(function(a, b) {

            return a.id - b.id;

        });

    }


    if (sort === "name") {

        filteredNotes.sort(function(a, b) {

            return a.title.localeCompare(b.title);

        });

    }


    // Clear

    container.innerHTML = "";


    // No notes

    if (filteredNotes.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                <div class="empty-icon">
                    📝
                </div>

                <h2>
                    No Notes Added Yet
                </h2>

                <p>
                    Add a written note or upload a PDF/DOCX file.
                </p>

            </div>

        `;

        return;

    }


    // Create cards

    filteredNotes.forEach(function(note) {

        createNoteCard(note, container);

    });

}


// ==================================================
// CREATE NOTE CARD
// ==================================================

function createNoteCard(note, container) {

    let card =
        document.createElement("div");


    card.className =
        "note-card";


    // Subject

    let subjectName =

        note.subject === ""

        ? "No Subject Added"

        : note.subject;


    // Icon

    let icon = "📝";


    if (note.type === "pdf") {

        icon = "📄";

    }


    if (note.type === "docx") {

        icon = "📘";

    }


    // Content

    let content = "";


    if (note.type === "text") {

        let shortText =
            note.content.length > 120

            ? note.content.substring(0, 120) + "..."

            : note.content;


        content = `

            <p class="note-content">

                ${shortText}

            </p>

        `;

    }

    else {

        content = `

            <p class="file-size">

                📎 ${note.fileName}

            </p>

            <p class="file-size">

                ${note.fileSize}

            </p>

        `;

    }


    // Tags

    let tags = "";


    if (note.tags !== "") {

        tags = `

            <p class="tags">

                #${note.tags.replaceAll(",", " #")}

            </p>

        `;

    }


    card.innerHTML = `

        <div class="card-top">

            <div>

                <div class="note-icon">
                    ${icon}
                </div>

            </div>

            <div>

                ${note.pinned ? "📌" : ""}

                ${note.favorite ? "⭐" : ""}

            </div>

        </div>


        <h2 class="note-title">

            ${note.title}

        </h2>


        <span class="subject">

            ${subjectName}

        </span>


        ${content}


        ${tags}


        <p class="note-date">

            Created: ${note.date}

        </p>


        <div class="card-buttons">

            ${
                note.type === "pdf" ||
                note.type === "docx"

                ?

                `

                <button
                    class="open-button"
                    onclick="openFile(${note.id})">

                    👀 Open

                </button>


                <button
                    onclick="downloadFile(${note.id})">

                    ⬇️ Download

                </button>

                `

                :

                `

                <button
                    class="open-button"
                    onclick="viewNote(${note.id})">

                    👀 View

                </button>

                `

            }


            <button
                onclick="togglePin(${note.id})">

                ${note.pinned ? "📌 Unpin" : "📌 Pin"}

            </button>


            <button
                onclick="toggleFavorite(${note.id})">

                ${note.favorite ? "⭐ Unfavorite" : "☆ Favorite"}

            </button>


            <button
                onclick="deleteNote(${note.id})">

                🗑 Delete

            </button>

        </div>

    `;


    container.appendChild(card);

}


// ==================================================
// OPEN FILE
// ==================================================

function openFile(id) {

    let note =
        notes.find(function(note) {

            return note.id === id;

        });


    if (!note) {

        return;

    }


    let newWindow =
        window.open();


    newWindow.document.write(`

        <html>

        <head>

            <title>
                ${note.fileName}
            </title>

        </head>

        <body
            style="
                margin:0;
                height:100vh;
            ">

            <iframe
                src="${note.fileData}"
                style="
                    width:100%;
                    height:100%;
                    border:none;
                ">

            </iframe>

        </body>

        </html>

    `);

}


// ==================================================
// DOWNLOAD FILE
// ==================================================

function downloadFile(id) {

    let note =
        notes.find(function(note) {

            return note.id === id;

        });


    if (!note) {

        return;

    }


    let link =
        document.createElement("a");


    link.href =
        note.fileData;


    link.download =
        note.fileName;


    link.click();

}


// ==================================================
// VIEW TEXT NOTE
// ==================================================

function viewNote(id) {

    let note =
        notes.find(function(note) {

            return note.id === id;

        });


    if (!note) {

        return;

    }


    alert(

        "Title: " +
        note.title +

        "\n\n" +

        "Subject: " +
        (
            note.subject === ""
            ? "No Subject Added"
            : note.subject
        ) +

        "\n\n" +

        note.content

    );

}


// ==================================================
// PIN
// ==================================================

function togglePin(id) {

    let note =
        notes.find(function(note) {

            return note.id === id;

        });


    if (note) {

        note.pinned =
            !note.pinned;

    }


    saveNotes();

    displayNotes();

    updateStatistics();

}


// ==================================================
// FAVORITE
// ==================================================

function toggleFavorite(id) {

    let note =
        notes.find(function(note) {

            return note.id === id;

        });


    if (note) {

        note.favorite =
            !note.favorite;

    }


    saveNotes();

    displayNotes();

    updateStatistics();

}


// ==================================================
// DELETE
// ==================================================

function deleteNote(id) {

    let confirmDelete =
        confirm(
            "Are you sure you want to delete this note?"
        );


    if (!confirmDelete) {

        return;

    }


    notes =
        notes.filter(function(note) {

            return note.id !== id;

        });


    saveNotes();

    displayNotes();

    updateStatistics();

}


// ==================================================
// ADD SUBJECT
// ==================================================

function addSubject() {

    let name =
        document.getElementById("subjectName")
            .value
            .trim();


    if (name === "") {

        alert("Please enter subject name.");

        return;

    }


    // Check duplicate

    let exists =
        subjects.some(function(subject) {

            return subject.toLowerCase() ===
                name.toLowerCase();

        });


    if (exists) {

        alert("Subject already exists.");

        return;

    }


    subjects.push(name);


    localStorage.setItem(
        "studySubjects",
        JSON.stringify(subjects)
    );


    document.getElementById("subjectName")
        .value = "";


    closeSubjectPopup();


    displaySubjects();

    displaySubjectOptions();

    updateStatistics();

}


// ==================================================
// DISPLAY SUBJECTS
// ==================================================

function displaySubjects() {

    let filter =
        document.getElementById("subjectFilter");


    filter.innerHTML = `

        <option value="all">
            All Subjects
        </option>

    `;


    subjects.forEach(function(subject) {

        filter.innerHTML += `

            <option value="${subject}">
                ${subject}
            </option>

        `;

    });

}


// ==================================================
// SUBJECT DROPDOWN
// ==================================================

function displaySubjectOptions() {

    let noteSubject =
        document.getElementById("noteSubject");


    let fileSubject =
        document.getElementById("fileSubject");


    let options = `

        <option value="">
            No Subject Added
        </option>

    `;


    subjects.forEach(function(subject) {

        options += `

            <option value="${subject}">
                ${subject}
            </option>

        `;

    });


    noteSubject.innerHTML =
        options;


    fileSubject.innerHTML =
        options;

}


// ==================================================
// SUBJECT POPUP
// ==================================================

function openSubjectPopup() {

    document.getElementById("subjectPopup")
        .style.display = "flex";

}


function closeSubjectPopup() {

    document.getElementById("subjectPopup")
        .style.display = "none";

}


// ==================================================
// FILTER BUTTON
// ==================================================

function showFilter(filter, button) {

    currentFilter = filter;


    // Remove active from buttons

    let buttons =
        document.querySelectorAll(".filter-button");


    buttons.forEach(function(btn) {

        btn.classList.remove("active");

    });


    // Add active

    button.classList.add("active");


    displayNotes();

}


// ==================================================
// FILE SIZE
// ==================================================

function formatFileSize(bytes) {

    if (bytes === 0) {

        return "0 Bytes";

    }


    let sizes = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    let i =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (

        Math.round(
            bytes /
            Math.pow(1024, i) *
            100
        ) / 100

        +

        " " +

        sizes[i]

    );

}


// ==================================================
// SAVE NOTES
// ==================================================

function saveNotes() {

    localStorage.setItem(
        "studyNotes",
        JSON.stringify(notes)
    );

}


// ==================================================
// STATISTICS
// ==================================================

function updateStatistics() {

    document.getElementById("totalNotes")
        .innerText = notes.length;


    let pdfCount =
        notes.filter(function(note) {

            return note.type === "pdf";

        }).length;


    document.getElementById("pdfNotes")
        .innerText = pdfCount;


    let docxCount =
        notes.filter(function(note) {

            return note.type === "docx";

        }).length;


    document.getElementById("docxNotes")
        .innerText = docxCount;


    document.getElementById("totalSubjects")
        .innerText = subjects.length;

}