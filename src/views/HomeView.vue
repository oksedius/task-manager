<template>
  <div class="home-page">
    <h1>Мої проєкти</h1>

    <div v-if="projectsStore.loading" class="loading">
      Завантаження проєктів...
    </div>
    <div v-else-if="projectsStore.error" class="error-message">
      {{ projectsStore.error }}
      <button @click="projectsStore.fetchProjects()">Спробувати ще раз</button>
    </div>
    <div v-else>
      <div class="controls">
        <input
          v-model="searchQuery"
          placeholder="Пошук за назвою..."
          class="search-input"
        />
        <button @click="showAddProjectModal = true" class="btn btn-primary">
          + Додати проєкт
        </button>
      </div>

      <ProjectTable
        :projects="filteredProjects"
        @row-click="goToProject"
        @delete-project="confirmDeleteProject"
      />

      <!-- Модальне вікно створення проєкту -->
      <div
        v-if="showAddProjectModal"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <h2>Новий проєкт</h2>

          <div class="form-group">
            <label>Назва проєкту *</label>
            <input
              v-model="newProject.name"
              placeholder="Наприклад: Вебсайт компанії"
            />
            <div v-if="nameError" class="error">{{ nameError }}</div>
          </div>

          <div class="form-group">
            <label>Опис (необов'язково)</label>
            <textarea v-model="newProject.description" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button @click="closeModal" class="btn btn-secondary">
              Скасувати
            </button>
            <button
              @click="createProject"
              class="btn btn-primary"
              :disabled="projectsStore.loading || !newProject.name.trim()"
            >
              {{ projectsStore.loading ? "Створюється..." : "Створити" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Модальне вікно підтвердження видалення -->
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="cancelDelete"
      >
        <div class="modal-content modal-delete">
          <div class="delete-icon">⚠️</div>
          <h2>Видалити проєкт?</h2>
          <p class="delete-warning">
            Ви впевнені, що хочете видалити проєкт
            <strong>{{ projectToDelete?.name }}</strong
            >?
          </p>
          <p class="delete-subtext">
            Усі завдання цього проєкту також будуть видалені. Цю дію не можна
            скасувати.
          </p>

          <div class="modal-actions">
            <button @click="cancelDelete" class="btn btn-secondary">
              Скасувати
            </button>
            <button
              @click="handleDeleteProject"
              class="btn btn-danger"
              :disabled="projectsStore.loading"
            >
              {{ projectsStore.loading ? "Видалення..." : "Видалити" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ProjectTable from "../components/ProjectTable.vue";
import { useProjectsStore } from "../stores/projects";
import { useTasksStore } from "../stores/tasks";
import type { Project } from "../types/project";

const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const router = useRouter();

const searchQuery = ref("");
const showAddProjectModal = ref(false);
const showDeleteModal = ref(false);
const projectToDelete = ref<Project | null>(null);
const newProject = ref({ name: "", description: "" });
const nameError = ref("");

onMounted(() => {
  projectsStore.fetchProjects();
});

const filteredProjects = computed(() => {
  if (!searchQuery.value.trim()) return projectsStore.projects;
  const q = searchQuery.value.toLowerCase();
  return projectsStore.projects.filter((p) => p.name.toLowerCase().includes(q));
});

function goToProject(id: number | string) {
  router.push(`/project/${id}`);
}

async function createProject() {
  if (!newProject.value.name.trim()) {
    nameError.value = "Назва обов'язкова";
    return;
  }

  const created = await projectsStore.addProject(
    newProject.value.name.trim(),
    newProject.value.description.trim() || undefined,
  );

  if (created) {
    newProject.value = { name: "", description: "" };
    nameError.value = "";
    showAddProjectModal.value = false;
  } else {
    nameError.value = "Не вдалося створити проєкт";
  }
}

function closeModal() {
  newProject.value = { name: "", description: "" };
  nameError.value = "";
  showAddProjectModal.value = false;
}

function confirmDeleteProject(projectId: string) {
  const project = projectsStore.projects.find((p) => p.id === projectId);
  if (!project) return;

  projectToDelete.value = project;
  showDeleteModal.value = true;
}

function cancelDelete() {
  showDeleteModal.value = false;
  projectToDelete.value = null;
}

async function handleDeleteProject() {
  if (!projectToDelete.value) return;

  const projectId = projectToDelete.value.id;

  await projectsStore.deleteProject(projectId);

  // Видалити всі завдання цього проєкту
  const projectTasks = tasksStore.getTasksByProject(projectId).value;
  for (const task of projectTasks) {
    await tasksStore.deleteTask(task.id);
  }

  showDeleteModal.value = false;
  projectToDelete.value = null;
}
</script>

<style scoped>
.home-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.search-input {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.btn-danger {
  background: #dc2626;
  color: white;
  border: none;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-delete {
  text-align: center;
}

.delete-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-delete h2 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.delete-warning {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

.delete-warning strong {
  color: #dc2626;
}

.delete-subtext {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  text-align: left;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.loading,
.error-message {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #4b5563;
}

.error-message {
  color: #dc2626;
}
</style>
