import express from "express";
import XLSX from "xlsx";
import * as store from "../store.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

const TYPES_COL = 'mbti_types';
const RECORDS_COL = 'mbti_records';
const SURVEY_COL = 'mbti_survey';
const POSITIONS_COL = 'mbti_positions';
const POSITION_DATA_COL = 'position_data';
const TASKS_COL = 'mbti_tasks';
const TASK_ASSIGNMENTS_COL = 'mbti_task_assignments';

router.post("/seed", (req, res) => {
  const types = [
    { type: 'INTJ', title: '建筑师', ei: 'I', sn: 'N', tf: 'T', jp: 'J', keywords: ['独立','理性','战略','分析'], dimensions: { energy: -3, information: 3, decision: 2, lifestyle: 1 }, strengths: ['深邃的洞察力','强大的战略规划能力','坚定的执行力'], advice: '学会关注细节，多与他人沟通想法', description: '富有想象力和战略性的思考者，具有独特的视角和强大的分析能力，能够看到别人看不到的模式和可能性。他们追求完美，对自己和他人都有很高的标准，善于制定长远规划并独立执行。' },
    { type: 'INTP', title: '逻辑学家', ei: 'I', sn: 'N', tf: 'T', jp: 'P', keywords: ['好奇','分析','创新','理论'], dimensions: { energy: -3, information: 3, decision: 2, lifestyle: -1 }, strengths: ['卓越的逻辑分析能力','强大的创新能力','深入的理论研究能力'], advice: '注重实践应用，培养执行力', description: '是具有创新精神的发明家，对知识有着不可抑制的渴望。他们喜欢探索复杂的概念和理论，追求真理和理解。INTP思维敏捷，能够快速识别逻辑错误，在抽象推理和理论构建方面极具天赋。' },
    { type: 'ENTJ', title: '指挥官', ei: 'E', sn: 'N', tf: 'T', jp: 'J', keywords: ['领导','果断','高效','目标'], dimensions: { energy: 3, information: 3, decision: 2, lifestyle: 1 }, strengths: ['出色的领导力','果断的决策能力','高效的组织能力'], advice: '学会倾听他人意见，关注团队情感', description: '是大胆、富有想象力、意志强烈的天生领导者。他们具有强大的决策能力和执行力，善于制定战略计划，并能够有效地组织和激励团队实现目标。ENTJ对效率和成就有着强烈的追求。' },
    { type: 'ENTP', title: '辩论家', ei: 'E', sn: 'N', tf: 'T', jp: 'P', keywords: ['机智','探索','挑战','创意'], dimensions: { energy: 3, information: 3, decision: 2, lifestyle: -1 }, strengths: ['敏捷的思维能力','出色的口才','创新的问题解决方式'], advice: '专注完成已开始的项目，避免半途而废', description: '是聪明好奇的思考者，不会放过任何智力上的挑战。他们思维敏捷，善于辩论和说服他人，喜欢探索新的想法和可能性。ENTP具有很强的适应性和创新能力，能够从多个角度分析问题。' },
    { type: 'INFJ', title: '提倡者', ei: 'I', sn: 'N', tf: 'F', jp: 'J', keywords: ['理想','洞察','使命','同理'], dimensions: { energy: -3, information: 3, decision: -2, lifestyle: 1 }, strengths: ['深刻的同理心','强烈的使命感','卓越的洞察力'], advice: '照顾好自己的需求，避免过度付出', description: '是安静而神秘，同时鼓舞他人的理想主义者。他们具有深刻的洞察力和强烈的同理心，能够理解他人的情感和动机。INFJ追求意义和目的，是MBTI中最稀有的类型，约占总人口的1.5%。' },
    { type: 'INFP', title: '调停者', ei: 'I', sn: 'N', tf: 'F', jp: 'P', keywords: ['理想','诗意','善良','创造'], dimensions: { energy: -3, information: 3, decision: -2, lifestyle: -1 }, strengths: ['丰富的想象力','深厚的同理心','真诚的价值观'], advice: '增强现实适应力，学会保护自己', description: '是诗意的、心地善良的利他主义者，总是热切地想要帮助正义事业。他们具有强烈的价值观和道德感，追求和谐与理解。INFP富有创造力，善于以独特的方式表达情感和想法。' },
    { type: 'ENFJ', title: '主人公', ei: 'E', sn: 'N', tf: 'F', jp: 'J', keywords: ['魅力','鼓舞','关怀','引领'], dimensions: { energy: 3, information: 3, decision: -2, lifestyle: 1 }, strengths: ['卓越的社交能力','强大的感染力','无私的奉献精神'], advice: '注意不要过度承担他人的问题', description: '是魅力非凡的领导者，能够令听众全神贯注。他们具有天生的领导魅力和强大的沟通能力，善于激励和鼓舞他人。ENFJ关心他人的成长和发展，被称为最温暖的领导型人格。' },
    { type: 'ENFP', title: '竞选者', ei: 'E', sn: 'N', tf: 'F', jp: 'P', keywords: ['热情','创意','自由','探索'], dimensions: { energy: 3, information: 3, decision: -2, lifestyle: -1 }, strengths: ['无限的创造力','充沛的热情','优秀的社交能力'], advice: '学会专注，培养持续力', description: '是热情、有创造力的社交家，总能找到微笑的理由。他们充满活力和热情，善于激发他人的潜能。ENFP喜欢探索新的可能性和体验，具有很强的适应性和感染力。' },
    { type: 'ISTJ', title: '物流师', ei: 'I', sn: 'S', tf: 'T', jp: 'J', keywords: ['可靠','务实','责任','秩序'], dimensions: { energy: -3, information: -3, decision: 2, lifestyle: 1 }, strengths: ['极强的责任心','出色的执行力','注重细节'], advice: '适当接受变化，培养灵活性', description: '是实用主义的现实主义者，不但可靠而且有担当。他们注重事实和细节，善于组织和执行计划。ISTJ重视传统和秩序，具有很强的责任感和执行力，是最可靠的人格类型之一。' },
    { type: 'ISFJ', title: '守卫者', ei: 'I', sn: 'S', tf: 'F', jp: 'J', keywords: ['守护','温暖','细致','奉献'], dimensions: { energy: -3, information: -3, decision: -2, lifestyle: 1 }, strengths: ['无微不至的关怀','踏实可靠','注重传统'], advice: '学会表达自己的需求，勇于改变', description: '是非常专注、温暖的守护者，时刻准备着保护所爱的人。他们具有强烈的责任感和同理心，善于照顾他人的需求。ISFJ重视和谐和稳定，是MBTI中最常见的人格类型，约占总人口的13.8%。' },
    { type: 'ESTJ', title: '总经理', ei: 'E', sn: 'S', tf: 'T', jp: 'J', keywords: ['高效','组织','执行','管理'], dimensions: { energy: 3, information: -3, decision: 2, lifestyle: 1 }, strengths: ['强大的组织能力','高效的执行力','务实的管理风格'], advice: '关注他人感受，适当放权', description: '是出色的管理者，在管理事情或管理人方面都非常出色。他们具有很强的组织能力和决策能力，善于制定和执行计划。ESTJ重视效率和秩序，是天生的实干型领导者。' },
    { type: 'ESFJ', title: '执政官', ei: 'E', sn: 'S', tf: 'F', jp: 'J', keywords: ['热情','友善','合作','尽责'], dimensions: { energy: 3, information: -3, decision: -2, lifestyle: 1 }, strengths: ['出色的社交能力','热心助人','强烈的责任感'], advice: '培养独立思考能力，不要过于在意他人评价', description: '是非常关心他人的感受，乐于奉献的协作者。他们具有很强的社交能力和同理心，善于照顾他人的需求。ESFJ重视和谐和合作，具有很强的组织能力，是最受欢迎的社交型人格之一。' },
    { type: 'ISTP', title: '鉴赏家', ei: 'I', sn: 'S', tf: 'T', jp: 'P', keywords: ['冷静','灵活','动手','探索'], dimensions: { energy: -3, information: -3, decision: 2, lifestyle: -1 }, strengths: ['出色的动手能力','冷静的危机处理','灵活应变'], advice: '加强长远规划，注重情感表达', description: '是大胆而实际的实验者，擅长使用各种工具。他们具有很强的实践能力和解决问题的能力，喜欢动手操作和探索。ISTP冷静理性，善于分析问题并在紧急情况下保持冷静，找到最佳解决方案。' },
    { type: 'ISFP', title: '探险家', ei: 'I', sn: 'S', tf: 'F', jp: 'P', keywords: ['艺术','敏感','宁静','自由'], dimensions: { energy: -3, information: -3, decision: -2, lifestyle: -1 }, strengths: ['敏锐的审美','温柔的同理心','随和的性格'], advice: '增强自信心，勇于表达自己', description: '是灵活、有魅力的艺术家，时刻准备着探索新的可能性。他们具有很强的艺术天赋和审美能力，喜欢体验新事物。ISFP重视和谐和美感，用自己独特的方式表达对世界的感受。' },
    { type: 'ESTP', title: '企业家', ei: 'E', sn: 'S', tf: 'T', jp: 'P', keywords: ['行动','活力','冒险','说服'], dimensions: { energy: 3, information: -3, decision: 2, lifestyle: -1 }, strengths: ['强大的行动力','出色的说服力','灵活应变'], advice: '注重长远规划，关注细节', description: '是聪明、精力充沛、非常善于感知的人，真正享受生活。他们具有很强的实践能力和适应能力，喜欢冒险和刺激。ESTP善于观察环境，能够快速做出决策并行动，是天生的实干家。' },
    { type: 'ESFP', title: '表演者', ei: 'E', sn: 'S', tf: 'F', jp: 'P', keywords: ['快乐','活力','社交','表演'], dimensions: { energy: 3, information: -3, decision: -2, lifestyle: -1 }, strengths: ['充沛的活力','出色的表演天赋','感染他人的能力'], advice: '学会规划未来，培养深度思考习惯', description: '是自发的、精力充沛、热情的表演者，生活对他们来说绝不无聊。他们具有很强的社交能力和表演天赋，喜欢成为关注的焦点。ESFP善于激励他人，具有很强的感染力和活力。' }
  ];
  store.dropCol(TYPES_COL);
  for (const t of types) store.insertOne(TYPES_COL, t);
  res.json({ message: "MBTI 16种人格数据初始化成功" });
});

