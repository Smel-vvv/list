document.addEventListener('DOMContentLoaded', () => {
  // DOM элементы
  const themeBtn = document.getElementById('themeBtn');
  const taskInput = document.getElementById('taskInput');
  const addBtn = document.getElementById('addBtn');
  const taskList = document.getElementById('taskList');
  const searchInput = document.getElementById('searchInput');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('sortSelect');
  const categorySelect = document.getElementById('categorySelect');
  const deadlineInput = document.getElementById('deadlineInput');
  const totalTasksEl = document.getElementById('totalTasks');
  const completedTasksEl = document.getElementById('completedTasks');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentFilter = 'all';
  let currentSort = 'date';

  // Инициализация
  renderTasks();
  updateStats();

  // Смена темы
  themeBtn.addEventListener('click', toggleTheme);

  // Добавление задачи
  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Фильтрация и поиск
  searchInput.addEventListener('input', renderTasks);
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Сортировка
  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    renderTasks();
  });

  // Функции
  function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    const newTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeBtn.textContent = newTheme === 'light' ? '🌙 Тёмная тема' : '☀ Светлая тема';
    localStorage.setItem('theme', newTheme);
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now(),
      text,
      completed: false,
      category: categorySelect.value,
      deadline: deadlineInput.value,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    deadlineInput.value = '';
    renderTasks();
  }

  function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchInput.value.toLowerCase());
      const matchesFilter = currentFilter === 'all' || 
                          (currentFilter === 'active' && !task.completed) || 
                          (currentFilter === 'completed' && task.completed);
      return matchesSearch && matchesFilter;
    });

    if (currentSort === 'date') {
      filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
    }

    filteredTasks.forEach(task => {
      const taskEl = document.createElement('li');
      taskEl.className = `task ${task.completed ? 'completed' : ''}`;
      taskEl.dataset.id = task.id;

      taskEl.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text">${task.text}</span>
        <span class="task-category ${task.category}">${task.category}</span>
        ${task.deadline ? `<span class="task-deadline">📅 ${new Date(task.deadline).toLocaleDateString()}</span>` : ''}
        <button class="delete-btn">Удалить</button>
      `;

      taskEl.querySelector('input').addEventListener('change', () => toggleComplete(task.id));
      taskEl.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
      taskList.appendChild(taskEl);
    });

    updateStats();
  }

  function toggleComplete(taskId) {
    tasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function updateStats() {
    totalTasksEl.textContent = tasks.length;
    completedTasksEl.textContent = tasks.filter(t => t.completed).length;
  }

  // Загрузка темы
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'light' ? '🌙 Тёмная тема' : '☀ Светлая тема';
});