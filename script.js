/// CACHE DOM ELEMENTS
/// ----------------------------
const taskInput = document.querySelector('#taskInput');
const taskDateInput = document.querySelector('#taskDateInput');
const addTaskBtn = document.querySelector('#addTaskBtn');
const taskList = document.querySelector('#taskList');

const allBtn = document.querySelector('#allBtn');
const completedBtn = document.querySelector('#completedBtn');
const activeBtn = document.querySelector('#activeBtn');
const sortDateBtn = document.querySelector('#sortDateBtn');

const themeToggleBtn = document.querySelector('#themeToggleBtn');

/// STATE
/// ----------------------------
let currentFilter = 'all';
let sortByDate = false;



/// GET & SAVE TASKS (LOCAL STORAGE UTILITIES)
/// ----------------------------
function getTasks() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}



/// FILTER & SORT
/// ----------------------------
function filterTasks(tasks, filter) {
    switch (filter) {
        case 'all':
            return tasks;

        case 'completed':
            return tasks.filter(task => task.completed === true);

        case 'active':
            return tasks.filter(task => task.completed === false);

        default:
            return tasks;
    }
}
function sortTasks(tasks) {
    return tasks.slice().sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}


/// RENDER TASKS TO DOM
/// ----------------------------
function renderTasks() {
    let tasks = getTasks();

    // Apply filter
    tasks = filterTasks(tasks, currentFilter);

    // Apply sorting
    if (sortByDate) {
        tasks = sortTasks(tasks);
    }

    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('taskItem');
        li.dataset.id = task.id;

        li.innerHTML = `
            <input type='checkbox' ${task.completed ? 'checked' : ''}/>
             <span class="taskName ${task.completed ? 'completed' : ''}">${task.text}</span>
             <span class="taskDueDate">(${task.dueDate})</span>
            <button class='deleteTaskBtn'>🗑️</button>
        `;

        // Toggle completion
        li.querySelector('input').addEventListener('change', () => {
            const tasks = getTasks();
            const index = tasks.findIndex(t => t.id === task.id);
            tasks[index].completed = !tasks[index].completed;
            saveTasks(tasks);
            renderTasks();
        });

        // Delete task
        li.querySelector('.deleteTaskBtn').addEventListener('click', () => {
            let tasks = getTasks();
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks(tasks);
            renderTasks();
        })

        taskList.appendChild(li);
    });
}



/// ADD TASK
/// ----------------------------
function addTask() {
    // Get values from inputs
    const text = taskInput.value.trim();
    const dueDate = taskDateInput.value;

    // Validate Values
    if (!text || !dueDate) {
        alert('Please Enter a Task and a Date!');
        return;
    }

    // Create Task Object
    const tasks = getTasks();
    const task = {
        id: Date.now(),
        text: text,
        dueDate: dueDate,
        completed: false
    };

    tasks.push(task);
    saveTasks(tasks);
    renderTasks();

    // Clear Input Fields
    taskInput.value = "";
    taskDateInput.value = "";
}



/// TOGGLE THEMES
/// ----------------------------
// Load theme from local storage
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);

// Update Theme Button Icon
function updateThemeIcon(theme) {
    themeToggleBtn.textContent = theme === 'light' ? '🌙' : '🌞';
}

// Toggle theme on click
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});



/// INITIALIZE THE APP
/// ----------------------------
renderTasks();

addTaskBtn.addEventListener('click', addTask);

allBtn.addEventListener('click', () => {
    currentFilter = 'all';
    renderTasks();
});
completedBtn.addEventListener('click', () => {
    currentFilter = 'completed';
    renderTasks();
});
activeBtn.addEventListener('click', () => {
    currentFilter = 'active';
    renderTasks();
});

sortDateBtn.addEventListener('click', () => {
    sortByDate = !sortByDate;
    renderTasks();
});