router.get("/types", (req, res) => {
  const { keyword } = req.query;
  let list = store.findAll(TYPES_COL);
  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter(t => t.type.toLowerCase().includes(kw) || t.title.includes(kw) || t.keywords?.some(k => k.includes(kw)));
  }
  list.sort((a, b) => a.type.localeCompare(b.type));
  res.json(list);
});

router.post("/match", (req, res) => {
  const { mbtiType } = req.body;
  if (!mbtiType) {
    return res.status(400).json({ error: "请提供MBTI类型" });
  }
  const cleanType = cleanMbtiType(mbtiType);
  const personality = store.findAll(TYPES_COL).find(t => t.type === cleanType);
  if (!personality) return res.status(404).json({ error: "未找到匹配的 MBTI 类型" });
  res.json({ mbtiType: cleanType, ei: cleanType[0], personality });
});

router.get("/records", (req, res) => {
  const { mbtiType, ei, groupBy, name } = req.query;
  let list = store.findAll(RECORDS_COL);
  if (mbtiType) list = list.filter(r => r.mbtiType === mbtiType);
  if (ei) list = list.filter(r => r.ei === ei);
  if (name) list = list.filter(r => r.name.includes(name));
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (groupBy === 'type') {
    const grouped = {};
    for (const r of list) {
      if (!grouped[r.mbtiType]) grouped[r.mbtiType] = [];
      grouped[r.mbtiType].push(r);
    }
    return res.json(grouped);
  }

  if (groupBy === 'adaptor') {
    const grouped = {};
    for (const r of list) {
      const adaptor = r.adaptor || '未评估';
      if (!grouped[adaptor]) grouped[adaptor] = [];
      grouped[adaptor].push(r);
    }
    return res.json(grouped);
  }

  res.json(list);
});

router.post("/records", (req, res) => {
  const { name, mbtiType, ei, scores, tags, adaptor } = req.body;
  if (!name || !mbtiType || !ei) return res.status(400).json({ error: "姓名、MBTI类型和EI分类为必填项" });
  const defaultScores = { communication: 0, collaboration: 0, problemSolving: 0, projectManagement: 0, learningAdaptability: 0, responsibility: 0, teamwork: 0, challenge: 0 };
  const item = store.insertOne(RECORDS_COL, { name, mbtiType, ei, scores: scores || defaultScores, tags: tags || [], adaptor: adaptor || '' });
  res.json(item);
});

