import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import InstanceView from '@/views/InstanceView.vue';
import TaskView from './views/TaskView.vue';
import TaskListView from './views/TaskListView.vue';
import TaskFormView from './views/TaskFormView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/instances/:id',
      name: 'instance',
      component: InstanceView,
    },
    {
      path: '/tasks',
      name: 'taskList',
      component: TaskListView,
    },
    {
      path: '/tasks/new',
      name: 'taskForm',
      component: TaskFormView,
    },
    {
      path: '/tasks/:id',
      name: 'task',
      component: TaskView,
    },
  ],
});

export default router;
