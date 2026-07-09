<template>
  <div class="wcpa-container">
    <div class="wcpa-header">
      <div class="header-content">
        <span class="test-icon">🎯</span>
        <h1>WCPA 能力测评</h1>
        <p>通过16道题目，全面评估你的8项核心能力</p>
      </div>
    </div>

    <div v-if="testState === 'intro'" class="intro-section">
      <el-card class="intro-card">
        <div class="intro-content">
          <h2>测评说明</h2>
          <ul>
            <li>本测评包含16道题目，涵盖8个核心能力维度</li>
            <li>每个题目请根据自身实际情况评分（1-10分）</li>
            <li>1分表示能力较弱，10分表示能力非常强</li>
            <li>测评结果仅供参考，可帮助了解自身能力分布</li>
            <li>预计完成时间：3-5分钟</li>
          </ul>
          <div class="dimension-list">
            <div class="dimension-item" v-for="(label, key) in dimensionLabels" :key="key">
              <span class="dim-icon">{{ dimensionIcons[key] }}</span>
              <span class="dim-label">{{ label }}</span>
            </div>
          </div>
          <el-button type="primary" size="large" class="start-btn" @click="startTest">开始测评</el-button>
        </div>
      </el-card>
    </div>

    <div v-else-if="testState === 'testing'" class="testing-section">
      <el-card class="progress-card" shadow="never">
        <div class="progress-info">
          <span class="progress-text">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
          <el-progress :percentage="((currentIndex + 1) / questions.length) * 100" :stroke-width="8" color="#10b981" />
        </div>
      </el-card>

      <el-card class="question-card">
        <div class="question-header">
          <span class="question-num">{{ currentIndex + 1 }}</span>
          <span class="question-dimension">{{ currentQuestion.dimensionLabel }}</span>
        </div>
        <p class="question-desc">{{ currentQuestion.description }}</p>
        <h3 class="question-text">{{ currentQuestion.question }}</h3>
        
        <div class="rating-section">
          <div class="rating-label">请选择你的评分（1-10分）</div>
          <el-rate 
            v-model="currentRating" 
            :max="10" 
            :show-text="true"
            text-color="#10b981"
            size="large"
            @change="onRatingChange"
          />
          <div class="rating-hint">
            <span class="hint-low">1-3: 较弱</span>
            <span class="hint-medium">4-6: 一般</span>
            <span class="hint-high">7-10: 较强</span>
          </div>
        </div>

        <div class="nav-buttons">
          <el-button 
            type="default" 
            @click="prevQuestion" 
            :disabled="currentIndex === 0"
          >上一题</el-button>
          <el-button 
            type="primary" 
            @click="nextQuestion"
            :disabled="!answers[currentIndex]"
          >
            {{ currentIndex === questions.length - 1 ? '提交测评' : '下一题' }}
          </el-button>
        </div>
      </el-card>
    </div>

    <div v-else-if="testState === 'result'" class="result-section">
      <el-card class="result-card">
        <div class="result-header">
          <div class="total-badge">
            <span class="total-label">综合评分</span>
            <span class="total-score">{{ result.totalScore }}</span>
            <span class="total-level">{{ result.overallLevel }} - {{ result.overallLabel }}</span>
          </div>
        </div>

        <div class="result-chart">
          <div class="chart-title">各维度得分</div>
          <div class="bar-chart">
            <div 
              v-for="item in result.details" 
              :key="item.dimension"
              class="bar-item"
            >
              <span class="bar-label">{{ item.label }}</span>
              <div class="bar-track">
                <div 
                  class="bar-fill" 
                  :style="{ width: (item.score / 10) * 100 + '%', background: getLevelColor(item.level) }"
                ></div>
              </div>
              <span class="bar-score">{{ item.score }}</span>
              <span class="bar-level" :style="{ background: getLevelColor(item.level) }">{{ item.level }}</span>
            </div>
          </div>
        </div>

        <div class="result-summary">
          <h4>能力分析</h4>
          <div class="strength-weakness">
            <div class="strength-box">
              <h5>🌟 优势能力</h5>
              <ul>
                <li v-for="item in strengths" :key="item.dimension">{{ item.label }} ({{ item.score }}分)</li>
              </ul>
            </div>
            <div class="weakness-box">
              <h5>💪 待提升能力</h5>
              <ul>
                <li v-for="item in weaknesses" :key="item.dimension">{{ item.label }} ({{ item.score }}分)</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <el-button type="primary" @click="startTest">重新测评</el-button>
          <el-button @click="goToMatch">岗位匹配评估</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const testState = ref('intro')
const questions = ref([])
const currentIndex = ref(0)
const answers = ref([])
const currentRating = ref(0)
const result = ref(null)

const dimensionLabels = {
  communication: '沟通表达',
  collaboration: '社交协助',
  problemSolving: '解决问题',
  projectManagement: '项目管理',
  learningAdaptability: '学习适应',
  responsibility: '承担责任',
  teamwork: '团队贡献',
  challenge: '接受挑战'
}

