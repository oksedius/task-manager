<template>
  <div class="kanban-board">
    <div class="kanban-columns">
      <div
        v-for="column in columns"
        :key="column.status"
        class="kanban-column"
        @dragover.prevent
        @drop="onDrop($event, column.status)"
      >
        <div class="column-header">
          <h3>{{ column.title }}</h3>
          <span class="task-count">{{ column.tasks.length }}</span>
        </div>

        <div class="column-tasks">
          <div
            v-for="task in column.tasks"
            :key="task.id"
            class="kanban-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
          >
            <div class="card-title">{{ task.title }}</div>
            <div class="card-assignee" v-if="task.assignee">
              {{ task.assignee }}
            </div>
            <div class="card-due" :class="{ overdue: isOverdue(task.dueDate) }">
              {{ formatDate(task.dueDate) }}
            </div>
          </div>

          <div v-if="!column.tasks.length" class="empty-column">
            Порожньо
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../types/task'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'task-moved', payload: { taskId: string; newStatus: Task['status']; newOrder: number }): void
}>()

const statusOrder = ['todo', 'in-progress', 'done'] as const

const columns = computed(() => {
  const grouped = {
    todo: [] as Task[],
    'in-progress': [] as Task[],
    done: [] as Task[]
  }

  props.tasks.forEach(task => {
    if (grouped[task.status]) {
      grouped[task.status].push(task)
    }
  })

  Object.values(grouped).forEach(arr => {
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  })

  return [
    { status: 'todo' as const, title: 'To Do', tasks: grouped.todo },
    { status: 'in-progress' as const, title: 'In Progress', tasks: grouped['in-progress'] },
    { status: 'done' as const, title: 'Done', tasks: grouped.done }
  ]
})

let draggedTask: Task | null = null

function onDragStart(e: DragEvent, task: Task) {
  draggedTask = task
  e.dataTransfer?.setData('text/plain', task.id)

  const target = e.target as HTMLElement
  target.classList.add('dragging')
  target.dataset.taskId = task.id
}

function onDragEnd(e: DragEvent) {
  ;(e.target as HTMLElement).classList.remove('dragging')
  draggedTask = null
}

function onDrop(e: DragEvent, newStatus: Task['status']) {
  e.preventDefault()
  if (!draggedTask) return

  const target = e.target as HTMLElement
  let newOrder = 0

  // визначаємо позицію дропу всередині колонки
  const columnTasks = target.closest('.column-tasks')
  const cardElements = columnTasks?.querySelectorAll('.kanban-card:not(.dragging)') || []
  const afterElement = getDragAfterElement(cardElements as NodeListOf<Element>, e.clientY)

  if (afterElement) {
    const nextTaskId = (afterElement as HTMLElement).dataset.taskId
    const nextTask = props.tasks.find(t => t.id === nextTaskId)
    newOrder = (nextTask?.order ?? 0) - 0.5
  } else {
    // якщо дроп в кінець колонки
    const lastInColumn = columns.value
      .find(c => c.status === newStatus)?.tasks.slice(-1)[0]
    newOrder = (lastInColumn?.order ?? 0) + 1
  }

  // якщо статус не змінився і порядок той самий — нічого не робимо
  if (draggedTask.status === newStatus && Math.abs(draggedTask.order - newOrder) < 0.01) {
    return
  }

  emit('task-moved', {
    taskId: draggedTask.id,
    newStatus,
    newOrder
  })
}

function getDragAfterElement(container: NodeListOf<Element>, y: number) {
  const draggableElements = [...container]

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect()
      const offset = y - box.top - box.height / 2
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      }
      return closest
    },
    { offset: Number.NEGATIVE_INFINITY, element: null as Element | null }
  ).element
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })
}

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}
</script>

<style scoped>
.kanban-board {
  margin-top: 1rem;
}

.kanban-columns {
  display: flex;
  gap: 1.2rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.kanban-column {
  flex: 1 0 320px;
  min-width: 320px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: 80vh;
}

.column-header {
  padding: 1rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #374151;
}

.task-count {
  background: #e5e7eb;
  color: #4b5563;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.column-tasks {
  padding: 0.8rem;
  flex: 1;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.kanban-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: grab;
  transition: all 0.15s;
}

.kanban-card.dragging {
  opacity: 0.5;
  transform: scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-assignee {
  color: #4b5563;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

.card-due {
  font-size: 0.875rem;
  color: #6b7280;
}

.card-due.overdue {
  color: #dc2626;
  font-weight: 500;
}

.empty-column {
  text-align: center;
  color: #9ca3af;
  padding: 2rem 0;
  font-style: italic;
}
</style>
