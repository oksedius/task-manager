<template>
  <div class="project-page">
    <div v-if="projectsStore.loading || tasksStore.loading" class="loading">
      Завантаження даних...
    </div>
    <div
      v-else-if="projectsStore.error || tasksStore.error"
      class="error-message"
    >
      {{ projectsStore.error || tasksStore.error }}
      <button @click="reloadData">Спробувати ще раз</button>
    </div>
    <div v-else-if="project">
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
        <button
          class="btn btn-primary"
          @click="openTaskModal()"
          :disabled="tasksStore.loading"
        >
          + Додати завдання
        </button>
      </div>

      <TaskTable
        v-if="viewMode === 'table'"
        :tasks="filteredTasks"
        @edit="openTaskModal"
      />

      <KanbanBoard
        v-if="viewMode === 'kanban'"
        :tasks="filteredTasks"
        @task-moved="handleTaskMoved"
      />

      <TaskModal
        :show="showTaskModal"
        :task="editingTask"
        :project-id="Number(projectId)"
        @save="saveTask"
        @close="closeTaskModal"
      />
    </div>

    <div v-else class="not-found">
      <h2>Проєкт не знайдено</h2>
      <router-link to="/">Повернутися на головну</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
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

const projectId = computed(() => route.params.id as string);
const project = computed(() =>
  projectsStore.projects.find((p) => p.id === projectId.value),
);

const viewMode = ref<"table" | "kanban">("table");
const showTaskModal = ref(false);
const editingTask = ref(null as any);

onMounted(async () => {
  if (!projectsStore.projects.length) {
    await projectsStore.fetchProjects();
  }
  await tasksStore.fetchTasksByProject(projectId.value);

  const savedMode = localStorage.getItem(
    `project-view-mode-${projectId.value}`,
  );
  if (savedMode === "kanban" || savedMode === "table") {
    viewMode.value = savedMode;
  }
});

watch(viewMode, (newMode) => {
  localStorage.setItem(`project-view-mode-${projectId.value}`, newMode);
});

const filteredTasks = computed(() => {
  return tasksStore.getTasksByProject(projectId.value).value;
});

const tasksByStatus = computed(() => {
  return tasksStore.tasksByStatus(projectId.value).value;
});

function openTaskModal(task: any = null) {
  editingTask.value = task ? { ...task } : null;
  showTaskModal.value = true;
}

function closeTaskModal() {
  showTaskModal.value = false;
  editingTask.value = null;
}

async function saveTask(taskData: any) {
  if (editingTask.value) {
    await tasksStore.updateTask(editingTask.value.id, taskData);
  } else {
    await tasksStore.addTask(projectId.value, taskData);
  }
  closeTaskModal();
}

async function handleTaskMoved({ taskId, newStatus, newOrder }: any) {
  await tasksStore.moveTask(taskId, newStatus, newOrder);
}

function reloadData() {
  projectsStore.fetchProjects();
  tasksStore.fetchTasksByProject(projectId.value);
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
.loading,
.error-message {
  text-align: center;
  padding: 4rem 1rem;
  font-size: 1.2rem;
}

.error-message button {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
}
</style>
