/**
 * 程序记忆模块
 * 存储和管理"如何做某事"的知识
 * 
 * 参考：web-access skill 的站点经验积累
 */

const fs = require('fs');
const path = require('path');

// 支持两种模式：
// 1. Skill 内模式（开发/测试）- 使用 skill 目录内的 memory/hooks
// 2. Workspace 模式（生产）- 使用 workspace/memory/hooks
const SKILL_DIR = __dirname;
const WORKSPACE_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.openclaw/workspace'
);

// 优先使用 workspace 模式，如果不存在则使用 skill 内模式
const HOOKS_DIR = fs.existsSync(path.join(WORKSPACE_DIR, 'memory/hooks'))
  ? path.join(WORKSPACE_DIR, 'memory/hooks')
  : path.join(SKILL_DIR, 'memory/hooks');

class ProceduralMemory {
  constructor() {
    this.ensureHooksDir();
  }
  
  /**
   * 确保 hooks 目录存在
   */
  ensureHooksDir() {
    if (!fs.existsSync(HOOKS_DIR)) {
      fs.mkdirSync(HOOKS_DIR, { recursive: true });
    }
  }
  
  /**
   * 保存经验
   * @param {string} platform - 平台名称（如 github, xiaohongshu）
   * @param {string} experience - 经验内容（Markdown 格式）
   */
  async saveExperience(platform, experience) {
    const filePath = path.join(HOOKS_DIR, `${platform}-experience.md`);
    
    // 如果文件存在，追加到末尾
    if (fs.existsSync(filePath)) {
      const existing = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(filePath, existing + '\n\n' + experience, 'utf8');
    } else {
      fs.writeFileSync(filePath, experience, 'utf8');
    }
    
    console.log(`[ProceduralMemory] 已保存 ${platform} 经验`);
    return filePath;
  }
  
  /**
   * 读取经验
   * @param {string} platform - 平台名称
   * @returns {Promise<string|null>} 经验内容，不存在返回 null
   */
  async getExperience(platform) {
    const filePath = path.join(HOOKS_DIR, `${platform}-experience.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    return fs.readFileSync(filePath, 'utf8');
  }
  
  /**
   * 搜索相关经验
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<Array>} 搜索结果列表
   */
  async searchExperience(keyword) {
    const files = fs.readdirSync(HOOKS_DIR);
    const results = [];
    
    for (const file of files) {
      if (!file.endsWith('-experience.md')) continue;
      
      const filePath = path.join(HOOKS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        // 提取包含关键词的上下文
        const lines = content.split('\n');
        const context = [];
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(keyword.toLowerCase())) {
            // 提取前后各 2 行
            const start = Math.max(0, i - 2);
            const end = Math.min(lines.length, i + 3);
            context.push(lines.slice(start, end).join('\n'));
          }
        }
        
        results.push({
          platform: file.replace('-experience.md', ''),
          file: file,
          context: context.slice(0, 3), // 最多 3 个上下文
          snippet: content.substring(0, 200) + '...'
        });
      }
    }
    
    return results;
  }
  
  /**
   * 列出所有经验
   * @returns {Promise<Array>} 经验列表
   */
  async listExperiences() {
    const files = fs.readdirSync(HOOKS_DIR);
    
    return files
      .filter(f => f.endsWith('-experience.md'))
      .map(f => {
        const filePath = path.join(HOOKS_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          platform: f.replace('-experience.md', ''),
          file: f,
          size: stats.size,
          lastModified: stats.mtime.toISOString()
        };
      });
  }
  
  /**
   * 更新经验（覆盖）
   * @param {string} platform - 平台名称
   * @param {string} content - 新内容
   */
  async updateExperience(platform, content) {
    const filePath = path.join(HOOKS_DIR, `${platform}-experience.md`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[ProceduralMemory] 已更新 ${platform} 经验`);
    return filePath;
  }
  
  /**
   * 删除经验
   * @param {string} platform - 平台名称
   */
  async deleteExperience(platform) {
    const filePath = path.join(HOOKS_DIR, `${platform}-experience.md`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[ProceduralMemory] 已删除 ${platform} 经验`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 检查经验是否存在
   * @param {string} platform - 平台名称
   * @returns {Promise<boolean>}
   */
  async hasExperience(platform) {
    const filePath = path.join(HOOKS_DIR, `${platform}-experience.md`);
    return fs.existsSync(filePath);
  }
  
  /**
   * 获取经验统计
   * @returns {Promise<Object>} 统计信息
   */
  async getStats() {
    const experiences = await this.listExperiences();
    
    return {
      total: experiences.length,
      platforms: experiences.map(e => e.platform),
      totalSize: experiences.reduce((sum, e) => sum + e.size, 0),
      lastUpdated: experiences.length > 0 
        ? experiences.sort((a, b) => 
            new Date(b.lastModified) - new Date(a.lastModified)
          )[0].lastModified 
        : null
    };
  }
}

module.exports = {
  ProceduralMemory
};

// 如果直接运行，执行示例
if (require.main === module) {
  const pm = new ProceduralMemory();
  
  console.log('程序记忆模块测试\n');
  console.log('='.repeat(50));
  
  // 列出所有经验
  pm.listExperiences().then(experiences => {
    console.log('\n已保存的经验:');
    if (experiences.length === 0) {
      console.log('  (暂无)');
    } else {
      experiences.forEach(e => {
        console.log(`  - ${e.platform}: ${(e.size / 1024).toFixed(2)} KB`);
      });
    }
    
    // 获取统计
    pm.getStats().then(stats => {
      console.log('\n统计信息:');
      console.log(`  总数：${stats.total}`);
      console.log(`  总大小：${(stats.totalSize / 1024).toFixed(2)} KB`);
      console.log(`  最后更新：${stats.lastUpdated || '无'}`);
    });
  });
}