router.put("/records/:id", (req, res) => {
  const { name, mbtiType, ei, scores, tags } = req.body;
  const update = {};
  if (name) update.name = name;
  if (mbtiType) update.mbtiType = mbtiType;
  if (ei) update.ei = ei;
  if (scores) update.scores = scores;
  if (tags) update.tags = tags;
  const updated = store.updateById(RECORDS_COL, req.params.id, update);
  if (!updated) return res.status(404).json({ error: "记录未找到" });
  res.json(updated);
});

router.delete("/records/:id", (req, res) => {
  const ok = store.deleteById(RECORDS_COL, req.params.id);
  if (!ok) return res.status(404).json({ error: "记录未找到" });
  res.json({ message: "删除成功" });
});

router.delete("/records", (req, res) => {
  store.dropCol(RECORDS_COL);
  res.json({ message: "全部数据已清空" });
});

router.post("/records/import", (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0) return res.status(400).json({ error: "请提供有效的记录列表" });
  const defaultScores = { communication: 0, collaboration: 0, problemSolving: 0, projectManagement: 0, learningAdaptability: 0, responsibility: 0, teamwork: 0, challenge: 0 };
  const inserted = store.insertMany(RECORDS_COL, records.map(r => ({
    name: r.name, mbtiType: r.mbtiType, ei: r.ei,
    scores: r.scores || defaultScores,
    tags: r.tags || []
  })));
  res.json({ message: `成功导入 ${inserted.length} 条记录`, count: inserted.length });
});

