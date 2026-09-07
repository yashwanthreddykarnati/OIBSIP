const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");

const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");

const pendingEmpty = document.getElementById("pendingEmpty");
const completedEmpty = document.getElementById("completedEmpty");

const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const totalPending = document.getElementById("totalPending");
const totalCompleted = document.getElementById("totalCompleted");
const totalTasks = document.getElementById("totalTasks");

const currentDay = document.getElementById("currentDay");
const currentDate = document.getElementById("currentDate");


// ========================================
// Task Data
// ========================================

let tasks = JSON.parse(
    localStorage.getItem("taskflow_tasks")
) || [];


// ========================================
// Date
// ========================================

function displayDate() {

    const now = new Date();

    currentDay.textContent =
        now.toLocaleDateString("en-US", {
            weekday: "long"
        });

    currentDate.textContent =
        now.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
}

displayDate();


// ========================================
// Add Task
// ========================================

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        return;
    }

    const newTask = {

        id: Date.now(),

        text: text,

        completed: false,

        createdAt: new Date().toISOString(),

        completedAt: null

    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";

    taskInput.focus();

    renderTasks();

});


// ========================================
// Save to Local Storage
// ========================================

function saveTasks() {

    localStorage.setItem(
        "taskflow_tasks",
        JSON.stringify(tasks)
    );

}


// ========================================
// Render Tasks
// ========================================

function renderTasks() {

    pendingList.innerHTML = "";
    completedList.innerHTML = "";

    const pendingTasks =
        tasks.filter(task => !task.completed);

    const completedTasks =
        tasks.filter(task => task.completed);


    // Render pending tasks
    pendingTasks.forEach(task => {

        pendingList.appendChild(
            createTaskElement(task)
        );

    });


    // Render completed tasks
    completedTasks.forEach(task => {

        completedList.appendChild(
            createTaskElement(task)
        );

    });


    // Counts
    pendingCount.textContent =
        `${pendingTasks.length} pending`;

    completedCount.textContent =
        `${completedTasks.length} completed`;

    totalPending.textContent =
        pendingTasks.length;

    totalCompleted.textContent =
        completedTasks.length;

    totalTasks.textContent =
        tasks.length;


    // Empty states
    pendingEmpty.style.display =
        pendingTasks.length === 0
            ? "block"
            : "none";

    completedEmpty.style.display =
        completedTasks.length === 0
            ? "block"
            : "none";

}


// ========================================
// Create Task Element
// ========================================

function createTaskElement(task) {

    const card = document.createElement("article");

    card.className =
        `task-card ${task.completed ? "completed" : ""}`;


    // Check button
    const checkButton =
        document.createElement("button");

    checkButton.className =
        "check-button";

    checkButton.textContent = "✓";

    checkButton.title =
        task.completed
            ? "Mark as pending"
            : "Mark as complete";

    checkButton.addEventListener(
        "click",
        () => toggleTask(task.id)
    );


    // Content
    const content =
        document.createElement("div");

    content.className =
        "task-content";


    const text =
        document.createElement("div");

    text.className =
        "task-text";

    text.textContent =
        task.text;


    const time =
        document.createElement("small");

    time.className =
        "task-time";

    time.textContent =
        getTimestamp(task);


    content.appendChild(text);

    content.appendChild(time);


    // Actions
    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";


    // Edit
    const editButton =
        document.createElement("button");

    editButton.textContent =
        "Edit";

    editButton.addEventListener(
        "click",
        () => editTask(task.id, content)
    );


    // Delete
    const deleteButton =
        document.createElement("button");

    deleteButton.textContent =
        "Delete";

    deleteButton.className =
        "delete";

    deleteButton.addEventListener(
        "click",
        () => deleteTask(task.id)
    );


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    card.appendChild(checkButton);
    card.appendChild(content);
    card.appendChild(actions);


    return card;

}


// ========================================
// Toggle Complete
// ========================================

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            const completed =
                !task.completed;

            return {

                ...task,

                completed: completed,

                completedAt:
                    completed
                        ? new Date().toISOString()
                        : null

            };

        }

        return task;

    });

    saveTasks();

    renderTasks();

}


// ========================================
// Edit Task
// ========================================

function editTask(id, contentElement) {

    const task =
        tasks.find(task => task.id === id);

    if (!task) {
        return;
    }


    const input =
        document.createElement("input");

    input.type = "text";

    input.className =
        "edit-input";

    input.value =
        task.text;

    input.maxLength = 150;


    contentElement.innerHTML = "";

    contentElement.appendChild(input);

    input.focus();

    input.select();


    function saveEdit() {

        const newText =
            input.value.trim();

        if (newText === "") {

            renderTasks();

            return;

        }

        tasks = tasks.map(item => {

            if (item.id === id) {

                return {
                    ...item,
                    text: newText
                };

            }

            return item;

        });

        saveTasks();

        renderTasks();

    }


    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                saveEdit();

            }

            if (event.key === "Escape") {

                renderTasks();

            }

        }
    );


    input.addEventListener(
        "blur",
        saveEdit
    );

}


// ========================================
// Delete Task
// ========================================

function deleteTask(id) {

    const confirmed =
        confirm("Delete this task?");

    if (!confirmed) {
        return;
    }

    tasks =
        tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();

}


// ========================================
// Timestamp
// ========================================

function getTimestamp(task) {

    const created =
        new Date(task.createdAt);

    const createdText =
        created.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short"
        });

    if (task.completed && task.completedAt) {

        const completed =
            new Date(task.completedAt);

        return (
            `Added ${createdText} • ` +
            `Completed ${completed.toLocaleString(
                "en-US",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            )}`
        );

    }

    return `Added ${createdText}`;

}


// ========================================
// Initial Render
// ========================================

renderTasks();
