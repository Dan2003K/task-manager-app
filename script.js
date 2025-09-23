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



/// GLOBAL TASKS ARRAY
/// ----------------------------
let tasks = getTasks();



/// GET & SAVE TASKS (LOCAL STORAGE UTILITIES)
/// ----------------------------
function getTasks() {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
}

function saveTasks(tasksArray) {
    localStorage.setItem('tasks', JSON.stringify(tasksArray));
}



/// FILTER & SORT
/// ----------------------------
function filterTasks(tasksArray, filter) {
    switch (filter) {
        case 'all':
            return tasksArray;

        case 'completed':
            return tasksArray.filter(task => task.completed === true);

        case 'active':
            return tasksArray.filter(task => task.completed === false);

        default:
            return tasksArray;
    }
}

function sortTasks(tasksArray) {
    return tasksArray.slice().sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}



/// FETCH TASKS FROM API
/// ------------------------------
async function fetchInitialTasks() {
    try {
        if (tasks.length > 0) return;
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');

        // Check if response is OK and status is 200
        if (!response.ok || response.status !== 200) {
            throw new Error(`Failed to fetch tasks from API (status: ${response.status})`);
        }

        console.log("Response OK! | Status = 200");

        const data = await response.json();

        // Convert API tasks into in-app format
        const apiTasks = data.map(item => ({
            id: generateId(),
            text: item.title,
            dueDate: new Date().toISOString().split('T')[0],
            completed: item.completed
        }));

        // Merge with existing tasks
        tasks = [...tasks, ...apiTasks];
        saveTasks(tasks);
        renderTasks();

    } catch (error) {
        console.error("Error Fetching Tasks", error);
    }
}



/// RENDER TASKS TO DOM
/// ----------------------------
function renderTasks() {
    let visibleTasks = filterTasks(tasks, currentFilter);

    if (sortByDate) {
        visibleTasks = sortTasks(visibleTasks);
    }

    taskList.innerHTML = '';

    visibleTasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('taskItem');
        li.dataset.id = task.id;

        li.innerHTML = `
             <input type='checkbox' ${task.completed ? 'checked' : ''}/>
             <section id="dateDelContainer">
             <span class="taskDueDate">(${task.dueDate})</span>
             <button class='deleteTaskBtn'>🗑️</button>
             </section>
        `;

        const spanName = document.createElement('span');
        spanName.className = `taskName ${task.completed ? 'completed' : ''}`;
        spanName.textContent = task.text;
        li.insertBefore(spanName, li.querySelector('#dateDelContainer'));

        // Toggle completion
        li.querySelector('input').addEventListener('change', () => {
            const index = tasks.findIndex(t => t.id === task.id);
            tasks[index].completed = !tasks[index].completed;
            saveTasks(tasks);
            renderTasks();
        });

        // Delete task
        li.querySelector('.deleteTaskBtn').addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks(tasks);
            renderTasks();
        });

        taskList.appendChild(li);
    });
}



/// ADD TASK
/// ----------------------------
function addTask() {
    const text = taskInput.value.trim();
    const dueDate = taskDateInput.value;

    if (!text || !dueDate) {
        alert('Please Enter a Task and a Date!');
        return;
    }

    const task = {
        id: generateId(),
        text: text,
        dueDate: dueDate,
        completed: false
    };

    tasks.push(task);
    saveTasks(tasks);
    renderTasks();

    taskInput.value = "";
    taskDateInput.value = "";
}



/// TOGGLE THEMES
/// ----------------------------
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);

function updateThemeIcon(theme) {
    themeToggleBtn.textContent = theme === 'light' ? '🌙' : '🌞';
}

updateThemeIcon(savedTheme);

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
fetchInitialTasks();

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