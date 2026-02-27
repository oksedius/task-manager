import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Project } from '../types/project'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])

  // --------------------------------------------------------------------------
  // Computed / Getters
  // --------------------------------------------------------------------------
  const sortedProjects = computed(() => {
    return [...projects.value].sort((a, b) => a.id - b.id)
  })

  const getProjectById = (id: number) => {
    return projects.value.find(p => p.id === id)
  }

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  function addProject(name: string, description?: string) {
    const newId = projects.value.length
      ? Math.max(...projects.value.map(p => p.id)) + 1
      : 1

    const project: Project = {
      id: newId,
      name: name.trim(),
      description: description?.trim(),
      createdAt: new Date().toISOString()
    }

    projects.value.push(project)
    return project
  }

  function updateProject(id: number, updates: Partial<Pick<Project, 'name' | 'description'>>) {
    const project = getProjectById(id)
    if (project) {
      if (updates.name) project.name = updates.name.trim()
      if (updates.description !== undefined) project.description = updates.description?.trim()
    }
  }

  function deleteProject(id: number) {
    projects.value = projects.value.filter(p => p.id !== id)
    // також можна видалити всі пов'язані завдання (опціонально)
  }

  // --------------------------------------------------------------------------
  // Persistence (localStorage)
  // --------------------------------------------------------------------------
  function loadProjects() {
    const saved = localStorage.getItem('projects')
    if (saved) {
      try {
        projects.value = JSON.parse(saved)
      } catch (e) {
        console.error('Помилка парсингу projects з localStorage:', e)
      }
    }
  }

  function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects.value))
  }

  // Ініціалізація
  loadProjects()

  // Автозбереження при зміні
  watch(projects, saveProjects, { deep: true })

  return {
    projects,
    sortedProjects,
    getProjectById,
    addProject,
    updateProject,
    deleteProject
  }
}, {
  persist: true
})