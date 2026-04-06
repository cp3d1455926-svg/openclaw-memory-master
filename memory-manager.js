/**
 * 记忆管理器 v2 - 三层架构（参考 Claude Code）
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw/workspace/memory');
const TOPICS_DIR = path.join(MEMORY_DIR, 'topics');
const SESSIONS_DIR = path.join(MEMORY_DIR, 'sessions');

/**
 * 主题文件管理器
 */
class TopicFileManager {
  constructor() {
    this.topics = {
      projects: 'projects.md',
      tasks: 'tasks.md',
      people: 'people.md',
      preferences: 'preferences.md',
      decisions: 'decisions.md'
    };
    
    this.ensureDirectories();
    this.initializeTopicFiles();
  }
  
  /**
   * 确保目录存在
   */
  ensureDirectories() {
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
    if (!fs.existsSync(TOPICS_DIR)) {
      fs.mkdirSync(TOPICS_DIR, { recursive: true });
    }
    if (!fs.existsSync(SESSIONS_DIR)) {
      fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    }
  }
  
  /**
   * 初始化主题文件
   */
  initializeTopicFiles() {
    const headers = {
      projects: '# 项目记忆\n\n记录所有项目相关信息\n',
      tasks: '# 待办事项\n\n记录所有待办任务\n',
      people: '# 人物关系\n\n记录人物信息和关系\n',
      preferences: '# 用户偏好\n\n记录用户习惯和偏好\n',
      decisions: '# 重要决策\n\n记录重要决策和原因\n'
    };
    
    for (const [topic, filename] of Object.entries(this.topics)) {
      const filePath = path.join(TOPICS_DIR, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, headers[topic], 'utf8');
      }
    }
  }
  
  /**
   * 追加到主题文件
   */
  async appendToTopic(topic, content) {
    const filename = this.topics[topic];
    if (!filename) {
      throw new Error(`未知主题：${topic}`);
    }
    
    const filePath = path.join(TOPICS_DIR, filename);
    const timestamp = new Date().toISOString();
    const entry = `\n## [${timestamp}]\n\n${content}\n`;
    
    fs.appendFileSync(filePath, entry, 'utf8');
    console.log(`[TopicManager] 已追加到 ${topic}`);
  }
  
  /**
   * 读取主题文件
   */
  async loadTopic(topic, limit = 1000) {
    const filename = this.topics[topic];
    if (!filename) {
      throw new Error(`未知主题：${topic}`);
    }
    
    const filePath = path.join(TOPICS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return '';
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 限制读取行数（参考 Claude Code 的 200 行限制）
    const lines = content.split('\n');
    if (lines.length > limit) {
      content = lines.slice(-limit).join('\n');
    }
    
    return content;
  }
  
  /**
   * 获取所有主题索引
   */
  async getIndex() {
    const index = {};
    
    for (const [topic, filename] of Object.entries(this.topics)) {
      const filePath = path.join(TOPICS_DIR, filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        index[topic] = {
          file: filename,
          size: `${(stats.size / 1024).toFixed(2)} KB`,
          lines: lines.length,
          lastModified: stats.mtime.toISOString()
        };
      }
    }
    
    return index;
  }
  
  /**
   * 保存会话记录
   */
  async saveSession(sessionId, content) {
    const filename = `${sessionId}.md`;
    const filePath = path.join(SESSIONS_DIR, filename);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[TopicManager] 已保存会话：${sessionId}`);
  }
  
  /**
   * 加载会话记录
   */
  async loadSession(sessionId) {
    const filename = `${sessionId}.md`;
    const filePath = path.join(SESSIONS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    return fs.readFileSync(filePath, 'utf8');
  }
  
  /**
   * 列出所有会话
   */
  async listSessions(limit = 10) {
    if (!fs.existsSync(SESSIONS_DIR)) {
      return [];
    }
    
    const files = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, limit);
    
    return files.map(f => {
      const filePath = path.join(SESSIONS_DIR, f);
      const stats = fs.statSync(filePath);
      return {
        id: f.replace('.md', ''),
        file: f,
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      };
    });
  }
}

module.exports = {
  TopicFileManager
};
