<template>
  <div class="project-table-container">
    <table class="project-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Назва проєкту</th>
          <th>Завдань</th>
          <th>Створено</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in projects" :key="project.id" class="clickable-row">
          <td @click="emit('row-click', String(project.id))">
            {{ project.id }}
          </td>
          <td @click="emit('row-click', String(project.id))">
            {{ project.name }}
          </td>
          <td @click="emit('row-click', String(project.id))">
            {{ getTaskCount(String(project.id)) }}
          </td>
          <td @click="emit('row-click', String(project.id))">
            {{ formatDate(project.createdAt) }}
          </td>
          <td>
            <button
              class="btn-delete"
              @click.stop="emit('delete-project', project.id)"
              title="Видалити проєкт"
            >
              🗑️ Видалити
            </button>
          </td>
        </tr>
        <tr v-if="!projects.length">
          <td colspan="5" class="empty-message">
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

const props = defineProps<{
  projects: Project[]
}>()

const emit = defineEmits<{
  (e: 'row-click', projectId: string): void
  (e: 'delete-project', projectId: string): void
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

.btn-delete {
  padding: 0.5rem 1rem;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-delete:hover {
  background: #fecaca;
  border-color: #fca5a5;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.15);
}

.btn-delete:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
