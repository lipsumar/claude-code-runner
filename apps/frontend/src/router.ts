import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import InstanceView from '@/views/InstanceView.vue';
import RunView from './views/RunView.vue';
import TaskListView from './views/TaskListView.vue';
import TaskFormView from './views/TaskFormView.vue';
import TaskRunView from './views/TaskRunView.vue';

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
      name: 'taskNew',
      component: TaskFormView,
    },
    {
      path: '/tasks/:id/edit',
      name: 'taskEdit',
      component: TaskFormView,
    },
    {
      path: '/tasks/:id/run',
      name: 'taskRun',
      component: TaskRunView,
    },
    {
      path: '/runs/:id',
      name: 'runView',
      component: RunView,
    },
  ],
});

export default router;
