import { createRouter, createWebHistory } from 'vue-router'
import MbtiPage from '../views/MbtiPage.vue'
import MbtiTest from '../views/MbtiTest.vue'
import WcpaTest from '../views/WcpaTest.vue'
import TaskMatch from '../views/TaskMatch.vue'

const routes = [
  { path: '/', redirect: '/mbti' },
  { path: '/mbti', component: MbtiPage },
  { path: '/test', component: MbtiTest },
  { path: '/wcpa-test', component: WcpaTest },
  { path: '/task-match', component: TaskMatch }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
