/* =========================================
   GET SELECTED SUBJECT
========================================= */

let selectedSubject =
    localStorage.getItem("selectedSubject");


/* =========================================
   CHECK SUBJECT
========================================= */

if (!selectedSubject) {

    alert("Please select a subject first.");

    window.location.href = "subjects.html";

}


/* =========================================
   TOPICS
========================================= */

let topics =
    JSON.parse(
        localStorage.getItem(
            "topics_" + selectedSubject
        )
    ) || [];


/* =========================================
   DISPLAY SUBJECT
========================================= */

document.getElementById("subjectTitle").innerText =
    "📚 " + selectedSubject;


/* =========================================
   TOPIC POPUP
========================================= */

function openTopicPopup() {

    document.getElementById("topicPopup").style.display =
        "flex";

}


function closeTopicPopup() {

    document.getElementById("topicPopup").style.display =
        "none";

}


/* =========================================
   ADD TOPIC
========================================= */

function addTopic() {

    let name =
        document.getElementById("topicName")
        .value.trim();


    let importance =
        document.getElementById("topicImportance")
        .value;


    if (name === "") {

        alert("Please enter topic name.");

        return;

    }


    let topic = {

        name: name,

        importance: importance,

        completed: false

    };


    topics.push(topic);


    saveTopics();


    document.getElementById("topicName").value = "";


    closeTopicPopup();


    displayTopics();

    updateProgress();

}


/* =========================================
   SAVE TOPICS
========================================= */

function saveTopics() {

    localStorage.setItem(

        "topics_" + selectedSubject,

        JSON.stringify(topics)

    );

}


/* =========================================
   DISPLAY TOPICS
========================================= */

function displayTopics() {

    let container =
        document.getElementById("topicsContainer");


    container.innerHTML = "";


    if (topics.length === 0) {

        container.innerHTML = `

            <p class="empty-text">

                No chapters or topics added yet.

            </p>

        `;

        return;

    }


    topics.forEach(function(topic, index) {


        let completedClass = "";

        if (topic.completed === true) {

            completedClass =
                "completed-topic";

        }


        let importanceClass = "";

        if (topic.importance === "Important") {

            importanceClass = "important";

        }


        container.innerHTML += `

            <div class="topic-item">

                <div class="topic-left">

                    <input
                        type="checkbox"
                        ${topic.completed ? "checked" : ""}
                        onchange="toggleTopic(${index})"
                    >

                    <div>

                        <div
                            class="topic-name ${completedClass}">

                            ${topic.name}

                        </div>

                        <div
                            class="importance ${importanceClass}">

                            ${topic.importance}

                        </div>

                    </div>

                </div>


                <button
                    class="topic-delete"
                    onclick="deleteTopic(${index})">

                    Delete

                </button>

            </div>

        `;

    });

}


/* =========================================
   COMPLETE / UNCOMPLETE TOPIC
========================================= */

function toggleTopic(index) {

    topics[index].completed =
        !topics[index].completed;


    saveTopics();


    displayTopics();

    updateProgress();

}


/* =========================================
   DELETE TOPIC
========================================= */

function deleteTopic(index) {

    let confirmDelete =
        confirm("Delete this topic?");


    if (!confirmDelete) {

        return;

    }


    topics.splice(index, 1);


    saveTopics();


    displayTopics();

    updateProgress();

}


/* =========================================
   UPDATE PROGRESS
========================================= */

function updateProgress() {

    let total =
        topics.length;


    let completed =
        topics.filter(function(topic) {

            return topic.completed === true;

        }).length;


    let progress = 0;


    if (total > 0) {

        progress =
            Math.round(
                (completed / total) * 100
            );

    }


    document.getElementById("progressPercent")
        .innerText = progress + "%";


    document.getElementById("progressFill")
        .style.width = progress + "%";


    document.getElementById("progressText")
        .innerText =
            completed +
            " of " +
            total +
            " topics completed";


}


/* =========================================
   SYLLABUS POPUP
========================================= */

function openSyllabusPopup() {

    document.getElementById("syllabusPopup")
        .style.display = "flex";

}


function closeSyllabusPopup() {

    document.getElementById("syllabusPopup")
        .style.display = "none";

}


