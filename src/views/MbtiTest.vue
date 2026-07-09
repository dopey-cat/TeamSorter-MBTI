<template>
  <div class="test-container">
    <div class="test-header">
      <div class="header-content">
        <span class="test-icon">🧠</span>
        <h1>MBTI 人格测试</h1>
        <p>通过16道题目，了解你的人格类型</p>
      </div>
    </div>

    <div v-if="testState === 'intro'" class="intro-section">
      <el-card class="intro-card">
        <div class="intro-content">
          <h2>测试说明</h2>
          <ul>
            <li>本测试包含16道题目，分为4个维度</li>
            <li>每个题目选择最符合你真实情况的选项</li>
            <li>测试结果仅供参考，不代表绝对结论</li>
            <li>预计完成时间：3-5分钟</li>
          </ul>
          <div class="dimension-list">
            <div class="dimension-item">
              <span class="dim-label">E/I</span>
              <span class="dim-desc">外向 / 内向</span>
            </div>
            <div class="dimension-item">
              <span class="dim-label">S/N</span>
              <span class="dim-desc">感觉 / 直觉</span>
            </div>
            <div class="dimension-item">
              <span class="dim-label">T/F</span>
              <span class="dim-desc">思考 / 情感</span>
            </div>
            <div class="dimension-item">
              <span class="dim-label">J/P</span>
              <span class="dim-desc">判断 / 感知</span>
            </div>
          </div>
          <el-button type="primary" size="large" class="start-btn" @click="startTest">开始测试</el-button>
        </div>
      </el-card>
    </div>

    <div v-else-if="testState === 'testing'" class="testing-section">
      <el-card class="progress-card" shadow="never">
        <div class="progress-info">
          <span class="progress-text">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
          <el-progress :percentage="((currentIndex + 1) / questions.length) * 100" :stroke-width="8" color="#667eea" />
        </div>
      </el-card>

      <el-card class="question-card">
        <div class="question-header">
          <span class="question-num">{{ currentIndex + 1 }}</span>
          <span class="question-dimension">{{ currentDimension }}</span>
        </div>
        <h3 class="question-text">{{ currentQuestion.question }}</h3>
        <div class="options-list">
          <div 
            v-for="option in currentQuestion.options" 
            :key="option.label"
            class="option-item"
            :class="{ selected: answers[currentIndex] === option.label }"
            @click="selectAnswer(option.label)"
          >
            <span class="option-label">{{ option.label }}</span>
            <span class="option-text">{{ option.text }}</span>
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
            {{ currentIndex === questions.length - 1 ? '提交测试' : '下一题' }}
          </el-button>
        </div>
      </el-card>
    </div>

    <div v-else-if="testState === 'result'" class="result-section">
      <el-card class="result-card">
        <div class="result-header">
          <div class="type-badge">
            <span class="type-code">{{ result.mbtiType }}</span>
            <span class="type-title">{{ result.personality?.title }}</span>
          </div>
        </div>
        
        <div class="result-dimensions">
          <div class="dim-row">
            <div class="dim-bar">
              <span class="dim-label">E</span>
              <el-progress :percentage="(result.scores.E / 4) * 100" :stroke-width="20" color="#67c23a" />
              <span class="dim-label">I</span>
            </div>
          </div>
          <div class="dim-row">
            <div class="dim-bar">
              <span class="dim-label">S</span>
              <el-progress :percentage="(result.scores.S / 4) * 100" :stroke-width="20" color="#409eff" />
              <span class="dim-label">N</span>
            </div>
          </div>
          <div class="dim-row">
            <div class="dim-bar">
              <span class="dim-label">T</span>
              <el-progress :percentage="(result.scores.T / 4) * 100" :stroke-width="20" color="#e6a23c" />
              <span class="dim-label">F</span>
            </div>
          </div>
          <div class="dim-row">
            <div class="dim-bar">
              <span class="dim-label">J</span>
              <el-progress :percentage="(result.scores.J / 4) * 100" :stroke-width="20" color="#f56c6c" />
              <span class="dim-label">P</span>
            </div>
          </div>
        </div>

        <div v-if="result.personality" class="personality-detail">
          <h4>人格特征</h4>
          <div class="keywords">
            <el-tag v-for="kw in result.personality.keywords" :key="kw" type="info" size="small">{{ kw }}</el-tag>
          </div>
          <p class="description">{{ result.personality.description }}</p>
          <div class="strengths">
            <h5>优势能力</h5>
            <ul>
              <li v-for="(s, i) in result.personality.strengths" :key="i">{{ s }}</li>
            </ul>
          </div>
          <div class="advice">
            <h5>发展建议</h5>
            <p>{{ result.personality.advice }}</p>
          </div>
        </div>

        <div class="result-actions">
          <el-button type="primary" @click="startTest">重新测试</el-button>
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
const result = ref(null)

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const currentDimension = computed(() => {
  const dimMap = { EI: '能量来源', SN: '认知方式', TF: '决策方式', JP: '生活方式' }
  return dimMap[currentQuestion.value.dimension] || ''
})

