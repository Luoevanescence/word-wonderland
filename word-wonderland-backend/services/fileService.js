const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class FileService {
  constructor(filename) {
    this.filename = filename;
    this.filePath = path.join(config.dataDirectory, `${filename}.json`);
    this.ensureDataDirectory();
    this.ensureFile();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(config.dataDirectory)) {
      fs.mkdirSync(config.dataDirectory, { recursive: true });
    }
  }

  ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf8');
    }
  }

  readData() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.filename}:`, error);
      return [];
    }
  }

  writeData(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing ${this.filename}:`, error);
      return false;
    }
  }

  // 创建
  create(item) {
    const data = this.readData();
    const newItem = {
      id: uuidv4(),
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newItem);
    this.writeData(data);
    return newItem;
  }

  // 读取所有
  findAll() {
    return this.readData();
  }

  // 根据 ID 读取
  findById(id) {
    const data = this.readData();
    return data.find(item => item.id === id);
  }

  // 更新
  update(id, updates) {
    const data = this.readData();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }

    data[index] = {
      ...data[index],
      ...updates,
      id: data[index].id, // 保留原始 ID
      createdAt: data[index].createdAt, // 保留创建时间
      updatedAt: new Date().toISOString()
    };

    this.writeData(data);
    return data[index];
  }

  // 删除
  delete(id) {
    const data = this.readData();
    const filteredData = data.filter(item => item.id !== id);
    
    if (data.length === filteredData.length) {
      return false; // 没有项目被删除
    }

    this.writeData(filteredData);
    return true;
  }

  // 获取随机项目
  getRandom(count = 10) {
    const data = this.readData();
    const total = data.length;

    if (total === 0) {
      return [];
    }

    if (total <= count) {
      return data;
    }

    // Fisher-Yates 洗牌算法
    const shuffled = [...data];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }
}

module.exports = FileService;