/* =========================================
   SAVE SYLLABUS
========================================= */

function saveSyllabus() {

    let file =
        document.getElementById("syllabusFile")
        .files[0];


    if (!file) {

        alert("Please select a PDF or image.");

        return;

    }


    let allowedTypes = [

        "application/pdf",

        "image/jpeg",

        "image/png"

    ];


    if (!allowedTypes.includes(file.type)) {

        alert(
            "Please upload a PDF, JPG or PNG file."
        );

        return;

    }


    let reader = new FileReader();


    reader.onload = function(event) {


        let syllabus = {

            name: file.name,

            type: file.type,

            data: event.target.result

        };


        localStorage.setItem(

            "syllabus_" + selectedSubject,

            JSON.stringify(syllabus)

        );


        alert("Syllabus uploaded successfully!");


        closeSyllabusPopup();


        displaySyllabus();

    };


    reader.readAsDataURL(file);

}


/* =========================================
   DISPLAY SYLLABUS
========================================= */

function displaySyllabus() {

    let container =
        document.getElementById("syllabusContainer");


    let syllabus =
        JSON.parse(

            localStorage.getItem(
                "syllabus_" + selectedSubject
            )

        );


    if (!syllabus) {

        container.innerHTML = `

            <p class="empty-text">

                No syllabus uploaded yet.

            </p>

        `;

        return;

    }


    container.innerHTML = `

        <div class="syllabus-box">

            <div>

                <div class="syllabus-name">

                    📄 ${syllabus.name}

                </div>

                <p class="small-text">

                    Syllabus for ${selectedSubject}

                </p>

            </div>


            <div class="syllabus-buttons">

                <a
                    href="${syllabus.data}"
                    target="_blank"
                    class="view-file">

                    View

                </a>


                <button
                    class="delete-file"
                    onclick="deleteSyllabus()">

                    Delete

                </button>

            </div>

        </div>

    `;

}


/* =========================================
   DELETE SYLLABUS
========================================= */

function deleteSyllabus() {

    let confirmDelete =
        confirm("Delete this syllabus?");


    if (!confirmDelete) {

        return;

    }


    localStorage.removeItem(
        "syllabus_" + selectedSubject
    );


    displaySyllabus();

}


/* =========================================
   DISPLAY NOTES
========================================= */

function displayRelatedNotes() {

    let container =
        document.getElementById("notesContainer");


    let notes =
        JSON.parse(
            localStorage.getItem("studyNotes")
        ) || [];


    /*
       Find notes whose subject matches
       the current subject.
    */

    let relatedNotes =
        notes.filter(function(note) {

            return note.subject === selectedSubject;

        });


    container.innerHTML = "";


    if (relatedNotes.length === 0) {

        container.innerHTML = `

            <p class="empty-text">

                No notes related to this subject.

            </p>

        `;

        return;

    }


    relatedNotes.forEach(function(note) {

        container.innerHTML += `

            <div class="note-item">

                <h3>
                    📝 ${note.title}
                </h3>

                <p>

                    ${note.type || "Note"}

                </p>

            </div>

        `;

    });

}


/* =========================================
   DISPLAY TASKS
========================================= */

function displayRelatedTasks() {

    let container =
        document.getElementById("tasksContainer");


    /*
       Your Task Planner may use a different
       localStorage key.

       We check studyTasks here.
    */

    let tasks =
        JSON.parse(
            localStorage.getItem("studyTasks")
        ) || [];


    let relatedTasks =
        tasks.filter(function(task) {

            return task.subject === selectedSubject;

        });


    container.innerHTML = "";


    if (relatedTasks.length === 0) {

        container.innerHTML = `

            <p class="empty-text">

                No related tasks found.

            </p>

        `;

        return;

    }


    relatedTasks.forEach(function(task) {

        container.innerHTML += `

            <div class="task-item">

                <h3>
                    ✅ ${task.title || task.name}
                </h3>

                <p>

                    ${task.date || "No date"}

                </p>

            </div>

        `;

    });

}


/* =========================================
   INITIAL LOAD
========================================= */

displayTopics();

updateProgress();

displaySyllabus();

displayRelatedNotes();

displayRelatedTasks();