async function loadQuestions() {
  try {
    const res = await fetch('/api/mbti/test/questions')
    questions.value = await res.json()
    answers.value = new Array(questions.value.length).fill(null)
  } catch (err) {
    console.error('加载题目失败:', err)
  }
}

function startTest() {
  currentIndex.value = 0
  answers.value = new Array(questions.value.length).fill(null)
  result.value = null
  testState.value = 'testing'
}

function selectAnswer(label) {
  answers.value[currentIndex.value] = label
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  } else {
    submitTest()
  }
}

async function submitTest() {
  try {
    const res = await fetch('/api/mbti/test/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answers.value })
    })
    result.value = await res.json()
    testState.value = 'result'
    localStorage.setItem('mbtiTestResult', result.value.mbtiType)
  } catch (err) {
    console.error('提交测试失败:', err)
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
.test-container {
  min-height: 100vh;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.test-header {
  text-align: center;
  padding: 40px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.test-header h1 {
  font-size: 28px;
  margin: 12px 0 8px;
}

.test-header p {
  opacity: 0.9;
  font-size: 15px;
}

.intro-card, .question-card, .result-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
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
  color: #667eea;
  font-weight: bold;
}

.dimension-list {
  display: flex;
  justify-content: space-around;
  margin-bottom: 32px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.dimension-item {
  text-align: center;
}

.dim-label {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 4px;
}

.dim-desc {
  font-size: 12px;
  color: #64748b;
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
  margin-bottom: 20px;
}

.question-num {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.question-dimension {
  font-size: 14px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.question-text {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 24px;
  line-height: 1.6;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.option-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.option-label {
  width: 32px;
  height: 32px;
  background: #e2e8f0;
  color: #475569;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.option-item.selected .option-label {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.option-text {
  font-size: 15px;
  color: #334155;
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

.type-badge {
  display: inline-block;
  padding: 16px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #fff;
}

.type-code {
  display: block;
  font-size: 48px;
  font-weight: 700;
  letter-spacing: 8px;
  margin-bottom: 8px;
}

.type-title {
  font-size: 18px;
  opacity: 0.9;
}

.result-dimensions {
  margin-bottom: 32px;
}

.dim-row {
  margin-bottom: 16px;
}

.dim-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dim-bar .dim-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  width: 24px;
  text-align: center;
}

.dim-bar .el-progress {
  flex: 1;
}

.personality-detail {
  margin-bottom: 32px;
}

.personality-detail h4 {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 12px;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.description {
  color: #475569;
  line-height: 1.8;
  margin-bottom: 20px;
}

.strengths h5, .advice h5 {
  font-size: 15px;
  color: #334155;
  margin-bottom: 8px;
}

.strengths ul {
  list-style: none;
  padding: 0;
}

.strengths li {
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
  color: #475569;
}

.strengths li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
}

.advice {
  background: #fef3c7;
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
}

.advice p {
  color: #92400e;
  margin: 0;
  line-height: 1.6;
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