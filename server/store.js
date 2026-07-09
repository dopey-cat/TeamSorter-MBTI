import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function read(col) {
  const fp = path.join(DATA_DIR, `${col}.json`);
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

function write(col, data) {
  fs.writeFileSync(path.join(DATA_DIR, `${col}.json`), JSON.stringify(data, null, 2), 'utf-8');
}

let idCounter = Date.now();
function genId() { return String(++idCounter); }

export function findAll(col, filter = {}) {
  let list = read(col);
  for (const [k, v] of Object.entries(filter)) {
    if (v instanceof RegExp) {
      list = list.filter(item => v.test(item[k]));
    } else {
      list = list.filter(item => item[k] === v);
    }
  }
  return list;
}

export function findById(col, id) {
  return read(col).find(item => item._id === id) || null;
}

export function insertOne(col, doc) {
  const list = read(col);
  const item = { _id: genId(), ...doc, createdAt: new Date().toISOString() };
  list.push(item);
  write(col, list);
  return item;
}

export function insertMany(col, docs) {
  const list = read(col);
  const inserted = docs.map(d => ({ _id: genId(), ...d, createdAt: new Date().toISOString() }));
  list.push(...inserted);
  write(col, list);
  return inserted;
}

export function updateById(col, id, update) {
  const list = read(col);
  const idx = list.findIndex(item => item._id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...update, updatedAt: new Date().toISOString() };
  write(col, list);
  return list[idx];
}

export function deleteById(col, id) {
  const list = read(col);
  const idx = list.findIndex(item => item._id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  write(col, list);
  return true;
}

export function deleteMany(col, filter = {}) {
  let list = read(col);
  const before = list.length;
  list = list.filter(item => {
    for (const [k, v] of Object.entries(filter)) {
      if (item[k] === v) return false;
    }
    return true;
  });
  write(col, list);
  return before - list.length;
}

export function aggregate(col, pipeline) {
  let list = read(col);
  for (const stage of pipeline) {
    if (stage.$match) {
      list = list.filter(item => {
        for (const [k, cond] of Object.entries(stage.$match)) {
          if (cond.$ne !== undefined && item[k] === cond.$ne) return false;
          if (cond.$exists !== undefined && cond.$exists && !item[k]) return false;
          if (cond.$regex) {
            const re = new RegExp(cond.$regex, cond.$options || '');
            if (!re.test(item[k])) return false;
          }
        }
        return true;
      });
    }
    if (stage.$group) {
      const groups = {};
      for (const item of list) {
        let key;
        if (stage.$group._id === null) key = '__all__';
        else if (typeof stage.$group._id === 'string') key = item[stage.$group._id];
        else key = item._id;
        if (!groups[key]) groups[key] = { _id: key, count: 0 };
        groups[key].count++;
      }
      list = Object.values(groups);
    }
    if (stage.$sort) {
      const [key, dir] = Object.entries(stage.$sort)[0];
      list.sort((a, b) => dir * (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
    }
    if (stage.$limit) list = list.slice(0, stage.$limit);
  }
  return list;
}

export function dropCol(col) {
  write(col, []);
}