router.post("/survey/import", (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: "请提供文件路径" });
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (!data.length) return res.status(400).json({ error: "文件为空" });

    const keys = Object.keys(data[0]);
    const getName = (row) => { for (const k of keys) { if (k.includes('姓名')) return String(row[k]).trim() } return '' };
    const getMbti = (row) => { for (const k of keys) { if (k.toLowerCase().includes('mbti')) return String(row[k]).trim().toUpperCase() } return '' };
    const getScore = (row, key) => { const raw = row[key]; if (raw === undefined || raw === '') return 0; const n = Number(String(raw).trim()); return isNaN(n) ? 0 : n };

    const list = data.map(row => {
      const name = getName(row);
      if (!name) return null;
      return {
        source: filePath.includes('mbti1') ? 'mbti1' : 'mbti2',
        submitTime: String(row['提交时间'] || row['提交'] || ''),
        fillId: String(row['填写ID'] || ''),
        duration: String(row['用时(秒)'] || row['用时'] || ''),
        phone: String(row['手机号'] || ''),
        name,
        studentId: String(row['学号'] || ''),
        college: String(row['学院'] || ''),
        major: String(row['专业'] || ''),
        mbtiType: getMbti(row),
        scores: {
          communication: getScore(row, '沟通表达'),
          collaboration: getScore(row, '社交协作'),
          problemSolving: getScore(row, '解决问题'),
          projectManagement: getScore(row, '项目管理'),
          learningAdaptability: getScore(row, '学习适应'),
          responsibility: getScore(row, '承担责任意愿') || getScore(row, '承担责任'),
          teamwork: getScore(row, '团队合作意愿'),
          challenge: getScore(row, '接受挑战意愿')
        },
        preferences: {
          activity: String(row['活动参与偏好'] || ''),
          activityType: String(row['活动类型偏好'] || ''),
          hobby: String(row['业余兴趣'] || '')
        }
      };
    }).filter(Boolean);

    store.deleteMany(SURVEY_COL, { source: list[0]?.source });
    const inserted = store.insertMany(SURVEY_COL, list);
    res.json({ message: `成功导入 ${inserted.length} 条记录`, count: inserted.length, total: list.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/survey", (req, res) => {
  const { source, mbtiType } = req.query;
  let list = store.findAll(SURVEY_COL);
  if (source) list = list.filter(s => s.source === source);
  if (mbtiType) { const escaped = mbtiType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const re = new RegExp(escaped, 'i'); list = list.filter(s => re.test(s.mbtiType)) }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.get("/survey/stats", (req, res) => {
  const all = store.findAll(SURVEY_COL);
  const total = all.length;
  const byType = {};
  const byCollege = {};
  let sumComm = 0, sumCollab = 0, sumProb = 0, sumProj = 0, sumLearn = 0, sumResp = 0;
  let count = 0;
  for (const s of all) {
    if (s.mbtiType) { byType[s.mbtiType] = (byType[s.mbtiType] || 0) + 1 }
    if (s.college) { byCollege[s.college] = (byCollege[s.college] || 0) + 1 }
    const sc = s.scores || {};
    sumComm += sc.communication || 0; sumCollab += sc.collaboration || 0;
    sumProb += sc.problemSolving || 0; sumProj += sc.projectManagement || 0;
    sumLearn += sc.learningAdaptability || 0; sumResp += sc.responsibility || 0;
    count++;
  }
  res.json({
    total,
    byType: Object.entries(byType).map(([k, v]) => ({ _id: k, count: v })).sort((a, b) => b.count - a.count),
    byCollege: Object.entries(byCollege).map(([k, v]) => ({ _id: k, count: v })).sort((a, b) => b.count - a.count),
    avgScores: count ? {
      avgCommunication: (sumComm / count).toFixed(1),
      avgCollaboration: (sumCollab / count).toFixed(1),
      avgProblemSolving: (sumProb / count).toFixed(1),
      avgProjectManagement: (sumProj / count).toFixed(1),
      avgLearningAdaptability: (sumLearn / count).toFixed(1),
      avgResponsibility: (sumResp / count).toFixed(1)
    } : {}
  });
});

function cleanMbtiType(raw) {
  if (!raw) return '';
  return raw
    .replace(/[\u2000-\u200F\u2028-\u202F\u205F\u3000\uFEFF\s]/g, '')
    .replace(/[-_][AT]$/, '')
    .replace(/[?]/g, '')
    .trim().toUpperCase();
}

function computeMbtiAverages() {
  const all = store.findAll(SURVEY_COL);
  const dims = ['communication', 'collaboration', 'problemSolving', 'projectManagement', 'learningAdaptability', 'responsibility', 'teamwork', 'challenge'];
  const sums = {};
  const counts = {};
  for (const s of all) {
    const type = cleanMbtiType(s.mbtiType);
    if (!type || !/^[IE][NS][TF][JP]$/.test(type)) continue;
    if (!sums[type]) { sums[type] = {}; counts[type] = 0 }
    for (const d of dims) {
      sums[type][d] = (sums[type][d] || 0) + (s.scores?.[d] || 0);
    }
    counts[type]++;
  }
  const result = {};
  for (const type of Object.keys(sums)) {
    result[type] = {};
    for (const d of dims) {
      result[type][d] = counts[type] ? +(sums[type][d] / counts[type]).toFixed(2) : 0;
    }
    result[type]._count = counts[type];
  }
  return result;
}

const DIM_LABELS = ['communication', 'collaboration', 'problemSolving', 'projectManagement', 'learningAdaptability', 'responsibility', 'teamwork', 'challenge'];

// E/I 对应的期望能力方向
const TENSION_MAP = {
  E: { communication: 1, collaboration: 1, teamwork: 1 },
  I: { problemSolving: 1, learningAdaptability: 1, projectManagement: 1 },
  N: { learningAdaptability: 1, problemSolving: 1, communication: 1 },
  S: { responsibility: 1, projectManagement: 1, collaboration: 1 },
  T: { problemSolving: 1, projectManagement: 1, responsibility: 1 },
  F: { communication: 1, collaboration: 1, teamwork: 1 },
  J: { projectManagement: 1, responsibility: 1, communication: 1 },
  P: { learningAdaptability: 1, challenge: 1, problemSolving: 1 }
};

function calcTension(mbtiType, scores) {
  const letters = mbtiType.split('');
  let totalScore = 0, totalWeight = 0;
  for (const letter of letters) {
    const map = TENSION_MAP[letter];
    if (!map) continue;
    for (const [dim, weight] of Object.entries(map)) {
      const val = (scores[dim] || 0) / 10;
      totalScore += val * weight;
      totalWeight += weight;
    }
  }
  return totalWeight ? +(totalScore / totalWeight).toFixed(4) : 0.5;
}

router.get("/coeff", (req, res) => {
  res.json(computeMbtiAverages());
});

const ROLES = {
  driver: {
    key: 'driver', label: '紫色驱动者', icon: '🟣',
    condition: 'E人+N人+计划型(J)',
    suitAbbr: 'I高+E高+R高+C高',
    suitTypes: ['ENFJ', 'ENTJ', 'ENFP'],
    description: '全能型领袖，适合0-1开创',
    color: '#8b5cf6'
  },
  breaker: {
    key: 'breaker', label: '蓝色攻坚者', icon: '🔵',
    condition: 'I人+T人+N人',
    suitAbbr: 'E高+R高',
    suitTypes: ['INTJ', 'INTP', 'ENTJ'],
    description: '单兵突破手，适合技术/研发',
    color: '#3b82f6'
  },
  coordinator: {
    key: 'coordinator', label: '绿色协作者', icon: '🟢',
    condition: 'F人+S人+判断型(J)',
    suitAbbr: 'C高+I中',
    suitTypes: ['ESFJ', 'ISFJ', 'ENFJ'],
    description: '团队稳定器，适合运营/支持',
    color: '#10b981'
  },
  dormant: {
    key: 'dormant', label: '橙色待激活者', icon: '🟠',
    condition: 'I人+P人或全面低分',
    suitAbbr: '任一项≤5',
    suitTypes: ['INFP', 'ISFP', 'INTP'],
    description: '需重点培养或调整岗位',
    color: '#f59e0b'
  }
};

function classifyRole(mbtiType, iercScores) {
  const letters = mbtiType.split('');
  const e = letters[0], n = letters[1], t = letters[2], j = letters[3];
  const { I, E, R, C } = iercScores;
  const allHigh = I >= 6 && E >= 6 && R >= 6 && C >= 6;
  const anyLow = I <= 5 || E <= 5 || R <= 5 || C <= 5;

  if (anyLow) return 'dormant';
  if (e === 'E' && n === 'N' && j === 'J' && allHigh) return 'driver';
  if (e === 'I' && t === 'T' && n === 'N' && E >= 6 && R >= 6) return 'breaker';
  if (t === 'F' && n === 'S' && j === 'J' && C >= 6 && I >= 5) return 'coordinator';
  if (allHigh) return 'driver';
  return 'dormant';
}

function calcIercScores(scores) {
  return {
    I: scores.communication || 0,
    E: +(((scores.problemSolving || 0) + (scores.projectManagement || 0) + (scores.challenge || 0)) / 3).toFixed(1),
    R: +(((scores.learningAdaptability || 0) + (scores.responsibility || 0)) / 2).toFixed(1),
    C: +(((scores.collaboration || 0) + (scores.teamwork || 0)) / 2).toFixed(1)
  };
}

function iercCode(scores) {
  const s = calcIercScores(scores);
  return [s.I >= 6 ? 'I' : 'i', s.E >= 6 ? 'E' : 'e', s.R >= 6 ? 'R' : 'r', s.C >= 6 ? 'C' : 'c'].join('');
}

router.post("/evaluate", (req, res) => {
  try {
    const { mbtiType, wcpaScores, thresholds } = req.body;
    if (!mbtiType || !wcpaScores || !thresholds) {
      return res.status(400).json({ error: "请提供MBTI类型、WCPA分数和岗位阈值" });
    }

    const cleanType = cleanMbtiType(mbtiType);
    if (!/^[IE][NS][TF][JP]$/.test(cleanType)) {
      return res.status(400).json({ error: "无效的MBTI类型" });
    }

    // 1. MBTI维度共振系数
    const averages = computeMbtiAverages();
    const typeAvg = averages[cleanType];
    let mbtiResonance = 0;
    if (typeAvg) {
      let sum = 0, count = 0;
      for (const d of DIM_LABELS) {
        sum += (typeAvg[d] || 0) / 10;
        count++;
      }
      mbtiResonance = count ? +(sum / count).toFixed(4) : 0.5;
    } else {
      mbtiResonance = 0.5;
    }

    // 2. WCPA能力达标率
    let totalRate = 0, dimCount = 0;
    const dimDetails = {};
    for (const d of DIM_LABELS) {
      const personVal = wcpaScores[d] || 0;
      const threshold = thresholds[d] || 1;
      const rate = threshold > 0 ? Math.min(personVal / threshold, 1) : 0;
      totalRate += rate;
      dimCount++;
      dimDetails[d] = { score: personVal, threshold, rate: +rate.toFixed(4) };
    }
    const wcpaRate = dimCount ? +(totalRate / dimCount).toFixed(4) : 0;

    // 3. MBTI-WCPA张力系数
    const tension = calcTension(cleanType, wcpaScores);

    // 4. 总分
    const total = +(mbtiResonance * 0.3 + wcpaRate * 0.5 + tension * 0.2).toFixed(4);
    const pct = +(total * 100).toFixed(1);

    let grade, gradeLabel;
    if (pct >= 85) { grade = 'S'; gradeLabel = '天选共振者' }
    else if (pct >= 70) { grade = 'A'; gradeLabel = '高潜适配者' }
    else if (pct >= 55) { grade = 'B'; gradeLabel = '可塑协作者' }
    else if (pct >= 40) { grade = 'C'; gradeLabel = '风险警示者' }
    else { grade = 'D'; gradeLabel = '紧急干预对象' }

    const iercScores = calcIercScores(wcpaScores);
    const roleKey = classifyRole(cleanType, iercScores);
    const role = ROLES[roleKey];

    res.json({
      mbtiType: cleanType,
      totalScore: total,
      totalPercent: pct,
      grade,
      gradeLabel,
      components: {
        mbtiResonance: { value: mbtiResonance, weight: 0.3, contribution: +(mbtiResonance * 0.3).toFixed(4) },
        wcpaRate: { value: wcpaRate, weight: 0.5, contribution: +(wcpaRate * 0.5).toFixed(4) },
        tensionCoefficient: { value: tension, weight: 0.2, contribution: +(tension * 0.2).toFixed(4) }
      },
      dimDetails,
      role: {
        key: role.key,
        label: role.label,
        icon: role.icon,
        condition: role.condition,
        suitAbbr: role.suitAbbr,
        suitTypes: role.suitTypes,
        description: role.description,
        color: role.color
      },
      iercScores,
      iercCode: iercCode(wcpaScores)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/positions", (req, res) => {
  let list = store.findAll(POSITIONS_COL);
  list.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  res.json(list);
});

router.post("/positions/seed", (req, res) => {
  const defaultPositions = [
    {
      name: '项目管理岗', icon: '📋', color: '#8b5cf6',
      req: { communication: 6, collaboration: 6, problemSolving: 7, projectManagement: 9, learningAdaptability: 6, responsibility: 8, teamwork: 6, challenge: 6 },
      description: '负责项目整体规划、进度管控与资源协调'
    },
    {
      name: '技术研发岗', icon: '💻', color: '#3b82f6',
      req: { communication: 5, collaboration: 5, problemSolving: 9, projectManagement: 6, learningAdaptability: 8, responsibility: 7, teamwork: 5, challenge: 7 },
      description: '负责产品技术研发、架构设计与核心代码开发'
    },
    {
      name: '运营支持岗', icon: '📊', color: '#10b981',
      req: { communication: 7, collaboration: 8, problemSolving: 5, projectManagement: 5, learningAdaptability: 6, responsibility: 7, teamwork: 8, challenge: 5 },
      description: '负责日常运营维护、用户支持与流程优化'
    },
    {
      name: '市场拓展岗', icon: '🚀', color: '#f59e0b',
      req: { communication: 8, collaboration: 7, problemSolving: 6, projectManagement: 5, learningAdaptability: 6, responsibility: 5, teamwork: 6, challenge: 8 },
      description: '负责市场开拓、商务合作与品牌推广'
    },
    {
      name: '行政管理岗', icon: '📁', color: '#ec4899',
      req: { communication: 7, collaboration: 6, problemSolving: 5, projectManagement: 7, learningAdaptability: 5, responsibility: 8, teamwork: 6, challenge: 4 },
      description: '负责行政事务、制度管理与后勤保障'
    },
    {
      name: '设计创意岗', icon: '🎨', color: '#14b8a6',
      req: { communication: 6, collaboration: 6, problemSolving: 7, projectManagement: 4, learningAdaptability: 7, responsibility: 5, teamwork: 6, challenge: 8 },
      description: '负责视觉设计、UI/UX与创意策划'
    },
    {
      name: '数据分析岗', icon: '📈', color: '#6366f1',
      req: { communication: 5, collaboration: 5, problemSolving: 8, projectManagement: 5, learningAdaptability: 7, responsibility: 6, teamwork: 5, challenge: 6 },
      description: '负责数据采集、分析建模与决策支持'
    },
    {
      name: '客户服务岗', icon: '💬', color: '#f43f5e',
      req: { communication: 9, collaboration: 7, problemSolving: 6, projectManagement: 4, learningAdaptability: 6, responsibility: 7, teamwork: 7, challenge: 5 },
      description: '负责客户咨询、投诉处理与满意度管理'
    },
  ];
  store.dropCol(POSITIONS_COL);
  for (const p of defaultPositions) store.insertOne(POSITIONS_COL, p);
  res.json({ message: `成功初始化 ${defaultPositions.length} 个岗位`, count: defaultPositions.length });
});

router.get("/position-data", (req, res) => {
  let list = store.findAll(POSITION_DATA_COL);
  list.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  res.json(list);
});

router.get("/position-data/:id", (req, res) => {
  const pos = store.findById(POSITION_DATA_COL, req.params.id);
  if (!pos) return res.status(404).json({ error: "岗位未找到" });
  res.json(pos);
});

router.post("/position-data", (req, res) => {
  const { name, icon, color, requirements, description } = req.body;
  if (!name || !requirements) return res.status(400).json({ error: "岗位名称和能力要求为必填项" });
  const item = store.insertOne(POSITION_DATA_COL, { name, icon, color, requirements, description });
  res.json(item);
});

router.put("/position-data/:id", (req, res) => {
  const { name, icon, color, requirements, description } = req.body;
  const update = {};
  if (name) update.name = name;
  if (icon) update.icon = icon;
  if (color) update.color = color;
  if (requirements) update.requirements = requirements;
  if (description) update.description = description;
  const updated = store.updateById(POSITION_DATA_COL, req.params.id, update);
  if (!updated) return res.status(404).json({ error: "岗位未找到" });
  res.json(updated);
});

router.delete("/position-data/:id", (req, res) => {
  const ok = store.deleteById(POSITION_DATA_COL, req.params.id);
  if (!ok) return res.status(404).json({ error: "岗位未找到" });
  res.json({ message: "删除成功" });
});

router.get("/test/questions", (req, res) => {
  const filePath = path.join(__dirname, '../data/mbti_test.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/test/result", (req, res) => {
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "请提供有效的答案数组" });
  }

  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  
  const filePath = path.join(__dirname, '../data/mbti_test.json');
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const answer = answers[i];
    if (answer === undefined || answer === null) continue;
    
    const option = q.options.find(o => o.label === answer);
    if (!option) continue;
    
    if (option.score === 1) {
      scores[q.type] += 1;
    } else {
      const oppositeMap = { E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J' };
      scores[oppositeMap[q.type]] += 1;
    }
  }

  const mbtiType = (scores.E > scores.I ? 'E' : 'I') +
                   (scores.S > scores.N ? 'S' : 'N') +
                   (scores.T > scores.F ? 'T' : 'F') +
                   (scores.J > scores.P ? 'J' : 'P');

  const types = store.findAll(TYPES_COL);
  const personality = types.find(t => t.type === mbtiType);

  res.json({
    mbtiType,
    scores,
    personality: personality || null
  });
});

router.post("/position-data/seed", (req, res) => {
  const defaultPositions = [
    {
      name: '项目管理岗', icon: '📋', color: '#8b5cf6',
      requirements: { communication: 6, collaboration: 6, problemSolving: 7, projectManagement: 9, learningAdaptability: 6, responsibility: 8, teamwork: 6, challenge: 6 },
      description: '负责项目整体规划、进度管控与资源协调'
    },
    {
      name: '技术研发岗', icon: '💻', color: '#3b82f6',
      requirements: { communication: 5, collaboration: 5, problemSolving: 9, projectManagement: 6, learningAdaptability: 8, responsibility: 7, teamwork: 5, challenge: 7 },
      description: '负责产品技术研发、架构设计与核心代码开发'
    },
    {
      name: '运营支持岗', icon: '📊', color: '#10b981',
      requirements: { communication: 7, collaboration: 8, problemSolving: 5, projectManagement: 5, learningAdaptability: 6, responsibility: 7, teamwork: 8, challenge: 5 },
      description: '负责日常运营维护、用户支持与流程优化'
    },
    {
      name: '市场拓展岗', icon: '🚀', color: '#f59e0b',
      requirements: { communication: 8, collaboration: 7, problemSolving: 6, projectManagement: 5, learningAdaptability: 6, responsibility: 5, teamwork: 6, challenge: 8 },
      description: '负责市场开拓、商务合作与品牌推广'
    },
    {
      name: '行政管理岗', icon: '📁', color: '#ec4899',
      requirements: { communication: 7, collaboration: 6, problemSolving: 5, projectManagement: 7, learningAdaptability: 5, responsibility: 8, teamwork: 6, challenge: 4 },
      description: '负责行政事务、制度管理与后勤保障'
    },
    {
      name: '设计创意岗', icon: '🎨', color: '#14b8a6',
      requirements: { communication: 6, collaboration: 6, problemSolving: 7, projectManagement: 4, learningAdaptability: 7, responsibility: 5, teamwork: 6, challenge: 8 },
      description: '负责视觉设计、UI/UX与创意策划'
    },
    {
      name: '数据分析岗', icon: '📈', color: '#6366f1',
      requirements: { communication: 5, collaboration: 5, problemSolving: 8, projectManagement: 5, learningAdaptability: 7, responsibility: 6, teamwork: 5, challenge: 6 },
      description: '负责数据采集、分析建模与决策支持'
    },
    {
      name: '客户服务岗', icon: '💬', color: '#f43f5e',
      requirements: { communication: 9, collaboration: 7, problemSolving: 6, projectManagement: 4, learningAdaptability: 6, responsibility: 7, teamwork: 7, challenge: 5 },
      description: '负责客户咨询、投诉处理与满意度管理'
    },
  ];
  store.dropCol(POSITION_DATA_COL);
  for (const p of defaultPositions) store.insertOne(POSITION_DATA_COL, p);
  res.json({ message: `成功初始化 ${defaultPositions.length} 个岗位数据`, count: defaultPositions.length });
});

router.get("/wcpa/questions", (req, res) => {
  const filePath = path.join(__dirname, '../data/wcpa_test.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/wcpa/result", (req, res) => {
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "请提供有效的答案数组" });
  }

  const filePath = path.join(__dirname, '../data/wcpa_test.json');
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const dimensionScores = {
    communication: 0,
    collaboration: 0,
    problemSolving: 0,
    projectManagement: 0,
    learningAdaptability: 0,
    responsibility: 0,
    teamwork: 0,
    challenge: 0
  };

  const dimensionCounts = {
    communication: 0,
    collaboration: 0,
    problemSolving: 0,
    projectManagement: 0,
    learningAdaptability: 0,
    responsibility: 0,
    teamwork: 0,
    challenge: 0
  };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const answer = answers[i];
    if (answer === undefined || answer === null || answer < 1 || answer > 10) continue;

    if (dimensionScores[q.dimension] !== undefined) {
      dimensionScores[q.dimension] += answer;
      dimensionCounts[q.dimension]++;
    }
  }

  for (const dim of Object.keys(dimensionScores)) {
    if (dimensionCounts[dim] > 0) {
      dimensionScores[dim] = +(dimensionScores[dim] / dimensionCounts[dim]).toFixed(1);
    } else {
      dimensionScores[dim] = 0;
    }
  }

  const totalScore = +(Object.values(dimensionScores).reduce((a, b) => a + b, 0) / 8).toFixed(1);

  let overallLevel, overallLabel;
  if (totalScore >= 8.5) { overallLevel = 'S'; overallLabel = '卓越'; }
  else if (totalScore >= 7.0) { overallLevel = 'A'; overallLabel = '优秀'; }
  else if (totalScore >= 5.5) { overallLevel = 'B'; overallLabel = '良好'; }
  else if (totalScore >= 4.0) { overallLevel = 'C'; overallLabel = '一般'; }
  else { overallLevel = 'D'; overallLabel = '需提升'; }

  const dimensionLabels = {
    communication: '沟通表达',
    collaboration: '社交协助',
    problemSolving: '解决问题',
    projectManagement: '项目管理',
    learningAdaptability: '学习适应',
    responsibility: '承担责任',
    teamwork: '团队贡献',
    challenge: '接受挑战'
  };

  const resultDetails = Object.entries(dimensionScores).map(([key, value]) => ({
    dimension: key,
    label: dimensionLabels[key],
    score: value,
    level: value >= 8.5 ? 'S' : value >= 7.0 ? 'A' : value >= 5.5 ? 'B' : value >= 4.0 ? 'C' : 'D'
  }));

  res.json({
    scores: dimensionScores,
    totalScore,
    overallLevel,
    overallLabel,
    details: resultDetails
  });
});

