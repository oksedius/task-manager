<template>
  <div class="task-table-wrapper">
    <div class="table-controls">
      <input
        v-model="searchAssignee"
        placeholder="Пошук за виконавцем..."
        class="search-input"
      />

      <select v-model="filterStatus" class="status-filter">
        <option value="">Всі статуси</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>

    <div class="table-container">
      <table class="task-table">
        <thead>
          <tr>
            <th @click="sortBy('id')" class="sortable">
              ID
              <span v-if="sortKey === 'id'">{{
                sortOrder === "asc" ? "↑" : "↓"
              }}</span>
            </th>
            <th>Назва завдання</th>
            <th @click="sortBy('assignee')" class="sortable">
              Виконавець
              <span v-if="sortKey === 'assignee'">{{
                sortOrder === "asc" ? "↑" : "↓"
              }}</span>
            </th>
            <th @click="sortBy('status')" class="sortable">
              Статус
              <span v-if="sortKey === 'status'">{{
                sortOrder === "asc" ? "↑" : "↓"
              }}</span>
            </th>
            <th @click="sortBy('dueDate')" class="sortable">
              Термін
              <span v-if="sortKey === 'dueDate'">{{
                sortOrder === "asc" ? "↑" : "↓"
              }}</span>
            </th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in sortedAndFilteredTasks" :key="task.id">
            <td>{{ task.id }}</td>
            <td>{{ task.title }}</td>
            <td>{{ task.assignee || "—" }}</td>
            <td>
              <span :class="`status-badge ${task.status}`">
                {{ statusLabels[task.status] }}
              </span>
            </td>
            <td>{{ formatDate(task.dueDate) }}</td>
            <td>
              <button class="btn-edit" @click="$emit('edit', task)">✏️</button>
            </td>
          </tr>
          <tr v-if="!sortedAndFilteredTasks.length">
            <td colspan="6" class="empty-row">Завдань не знайдено</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '../types/task'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
}>()

const searchAssignee = ref('')
const filterStatus = ref('')
const sortKey = ref<keyof Task>('dueDate')
const sortOrder = ref<'asc' | 'desc'>('asc')

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done'
}

const sortedAndFilteredTasks = computed(() => {
  let result = [...props.tasks]

  // фільтр за виконавцем
  if (searchAssignee.value.trim()) {
    const q = searchAssignee.value.toLowerCase().trim()
    result = result.filter(t =>
      t.assignee?.toLowerCase().includes(q)
    )
  }

  // фільтр за статусом
  if (filterStatus.value) {
    result = result.filter(t => t.status === filterStatus.value)
  }

  // сортування
  result.sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    if (sortKey.value === 'dueDate') {
      valA = valA ? new Date(valA as string).getTime() : 0
      valB = valB ? new Date(valB as string).getTime() : 0
    } else if (typeof valA === 'string' && typeof valB === 'string') {
      valA = (valA as string).toLowerCase()
      valB = (valB as string).toLowerCase()
    }

    if (valA != null && valB != null) {
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    }
    return 0
  })

  return result
})

function sortBy(key: keyof Task) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return iso
  }
}
</script>

<style scoped>
.task-table-wrapper {
  margin-top: 1rem;
}

.table-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-input,
.status-filter {
  padding: 0.6rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
}

.status-filter {
  min-width: 160px;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  min-width: 700px;
}

th,
td {
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background: #f1f5f9;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.todo {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.in-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.done {
  background: #d1fae5;
  color: #065f46;
}

.btn-edit {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #2563eb;
  padding: 0.3rem 0.6rem;
}

.btn-edit:hover {
  color: #1d4ed8;
  background: #eff6ff;
  border-radius: 4px;
}

.empty-row {
  text-align: center;
  color: #6b7280;
  padding: 3rem !important;
  font-style: italic;
}
</style>
