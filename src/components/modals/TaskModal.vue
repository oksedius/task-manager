<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2>{{ editingTask ? "Редагувати завдання" : "Нове завдання" }}</h2>

      <form @submit.prevent="submit">
        <div class="form-group">
          <label>Назва завдання *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Опис завдання (3–120 символів)"
            :class="{ 'input-error': errors.title }"
          />
          <div v-if="errors.title" class="error-message">
            {{ errors.title }}
          </div>
        </div>

        <div class="form-group">
          <label>Виконавець (необов’язково)</label>
          <input
            v-model="form.assignee"
            type="text"
            placeholder="Ім’я або прізвище"
          />
        </div>

        <div class="form-group">
          <label>Статус *</label>
          <select
            v-model="form.status"
            :class="{ 'input-error': errors.status }"
          >
            <option value="" disabled>Оберіть статус</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div v-if="errors.status" class="error-message">
            {{ errors.status }}
          </div>
        </div>

        <div class="form-group">
          <label>Термін виконання *</label>
          <input
            v-model="form.dueDate"
            type="date"
            :min="minDueDate"
            :class="{ 'input-error': errors.dueDate }"
          />
          <div v-if="errors.dueDate" class="error-message">
            {{ errors.dueDate }}
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="close">
            Скасувати
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            {{ editingTask ? "Зберегти зміни" : "Створити завдання" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Task } from '../../types/task'

const props = defineProps<{
  show: boolean
  task: Task | null
  projectId: number
}>()

const emit = defineEmits<{
  (e: 'save', task: Omit<Task, 'id' | 'projectId' | 'order'>): void
  (e: 'close'): void
}>()

const form = ref<{
  title: string
  assignee: string
  status: Task['status'] | ''
  dueDate: string | undefined   // ← ось зміна
}>({
  title: '',
  assignee: '',
  status: '',
  dueDate: undefined             // ← замість ''
})

const errors = ref({
  title: '',
  status: '',
  dueDate: ''
})

const isSubmitting = ref(false)

const editingTask = computed(() => props.task !== null)

const minDueDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString().split('T')[0]
})

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      form.value = {
        title: newTask.title,
        assignee: newTask.assignee || '',
        status: newTask.status,
        dueDate: (newTask.dueDate || '').split('T')[0] // для input type="date"
      }
    } else {
      form.value = {
        title: '',
        assignee: '',
        status: '',
        dueDate: ''
      }
    }
    errors.value = { title: '', status: '', dueDate: '' }
  },
  { immediate: true }
)

function validate(): boolean {
  errors.value = { title: '', status: '', dueDate: '' }
  let valid = true

  if (!form.value.title.trim()) {
    errors.value.title = 'Назва обов’язкова'
    valid = false
  } else if (form.value.title.trim().length < 3 || form.value.title.trim().length > 120) {
    errors.value.title = 'Назва повинна бути від 3 до 120 символів'
    valid = false
  }

  if (!form.value.status) {
    errors.value.status = 'Оберіть статус'
    valid = false
  }

  if (!form.value.dueDate) {
    errors.value.dueDate = 'Вкажіть термін виконання'
    valid = false
  } else {
    const selected = new Date(form.value.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selected < today) {
      errors.value.dueDate = 'Термін не може бути раніше сьогодні'
      valid = false
    }
  }

  return valid
}

function submit() {
  if (!validate()) return

  isSubmitting.value = true

  const payload = {
    title: form.value.title.trim(),
    assignee: form.value.assignee.trim() || undefined,
    status: form.value.status as Task['status'],
    dueDate: new Date(form.value.dueDate as string).toISOString().split('T')[0] + 'T23:59:59.999Z'
  }

  emit('save', payload)
  close()
}

function close() {
  emit('close')
  isSubmitting.value = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  padding: 1.8rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1.4rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

input,
select {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

input:focus,
select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-error {
  border-color: #dc2626 !important;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.35rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.65rem 1.4rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background: #4b5563;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
