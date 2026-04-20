"use strict";
/**
 * L1 Warm Store - 温记忆存储
 *
 * 存储最近 7 天的记忆，按需加载，平衡速度和容量
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
exports.L1WarmStore = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * L1 温存储 - 按天组织的温数据存储
 */
class L1WarmStore {
    constructor(config = {}) {
        this.config = {
            basePath: config.basePath ?? 'memory/l1-warm',
            cacheSize: config.cacheSize ?? 1000,
            ttl: config.ttl ?? 7 * 24 * 60 * 60 * 1000, // 7 天
            compressThreshold: config.compressThreshold ?? 1024, // 1KB
        };
        this.cache = new Map();
        this.daySummaries = new Map();
        this.index = new Map();
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
                if (parsed.daySummaries) {
                    this.daySummaries = new Map(parsed.daySummaries.map((s) => [s.date, s]));
                }
                console.log(`[L1WarmStore] 恢复了 ${this.index.size} 条温记忆，${this.daySummaries.size} 天`);
            }
            // 预加载最近的记忆到缓存
            this.preloadRecent();
        }
        catch (error) {
            console.warn('[L1WarmStore] 初始化失败:', error);
        }
    }
    /**
     * 预加载最近的记忆
     */
    async preloadRecent() {
        const recentDays = 3; // 预加载最近 3 天
        const now = Date.now();
        for (let i = 0; i < recentDays; i++) {
            const date = new Date(now - i * 24 * 60 * 60 * 1000);
            const dateStr = this.toDateString(date);
            const summary = this.daySummaries.get(dateStr);
            if (summary) {
                // 加载部分记忆到缓存（最近 50 条）
                const recentIds = summary.memoryIds.slice(-50);
                for (const id of recentIds) {
                    this.loadToCache(id, dateStr);
                }
            }
        }
        console.log(`[L1WarmStore] 预加载完成，缓存大小：${this.cache.size}`);
    }
    /**
     * 写入记忆
     */
    async write(memory) {
        const dateStr = this.toDateString(new Date(memory.timestamp));
        const dayPath = path.join(this.config.basePath, 'days', dateStr);
        // 确保目录存在
        if (!fs.existsSync(dayPath)) {
            fs.mkdirSync(dayPath, { recursive: true });
        }
        // 检查是否需要压缩
        const contentSize = Buffer.byteLength(memory.content, 'utf-8');
        if (contentSize > this.config.compressThreshold && !memory.compressed) {
            // TODO: 集成 AAAK 压缩
            // memory = await this.compress(memory);
        }
        // 写入文件
        const filePath = path.join(dayPath, `${memory.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(memory, null, 2), 'utf-8');
        // 更新索引
        this.index.set(memory.id, dateStr);
        // 更新日摘要
        let summary = this.daySummaries.get(dateStr);
        if (!summary) {
            summary = {
                date: dateStr,
                memoryIds: [],
                totalSize: 0,
            };
            this.daySummaries.set(dateStr, summary);
        }
        if (!summary.memoryIds.includes(memory.id)) {
            summary.memoryIds.push(memory.id);
            summary.totalSize += contentSize;
        }
        // 添加到缓存
        this.addToCache(memory);
        // 持久化索引
        await this.persistIndex();
        console.log(`[L1WarmStore] 写入记忆 ${memory.id} (${dateStr})`);
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
        // 先查缓存
        const cached = this.cache.get(id);
        if (cached) {
            return cached;
        }
        // 查索引
        const dateStr = this.index.get(id);
        if (!dateStr) {
            return null;
        }
        // 从磁盘加载
        return await this.loadToCache(id, dateStr);
    }
    /**
     * 批量读取
     */
    async batchRead(ids) {
        return Promise.all(ids.map(id => this.read(id)));
    }
    /**
     * 按日期范围读取
     */
    async readByDateRange(start, end) {
        const memories = [];
        const startStr = this.toDateString(start);
        const endStr = this.toDateString(end);
        for (const [dateStr, summary] of this.daySummaries.entries()) {
            if (dateStr >= startStr && dateStr <= endStr) {
                const dayMemories = await this.batchRead(summary.memoryIds);
                memories.push(...dayMemories.filter((m) => m !== null));
            }
        }
        return memories;
    }
    /**
     * 删除记忆
     */
    async delete(id) {
        const dateStr = this.index.get(id);
        if (!dateStr) {
            return false;
        }
        // 删除文件
        const filePath = path.join(this.config.basePath, 'days', dateStr, `${id}.json`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        // 更新索引
        this.index.delete(id);
        // 更新日摘要
        const summary = this.daySummaries.get(dateStr);
        if (summary) {
            summary.memoryIds = summary.memoryIds.filter(mid => mid !== id);
            // 如果这天没有记忆了，删除目录
            if (summary.memoryIds.length === 0) {
                const dayPath = path.join(this.config.basePath, 'days', dateStr);
                if (fs.existsSync(dayPath)) {
                    fs.rmdirSync(dayPath);
                }
                this.daySummaries.delete(dateStr);
            }
        }
        // 从缓存移除
        this.cache.delete(id);
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
     * 获取日摘要
     */
    getDaySummary(dateStr) {
        return this.daySummaries.get(dateStr) || null;
    }
    /**
     * 获取所有日摘要
     */
    getAllDaySummaries() {
        return Array.from(this.daySummaries.values());
    }
    /**
     * 搜索记忆
     */
    async search(query, limit = 20) {
        const results = [];
        const queryLower = query.toLowerCase();
        // 在缓存中搜索
        for (const memory of this.cache.values()) {
            const score = this.calculateScore(memory, queryLower);
            if (score > 0) {
                results.push({ memory, score });
            }
        }
        // 如果缓存中结果不够，搜索磁盘
        if (results.length < limit) {
            // 搜索最近的几天
            const recentDays = Array.from(this.daySummaries.keys())
                .sort()
                .reverse()
                .slice(0, 7);
            for (const dateStr of recentDays) {
                const summary = this.daySummaries.get(dateStr);
                if (summary) {
                    for (const id of summary.memoryIds) {
                        if (!this.cache.has(id)) {
                            const memory = await this.read(id);
                            if (memory) {
                                const score = this.calculateScore(memory, queryLower);
                                if (score > 0) {
                                    results.push({ memory, score });
                                }
                            }
                        }
                    }
                }
            }
        }
        // 按评分排序
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, limit).map(r => r.memory);
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
        // 近因加分
        const age = Date.now() - memory.timestamp;
        if (age < 24 * 60 * 60 * 1000) {
            score += 2; // 24 小时内
        }
        else if (age < 3 * 24 * 60 * 60 * 1000) {
            score += 1; // 3 天内
        }
        return score;
    }
    /**
     * 加载到缓存
     */
    async loadToCache(id, dateStr) {
        try {
            const filePath = path.join(this.config.basePath, 'days', dateStr, `${id}.json`);
            if (!fs.existsSync(filePath)) {
                return null;
            }
            const data = fs.readFileSync(filePath, 'utf-8');
            const memory = JSON.parse(data);
            // 添加到缓存
            await this.addToCache(memory);
            return memory;
        }
        catch (error) {
            console.error(`[L1WarmStore] 加载记忆 ${id} 失败:`, error);
            return null;
        }
    }
    /**
     * 添加到缓存（带淘汰）
     */
    async addToCache(memory) {
        // 检查缓存是否已满
        if (this.cache.size >= this.config.cacheSize) {
            // 淘汰最旧的
            const oldestId = this.cache.keys().next().value;
            if (oldestId) {
                this.cache.delete(oldestId);
            }
        }
        this.cache.set(memory.id, memory);
    }
    /**
     * 持久化索引
     */
    async persistIndex() {
        try {
            const indexPath = path.join(this.config.basePath, 'index.json');
            const data = {
                index: Object.fromEntries(this.index),
                daySummaries: Array.from(this.daySummaries.values()),
                timestamp: Date.now(),
            };
            fs.writeFileSync(indexPath, JSON.stringify(data, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('[L1WarmStore] 持久化索引失败:', error);
        }
    }
    /**
     * 日期转字符串
     */
    toDateString(date) {
        return date.toISOString().split('T')[0];
    }
    /**
     * 获取统计信息
     */
    getStats() {
        const totalSize = Array.from(this.daySummaries.values())
            .reduce((sum, s) => sum + s.totalSize, 0);
        return {
            totalMemories: this.index.size,
            totalDays: this.daySummaries.size,
            cacheSize: this.config.cacheSize,
            cacheUsage: this.cache.size,
            totalSize,
        };
    }
    /**
     * 清理过期记忆
     */
    async cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (const [dateStr, summary] of this.daySummaries.entries()) {
            const date = new Date(dateStr);
            const age = now - date.getTime();
            if (age > this.config.ttl) {
                // 删除这天的所有记忆
                const dayPath = path.join(this.config.basePath, 'days', dateStr);
                if (fs.existsSync(dayPath)) {
                    for (const id of summary.memoryIds) {
                        const filePath = path.join(dayPath, `${id}.json`);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            cleaned++;
                        }
                    }
                    fs.rmdirSync(dayPath);
                }
                this.daySummaries.delete(dateStr);
                for (const id of summary.memoryIds) {
                    this.index.delete(id);
                    this.cache.delete(id);
                }
            }
        }
        if (cleaned > 0) {
            console.log(`[L1WarmStore] 清理了 ${cleaned} 条过期记忆`);
            await this.persistIndex();
        }
        return cleaned;
    }
}
exports.L1WarmStore = L1WarmStore;
