"use strict";
/**
 * L2 Cold Store - 冷记忆存储
 *
 * 存储历史记忆，磁盘存储，懒加载，容量无限制
 *
 * @author 小鬼 👻 + Jake
 * @version 4.2.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.L2ColdStore = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * L2 冷存储 - 按月归档的长期存储
 */
class L2ColdStore {
    constructor(config = {}) {
        this.config = {
            basePath: config.basePath ?? 'memory/l2-cold',
            compressAll: config.compressAll ?? true,
            archiveAfterDays: config.archiveAfterDays ?? 30,
        };
        this.index = new Map();
        this.monthArchives = new Map();
        this.queryCache = new Map();
        // 初始化
        this.init();
    }
    /**
     * 初始化存储
     */
    async init() {
        try {
            // 确保基础目录存在
            if (!fs.existsSync(this.config.basePath)) {
                fs.mkdirSync(this.config.basePath, { recursive: true });
            }
            // 加载索引
            const indexPath = path.join(this.config.basePath, 'index.json');
            if (fs.existsSync(indexPath)) {
                const data = fs.readFileSync(indexPath, 'utf-8');
                const parsed = JSON.parse(data);
                if (parsed.index) {
                    this.index = new Map(Object.entries(parsed.index));
                }
                if (parsed.monthArchives) {
                    this.monthArchives = new Map(parsed.monthArchives.map((a) => [a.month, a]));
                }
                console.log(`[L2ColdStore] 恢复了 ${this.index.size} 条冷记忆，${this.monthArchives.size} 个月`);
            }
            // 加载已归档的索引
            await this.loadArchives();
        }
        catch (error) {
            console.warn('[L2ColdStore] 初始化失败:', error);
        }
    }
    /**
     * 加载归档索引
     */
    async loadArchives() {
        const archiveDir = path.join(this.config.basePath, 'archives');
        if (!fs.existsSync(archiveDir)) {
            return;
        }
        const files = fs.readdirSync(archiveDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const filePath = path.join(archiveDir, file);
                    const data = fs.readFileSync(filePath, 'utf-8');
                    const archive = JSON.parse(data);
                    // 更新索引
                    for (const id of archive.memoryIds) {
                        this.index.set(id, {
                            month: archive.month,
                            path: filePath,
                        });
                    }
                }
                catch (error) {
                    console.warn(`[L2ColdStore] 加载归档 ${file} 失败:`, error);
                }
            }
        }
    }
    /**
     * 写入记忆
     */
    async write(memory) {
        const monthStr = this.toMonthString(new Date(memory.timestamp));
        const monthPath = path.join(this.config.basePath, 'months', monthStr);
        // 确保目录存在
        if (!fs.existsSync(monthPath)) {
            fs.mkdirSync(monthPath, { recursive: true });
        }
        // 压缩（如果需要）
        if (this.config.compressAll && !memory.compressed) {
            // TODO: 集成 AAAK 压缩
            // memory = await this.compress(memory);
            memory.compressed = true;
        }
        // 写入文件
        const filePath = path.join(monthPath, `${memory.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(memory, null, 2), 'utf-8');
        // 更新索引
        this.index.set(memory.id, {
            month: monthStr,
            path: filePath,
        });
        // 更新月归档
        let archive = this.monthArchives.get(monthStr);
        if (!archive) {
            archive = {
                month: monthStr,
                memoryIds: [],
                totalSize: 0,
                archived: false,
            };
            this.monthArchives.set(monthStr, archive);
        }
        if (!archive.memoryIds.includes(memory.id)) {
            archive.memoryIds.push(memory.id);
            const contentSize = Buffer.byteLength(memory.content, 'utf-8');
            archive.totalSize += contentSize;
        }
        // 持久化索引
        await this.persistIndex();
        console.log(`[L2ColdStore] 写入记忆 ${memory.id} (${monthStr})`);
    }
    /**
     * 批量写入
     */
    async batchWrite(memories) {
        for (const memory of memories) {
            await this.write(memory);
        }
    }
    /**
     * 读取记忆
     */
    async read(id) {
        const location = this.index.get(id);
        if (!location) {
            return null;
        }
        try {
            // 检查是否是归档文件
            if (location.path.endsWith('.json') && fs.existsSync(location.path)) {
                const data = fs.readFileSync(location.path, 'utf-8');
                // 如果是归档文件，需要找到对应的记忆
                if (location.path.includes('archives')) {
                    const archive = JSON.parse(data);
                    const memory = archive.memories?.find((m) => m.id === id);
                    return memory || null;
                }
                else {
                    return JSON.parse(data);
                }
            }
            return null;
        }
        catch (error) {
            console.error(`[L2ColdStore] 读取记忆 ${id} 失败:`, error);
            return null;
        }
    }
    /**
     * 批量读取
     */
    async batchRead(ids) {
        return Promise.all(ids.map(id => this.read(id)));
    }
    /**
     * 按月范围读取
     */
    async readByMonthRange(startMonth, endMonth) {
        const memories = [];
        for (const [monthStr, archive] of this.monthArchives.entries()) {
            if (monthStr >= startMonth && monthStr <= endMonth) {
                const monthMemories = await this.batchRead(archive.memoryIds);
                memories.push(...monthMemories.filter((m) => m !== null));
            }
        }
        return memories;
    }
    /**
     * 删除记忆
     */
    async delete(id) {
        const location = this.index.get(id);
        if (!location) {
            return false;
        }
        // 删除文件
        if (fs.existsSync(location.path)) {
            fs.unlinkSync(location.path);
        }
        // 更新索引
        this.index.delete(id);
        // 更新月归档
        const archive = this.monthArchives.get(location.month);
        if (archive) {
            archive.memoryIds = archive.memoryIds.filter(mid => mid !== id);
        }
        // 持久化索引
        await this.persistIndex();
        return true;
    }
    /**
     * 获取记忆数量
     */
    size() {
        return this.index.size;
    }
    /**
     * 获取月归档
     */
    getMonthArchive(monthStr) {
        return this.monthArchives.get(monthStr) || null;
    }
    /**
     * 获取所有月归档
     */
    getAllMonthArchives() {
        return Array.from(this.monthArchives.values());
    }
    /**
     * 搜索记忆（懒加载）
     */
    async search(query, limit = 50) {
        const queryLower = query.toLowerCase();
        const results = [];
        // 检查查询缓存
        const cacheKey = queryLower;
        if (this.queryCache.has(cacheKey)) {
            return this.queryCache.get(cacheKey) || [];
        }
        // 遍历所有月份（可能需要优化）
        for (const [monthStr, archive] of this.monthArchives.entries()) {
            // 懒加载：只加载部分月份
            const monthMemories = await this.batchRead(archive.memoryIds.slice(0, 100));
            for (const memory of monthMemories.filter((m) => m !== null)) {
                const score = this.calculateScore(memory, queryLower);
                if (score > 0) {
                    results.push({ memory, score });
                }
            }
            // 如果结果已够，提前退出
            if (results.length >= limit * 2) {
                break;
            }
        }
        // 按评分排序
        results.sort((a, b) => b.score - a.score);
        const topResults = results.slice(0, limit).map(r => r.memory);
        // 缓存结果
        this.queryCache.set(cacheKey, topResults);
        return topResults;
    }
    /**
     * 计算搜索评分
     */
    calculateScore(memory, query) {
        let score = 0;
        const contentLower = memory.content.toLowerCase();
        // 内容匹配
        if (contentLower.includes(query)) {
            score += 10;
        }
        // 标签匹配
        if (memory.tags?.some(tag => tag.toLowerCase().includes(query))) {
            score += 5;
        }
        // 类型匹配
        if (memory.type.toLowerCase().includes(query)) {
            score += 3;
        }
        return score;
    }
    /**
     * 归档月份数据
     */
    async archiveMonth(monthStr) {
        const archive = this.monthArchives.get(monthStr);
        if (!archive || archive.archived) {
            return;
        }
        try {
            // 读取所有记忆
            const memories = await this.batchRead(archive.memoryIds);
            const validMemories = memories.filter((m) => m !== null);
            if (validMemories.length === 0) {
                return;
            }
            // 创建归档文件
            const archiveDir = path.join(this.config.basePath, 'archives');
            if (!fs.existsSync(archiveDir)) {
                fs.mkdirSync(archiveDir, { recursive: true });
            }
            const archivePath = path.join(archiveDir, `${monthStr}.json`);
            const archiveData = {
                month: monthStr,
                memories: validMemories,
                memoryIds: archive.memoryIds,
                totalSize: archive.totalSize,
                archivedAt: Date.now(),
            };
            fs.writeFileSync(archivePath, JSON.stringify(archiveData, null, 2), 'utf-8');
            // 更新归档状态
            archive.archived = true;
            archive.archivePath = archivePath;
            // 删除原始文件
            const monthPath = path.join(this.config.basePath, 'months', monthStr);
            if (fs.existsSync(monthPath)) {
                for (const id of archive.memoryIds) {
                    const filePath = path.join(monthPath, `${id}.json`);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                fs.rmdirSync(monthPath);
            }
            // 更新索引
            for (const id of archive.memoryIds) {
                this.index.set(id, {
                    month: monthStr,
                    path: archivePath,
                });
            }
            await this.persistIndex();
            console.log(`[L2ColdStore] 归档月份 ${monthStr} (${validMemories.length} 条记忆)`);
        }
        catch (error) {
            console.error(`[L2ColdStore] 归档月份 ${monthStr} 失败:`, error);
        }
    }
    /**
     * 自动归档（后台任务）
     */
    async autoArchive() {
        const now = Date.now();
        let archived = 0;
        for (const [monthStr, archive] of this.monthArchives.entries()) {
            if (archive.archived) {
                continue;
            }
            const monthDate = new Date(monthStr + '-01');
            const age = now - monthDate.getTime();
            // 超过配置天数后归档
            if (age > this.config.archiveAfterDays * 24 * 60 * 60 * 1000) {
                await this.archiveMonth(monthStr);
                archived++;
            }
        }
        if (archived > 0) {
            console.log(`[L2ColdStore] 自动归档了 ${archived} 个月份`);
        }
        return archived;
    }
    /**
     * 持久化索引
     */
    async persistIndex() {
        try {
            const indexPath = path.join(this.config.basePath, 'index.json');
            const data = {
                index: Object.fromEntries(this.index),
                monthArchives: Array.from(this.monthArchives.values()),
                timestamp: Date.now(),
            };
            fs.writeFileSync(indexPath, JSON.stringify(data, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('[L2ColdStore] 持久化索引失败:', error);
        }
    }
    /**
     * 月份字符串
     */
    toMonthString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
    /**
     * 获取统计信息
     */
    getStats() {
        const totalSize = Array.from(this.monthArchives.values())
            .reduce((sum, a) => sum + a.totalSize, 0);
        const archivedMonths = Array.from(this.monthArchives.values())
            .filter(a => a.archived).length;
        return {
            totalMemories: this.index.size,
            totalMonths: this.monthArchives.size,
            archivedMonths,
            totalSize,
        };
    }
    /**
     * 清理查询缓存
     */
    clearQueryCache() {
        this.queryCache.clear();
    }
}
exports.L2ColdStore = L2ColdStore;
