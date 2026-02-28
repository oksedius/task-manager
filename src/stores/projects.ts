import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '../types/project'
import { projectsApi } from '../api'   

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ──────────────────────────────────────────────
  // Завантаження всіх проєктів
  // ──────────────────────────────────────────────
  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      const { data } = await projectsApi.getAll()
      projects.value = data.map((p: any) => ({
        ...p,
        id: String(p.id)
      }))
    } catch (err: any) {
      error.value = err.message || 'Помилка завантаження проєктів'
      console.error('fetchProjects error:', err)
    } finally {
      loading.value = false
    }
  }

  // ──────────────────────────────────────────────
  // Отримати один проєкт за id
  // ──────────────────────────────────────────────
  async function fetchProjectById(id: string) {
    loading.value = true
    error.value = null
    try {
      const { data } = await projectsApi.getById(id)
      return { ...data, id: String(data.id) } as Project
    } catch (err: any) {
      error.value = err.message || 'Помилка завантаження проєкту'
      console.error(`Помилка завантаження проєкту ${id}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  // ──────────────────────────────────────────────
  // Додати новий проєкт
  // ──────────────────────────────────────────────
  async function addProject(name: string, description?: string) {
    loading.value = true
    error.value = null
    try {
      const payload = {
        name: name.trim(),
        description: description?.trim(),
        createdAt: new Date().toISOString(),
      }
      const { data } = await projectsApi.create(payload)
      const newProject = { ...data, id: String(data.id) }
      projects.value.push(newProject)
      return newProject
    } catch (err: any) {
      error.value = err.message || 'Не вдалося створити проєкт'
      console.error('addProject error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // ──────────────────────────────────────────────
  // Оновити проєкт
  // ──────────────────────────────────────────────
  async function updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description'>>) {
    loading.value = true
    error.value = null
    try {
      const { data } = await projectsApi.update(id, updates)
      const updatedProject = { ...data, id: String(data.id) }
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updatedProject }
      }
      return updatedProject
    } catch (err: any) {
      error.value = err.message || 'Помилка оновлення проєкту'
      console.error(`Помилка оновлення проєкту ${id}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  // ──────────────────────────────────────────────
  // Видалити проєкт
  // ──────────────────────────────────────────────
  async function deleteProject(id: string) {
    loading.value = true
    error.value = null
    try {
      await projectsApi.delete(id)
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Помилка видалення проєкту'
      console.error(`Помилка видалення проєкту ${id}:`, err)
    } finally {
      loading.value = false
    }
  }

  // Початкове завантаження при створенні стора
  fetchProjects()

  return {
    projects,
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    addProject,
    updateProject,
    deleteProject,
  }
})