const dimensionIcons = {
  communication: '💬',
  collaboration: '🤝',
  problemSolving: '🧩',
  projectManagement: '📋',
  learningAdaptability: '📚',
  responsibility: '🎯',
  teamwork: '👥',
  challenge: '🚀'
}

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})

const strengths = computed(() => {
  if (!result.value) return []
  return result.value.details
    .filter(d => d.score >= 7)
    .sort((a, b) => b.score - a.score)
})

const weaknesses = computed(() => {
  if (!result.value) return []
  return result.value.details
    .filter(d => d.score < 5.5)
    .sort((a, b) => a.score - b.score)
})

function getLevelColor(level) {
  const colors = {
    S: '#8b5cf6',
    A: '#10b981',
    B: '#3b82f6',
    C: '#f59e0b',
    D: '#ef4444'
  }
  return colors[level] || '#64748b'
}

async function loadQuestions() {
  try {
    const res = await fetch('/api/mbti/wcpa/questions')
    questions.value = await res.json()
    answers.value = new Array(questions.value.length).fill(null)
  } catch (err) {
    console.error('加载题目失败:', err)
  }
}

function startTest() {
  currentIndex.value = 0
  answers.value = new Array(questions.value.length).fill(null)
  currentRating.value = 0
  result.value = null
  testState.value = 'testing'
}

function onRatingChange(val) {
  answers.value[currentIndex.value] = val
}

function prevQuestion() {
  currentRating.value = answers.value[currentIndex.value - 1] || 0
  currentIndex.value--
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    currentRating.value = answers.value[currentIndex.value] || 0
  } else {
    submitTest()
  }
}

async function submitTest() {
  try {
    const res = await fetch('/api/mbti/wcpa/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answers.value })
    })
    result.value = await res.json()
    testState.value = 'result'
    localStorage.setItem('wcpaTestResult', JSON.stringify(result.value.scores))
  } catch (err) {
    console.error('提交测评失败:', err)
  }
}

function goToMatch() {
  router.push('/mbti')
}

onMounted(() => {
  loadQuestions()
})
</script>

<style scoped>
.wcpa-container {
  min-height: 100vh;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.wcpa-header {
  text-align: center;
  padding: 40px 0;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  margin-bottom: 24px;
  color: #fff;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.test-icon {
  font-size: 48px;
}

.wcpa-header h1 {
  font-size: 28px;
  margin: 12px 0 8px;
}

.wcpa-header p {
  opacity: 0.9;
  font-size: 15px;
}

.intro-card, .question-card, .result-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
}

.intro-content {
  padding: 24px;
}

.intro-content h2 {
  color: #1e293b;
  margin-bottom: 20px;
}

.intro-content ul {
  list-style: none;
  padding: 0;
  margin-bottom: 24px;
}

.intro-content li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  color: #475569;
}

.intro-content li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

.dimension-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.dimension-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.dim-icon {
  font-size: 20px;
}

.dim-label {
  font-size: 12px;
  color: #64748b;
  text-align: center;
}

.start-btn {
  width: 100%;
  height: 48px;
  font-size: 18px;
  border-radius: 12px;
}

.progress-card {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-text {
  font-size: 14px;
  color: #64748b;
  min-width: 100px;
}

.progress-info .el-progress {
  flex: 1;
}

.question-card {
  padding: 32px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-num {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.question-dimension {
  font-size: 14px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.question-desc {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
}

.question-text {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 32px;
  line-height: 1.6;
}

.rating-section {
  text-align: center;
  margin-bottom: 32px;
}

.rating-label {
  font-size: 16px;
  color: #334155;
  margin-bottom: 16px;
}

.rating-hint {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
}

.hint-low, .hint-medium, .hint-high {
  font-size: 12px;
  color: #64748b;
}

.nav-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.nav-buttons .el-button {
  padding: 12px 32px;
  border-radius: 10px;
}

.result-card {
  padding: 32px;
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
}

.total-badge {
  display: inline-block;
  padding: 24px 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  color: #fff;
}

.total-label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.total-score {
  display: block;
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 8px;
}

.total-level {
  font-size: 18px;
  opacity: 0.9;
}

.result-chart {
  margin-bottom: 32px;
}

.chart-title {
  font-size: 16px;
  color: #334155;
  margin-bottom: 16px;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 80px;
  font-size: 14px;
  color: #475569;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease;
}

.bar-score {
  width: 40px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.bar-level {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.result-summary {
  margin-bottom: 32px;
}

.result-summary h4 {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 16px;
}

.strength-weakness {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.strength-box, .weakness-box {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
}

.strength-box h5, .weakness-box h5 {
  font-size: 15px;
  color: #334155;
  margin-bottom: 12px;
}

.strength-box ul, .weakness-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.strength-box li, .weakness-box li {
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
  color: #475569;
  font-size: 14px;
}

.strength-box li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #10b981;
}

.weakness-box li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #f59e0b;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.result-actions .el-button {
  padding: 12px 40px;
  border-radius: 10px;
  font-size: 16px;
}
</style>
