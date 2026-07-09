<template>
  <div class="app-wrapper">
    <header class="app-header">
      <div class="header-left">
        <span class="logo-icon">🧠</span>
        <span class="logo-text">MBTI-WCPA 岗位匹配评估</span>
      </div>
      <div class="header-right">
        <el-button text style="color:#fff" @click="goToTest" :class="{ active: currentRoute === '/test' }">人格测试</el-button>
        <el-button text style="color:#fff" @click="goToWcpaTest" :class="{ active: currentRoute === '/wcpa-test' }">WCPA测评</el-button>
        <el-button text style="color:#fff" @click="goToMbti('match')" :class="{ active: currentRoute === '/mbti' && activeTab === 'match' }">岗位匹配</el-button>
        <el-button text style="color:#fff" @click="goToTaskMatch" :class="{ active: currentRoute === '/task-match' }">任务匹配</el-button>
        <el-button text style="color:#fff" @click="goToMbti('records')" :class="{ active: currentRoute === '/mbti' && activeTab === 'records' }">人格档案</el-button>
      </div>
    </header>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :activeTab="activeTab" @update:activeTab="activeTab = $event" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeTab = ref('match')

const currentRoute = computed(() => route.path)

watch(currentRoute, (newPath) => {
  if (newPath === '/mbti') {
    if (!activeTab.value) activeTab.value = 'match'
  }
})

function goToTest() {
  router.push('/test')
}

function goToWcpaTest() {
  router.push('/wcpa-test')
}

function goToMbti(tab) {
  activeTab.value = tab
  router.push('/mbti')
}

function goToTaskMatch() {
  router.push('/task-match')
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-header {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon { font-size: 28px; }
.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}
.header-right {
  display: flex;
  gap: 4px;
}
.header-right .el-button.active {
  background: rgba(255,255,255,0.2);
  border-radius: 6px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.main-content {
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 3px; }
</style>
