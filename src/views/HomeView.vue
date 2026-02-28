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

      <ProjectTable :projects="filteredProjects" @row-click="goToProject" />

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
            <label>Опис (необов’язково)</label>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ProjectTable from "../components/ProjectTable.vue";
import { useProjectsStore } from "../stores/projects";

const projectsStore = useProjectsStore();
const router = useRouter();

const searchQuery = ref("");
const showAddProjectModal = ref(false);
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
  const numericId = Number(id);
  if (!isNaN(numericId)) {
    router.push(`/project/${numericId}`);
  }
}
async function createProject() {
  if (!newProject.value.name.trim()) {
    nameError.value = "Назва обов’язкова";
    return;
  }

  const created = await projectsStore.addProject(
    newProject.value.name.trim(),
    newProject.value.description.trim() || undefined,
  );

  if (created) {
    // очищення після успішного створення
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
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover {
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
  padding: 1.5rem 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
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
  justify-content: flex-end;
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
