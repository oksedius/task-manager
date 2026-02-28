<template>
  <div class="project-table-container">
    <table class="project-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Назва проєкту</th>
          <th>Завдань</th>
          <th>Створено</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="project in projects"
          :key="project.id"
          @click="emit('row-click', String(project.id))"
          class="clickable-row"
        >
          <td>{{ project.id }}</td>
          <td>{{ project.name }}</td>
          <td>{{ getTaskCount(String(project.id)) }}</td>
          <td>{{ formatDate(project.createdAt) }}</td>
        </tr>
        <tr v-if="!projects.length">
          <td colspan="4" class="empty-message">
            Проєктів ще немає. Додайте перший!
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '../stores/tasks'
import type { Project } from '../types/project'

defineProps<{
  projects: Project[]
}>()

const emit = defineEmits<{
  (e: 'row-click', projectId: string): void
}>()

const tasksStore = useTasksStore()

function getTaskCount(projectId: string): number {
  return tasksStore.getTasksByProject(projectId).value.length
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.project-table-container {
  overflow-x: auto;
}

.project-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  padding: 0.9rem 1.1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f3f4f6;
  font-weight: 600;
  color: #374151;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.12s;
}

.clickable-row:hover {
  background: #f8fafc;
}

.empty-message {
  text-align: center;
  color: #6b7280;
  padding: 3rem !important;
  font-style: italic;
}
</style>
