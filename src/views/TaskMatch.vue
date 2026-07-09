<template>
  <div class="task-match-container">
    <div class="section-header">
      <h2>🎯 任务匹配中心</h2>
      <p>发布任务需求，系统自动分析所需能力并从人格档案中匹配最合适的人员</p>
    </div>

    <el-card class="ops-card" shadow="never">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-input v-model="searchTaskName" placeholder="搜索任务名称" clearable size="default" @input="handleFilterChange" />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterPriority" placeholder="优先级筛选" clearable size="default" @change="handleFilterChange">
            <el-option label="高优先级" value="high" />
            <el-option label="中优先级" value="medium" />
            <el-option label="低优先级" value="low" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="状态筛选" clearable size="default" @change="handleFilterChange">
            <el-option label="待分配" value="pending" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-col>
        <el-col :span="10" style="text-align:right">
          <el-button type="warning" @click="releaseExpiredAssignments">释放过期人员</el-button>
          <el-button type="primary" @click="showCreateModal = true">发布新任务</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="24">
      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="task-list-card">
          <template #header><span>任务列表</span></template>
          <el-table :data="tasks" v-loading="loadingTasks" stripe style="width:100%" @row-click="viewTask" row-class-name="clickable-row">
            <el-table-column prop="name" label="任务名称" min-width="120" />
            <el-table-column prop="description" label="任务描述" min-width="120" show-overflow-tooltip />
            <el-table-column prop="requiredPeople" label="所需人数" width="80" />
            <el-table-column prop="priority" label="优先级" width="90">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)" size="small">
                  {{ getPriorityLabel(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="选用截止" width="110">
              <template #default="{ row }">
                <span v-if="row.assignmentEndTime" class="expire-time" :class="{ expired: isExpired(row.assignmentEndTime) }">
                  {{ formatDateTimeShort(row.assignmentEndTime) }}
                </span>
                <span v-else class="text-gray">无限制</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button text size="small" @click="viewTask(row)">查看</el-button>
                <el-button text type="danger" size="small" @click="deleteTask(row._id)">删除</el-button>
                <el-button 
                  v-if="row.status === 'pending'" 
                  type="primary" 
                  size="small" 
                  @click="updateTaskStatus(row._id, 'in-progress')"
                >
                  执行
                </el-button>
                <el-button 
                  v-if="row.status === 'in-progress'" 
                  type="success" 
                  size="small" 
                  @click="updateTaskStatus(row._id, 'completed')"
                >
                  完成
                </el-button>
                <el-tag v-if="row.status === 'completed'" type="success" size="small">已完成</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="14">
        <el-card v-if="selectedTask" shadow="never" class="task-detail-card">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>{{ selectedTask.name }}</span>
              <el-tag :type="getPriorityType(selectedTask.priority)" size="small">
                {{ getPriorityLabel(selectedTask.priority) }}
              </el-tag>
            </div>
          </template>

          <div class="task-info">
            <div class="info-row">
              <span class="info-label">任务描述</span>
              <span class="info-value">{{ selectedTask.description }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">所需人数</span>
              <span class="info-value">{{ selectedTask.requiredPeople }} 人</span>
            </div>
            <div class="info-row">
              <span class="info-label">选用截止时间</span>
              <span class="info-value" :class="{ expired: selectedTask.assignmentEndTime && isExpired(selectedTask.assignmentEndTime) }">
                {{ selectedTask.assignmentEndTime ? formatDateTime(selectedTask.assignmentEndTime) : '无限制' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ formatDate(selectedTask.createdAt) }}</span>
            </div>
          </div>

          <el-divider />
          <div class="task-actions-row">
            <el-button 
              type="warning" 
              @click="autoAssignTask"
              :disabled="selectedTask.status === 'completed'"
              icon="el-icon-user-check"
            >
              自动任用 {{ selectedTask.requiredPeople }} 人
            </el-button>
            <el-button 
              type="danger" 
              @click="releaseTaskAssignments"
              icon="el-icon-user-minus"
            >
              释放已选用人员
            </el-button>
            <el-button 
              v-if="selectedTask.status === 'pending'" 
              type="primary" 
              :disabled="assignedPersons.length < selectedTask.requiredPeople"
              @click="updateTaskStatus(selectedTask._id, 'in-progress')"
              icon="el-icon-circle-check"
            >
              执行任务
            </el-button>
            <el-button 
              v-if="selectedTask.status === 'in-progress'" 
              type="success" 
              @click="updateTaskStatus(selectedTask._id, 'completed')"
              icon="el-icon-circle-check"
            >
              完成任务
            </el-button>
            <el-button 
              v-if="selectedTask.status === 'completed'" 
              type="warning" 
              @click="updateTaskStatus(selectedTask._id, 'pending')"
              icon="el-icon-refresh"
            >
              重新开启
            </el-button>
          </div>

          <el-divider />
          <h4 class="section-title">📋 能力需求分析</h4>
          <div class="requirement-grid">
            <div v-for="dim in wcpaDims" :key="dim.key" class="requirement-item">
              <div class="req-header">
                <span class="req-label">{{ dim.label }}</span>
                <span class="req-score">需求值: {{ selectedTask.requirements[dim.key] }}</span>
              </div>
              <el-progress
                :percentage="Math.round((selectedTask.requirements[dim.key] / 10) * 100)"
                :stroke-width="10"
                :color="getRequirementColor(selectedTask.requirements[dim.key])"
                :text-inside="true"
              />
            </div>
          </div>

          <el-divider />
          <div class="assigned-section">
            <h4 class="section-title">✅ 已选用人员</h4>
            <div v-if="assignedPersons.length > 0" class="assigned-list">
              <div v-for="person in assignedPersons" :key="person._id" class="assigned-item">
                <span class="assigned-name">{{ person.name }}</span>
                <el-tag :type="getTagType(person.ei)" size="small">{{ person.mbtiType }}</el-tag>
                <span class="assigned-rate">匹配度 {{ getPersonMatchRate(person) }}%</span>
                <el-button 
                  text 
                  type="danger" 
                  size="small" 
                  @click="unassignPerson(person._id)"
                >
                  移除
                </el-button>
              </div>
            </div>
            <div v-else class="empty-state small">
              <span class="empty-icon">👤</span>
              <p>暂无已选用人员</p>
            </div>
            <div class="assigned-count">
              已选用 {{ assignedPersons.length }} / {{ selectedTask.requiredPeople }} 人
              <el-progress :percentage="Math.round((assignedPersons.length / selectedTask.requiredPeople) * 100)" :stroke-width="6" />
            </div>
          </div>

          <el-divider />
          <h4 class="section-title">👥 可选用人员列表</h4>
          <div v-if="matchingResults.length > 0" class="match-results">
            <div v-for="(result, index) in matchingResults" :key="result.person._id" class="match-item" :class="{ locked: result.locked }">
              <div class="match-header">
                <span class="match-rank">{{ index + 1 }}</span>
                <span class="match-name">{{ result.person.name }}</span>
                <el-tag :type="getTagType(result.person.ei)" size="small">{{ result.person.mbtiType }}</el-tag>
                <span class="match-rate" :style="{ color: getMatchColor(result.matchRate) }">
                  匹配度 {{ result.matchRate }}%
                </span>
                <el-tag v-if="result.locked" type="danger" size="small" style="margin-left:auto">
                  🔒 被高优先级占用
                </el-tag>
              </div>
              <div class="match-dims">
                <div v-for="dim in wcpaDims" :key="dim.key" class="match-dim">
                  <span class="dim-name">{{ dim.label }}</span>
                  <div class="dim-bars">
                    <div class="dim-bar-wrap">
                      <div class="dim-bar-req" :style="{ width: (selectedTask.requirements[dim.key] / 10 * 100) + '%' }"></div>
                      <div 
                        class="dim-bar-user" 
                        :style="{ 
                          width: ((result.person.scores[dim.key] || 0) / 10 * 100) + '%',
                          backgroundColor: (result.person.scores[dim.key] || 0) >= selectedTask.requirements[dim.key] ? '#67c23a' : '#f56c6c'
                        }"
                      ></div>
                    </div>
                  </div>
                  <span class="dim-score">
                    {{ result.person.scores[dim.key] || 0 }}/{{ selectedTask.requirements[dim.key] }}
                  </span>
                </div>
              </div>
              <div class="match-actions">
                <el-button 
                  v-if="!result.assigned && !result.locked && assignedPersons.length < selectedTask.requiredPeople" 
                  size="small" 
                  type="primary" 
                  @click="assignPerson(result.person._id)"
                >
                  选用
                </el-button>
                <el-tag v-else-if="result.assigned" type="success" size="small">✓ 已选用</el-tag>
                <el-tag v-else-if="assignedPersons.length >= selectedTask.requiredPeople" type="warning" size="small">人数已满</el-tag>
                <el-tag v-else type="info" size="small" disabled>被占用</el-tag>
                <span class="match-adaptor">{{ result.person.adaptor || '未评估' }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">🔍</span>
            <p>暂无匹配人员</p>
            <p class="empty-hint">系统将根据任务需求与人员能力自动匹配</p>
          </div>

          
        </el-card>

        <el-card v-else class="empty-card" shadow="never">
          <div class="empty-state">
            <span class="empty-icon">📋</span>
            <p>请选择一个任务查看详情</p>
            <p class="empty-hint">或点击右上角发布新任务</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showCreateModal" title="发布新任务" width="650px" :close-on-click-modal="false">
      <el-form :model="taskForm" label-position="top">
        <el-form-item label="任务名称" required>
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" size="large" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="taskForm.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="所需人数" required>
              <el-input-number v-model="taskForm.requiredPeople" :min="1" :max="20" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" required>
              <el-select v-model="taskForm.priority" placeholder="选择优先级" size="large" style="width:100%">
                <el-option label="高优先级" value="high" />
                <el-option label="中优先级" value="medium" />
                <el-option label="低优先级" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="人员选用截止时间">
          <el-date-picker
            v-model="taskForm.assignmentEndTime"
            type="datetime"
            placeholder="选择截止时间"
            size="large"
            style="width:100%"
            :picker-options="{
              selectableRange: '08:00:00 - 22:00:00',
              disabledDate: (time) => {
                return time.getTime() < Date.now() - 8.64e7
              }
            }"
          />
          <span style="font-size:12px;color:#94a3b8;margin-left:8px">* 到期后人员将自动释放</span>
        </el-form-item>
        <el-divider content-position="left">能力需求设定</el-divider>
        <div class="req-setting-grid">
          <el-form-item v-for="dim in wcpaDims" :key="dim.key" :label="dim.label">
            <el-slider 
              v-model="taskForm.requirements[dim.key]" 
              :min="1" 
              :max="10" 
              :step="0.5" 
              show-stops 
            />
            <span style="float:right;color:#64748b">{{ taskForm.requirements[dim.key] }}</span>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showCreateModal = false">取消</el-button>
        <el-button type="primary" @click="createTask" :disabled="!taskForm.name">发布任务</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const API = '/api/mbti'

const wcpaDims = [
  { key: 'communication', label: '沟通表达' },
  { key: 'collaboration', label: '社交协助' },
  { key: 'problemSolving', label: '解决问题' },
  { key: 'projectManagement', label: '项目管理' },
  { key: 'learningAdaptability', label: '学习适应' },
  { key: 'responsibility', label: '承担责任' },
  { key: 'teamwork', label: '团队贡献' },
  { key: 'challenge', label: '接受挑战' },
  { key: 'adaptability', label: '岗位能力适配' }
]

const tasks = ref([])
const loadingTasks = ref(false)
const selectedTask = ref(null)
const matchingResults = ref([])
const searchTaskName = ref('')
const filterPriority = ref('')
const filterStatus = ref('')
const showCreateModal = ref(false)

const taskForm = reactive({
  name: '',
  description: '',
  requiredPeople: 3,
  priority: 'medium',
  assignmentEndTime: null,
  requirements: {
    communication: 6,
    collaboration: 6,
    problemSolving: 6,
    projectManagement: 6,
    learningAdaptability: 6,
    responsibility: 6,
    teamwork: 6,
    challenge: 6,
    adaptability: 6
  }
})

const assignedPersons = computed(() => {
  return matchingResults.value
    .filter(r => r.assigned)
    .map(r => r.person)
})

function getPriorityType(priority) {
  if (priority === 'high') return 'danger'
  if (priority === 'medium') return 'warning'
  return 'info'
}

function getPriorityLabel(priority) {
  if (priority === 'high') return '高优先级'
  if (priority === 'medium') return '中优先级'
  return '低优先级'
}

function getStatusType(status) {
  if (status === 'pending') return 'info'
  if (status === 'in-progress') return 'primary'
  return 'success'
}

function getStatusLabel(status) {
  if (status === 'pending') return '待分配'
  if (status === 'in-progress') return '进行中'
  return '已完成'
}

function getTagType(ei) { return ei === 'E' ? 'success' : 'warning' }

function getRequirementColor(val) {
  if (val >= 8) return '#67c23a'
  if (val >= 6) return '#667eea'
  if (val >= 4) return '#e6a23c'
  return '#f56c6c'
}

function getMatchColor(rate) {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#667eea'
  if (rate >= 40) return '#e6a23c'
  return '#f56c6c'
}

function isExpired(timeStr) {
  if (!timeStr) return false
  return new Date(timeStr) < new Date()
}

function formatDate(d) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    return dt.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function formatDateTime(d) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    return dt.toLocaleString('zh-CN')
  } catch { return '' }
}

function formatDateTimeShort(d) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    return dt.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function getPersonMatchRate(person) {
  if (!selectedTask.value) return 0
  const dims = ['communication', 'collaboration', 'problemSolving', 'projectManagement', 'learningAdaptability', 'responsibility', 'teamwork', 'challenge']
  let totalRate = 0, count = 0
  for (const dim of dims) {
    const personScore = person.scores?.[dim] || 0
    const reqScore = selectedTask.value.requirements?.[dim] || 6
    if (reqScore > 0) {
      totalRate += Math.min((personScore / reqScore) * 100, 100)
      count++
    }
  }
  return count ? Math.round(totalRate / count) : 0
}

onMounted(async () => {
  await loadTasks()
})

function handleFilterChange() {
  loadTasks()
}

async function loadTasks() {
  loadingTasks.value = true
  try {
    const params = {}
    if (searchTaskName.value) params.name = searchTaskName.value
    if (filterPriority.value) params.priority = filterPriority.value
    if (filterStatus.value) params.status = filterStatus.value
    const res = await axios.get(`${API}/tasks`, { params })
    tasks.value = res.data.value || res.data || []
    if (tasks.value.length > 0 && !selectedTask.value) {
      await viewTask(tasks.value[0])
    }
  } catch (e) {
    ElMessage.error('加载任务失败: ' + (e.response?.data?.error || e.message))
  } finally { loadingTasks.value = false }
}

async function viewTask(task) {
  selectedTask.value = task
  await loadMatchingResults(task._id)
}

async function loadMatchingResults(taskId) {
  try {
    const res = await axios.get(`${API}/tasks/${taskId}/match`)
    matchingResults.value = res.data.value || res.data || []
  } catch (e) {
    ElMessage.error('加载匹配结果失败: ' + (e.response?.data?.error || e.message))
  }
}

async function createTask() {
  if (!taskForm.name) return
  try {
    const payload = { ...taskForm }
    if (taskForm.assignmentEndTime) {
      payload.assignmentEndTime = new Date(taskForm.assignmentEndTime).toISOString()
    }
    await axios.post(`${API}/tasks`, payload)
    showCreateModal.value = false
    taskForm.name = ''
    taskForm.description = ''
    taskForm.requiredPeople = 3
    taskForm.priority = 'medium'
    taskForm.assignmentEndTime = null
    for (const dim of wcpaDims) {
      taskForm.requirements[dim.key] = 6
    }
    await loadTasks()
    ElMessage.success('任务发布成功')
  } catch (e) {
    ElMessage.error('发布任务失败: ' + (e.response?.data?.error || e.message))
  }
}

async function deleteTask(taskId) {
  try {
    await axios.delete(`${API}/tasks/${taskId}`)
    if (selectedTask.value?._id === taskId) {
      selectedTask.value = null
      matchingResults.value = []
    }
    await loadTasks()
    ElMessage.success('任务已删除')
  } catch (e) {
    ElMessage.error('删除任务失败: ' + (e.response?.data?.error || e.message))
  }
}

async function assignPerson(personId) {
  if (!selectedTask.value) return
  try {
    await axios.post(`${API}/tasks/${selectedTask.value._id}/assign`, { personId })
    await loadMatchingResults(selectedTask.value._id)
    ElMessage.success('人员选用成功')
  } catch (e) {
    ElMessage.error('选用失败: ' + (e.response?.data?.error || e.message))
  }
}

async function unassignPerson(personId) {
  if (!selectedTask.value) return
  try {
    await axios.delete(`${API}/tasks/${selectedTask.value._id}/assign/${personId}`)
    await loadMatchingResults(selectedTask.value._id)
    ElMessage.success('人员已释放')
  } catch (e) {
    ElMessage.error('释放失败: ' + (e.response?.data?.error || e.message))
  }
}

async function releaseTaskAssignments() {
  if (!selectedTask.value) return
  try {
    const taskId = selectedTask.value._id
    await axios.delete(`${API}/tasks/${taskId}/assignments`)
    await loadMatchingResults(taskId)
    ElMessage.success('已释放所有选用人员')
  } catch (e) {
    ElMessage.error('释放失败: ' + (e.response?.data?.error || e.message))
  }
}

async function autoAssignTask() {
  if (!selectedTask.value) return
  try {
    const res = await axios.post(`${API}/tasks/${selectedTask.value._id}/auto-assign`)
    await loadMatchingResults(selectedTask.value._id)
    ElMessage.success(res.data.message)
  } catch (e) {
    ElMessage.error('自动任用失败: ' + (e.response?.data?.error || e.message))
  }
}

async function releaseExpiredAssignments() {
  try {
    const res = await axios.post(`${API}/tasks/release-expired`)
    await loadTasks()
    if (selectedTask.value) {
      await loadMatchingResults(selectedTask.value._id)
    }
    ElMessage.success(res.data.message)
  } catch (e) {
    ElMessage.error('释放失败: ' + (e.response?.data?.error || e.message))
  }
}

async function updateTaskStatus(taskId, status) {
  try {
    await axios.put(`${API}/tasks/${taskId}`, { status })
    await loadTasks()
    const statusLabel = getStatusLabel(status)
    ElMessage.success(`任务状态已更新为 ${statusLabel}`)
    
    if (status === 'completed') {
      await axios.delete(`${API}/tasks/${taskId}/assignments`)
      if (selectedTask.value?._id === taskId) {
        await loadMatchingResults(taskId)
      }
      ElMessage.success('已释放所有选用人员')
    }
  } catch (e) {
    ElMessage.error('更新状态失败: ' + (e.response?.data?.error || e.message))
  }
}
</script>

<style scoped>
.task-match-container {
  animation: fadeIn .3s ease;
}
@keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

.section-header { margin-bottom: 20px; }
.section-header h2 { margin:0; font-size:22px; color:#1e293b }
.section-header p { margin:4px 0 0; color:#64748b; font-size:14px }

.ops-card { margin-bottom:12px; border-radius:10px }
.task-list-card { border-radius:10px }
.task-detail-card { border-radius:10px; min-height:500px }

.empty-card { display:flex; align-items:center; justify-content:center; min-height:400px }
.empty-state { text-align:center; padding:60px 20px; color:#94a3b8 }
.empty-state.small { padding:20px; }
.empty-icon { font-size:56px; display:block; margin-bottom:12px }
.empty-state.small .empty-icon { font-size:32px; margin-bottom:8px }
.empty-state p { margin:4px 0 }
.empty-hint { font-size:13px; color:#c4b5fd }

.section-title { margin:0 0 12px 0; color:#334155; font-size:15px; font-weight:600 }

.task-info { margin-bottom:16px }
.info-row { display:flex; margin-bottom:8px }
.info-label { width:110px; color:#64748b; font-size:13px; flex-shrink:0 }
.info-value { flex:1; color:#1e293b; font-size:13px }
.info-value.expired { color:#f56c6c }

.task-actions-row { display:flex; gap:8px; margin-bottom:12px }

.requirement-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px }
.requirement-item { padding:8px; background:#f8fafc; border-radius:8px }
.req-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px }
.req-label { font-size:12px; color:#475569; font-weight:500 }
.req-score { font-size:11px; color:#667eea; font-weight:600 }

.assigned-section { margin-bottom:16px }
.assigned-list { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px }
.assigned-item { display:flex; align-items:center; gap:6px; padding:6px 10px; background:#ecfdf5; border-radius:6px }
.assigned-name { font-size:12px; font-weight:500; color:#065f46 }
.assigned-rate { font-size:11px; color:#059669; font-weight:600 }
.assigned-count { font-size:12px; color:#64748b; display:flex; align-items:center; gap:8px }
.assigned-count :deep(.el-progress) { flex:1; max-width:200px }

.match-results { display:flex; flex-direction:column; gap:12px }
.match-item { padding:12px; background:#f8fafc; border-radius:10px; opacity:1 }
.match-item.locked { opacity:0.6 }
.match-header { display:flex; align-items:center; gap:8px; margin-bottom:8px }
.match-rank { width:24px; height:24px; background:#667eea; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700 }
.match-name { font-size:14px; font-weight:600; color:#1e293b }
.match-rate { font-size:14px; font-weight:700; margin-left:auto }

.match-dims { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:8px }
.match-dim { display:flex; align-items:center; gap:4px; padding:4px; background:#fff; border-radius:4px }
.dim-name { font-size:10px; color:#64748b; width:48px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
.dim-bars { flex:1; min-width:0 }
.dim-bar-wrap { position:relative; height:4px; background:#e2e8f0; border-radius:2px; overflow:hidden }
.dim-bar-req { position:absolute; left:0; top:0; height:100%; background:#cbd5e1; border-radius:2px; z-index:1 }
.dim-bar-user { position:absolute; left:0; top:0; height:100%; border-radius:2px; z-index:2; transition:width 0.3s }
.dim-score { font-size:10px; color:#1e293b; font-weight:600; width:36px; text-align:right }

.match-actions { display:flex; align-items:center; justify-content:flex-end; gap:8px }
.match-adaptor { font-size:11px; color:#94a3b8 }

.task-status-actions { display:flex; gap:8px; justify-content:flex-end }

.req-setting-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px }

.text-gray { color:#94a3b8 }
.expire-time { font-size:12px; color:#64748b }
.expire-time.expired { color:#f56c6c; font-weight:500 }

:deep(.clickable-row) { cursor: pointer; }
:deep(.clickable-row:hover) { background-color: #f0f5ff; }
</style>