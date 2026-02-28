import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskStatus } from '../types/task'
import { tasksApi } from '../api'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTasksByProject(projectId: string) {
  loading.value = true
  try {
    const { data } = await tasksApi.getByProject(projectId)
    tasks.value = data
  } catch {
    if (projectId === '1') {
      tasks.value = [
        { id: '1', projectId: '1', title: 'Дизайн головної сторінки', assignee: 'Олексій', status: 'todo', dueDate: '2026-03-05', order: 1 },
        { id: '2', projectId: '1', title: 'Розробка бекенду', assignee: 'Іван', status: 'in-progress', dueDate: '2026-03-10', order: 2 },
        { id: '3', projectId: '1', title: 'Тестування', assignee: '', status: 'todo', dueDate: '2026-03-15', order: 3 }
      ]
    } else {
      tasks.value = []
    }
  } finally {
    loading.value = false
  }
}

  async function addTask(projectId: string, taskData: Omit<Task, 'id' | 'projectId' | 'order'>) {
    loading.value = true
    error.value = null
    try {
      const currentTasks = tasks.value.filter(t => t.projectId === String(projectId) && t.status === taskData.status)
      const maxOrder = currentTasks.length ? Math.max(...currentTasks.map(t => t.order || 0)) : 0

      const payload = {
        ...taskData,
        projectId: String(projectId),
        order: maxOrder + 1,
      }

      const { data } = await tasksApi.create(payload)
      const newTask = {
        ...data,
        id: String(data.id),
        projectId: String(data.projectId)
      }
      tasks.value.push(newTask)
      return newTask
    } catch (err: any) {
      error.value = err.message || 'Не вдалося створити завдання'
      console.error('addTask error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    loading.value = true
    error.value = null
    try {
      const { data } = await tasksApi.update(String(taskId), updates)
      const updatedTask = {
        ...data,
        id: String(data.id),
        projectId: String(data.projectId)
      }
      const index = tasks.value.findIndex(t => t.id === String(taskId))
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...updatedTask }
      }
      return updatedTask
    } catch (err: any) {
      error.value = err.message || 'Помилка оновлення завдання'
      console.error(`Помилка оновлення завдання ${taskId}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(taskId: string) {
    loading.value = true
    error.value = null
    try {
      await tasksApi.delete(String(taskId))
      tasks.value = tasks.value.filter(t => t.id !== String(taskId))
    } catch (err: any) {
      error.value = err.message || 'Помилка видалення завдання'
      console.error(`Помилка видалення завдання ${taskId}:`, err)
    } finally {
      loading.value = false
    }
  }

  async function moveTask(taskId: string, newStatus: TaskStatus, newOrder: number) {
    const task = tasks.value.find(t => t.id === String(taskId))
    if (!task) return

    try {
      await updateTask(String(taskId), { status: newStatus, order: newOrder })
      task.status = newStatus
      task.order = newOrder
    } catch (err) {
      console.error('Помилка переміщення завдання:', err)
    }
  }

  const getTasksByProject = (projectId: string) =>
    computed(() => tasks.value.filter(t => t.projectId === String(projectId)))

  const tasksByStatus = (projectId: string) =>
    computed(() => {
      const projectTasks = getTasksByProject(String(projectId)).value
      const grouped: Record<TaskStatus, Task[]> = {
        todo: [],
        'in-progress': [],
        done: [],
      }

      projectTasks.forEach(t => {
        if (t.status in grouped) grouped[t.status].push(t)
      })

      Object.values(grouped).forEach(arr => {
        arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      })

      return grouped
    })

  return {
    tasks,
    loading,
    error,
    fetchTasksByProject,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByProject,
    tasksByStatus,
  }
})