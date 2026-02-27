<template>
  <div class="project-page" v-if="project">
    <div class="header">
      <h1>{{ project.name }}</h1>
      <p v-if="project.description" class="description">
        {{ project.description }}
      </p>
      <div class="back" @click="router.back()">
        ← Назад до списку проєктів
      </div>
    </div>

    <div class="mode-switch">
      <button
        :class="{ active: viewMode === 'table' }"
        @click="viewMode = 'table'"
      >
        Таблиця
      </button>
      <button
        :class="{ active: viewMode === 'kanban' }"
        @click="viewMode = 'kanban'"
      >
        Канбан
      </button>
    </div>

    <div class="controls">
      <button class="btn btn-primary" @click="openTaskModal()">
        + Додати завдання
      </button>
    </div>

    <!-- Таблиця або Канбан залежно від режиму -->
    <TaskTable
      v-if="viewMode === 'table'"
      :tasks="filteredTasks"
      @edit="openTaskModal"
    />

    <KanbanBoard
      v-else
      :tasks="tasksStore.getTasksByProject(projectId)"
      @task-moved="handleTaskMoved"
    />

    <!-- Модалка створення / редагування завдання -->
    <TaskModal
      :show="showTaskModal"
      :task="editingTask"
      :project-id="projectId"
      @save="saveTask"
      @close="closeTaskModal"
    />
  </div>

  <div v-else class="not-found">
    <h2>Проєкт не знайдено</h2>
    <router-link to="/">Повернутися на головну</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectsStore } from "../stores/projects";
import { useTasksStore } from "../stores/tasks";
import TaskTable from "../components/TaskTable.vue";
import KanbanBoard from "../components/KanbanBoard.vue";
import TaskModal from "../components/modals/TaskModal.vue";

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();

const projectId = Number(route.params.id);
const project = computed(() => projectsStore.getProjectById(projectId));

const viewMode = ref<"table" | "kanban">("table");
const showTaskModal = ref(false);
const editingTask = ref(null as any);

// Завантаження збереженого режиму перегляду
watch(
  () => projectId,
  (id) => {
    const savedMode = localStorage.getItem(`project-view-mode-${id}`);
    if (savedMode === "kanban" || savedMode === "table") {
      viewMode.value = savedMode;
    }
  },
  { immediate: true },
);

watch(viewMode, (newMode) => {
  localStorage.setItem(`project-view-mode-${projectId}`, newMode);
});

// Фільтрація (можна розширити пізніше)
const filteredTasks = computed(() => {
  return tasksStore.getTasksByProject(projectId);
});

function openTaskModal(task: any = null) {
  editingTask.value = task ? { ...task } : null;
  showTaskModal.value = true;
}

function closeTaskModal() {
  showTaskModal.value = false;
  editingTask.value = null;
}

function saveTask(taskData: any) {
  if (editingTask.value) {
    // оновлення існуючого завдання (поки що просто заміна)
    const index = tasksStore.tasks.findIndex(
      (t) => t.id === editingTask.value.id,
    );
    if (index !== -1) {
      tasksStore.tasks[index] = { ...tasksStore.tasks[index], ...taskData };
    }
  } else {
    tasksStore.addTask(projectId, taskData);
  }
  closeTaskModal();
}

function handleTaskMoved({ taskId, newStatus, newOrder }: any) {
  const task = tasksStore.tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = newStatus;
    task.order = newOrder;
    // сортування оновлюється автоматично через computed в Kanban
  }
}
</script>

<style scoped>
.project-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.description {
  color: #4b5563;
  margin-top: 0.5rem;
  max-width: 800px;
}

.back {
  color: #2563eb;
  cursor: pointer;
  margin-top: 1rem;
  display: inline-block;
}

.back:hover {
  text-decoration: underline;
}

.mode-switch {
  display: inline-flex;
  background: #f3f4f6;
  border-radius: 9999px;
  padding: 0.25rem;
  margin-bottom: 1.5rem;
}

.mode-switch button {
  padding: 0.5rem 1.25rem;
  border: none;
  background: transparent;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.mode-switch button.active {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.controls {
  margin-bottom: 1.5rem;
}

.not-found {
  text-align: center;
  padding: 4rem 1rem;
  color: #4b5563;
}
</style>