router.get("/tasks", (req, res) => {
  const { name, priority, status } = req.query;
  let list = store.findAll(TASKS_COL);
  if (name) list = list.filter(r => r.name.includes(name));
  if (priority) list = list.filter(r => r.priority === priority);
  if (status) list = list.filter(r => r.status === status);
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.get("/tasks/:id", (req, res) => {
  const task = store.findById(TASKS_COL, req.params.id);
  if (!task) return res.status(404).json({ error: "任务未找到" });
  res.json(task);
});

router.post("/tasks", (req, res) => {
  const { name, description, requiredPeople, priority, requirements, assignmentEndTime } = req.body;
  if (!name || !requirements) {
    return res.status(400).json({ error: "任务名称和能力需求为必填项" });
  }
  const item = store.insertOne(TASKS_COL, {
    name,
    description: description || '',
    requiredPeople: requiredPeople || 3,
    priority: priority || 'medium',
    status: 'pending',
    requirements,
    assignmentEndTime: assignmentEndTime || null
  });
  res.json(item);
});

router.put("/tasks/:id", (req, res) => {
  const task = store.findById(TASKS_COL, req.params.id);
  if (!task) return res.status(404).json({ error: "任务未找到" });

  const { name, description, requiredPeople, priority, status, requirements, assignmentEndTime } = req.body;
  const update = {};

  if (status && status === 'in-progress') {
    const currentAssignments = store.findAll(TASK_ASSIGNMENTS_COL, { taskId: req.params.id });
    if (currentAssignments.length < task.requiredPeople) {
      return res.status(400).json({ error: `无法开始执行：需选用 ${task.requiredPeople} 人，当前已选 ${currentAssignments.length} 人` });
    }
  }

  if (name) update.name = name;
  if (description !== undefined) update.description = description;
  if (requiredPeople !== undefined) update.requiredPeople = requiredPeople;
  if (priority) update.priority = priority;
  if (status) update.status = status;
  if (requirements) update.requirements = requirements;
  if (assignmentEndTime !== undefined) update.assignmentEndTime = assignmentEndTime;
  const updated = store.updateById(TASKS_COL, req.params.id, update);
  if (!updated) return res.status(404).json({ error: "任务未找到" });
  res.json(updated);
});

router.delete("/tasks/:id", (req, res) => {
  const ok = store.deleteById(TASKS_COL, req.params.id);
  if (!ok) return res.status(404).json({ error: "任务未找到" });
  store.deleteMany(TASK_ASSIGNMENTS_COL, { taskId: req.params.id });
  res.json({ message: "删除成功" });
});

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

router.get("/tasks/:id/match", (req, res) => {
  const task = store.findById(TASKS_COL, req.params.id);
  if (!task) return res.status(404).json({ error: "任务未找到" });

  const records = store.findAll(RECORDS_COL);
  const allTasks = store.findAll(TASKS_COL);
  const allAssignments = store.findAll(TASK_ASSIGNMENTS_COL);

  const currentTaskPriority = PRIORITY_ORDER[task.priority] || 2;

  const lockedPersonIds = new Set();
  for (const otherTask of allTasks) {
    if (otherTask._id === task._id) continue;
    const otherPriority = PRIORITY_ORDER[otherTask.priority] || 2;
    if (otherPriority > currentTaskPriority) {
      const otherAssignments = allAssignments.filter(a => a.taskId === otherTask._id);
      for (const a of otherAssignments) {
        lockedPersonIds.add(a.personId);
      }
    }
  }

  const taskAssignments = allAssignments.filter(a => a.taskId === task._id);
  const assignedPersonIds = new Set(taskAssignments.map(a => a.personId));

  const DIMENSIONS = ['communication', 'collaboration', 'problemSolving', 'projectManagement', 'learningAdaptability', 'responsibility', 'teamwork', 'challenge', 'adaptability'];

  const ADAPTOR_SCORES = {
    '天选共振者': 9,
    '高潜适配者': 7,
    '可塑协作者': 5.5,
    '风险警示者': 4,
    '紧急干预对象': 2
  };

  const results = records.map(person => {
    let totalRate = 0;
    let count = 0;
    for (const dim of DIMENSIONS) {
      let personScore = 0;
      if (dim === 'adaptability') {
        personScore = ADAPTOR_SCORES[person.adaptor] || 5;
      } else {
        personScore = person.scores?.[dim] || 0;
      }
      const reqScore = task.requirements?.[dim] || 6;
      if (reqScore > 0) {
        totalRate += Math.min((personScore / reqScore) * 100, 100);
        count++;
      }
    }
    const matchRate = count ? Math.round(totalRate / count) : 0;
    const isLocked = lockedPersonIds.has(person._id);
    return {
      person,
      matchRate,
      assigned: assignedPersonIds.has(person._id),
      locked: isLocked
    };
  }).sort((a, b) => {
    if (a.locked && !b.locked) return 1;
    if (!a.locked && b.locked) return -1;
    return b.matchRate - a.matchRate;
  });

  res.json(results);
});

router.post("/tasks/:id/assign", (req, res) => {
  const { personId } = req.body;
  if (!personId) return res.status(400).json({ error: "请提供人员ID" });

  const task = store.findById(TASKS_COL, req.params.id);
  if (!task) return res.status(404).json({ error: "任务未找到" });

  const person = store.findById(RECORDS_COL, personId);
  if (!person) return res.status(404).json({ error: "人员未找到" });

  const existing = store.findAll(TASK_ASSIGNMENTS_COL, { taskId: req.params.id, personId });
  if (existing.length > 0) {
    return res.status(400).json({ error: "该人员已分配到该任务" });
  }

  const currentAssignments = store.findAll(TASK_ASSIGNMENTS_COL, { taskId: req.params.id });
  if (currentAssignments.length >= task.requiredPeople) {
    return res.status(400).json({ error: `已达到任务所需人数上限（${task.requiredPeople}人）` });
  }

  const allTasks = store.findAll(TASKS_COL);
  const allAssignments = store.findAll(TASK_ASSIGNMENTS_COL);
  const currentTaskPriority = PRIORITY_ORDER[task.priority] || 2;

  for (const otherTask of allTasks) {
    if (otherTask._id === task._id) continue;
    const otherPriority = PRIORITY_ORDER[otherTask.priority] || 2;
    if (otherPriority > currentTaskPriority) {
      const otherAssignments = allAssignments.filter(a => a.taskId === otherTask._id && a.personId === personId);
      if (otherAssignments.length > 0) {
        return res.status(400).json({ error: `该人员已被更高优先级任务"${otherTask.name}"占用` });
      }
    }
  }

  store.insertOne(TASK_ASSIGNMENTS_COL, {
    taskId: req.params.id,
    personId,
    taskName: task.name,
    personName: person.name,
    mbtiType: person.mbtiType,
    assignedAt: new Date().toISOString()
  });

  res.json({ message: "分配成功" });
});

router.post("/tasks/:id/auto-assign", (req, res) => {
  const task = store.findById(TASKS_COL, req.params.id);
  if (!task) return res.status(404).json({ error: "任务未找到" });

  const records = store.findAll(RECORDS_COL);
  const allTasks = store.findAll(TASKS_COL);
  const allAssignments = store.findAll(TASK_ASSIGNMENTS_COL);

  const currentTaskPriority = PRIORITY_ORDER[task.priority] || 2;

  const lockedPersonIds = new Set();
  for (const otherTask of allTasks) {
    if (otherTask._id === task._id) continue;
    const otherPriority = PRIORITY_ORDER[otherTask.priority] || 2;
    if (otherPriority > currentTaskPriority) {
      const otherAssignments = allAssignments.filter(a => a.taskId === otherTask._id);
      for (const a of otherAssignments) {
        lockedPersonIds.add(a.personId);
      }
    }
  }

  const taskAssignments = allAssignments.filter(a => a.taskId === task._id);
  const alreadyAssignedIds = new Set(taskAssignments.map(a => a.personId));

  const DIMENSIONS = ['communication', 'collaboration', 'problemSolving', 'projectManagement', 'learningAdaptability', 'responsibility', 'teamwork', 'challenge'];

  const availablePersons = records.filter(p => !lockedPersonIds.has(p._id) && !alreadyAssignedIds.has(p._id));

  const rankedPersons = availablePersons.map(person => {
    let totalRate = 0;
    let count = 0;
    for (const dim of DIMENSIONS) {
      const personScore = person.scores?.[dim] || 0;
      const reqScore = task.requirements?.[dim] || 6;
      if (reqScore > 0) {
        totalRate += Math.min((personScore / reqScore) * 100, 100);
        count++;
      }
    }
    const matchRate = count ? Math.round(totalRate / count) : 0;
    return { person, matchRate };
  }).sort((a, b) => b.matchRate - a.matchRate);

  const remainingSlots = task.requiredPeople - taskAssignments.length;
  const numToAssign = Math.min(remainingSlots, rankedPersons.length);
  const assigned = [];

  for (let i = 0; i < numToAssign; i++) {
    const { person, matchRate } = rankedPersons[i];
    store.insertOne(TASK_ASSIGNMENTS_COL, {
      taskId: req.params.id,
      personId: person._id,
      taskName: task.name,
      personName: person.name,
      mbtiType: person.mbtiType,
      matchRate,
      assignedAt: new Date().toISOString()
    });
    assigned.push({ name: person.name, mbtiType: person.mbtiType, matchRate });
  }

  res.json({
    message: `成功自动分配 ${assigned.length} 人`,
    assigned,
    totalNeeded: task.requiredPeople,
    assignedCount: assigned.length,
    remaining: task.requiredPeople - assigned.length
  });
});

router.post("/tasks/release-expired", (req, res) => {
  const now = new Date().toISOString();
  const allTasks = store.findAll(TASKS_COL);
  const allAssignments = store.findAll(TASK_ASSIGNMENTS_COL);

  let releasedCount = 0;
  const releasedDetails = [];

  for (const task of allTasks) {
    if (!task.assignmentEndTime) continue;
    if (task.assignmentEndTime <= now) {
      const taskAssignments = allAssignments.filter(a => a.taskId === task._id);
      for (const assignment of taskAssignments) {
        store.deleteById(TASK_ASSIGNMENTS_COL, assignment._id);
        releasedCount++;
        releasedDetails.push({
          taskName: task.name,
          personName: assignment.personName,
          endTime: task.assignmentEndTime
        });
      }
    }
  }

  res.json({
    message: `成功释放 ${releasedCount} 个人员分配`,
    releasedCount,
    releasedDetails
  });
});

router.delete("/tasks/:taskId/assign/:personId", (req, res) => {
  const { taskId, personId } = req.params;
  const allAssignments = store.findAll(TASK_ASSIGNMENTS_COL);
  const assignment = allAssignments.find(a => a.taskId === taskId && a.personId === personId);
  if (!assignment) {
    return res.status(404).json({ error: "分配记录未找到" });
  }
  store.deleteById(TASK_ASSIGNMENTS_COL, assignment._id);
  res.json({ message: "人员已释放" });
});

router.delete("/tasks/:id/assignments", (req, res) => {
  const taskId = req.params.id;
  const allAssignments = store.findAll(TASK_ASSIGNMENTS_COL);
  const taskAssignments = allAssignments.filter(a => a.taskId === taskId);
  for (const a of taskAssignments) {
    store.deleteById(TASK_ASSIGNMENTS_COL, a._id);
  }
  res.json({ message: `成功释放 ${taskAssignments.length} 个人员分配`, releasedCount: taskAssignments.length });
});

export default router;
