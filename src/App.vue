<template>
  <div class="app-wrapper">
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.app-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.logo h1 {
  margin: 0;
  font-size: 1.6rem;
  color: var(--primary);
  font-weight: 700;
}

.logo {
  text-decoration: none;
}

.back-link {
  color: var(--primary);
  font-weight: 500;
  transition: color 0.15s;
}

.back-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.app-main {
  flex: 1;
  padding: 1.5rem 0;
}

.app-footer {
  background: white;
  border-top: 1px solid var(--gray-200);
  padding: 1rem 0;
  margin-top: auto;
  text-align: center;
  color: var(--gray-500);
  font-size: 0.875rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 0.8rem;
    text-align: center;
  }

  .back-link {
    margin-top: 0.5rem;
  }
}
</style>
