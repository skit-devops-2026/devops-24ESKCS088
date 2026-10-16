/* =========================================
   GET SUBJECTS FROM LOCAL STORAGE
========================================= */

let subjects =
    JSON.parse(localStorage.getItem("studySubjects")) || [];


/* =========================================
   OPEN POPUP
========================================= */

function openSubjectPopup() {

    document.getElementById("subjectPopup").style.display = "flex";

}


/* =========================================
   CLOSE POPUP
========================================= */

function closeSubjectPopup() {

    document.getElementById("subjectPopup").style.display = "none";

}


/* =========================================
   ADD SUBJECT
========================================= */

function addSubject() {

    let name = document.getElementById("subjectName").value.trim();
    let code = document.getElementById("subjectCode").value.trim();
    let teacher = document.getElementById("teacherName").value.trim();

    if (name === "") {

        alert("Please enter subject name.");

        return;
    }


    /*
       IMPORTANT:

       Your Notes page already stores subjects
       as simple strings.

       Example:

       ["DBMS", "OS", "CN"]

       So we keep the same format.

       This means subjects added from Notes
       will also appear here.
    */

    if (subjects.includes(name)) {

        alert("This subject already exists.");

        return;
    }


    subjects.push(name);


    localStorage.setItem(
        "studySubjects",
        JSON.stringify(subjects)
    );


    alert("Subject added successfully!");


    document.getElementById("subjectName").value = "";
    document.getElementById("subjectCode").value = "";
    document.getElementById("teacherName").value = "";

    closeSubjectPopup();

    displaySubjects();

}


/* =========================================
   DISPLAY SUBJECTS
========================================= */

function displaySubjects() {

    /*
       Read latest subjects again.

       This is useful because the Notes page
       can also add subjects.
    */

    subjects =
        JSON.parse(localStorage.getItem("studySubjects")) || [];


    let container =
        document.getElementById("subjectsContainer");

    let search =
        document.getElementById("searchSubject").value
        .toLowerCase();


    container.innerHTML = "";


    let filteredSubjects = subjects.filter(function(subject) {

        return subject.toLowerCase().includes(search);

    });


    if (filteredSubjects.length === 0) {

        container.innerHTML = `
            <div class="empty-message">

                <h2>📚 No Subjects Found</h2>

                <p>
                    Add a subject to start managing
                    your syllabus.
                </p>

            </div>
        `;

        updateStatistics();

        return;
    }


    filteredSubjects.forEach(function(subject) {

        /*
           Get topics belonging to this subject
        */

        let topics =
            JSON.parse(
                localStorage.getItem("topics_" + subject)
            ) || [];


        let totalTopics = topics.length;

        let completedTopics =
            topics.filter(function(topic) {

                return topic.completed === true;

            }).length;


        let progress = 0;

        if (totalTopics > 0) {

            progress =
                Math.round(
                    (completedTopics / totalTopics) * 100
                );

        }


        container.innerHTML += `

            <div class="subject-card">

                <h2>📚 ${subject}</h2>

                <p class="subject-code">
                    Subject
                </p>

                <div class="progress-section">

                    <div class="progress-header">

                        <strong>Syllabus Progress</strong>

                        <strong>${progress}%</strong>

                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="width: ${progress}%">
                        </div>

                    </div>

                    <p class="topic-info">

                        ${completedTopics}
                        /
                        ${totalTopics}
                        topics completed

                    </p>

                </div>


                <div class="card-buttons">

                    <button
                        class="view-btn"
                        onclick="openSubject('${escapeSubject(subject)}')">

                        Open Subject

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteSubject('${escapeSubject(subject)}')">

                        Delete

                    </button>

                </div>

            </div>

        `;

    });


    updateStatistics();

}


/* =========================================
   OPEN SUBJECT DETAILS
========================================= */

function openSubject(subject) {

    localStorage.setItem(
        "selectedSubject",
        subject
    );


    window.location.href =
        "subject-details.html";

}


/* =========================================
   DELETE SUBJECT
========================================= */

function deleteSubject(subject) {

    let confirmDelete =
        confirm(
            "Delete this subject from your subject list?"
        );


    if (!confirmDelete) {

        return;

    }


    subjects =
        subjects.filter(function(item) {

            return item !== subject;

        });


    localStorage.setItem(
        "studySubjects",
        JSON.stringify(subjects)
    );


    displaySubjects();

}


/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {

    subjects =
        JSON.parse(localStorage.getItem("studySubjects")) || [];


    let totalTopics = 0;
    let completedTopics = 0;


    subjects.forEach(function(subject) {

        let topics =
            JSON.parse(
                localStorage.getItem("topics_" + subject)
            ) || [];


        totalTopics += topics.length;


        topics.forEach(function(topic) {

            if (topic.completed === true) {

                completedTopics++;

            }

        });

    });


    let overallProgress = 0;


    if (totalTopics > 0) {

        overallProgress =
            Math.round(
                (completedTopics / totalTopics) * 100
            );

    }


    document.getElementById("totalSubjects").innerText =
        subjects.length;

    document.getElementById("totalTopics").innerText =
        totalTopics;

    document.getElementById("completedTopics").innerText =
        completedTopics;

    document.getElementById("overallProgress").innerText =
        overallProgress + "%";

}


/* =========================================
   ESCAPE SUBJECT NAME
========================================= */

function escapeSubject(subject) {

    return subject
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");

}


/* =========================================
   INITIAL LOAD
========================================= */

displaySubjects();


/*
   If another page/tab changes subjects,
   refresh this page when possible.
*/

window.addEventListener("storage", function(event) {

    if (event.key === "studySubjects") {

        displaySubjects();

    }

});