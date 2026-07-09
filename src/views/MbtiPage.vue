<template>
  <div class="mbti-container">
    <div v-show="localTab === 'match'" class="match-section">
      <div class="section-header">
        <h2>MBTI-WCPA 岗位匹配评估</h2>
        <p>选择 MBTI 人格类型，设定个人 8 维能力得分与岗位要求阈值，系统自动计算综合匹配度</p>
      </div>
      <el-row :gutter="24">
        <el-col :xs="24" :lg="10">
          <el-card class="input-card" shadow="never">
            <template #header><span>评估输入</span></template>
            <el-form label-position="top">
              <el-form-item label="姓名">
                <el-input v-model="evalName" placeholder="请输入姓名" size="large" />
              </el-form-item>
              <el-form-item label="MBTI 人格类型">
                <el-select v-model="evalMbtiType" placeholder="选择MBTI类型" filterable clearable size="large" style="width:100%">
                  <el-option v-for="t in allTypes" :key="t.type" :label="`${t.type} ${t.title}`" :value="t.type" />
                </el-select>
                <div style="margin-top:8px">
                  <el-button type="text" @click="goToMbtiTest" size="small" style="color:#667eea">📝 点击进行MBTI测试</el-button>
                </div>
              </el-form-item>
              <el-divider />
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <span style="font-weight:600;font-size:14px;color:#1e293b">个人 8 维能力得分</span>
                <el-button type="text" @click="goToWcpaTest" size="small" style="color:#10b981">🎯 WCPA能力测评</el-button>
              </div>
              <el-form-item v-for="dim in wcpaDims" :key="dim.key" :label="dim.label">
                <el-slider v-model="wcpaScores[dim.key]" :min="0" :max="10" :step="0.5" show-stops />
              </el-form-item>
              <el-divider />
              <el-form-item label="选择岗位">
                <el-select v-model="selectedPosition" placeholder="选择岗位以自动填充阈值" filterable clearable size="large" style="width:100%">
                  <el-option v-for="pos in positions" :key="pos._id || pos.name" :label="`${pos.icon} ${pos.name}`" :value="pos._id" />
                </el-select>
              </el-form-item>
              <div style="font-weight:600;font-size:14px;color:#1e293b;margin-bottom:12px">岗位要求阈值</div>
              <el-row :gutter="8">
                <el-col :span="12" v-for="dim in wcpaDims" :key="dim.key" style="margin-bottom:8px">
                  <div style="font-size:12px;color:#64748b;margin-bottom:2px">{{ dim.label }}</div>
                  <el-input-number v-model="thresholds[dim.key]" :min="1" :max="10" :step="0.5" size="small" style="width:100%" />
                </el-col>
              </el-row>

              <el-divider />
              <div style="font-weight:600;font-size:14px;color:#1e293b;margin-bottom:12px">岗位和能力要求匹配分数</div>
              <div class="match-score-section" v-if="evalMbtiType">
                <div v-for="dim in wcpaDims" :key="dim.key" class="match-row">
                  <div class="match-label">{{ dim.label }}</div>
                  <div class="match-bar-wrap">
                    <el-progress
                      :percentage="Math.min(Math.round((wcpaScores[dim.key] / (thresholds[dim.key] || 1)) * 100), 100)"
                      :stroke-width="12"
                      :color="(wcpaScores[dim.key] >= thresholds[dim.key]) ? '#67c23a' : '#e6a23c'"
                    />
                  </div>
                  <div class="match-num">{{ wcpaScores[dim.key] }} / {{ thresholds[dim.key] }}</div>
                </div>
                <div class="match-overall">
                  <span class="match-overall-label">综合匹配度</span>
                  <span class="match-overall-val" :style="{ color: overallMatchRate >= 70 ? '#67c23a' : overallMatchRate >= 40 ? '#e6a23c' : '#f56c6c' }">
                    {{ overallMatchRate }}%
                  </span>
                </div>
                <div class="match-positions">
                  <div class="match-pos-title">推荐岗位</div>
                  <el-tag
                    v-for="pos in matchedPositions"
                    :key="pos.name"
                    :style="{ background: pos.color + '22', color: pos.color, borderColor: pos.color, margin: '3px' }"
                    size="default"
                  >{{ pos.icon }} {{ pos.name }}</el-tag>
                  <span v-if="!matchedPositions.length" style="color:#94a3b8;font-size:13px">暂无匹配岗位</span>
                </div>
              </div>
              <div v-else style="text-align:center;padding:12px;color:#94a3b8;font-size:13px">请先选择 MBTI 类型</div>

              <el-button type="primary" size="large" @click="doEvaluate" :loading="evaluating" class="full-btn" :disabled="!evalMbtiType">
                {{ evaluating ? '评估中...' : '开始评估' }}
              </el-button>
            </el-form>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="14">
          <el-card class="result-card" shadow="never" v-if="evalResult">
            <template #header>
              <span>评估结果 · {{ evalResult.mbtiType }}</span>
            </template>
            <div class="grade-section">
              <div class="role-name" v-if="evalName">{{ evalName }}</div>
              <div class="grade-badge">
                <span class="grade-label">{{ evalResult.gradeLabel }}</span>
                <span class="grade-pct">{{ evalResult.totalPercent }}%</span>
              </div>
            </div>

            <div class="role-section" :style="{ borderColor: evalResult.role.color }">
              <div class="role-badge" :style="{ background: evalResult.role.color }">
                <span class="role-icon">{{ evalResult.role.icon }}</span>
                <span class="role-label">{{ evalResult.role.label }}</span>
              </div>
              <div class="role-meta">
                <div class="role-desc">{{ evalResult.role.description }}</div>
                <div class="role-tags">
                  <el-tag size="small" round>{{ evalResult.role.condition }}</el-tag>
                  <el-tag size="small" round :style="{ background: evalResult.role.color + '22', color: evalResult.role.color, borderColor: evalResult.role.color }">{{ evalResult.role.suitAbbr }}</el-tag>
                </div>
                <div class="role-suit">典型类型: {{ evalResult.role.suitTypes.join('、') }}</div>
                <div class="role-code">IERC 编码: <strong>{{ evalResult.iercCode }}</strong>
                  <span v-for="(v, k) in evalResult.iercScores" :key="k" class="ierc-dim" :style="{ color: v >= 6 ? evalResult.role.color : '#94a3b8' }">
                    {{ k }}={{ v }}
                  </span>
                </div>
              </div>
            </div>

            <el-divider />
            <div class="score-bars">
              <div class="score-item" v-for="comp in scoreComponents" :key="comp.key">
                <div class="score-header">
                  <span class="score-name">{{ comp.label }}</span>
                  <span class="score-val">{{ (comp.value * 100).toFixed(1) }}%</span>
                  <span class="score-weight">× {{ comp.weight }}</span>
                  <span class="score-contri">= {{ (comp.contribution * 100).toFixed(1) }}%</span>
                </div>
                <el-progress :percentage="Math.round(comp.value * 100)" :stroke-width="14" :color="comp.color" />
              </div>
            </div>
            <el-divider />
            <h4 class="section-title">WCPA 各维度达标率</h4>
            <div class="dim-grid">
              <div v-for="(d, key) in evalResult.dimDetails" :key="key" class="dim-cell">
                <div class="dim-label">{{ dimMap[key] }}</div>
                <div class="dim-score">{{ d.score }} / {{ d.threshold }}</div>
                <div class="dim-rate">{{ (d.rate * 100).toFixed(0) }}%</div>
              </div>
            </div>
            <el-divider />
            <h4 class="section-title">WCPA 8维雷达</h4>
            <div id="match-radar" style="width:100%;height:180px"></div>
            
            <el-divider v-if="positionMatchResult" />
            <div v-if="positionMatchResult" class="position-match-section">
              <h4 class="section-title">岗位能力匹配分析</h4>
              <div class="match-header" :style="{ borderColor: positionMatchResult.levelColor }">
                <div class="match-pos-info">
                  <span class="match-pos-icon">{{ positionMatchResult.position.icon }}</span>
                  <span class="match-pos-name">{{ positionMatchResult.position.name }}</span>
                </div>
                <div class="match-level" :style="{ color: positionMatchResult.levelColor }">
                  <span class="match-level-text">{{ positionMatchResult.levelText }}</span>
                  <span class="match-level-rate">{{ positionMatchResult.totalRate }}%</span>
                </div>
              </div>
              <div class="match-stats">
                <div class="match-stat">
                  <span class="stat-label">达标维度</span>
                  <span class="stat-value">{{ positionMatchResult.meetCount }}/{{ positionMatchResult.totalDims }}</span>
                </div>
              </div>
              <div class="match-dim-list">
                <div v-for="dim in positionMatchResult.dimResults" :key="dim.key" class="match-dim-item">
                  <div class="match-dim-header">
                    <span class="match-dim-label">{{ dim.label }}</span>
                    <span class="match-dim-score" :class="{ 'dim-meet': dim.isMeet, 'dim-gap': !dim.isMeet }">
                      {{ dim.userScore }}/{{ dim.reqScore }}
                    </span>
                  </div>
                  <div class="match-dim-bar-wrap">
                    <div class="match-dim-bar-bg">
                      <div class="match-dim-bar-req" :style="{ width: (dim.reqScore / 10 * 100) + '%' }"></div>
                      <div class="match-dim-bar-user" :style="{ width: (dim.userScore / 10 * 100) + '%', backgroundColor: dim.isMeet ? '#67c23a' : '#f56c6c' }"></div>
                    </div>
                  </div>
                  <div class="match-dim-rate">匹配率: {{ Math.round(dim.rate) }}%</div>
                </div>
              </div>
              <div v-if="positionMatchResult.suggestions.length > 0" class="match-suggestions">
                <h5 class="suggestions-title">💡 提升建议</h5>
                <ul class="suggestions-list">
                  <li v-for="(s, idx) in positionMatchResult.suggestions" :key="idx" class="suggestion-item">
                    {{ s }}
                  </li>
                </ul>
              </div>
            </div>
          </el-card>
          <el-card v-else class="result-card empty-card" shadow="never">
            <div class="empty-state">
              <span class="empty-icon">📊</span>
              <p>选择 MBTI 类型，设置能力得分与阈值</p>
              <p class="empty-hint">系统将综合计算 MBTI 维度共振、WCPA 能力达标率和张力系数</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-show="localTab === 'records'" class="records-section">
      <div class="section-header">
        <h2>人格档案管理</h2>
        <p>管理已匹配的人员档案，按MBTI类型或I/E分类查看</p>
      </div>

      <el-card class="ops-card" shadow="never">
        <el-row :gutter="12" align="middle">
          <el-col :span="4">
            <el-input v-model="recordForm.name" placeholder="输入姓名" clearable size="default" />
          </el-col>
          <el-col :span="4">
            <el-select v-model="recordForm.mbtiType" placeholder="选择MBTI类型" filterable clearable size="default">
              <el-option v-for="t in allTypes" :key="t.type" :label="`${t.type} ${t.title}`" :value="t.type" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="recordForm.positionId" placeholder="选择岗位能力标准" filterable clearable size="default">
              <el-option v-for="pos in positions" :key="pos._id" :label="`${pos.icon} ${pos.name}`" :value="pos._id" />
            </el-select>
          </el-col>
          <el-col :span="11" style="text-align:right">
            <el-button type="primary" @click="addRecord" :disabled="!recordForm.name || !recordForm.mbtiType">添加档案</el-button>
            <el-button @click="showImport = true">导入数据</el-button>
            <el-button @click="loadRecords">刷新</el-button>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="filter-card" shadow="never">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <el-input 
              v-model="searchName" 
              placeholder="搜索姓名" 
              clearable 
              size="default" 
              style="width:180px;margin-right:8px"
              @keyup.enter="loadRecords"
              @clear="loadRecords"
            />
            <el-button type="primary" size="default" @click="loadRecords" style="margin-right:16px">搜索</el-button>
            <el-select v-model="groupBy" @change="loadRecords" placeholder="列表视图" size="default" style="width:160px">
              <el-option label="列表视图" value="" />
              <el-option label="按MBTI类型分组" value="type" />
              <el-option label="按岗位能力适配分组" value="adaptor" />
            </el-select>
          </div>
          <div style="display:flex;align-items:center;margin-left:20px">
            <el-radio-group v-model="filterEI" @change="loadRecords" size="default">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="E">E 外向</el-radio-button>
              <el-radio-button label="I">I 内向</el-radio-button>
            </el-radio-group>
            <el-button type="danger" size="small" @click="confirmClearAll" style="margin-left:10px">清空全部数据</el-button>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" v-if="!groupBy" class="table-card">
        <el-table :data="records" v-loading="loadingRecords" stripe style="width:100%">
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="mbtiType" label="MBTI" width="100">
            <template #default="{ row }">
              <el-tag :type="getTagType(row.ei)" effect="dark">{{ row.mbtiType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ei" label="I/E" width="70">
            <template #default="{ row }">
              <el-tag :type="row.ei === 'E' ? 'success' : 'warning'" size="small">{{ row.ei }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="沟通表达" width="80" align="center">
            <template #default="{ row }">{{ row.scores?.communication ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="社交协助" width="80" align="center">
            <template #default="{ row }">{{ row.scores?.collaboration ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="解决问题" width="80" align="center">
            <template #default="{ row }">{{ row.scores?.problemSolving ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="项目管理" width="80" align="center">
            <template #default="{ row }">{{ row.scores?.projectManagement ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="学习适应" width="80" align="center">
            <template #default="{ row }">{{ row.scores?.learningAdaptability ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="承担责任" width="80" align="center">
            <template #default="{ row }">{{ row.scores?.responsibility ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="团队贡献" width="80" align="center">
            <template #default="{ row }">{{ row.scores?.teamwork ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="接受挑战" width="80" align="center">
            <template #default="{ row }">{{ row.scores?.challenge ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="岗位能力适配" width="140">
            <template #default="{ row }">
              <el-tag size="small" style="margin:2px">{{ row.adaptor || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间" width="140">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button text type="danger" size="small" @click="deleteRecord(row._id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" v-else-if="groupBy === 'type'" class="group-card">
        <div v-for="(group, type) in groupedRecords" :key="type" class="type-group">
          <div class="group-header">
            <el-tag size="large" :type="getTagType(type[0])" effect="dark" style="font-size:16px;padding:6px 16px">{{ type }}</el-tag>
            <span class="group-count">{{ group.length }} 人</span>
            <el-tag v-if="type[0] === 'E'" type="success" size="small" effect="plain">外向</el-tag>
            <el-tag v-else type="warning" size="small" effect="plain">内向</el-tag>
          </div>
          <div class="group-members">
            <el-tag v-for="p in group" :key="p._id" closable @close="deleteRecord(p._id)" :type="getTagType(p.ei)" style="margin:4px">
              {{ p.name }}
            </el-tag>
          </div>
        </div>
        <div v-if="!Object.keys(groupedRecords).length" class="empty-state">
          <p>暂无档案数据</p>
        </div>
      </el-card>

      <el-card shadow="never" v-else-if="groupBy === 'adaptor'" class="group-card">
        <div v-for="(group, adaptor) in groupedByAdaptor" :key="adaptor" class="type-group">
          <div class="group-header">
            <el-tag size="large" :type="getAdaptorTagType(adaptor)" effect="dark" style="font-size:16px;padding:6px 16px">{{ adaptor || '未评估' }}</el-tag>
            <span class="group-count">{{ group.length }} 人</span>
          </div>
          <div class="group-members">
            <el-tag v-for="p in group" :key="p._id" closable @close="deleteRecord(p._id)" :type="getAdaptorTagType(p.adaptor)" style="margin:4px">
              {{ p.name }}
            </el-tag>
          </div>
        </div>
        <div v-if="!Object.keys(groupedByAdaptor).length" class="empty-state">
          <p>暂无档案数据</p>
        </div>
      </el-card>

      
    </div>

    <el-dialog v-model="showImport" title="导入数据" width="500px" :close-on-click-modal="false">
      <el-upload drag action="#" :auto-upload="false" :on-change="handleImport" accept=".csv" :show-file-list="false">
        <el-icon class="el-icon--upload" :size="48"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽 CSV 文件到此处，或 <em>点击选择文件</em></div>
        <template #tip>
          <div class="el-upload__tip">
            <p>CSV 格式要求（首行为列名，UTF-8编码）：</p>
            <code>姓名,MBTI类型,E/I,沟通表达,社交协助,解决问题,项目管理,学习适应,承担责任意愿,团队贡献意愿,接受挑战意愿,标签</code>
          </div>
        </template>
      </el-upload>
      <div v-if="importResult" style="margin-top:16px">
        <el-alert :title="importResult" :type="importResult.includes('失败') ? 'error' : 'success'" show-icon :closable="false" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({ activeTab: { type: String, default: 'match' } })
const emit = defineEmits(['update:activeTab'])

const API = '/api/mbti'
const localTab = ref(props.activeTab)
watch(() => props.activeTab, (v) => { localTab.value = v })
watch(localTab, (v) => { emit('update:activeTab', v) })

const evaluating = ref(false)
const evalResult = ref(null)
const evalMbtiType = ref(localStorage.getItem('mbtiTestResult') || '')
const evalName = ref('')
let matchChart = null
let iercChart = null

const allTypes = ref([])
const records = ref([])
const groupedRecords = ref({})
const groupedByAdaptor = ref({})
const loadingRecords = ref(false)
const filterEI = ref('')
const searchName = ref('')
const groupBy = ref('')
const showImport = ref(false)
const importResult = ref('')
const recordForm = reactive({ name: '', mbtiType: '', positionId: '' })

const wcpaDims = [
  { key: 'communication', label: '沟通表达' },
  { key: 'collaboration', label: '社交协助' },
  { key: 'problemSolving', label: '解决问题' },
  { key: 'projectManagement', label: '项目管理' },
  { key: 'learningAdaptability', label: '学习适应' },
  { key: 'responsibility', label: '承担责任意愿' },
  { key: 'teamwork', label: '团队贡献意愿' },
  { key: 'challenge', label: '接受挑战意愿' }
]
const dimMap = Object.fromEntries(wcpaDims.map(d => [d.key, d.label]))

const wcpaScores = reactive(Object.fromEntries(wcpaDims.map(d => [d.key, 5])))
const thresholds = reactive(Object.fromEntries(wcpaDims.map(d => [d.key, 6])))

function goToMbtiTest() {
  router.push('/test')
}

function goToWcpaTest() {
  router.push('/wcpa-test')
}

function loadWcpaResult() {
  const saved = localStorage.getItem('wcpaTestResult')
  if (saved) {
    try {
      const scores = JSON.parse(saved)
      for (const dim of wcpaDims) {
        if (scores[dim.key] !== undefined) {
          wcpaScores[dim.key] = scores[dim.key]
        }
      }
      ElMessage.success('已加载WCPA测评结果')
    } catch (e) {
      console.error('加载WCPA测评结果失败:', e)
    }
  }
}

const positions = ref([])
const selectedPosition = ref(null)

const overallMatchRate = computed(() => {
  let total = 0, count = 0
  for (const dim of wcpaDims) {
    const th = thresholds[dim.key] || 1
    const rate = Math.min((wcpaScores[dim.key] / th) * 100, 100)
    total += rate
    count++
  }
  return count ? Math.round(total / count) : 0
})

const matchedPositions = computed(() => {
  if (!evalMbtiType.value) return []
  return positions.value.filter(pos => {
    const reqs = pos.requirements || pos.req
    let matchCount = 0, totalReq = 0
    for (const [dim, min] of Object.entries(reqs)) {
      totalReq++
      if ((wcpaScores[dim] || 0) >= min) matchCount++
    }
    return totalReq > 0 && (matchCount / totalReq) >= 0.5
  })
})

const scoreComponents = computed(() => {
  if (!evalResult.value) return []
  const c = evalResult.value.components
  return [
    { key: 'mbtiResonance', label: 'MBTI维度共振系数', value: c.mbtiResonance.value, weight: c.mbtiResonance.weight, contribution: c.mbtiResonance.contribution, color: '#667eea' },
    { key: 'wcpaRate', label: 'WCPA能力达标率', value: c.wcpaRate.value, weight: c.wcpaRate.weight, contribution: c.wcpaRate.contribution, color: '#67c23a' },
    { key: 'tensionCoefficient', label: 'MBTI-WCPA张力系数', value: c.tensionCoefficient.value, weight: c.tensionCoefficient.weight, contribution: c.tensionCoefficient.contribution, color: '#e6a23c' }
  ]
})

const positionMatchResult = computed(() => {
  if (!selectedPosition.value || !evalMbtiType.value) return null
  const pos = positions.value.find(p => p._id === selectedPosition.value)
  if (!pos) return null
  
  const reqs = pos.requirements || pos.req
  const dimResults = wcpaDims.map(dim => {
    const userScore = wcpaScores[dim.key] || 0
    const reqScore = reqs[dim.key] || 6
    const rate = Math.min((userScore / reqScore) * 100, 100)
    const isMeet = userScore >= reqScore
    return {
      key: dim.key,
      label: dim.label,
      userScore,
      reqScore,
      rate,
      isMeet,
      gap: reqScore - userScore
    }
  })
  
  const totalRate = dimResults.reduce((sum, d) => sum + d.rate, 0) / dimResults.length
  const meetCount = dimResults.filter(d => d.isMeet).length
  
  let level = ''
  let levelColor = ''
  let levelText = ''
  if (totalRate >= 90) {
    level = 'excellent'
    levelColor = '#67c23a'
    levelText = '🏆 优秀匹配'
  } else if (totalRate >= 70) {
    level = 'good'
    levelColor = '#667eea'
    levelText = '👍 良好匹配'
  } else if (totalRate >= 50) {
    level = 'basic'
    levelColor = '#e6a23c'
    levelText = '💪 基本匹配'
  } else {
    level = 'low'
    levelColor = '#f56c6c'
    levelText = '📈 待提升'
  }
  
  const strongDims = dimResults.filter(d => d.rate >= 80).sort((a, b) => b.rate - a.rate).slice(0, 3)
  const weakDims = dimResults.filter(d => d.rate < 60).sort((a, b) => a.rate - b.rate).slice(0, 3)
  
  const suggestions = []
  if (strongDims.length > 0) {
    suggestions.push(`您在${strongDims.map(d => d.label).join('、')}方面表现优秀，这些是您的核心竞争力，建议继续保持和深化。`)
  }
  if (weakDims.length > 0) {
    suggestions.push(`在${weakDims.map(d => d.label).join('、')}方面需要加强，建议通过培训、实践等方式提升，特别是${weakDims[0].label}，当前差距较大。`)
  }
  if (meetCount < dimResults.length) {
    suggestions.push('建议对照岗位要求，制定针对性的能力提升计划，逐步缩小与岗位要求的差距。')
  }
  if (totalRate >= 70) {
    suggestions.push('整体匹配度良好，您具备胜任该岗位的基础能力，可考虑申请或转岗至相关岗位。')
  }
  
  return {
    position: pos,
    totalRate: Math.round(totalRate),
    meetCount,
    totalDims: dimResults.length,
    level,
    levelColor,
    levelText,
    dimResults,
    strongDims,
    weakDims,
    suggestions
  }
})

function formatDate(d) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    return dt.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}
function getTagType(ei) { return ei === 'E' ? 'success' : 'warning' }
function getAdaptorTagType(adaptor) {
  if (!adaptor) return 'info'
  if (adaptor.includes('天选')) return 'success'
  if (adaptor.includes('高潜')) return 'primary'
  if (adaptor.includes('可塑')) return 'warning'
  if (adaptor.includes('风险')) return 'danger'
  if (adaptor.includes('紧急')) return 'danger'
  return 'info'
}



watch(selectedPosition, (posId) => {
  if (posId) {
    const pos = positions.value.find(p => p._id === posId)
    if (pos && pos.requirements) {
      for (const dim of wcpaDims) {
        thresholds[dim.key] = pos.requirements[dim.key] || 6
      }
    }
  }
})

onMounted(async () => {
  await Promise.all([loadTypes(), loadRecords(), loadPositions()])
  loadWcpaResult()
})

async function loadTypes() {
  try {
    const res = await axios.get(`${API}/types`)
    allTypes.value = res.data
  } catch (e) {
    ElMessage.error('加载MBTI类型失败: ' + (e.response?.data?.error || e.message))
  }
}

async function loadPositions() {
  try {
    const res = await axios.get(`${API}/position-data`)
    positions.value = res.data
  } catch (e) {
    ElMessage.error('加载岗位数据失败: ' + (e.response?.data?.error || e.message))
  }
}

async function loadRecords() {
  loadingRecords.value = true
  try {
    const params = {}
    if (filterEI.value) params.ei = filterEI.value
    if (searchName.value) params.name = searchName.value
    params.groupBy = groupBy.value
    const res = await axios.get(`${API}/records`, { params })
    if (groupBy.value === 'type') {
      groupedRecords.value = res.data
      groupedByAdaptor.value = {}
      records.value = Object.values(res.data).flat()
    } else if (groupBy.value === 'adaptor') {
      groupedByAdaptor.value = res.data
      groupedRecords.value = {}
      records.value = Object.values(res.data).flat()
    } else {
      groupedRecords.value = {}
      groupedByAdaptor.value = {}
      records.value = res.data
    }
  } catch (e) {
    ElMessage.error('加载档案失败: ' + (e.response?.data?.error || e.message))
  } finally { loadingRecords.value = false }
}

async function doEvaluate() {
  evaluating.value = true
  evalResult.value = null
  try {
    if (!allTypes.value.length) await loadTypes()
    const res = await axios.post(`${API}/evaluate`, {
      mbtiType: evalMbtiType.value,
      wcpaScores: { ...wcpaScores },
      thresholds: { ...thresholds }
    })
    evalResult.value = res.data
    await nextTick()
    drawChart()
    
    await saveMatchRecord()
  } catch (e) {
    ElMessage.error('评估失败: ' + (e.response?.data?.error || e.message))
  } finally { evaluating.value = false }
}

async function saveMatchRecord() {
  if (!evalResult.value || !evalMbtiType.value) return
  const ei = evalMbtiType.value[0]
  const posMatch = positionMatchResult.value
  
  try {
    await axios.post(`${API}/records`, {
      name: evalName.value || '未命名',
      mbtiType: evalMbtiType.value,
      ei,
      scores: { ...wcpaScores },
      thresholds: { ...thresholds },
      matchResult: evalResult.value,
      positionMatch: posMatch ? {
        positionId: selectedPosition.value,
        positionName: posMatch.position?.name,
        totalRate: posMatch.totalRate,
        level: posMatch.level,
        dimResults: posMatch.dimResults
      } : null,
      matchedPositions: matchedPositions.value.map(p => ({
        name: p.name,
        icon: p.icon,
        color: p.color
      })),
      adaptor: evalResult.value.gradeLabel || ''
    })
    await loadRecords()
    ElMessage.success('岗位匹配结果已保存到人格档案')
  } catch (e) {
    ElMessage.warning('保存到档案失败: ' + (e.response?.data?.error || e.message))
  }
}

function drawChart() {
  const dom = document.getElementById('match-radar')
  if (!dom || !evalResult.value) return
  if (matchChart) matchChart.dispose()
  matchChart = echarts.init(dom)
  const details = evalResult.value.dimDetails
  const indicator = wcpaDims.map(d => ({ name: d.label, max: 10, min: 0 }))
  const personValues = wcpaDims.map(d => details[d.key].score)
  const thresholdValues = wcpaDims.map(d => details[d.key].threshold)
  matchChart.setOption({
    radar: {
      indicator,
      center: ['50%', '50%'],
      radius: '65%',
      axisName: { color: '#475569', fontSize: 11 }
    },
    legend: { data: ['个人得分', '岗位阈值'], bottom: 0 },
    series: [{
      type: 'radar',
      data: [
        {
          value: personValues,
          name: '个人得分',
          areaStyle: { color: 'rgba(102,126,234,0.2)' },
          lineStyle: { color: '#667eea', width: 2 },
          itemStyle: { color: '#667eea' }
        },
        {
          value: thresholdValues,
          name: '岗位阈值',
          areaStyle: { color: 'rgba(103,194,58,0.1)' },
          lineStyle: { color: '#67c23a', width: 2, type: 'dashed' },
          itemStyle: { color: '#67c23a' }
        }
      ]
    }]
  })

  drawIercChart()
}

function drawIercChart() {
  const dom = document.getElementById('ierc-radar')
  if (!dom || !evalResult.value) return
  if (iercChart) iercChart.dispose()
  iercChart = echarts.init(dom)
  const s = evalResult.value.iercScores
  const roleColor = evalResult.value.role.color
  const iercDims = [
    { name: 'I 影响力', max: 10 },
    { name: 'E 执行力', max: 10 },
    { name: 'R 韧性', max: 10 },
    { name: 'C 协作力', max: 10 }
  ]
  const values = [s.I, s.E, s.R, s.C]
  iercChart.setOption({
    radar: {
      indicator: iercDims,
      center: ['50%', '50%'],
      radius: '65%',
      axisName: { color: '#475569', fontSize: 11 }
    },
    series: [{
      type: 'radar',
      data: [{
        value: values,
        name: 'IERC画像',
        areaStyle: { color: roleColor + '33' },
        lineStyle: { color: roleColor, width: 2 },
        itemStyle: { color: roleColor }
      }]
    }]
  })
}

async function addRecord() {
  if (!recordForm.name || !recordForm.mbtiType) return
  const ei = recordForm.mbtiType[0]
  
  let scores = {}
  let adaptor = ''
  
  if (recordForm.positionId) {
    const pos = positions.value.find(p => p._id === recordForm.positionId)
    if (pos && pos.requirements) {
      scores = { ...pos.requirements }
      const sum = Object.values(scores).reduce((a, b) => a + b, 0)
      const avg = sum / 8
      if (avg >= 8.5) adaptor = '天选共振者'
      else if (avg >= 7) adaptor = '高潜适配者'
      else if (avg >= 5.5) adaptor = '可塑协作者'
      else if (avg >= 4) adaptor = '风险警示者'
      else adaptor = '紧急干预对象'
    }
  }
  
  try {
    await axios.post(`${API}/records`, { 
      name: recordForm.name, 
      mbtiType: recordForm.mbtiType, 
      ei,
      scores: Object.keys(scores).length ? scores : undefined,
      adaptor
    })
    recordForm.name = ''
    recordForm.mbtiType = ''
    recordForm.positionId = ''
    await loadRecords()
    ElMessage.success('档案添加成功')
  } catch (e) {
    ElMessage.error('添加档案失败: ' + (e.response?.data?.error || e.message))
  }
}

async function deleteRecord(id) {
  try {
    await axios.delete(`${API}/records/${id}`)
    await loadRecords()
    ElMessage.success('已删除')
  } catch (e) {
    ElMessage.error('删除失败: ' + (e.response?.data?.error || e.message))
  }
}

async function confirmClearAll() {
  try {
    await ElMessageBox.confirm(
      '确定要删除所有数据吗？此操作不可恢复！',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await axios.delete(`${API}/records`)
    await loadRecords()
    ElMessage.success('全部数据已清空')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('清空失败: ' + (e.response?.data?.error || e.message))
    }
  }
}

async function handleImport(file) {
  importResult.value = ''
  const text = await file.raw.text()
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) { importResult.value = '文件格式错误，缺少数据行'; return }
  const list = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim())
    if (cols.length < 2) continue
    const [name, mbtiType, ei, comm, collab, prob, proj, learn, resp, team, chall, ...tags] = cols
    if (name && mbtiType) {
      list.push({
        name, mbtiType, ei: ei || mbtiType[0],
        scores: {
          communication: Number(comm) || 0,
          collaboration: Number(collab) || 0,
          problemSolving: Number(prob) || 0,
          projectManagement: Number(proj) || 0,
          learningAdaptability: Number(learn) || 0,
          responsibility: Number(resp) || 0,
          teamwork: Number(team) || 0,
          challenge: Number(chall) || 0
        },
        tags: tags.length ? tags : []
      })
    }
  }
  if (!list.length) { importResult.value = '没有有效数据行'; return }
  try {
    const res = await axios.post(`${API}/records/import`, { records: list })
    importResult.value = res.data.message
    await loadRecords()
    ElMessage.success(res.data.message)
  } catch (e) {
    importResult.value = '导入失败: ' + (e.response?.data?.error || e.message)
    ElMessage.error(importResult.value)
  }
}
</script>

<style scoped>
.mbti-container {
  animation: fadeIn .3s ease;
}
@keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

.section-header { margin-bottom: 20px; }
.section-header h2 { margin:0; font-size:22px; color:#1e293b }
.section-header p { margin:4px 0 0; color:#64748b; font-size:14px }

.input-card, .result-card { border-radius:12px; min-height:480px }
.ops-card { margin-bottom:12px; border-radius:10px }
.filter-card { margin-bottom:12px; border-radius:10px; display:flex; align-items:center; justify-content:flex-end; padding:0 !important }
.filter-card .el-card__body { padding:8px 0 !important }
.table-card, .group-card { border-radius:10px; margin-top:12px }

.full-btn { width:100%; margin-top:8px; height:44px; font-size:16px; border-radius:10px }

.grade-section { display:flex; align-items:center; justify-content:center; gap:16px; padding:16px 0 }
.grade-badge {
  display:inline-flex; align-items:center; gap:16px;
  padding:12px 32px; border-radius:16px; margin-bottom:8px;
  background:linear-gradient(135deg,#667eea,#764ba2);
}
.grade-label { font-size:24px; font-weight:700; color:#fff }
.grade-pct { font-size:28px; font-weight:700; color:#fff }

.section-title { margin:0 0 10px 0; color:#334155; font-size:15px; font-weight:600 }

.score-bars { display:flex; flex-direction:column; gap:12px }
.score-item { }
.score-header { display:flex; align-items:center; gap:8px; margin-bottom:4px; font-size:13px }
.score-name { color:#334155; font-weight:500; flex:1 }
.score-val { color:#667eea; font-weight:600 }
.score-weight { color:#94a3b8 }
.score-contri { color:#10b981; font-weight:600 }

.dim-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px }
.dim-cell { text-align:center; padding:10px 4px; background:#f8fafc; border-radius:8px }
.dim-label { font-size:12px; color:#64748b; margin-bottom:4px }
.dim-score { font-size:14px; color:#1e293b; font-weight:600 }
.dim-rate { font-size:16px; color:#667eea; font-weight:700; margin-top:2px }

.empty-card { display:flex; align-items:center; justify-content:center }
.empty-state { text-align:center; padding:60px 20px; color:#94a3b8 }
.empty-icon { font-size:56px; display:block; margin-bottom:12px }
.empty-state p { margin:4px 0 }
.empty-hint { font-size:13px; color:#c4b5fd }

.type-group { margin-bottom:16px; padding:16px; background:#f8fafc; border-radius:10px }
.group-header { display:flex; align-items:center; gap:12px; margin-bottom:10px }
.group-count { color:#64748b; font-size:14px }
.group-members { display:flex; flex-wrap:wrap; gap:4px }

.no-tags { color:#cbd5e1; font-size:12px }

.match-score-section { display:flex; flex-direction:column; gap:6px; margin-bottom:8px }
.match-row { display:flex; align-items:center; gap:8px }
.match-label { width:72px; font-size:12px; color:#475569; flex-shrink:0 }
.match-bar-wrap { flex:1; min-width:0 }
.match-num { width:56px; text-align:right; font-size:12px; color:#64748b; flex-shrink:0 }
.match-overall {
  display:flex; align-items:center; justify-content:space-between;
  margin-top:8px; padding:10px 12px; background:#f8fafc; border-radius:8px;
}
.match-overall-label { font-size:14px; font-weight:600; color:#1e293b }
.match-overall-val { font-size:22px; font-weight:700 }
.match-positions { margin-top:8px }
.match-pos-title { font-size:13px; font-weight:600; color:#475569; margin-bottom:4px }

.role-section {
  display:flex; align-items:flex-start; gap:12px;
  margin:12px 0; padding:16px; 
  border:1px solid; border-radius:12px;
  background:#fafaff;
}
.role-name {
  font-size:16px; font-weight:700; color:#1e293b;
  padding:8px 12px; background:#f1f5f9; border-radius:6px;
  white-space:nowrap;
}
.role-badge {
  display:flex; flex-direction:column; align-items:center; gap:4px;
  padding:12px 16px; border-radius:10px; min-width:80px;
}
.role-icon { font-size:28px }
.role-label { font-size:14px; font-weight:700; color:#fff; white-space:nowrap }
.role-meta { flex:1; display:flex; flex-direction:column; gap:4px }
.role-desc { font-size:15px; font-weight:600; color:#1e293b }
.role-tags { display:flex; gap:6px; flex-wrap:wrap }
.role-suit { font-size:13px; color:#475569 }
.role-code { font-size:13px; color:#475569; margin-top:2px }
.ierc-dim { display:inline-block; margin-left:10px; font-weight:600 }

.position-match-section { margin-top:4px }
.match-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:8px 12px; border:1px solid; border-radius:8px;
  background:#fafaff; margin-bottom:8px;
}
.match-pos-info { display:flex; align-items:center; gap:6px }
.match-pos-icon { font-size:18px }
.match-pos-name { font-size:14px; font-weight:700; color:#1e293b }
.match-level { display:flex; align-items:center; gap:6px }
.match-level-text { font-size:12px; font-weight:600 }
.match-level-rate { font-size:22px; font-weight:700 }

.match-stats { display:flex; gap:12px; margin-bottom:10px }
.match-stat { padding:6px 12px; background:#f1f5f9; border-radius:6px }
.stat-label { display:block; font-size:11px; color:#64748b; margin-bottom:1px }
.stat-value { display:block; font-size:15px; font-weight:700; color:#1e293b }

.match-dim-list { display:flex; flex-direction:column; gap:6px; margin-bottom:10px }
.match-dim-item { padding:6px 8px; background:#f8fafc; border-radius:6px }
.match-dim-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px }
.match-dim-label { font-size:12px; color:#475569; font-weight:500 }
.match-dim-score { font-size:12px; font-weight:700 }
.dim-meet { color:#67c23a }
.dim-gap { color:#f56c6c }

.match-dim-bar-wrap { margin-bottom:2px }
.match-dim-bar-bg { position:relative; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden }
.match-dim-bar-req { position:absolute; left:0; top:0; height:100%; background:#cbd5e1; border-radius:3px; z-index:1 }
.match-dim-bar-user { position:absolute; left:0; top:0; height:100%; border-radius:3px; z-index:2; transition:width 0.3s }
.match-dim-rate { font-size:11px; color:#64748b }

.match-suggestions { padding:8px 12px; background:#fffbeb; border:1px solid #fef3c7; border-radius:6px }
.suggestions-title { font-size:12px; font-weight:600; color:#92400e; margin-bottom:4px }
.suggestions-list { margin:0; padding-left:16px }
.suggestion-item { font-size:11px; color:#78350f; line-height:1.5; margin-bottom:2px }
.suggestion-item:last-child { margin-bottom:0 }
</style>
