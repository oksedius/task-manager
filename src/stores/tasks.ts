import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Task, TaskStatus } from '../types/task'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])

  // --------------------------------------------------------------------------
  // Computed / Getters
  // --------------------------------------------------------------------------
  const getTasksByProject = (projectId: number) => {
    return tasks.value.filter(t => t.projectId === projectId)
  }

  const getTaskById = (taskId: number) => {
    return tasks.value.find(t => t.id === taskId)
  }

  const tasksByStatus = (projectId: number) => computed(() => {
    const projectTasks = getTasksByProject(projectId)

    const grouped = {
      todo: [] as Task[],
      'in-progress': [] as Task[],
      done: [] as Task[]
    }

    projectTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })

    // Сортуємо всередині кожної групи за order
    Object.values(grouped).forEach(group => {
      group.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    })

    return grouped
  })

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  function addTask(projectId: number, taskData: Omit<Task, 'id' | 'projectId' | 'order'>) {
    const newId = tasks.value.length
      ? Math.max(...tasks.value.map(t => t.id)) + 1
      : 1

    // Знаходимо максимальний order у цьому проєкті для нового статусу
    const sameStatusTasks = tasks.value
      .filter(t => t.projectId === projectId && t.status === taskData.status)
      .sort((a, b) => (b.order ?? 0) - (a.order ?? 0))

    const maxOrder = sameStatusTasks.length ? (sameStatusTasks[0]?.order ?? 0) : 0

    const newTask: Task = {
      id: newId,
      projectId,
      ...taskData,
      order: maxOrder + 1
    }

    tasks.value.push(newTask)
    return newTask
  }

  function updateTask(taskId: number, updates: Partial<Omit<Task, 'id' | 'projectId'>>) {
    const task = getTaskById(taskId)
    if (task) {
      Object.assign(task, updates)

      // Якщо змінився статус — перераховуємо order у новій колонці
      if (updates.status) {
        reindexOrdersInStatus(task.projectId, updates.status)
      }
    }
  }

  function deleteTask(taskId: number) {
    const task = getTaskById(taskId)
    if (task) {
      tasks.value = tasks.value.filter(t => t.id !== taskId)
      // Після видалення можна переіндексувати колонку, але не обов'язково
    }
  }

  function moveTask(taskId: number, newStatus: TaskStatus, newOrder: number) {
    const task = getTaskById(taskId)
    if (!task) return

    const oldStatus = task.status

    // Якщо статус не змінився — просто змінюємо order
    if (oldStatus === newStatus) {
      task.order = newOrder
      reindexOrdersInStatus(task.projectId, newStatus)
      return
    }

    // Якщо статус змінився
    task.status = newStatus
    task.order = newOrder

    // Переіндексуємо обидві колонки
    reindexOrdersInStatus(task.projectId, oldStatus)
    reindexOrdersInStatus(task.projectId, newStatus)
  }

  // Допоміжна функція — переприсвоює order від 1 і далі в межах статусу + проєкту
  function reindexOrdersInStatus(projectId: number, status: TaskStatus) {
    const relevantTasks = tasks.value
      .filter(t => t.projectId === projectId && t.status === status)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    relevantTasks.forEach((task, index) => {
      task.order = index + 1
    })
  }

  // --------------------------------------------------------------------------
  // Persistence
  // --------------------------------------------------------------------------
  function loadTasks() {
    const saved = localStorage.getItem('tasks')
    if (saved) {
      try {
        tasks.value = JSON.parse(saved)
      } catch (e) {
        console.error('Помилка парсингу tasks з localStorage:', e)
      }
    }
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  // Ініціалізація
  loadTasks()

  // Автозбереження
  watch(tasks, saveTasks, { deep: true })

  return {
    tasks,
    getTasksByProject,
    getTaskById,
    tasksByStatus,
    addTask,
    updateTask,
    deleteTask,
    moveTask
  }
}, {
  persist: true
})