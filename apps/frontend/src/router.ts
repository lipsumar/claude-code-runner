import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import InstanceView from '@/views/InstanceView.vue';
import TaskView from './views/TaskView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/instance/:id',
      name: 'instance',
      component: InstanceView,
    },
    {
      path: '/task/:id',
      name: 'task',
      component: TaskView,
    },
  ],
});

export default router;
