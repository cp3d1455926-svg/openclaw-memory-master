"use strict";
/**
 * L0 Hot Store - 热记忆存储
 *
 * 存储最近 24 小时的记忆，常驻内存，提供毫秒级访问
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
exports.L0HotStore = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * L0 热存储 - 常驻内存的高速缓存
 */
class L0HotStore {
    constructor(config = {}) {
        this.store = new Map();
        this.accessOrder = [];
        this.config = {
            maxSize: config.maxSize ?? 100,
            ttl: config.ttl ?? 24 * 60 * 60 * 1000, // 24 小时
            eviction: config.eviction ?? 'lru',
            persistPath: config.persistPath ?? 'memory/l0-hot',
            autoPersist: config.autoPersist ?? true,
        };
        // 初始化持久化
        this.initPersist();
        // 启动清理定时器（每 5 分钟清理过期记忆）
        this.startCleanupTimer();
    }
    /**
     * 初始化持久化
     */
    async initPersist() {
        try {
            const indexPath = path.join(this.config.persistPath, 'index.json');
            if (fs.existsSync(indexPath)) {
                const data = fs.readFileSync(indexPath, 'utf-8');
                const parsed = JSON.parse(data);
                // 恢复内存
                if (parsed.memories) {
                    for (const memory of parsed.memories) {
                        this.store.set(memory.id, memory);
                    }
                }
                // 恢复访问顺序
                if (parsed.accessOrder) {
                    this.accessOrder = parsed.accessOrder;
                }
                console.log(`[L0HotStore] 恢复了 ${this.store.size} 条热记忆`);
            }
        }
        catch (error) {
            console.warn('[L0HotStore] 恢复持久化失败:', error);
        }
    }
    /**
     * 启动清理定时器
     */
    startCleanupTimer() {
        setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000); // 5 分钟
    }
    /**
     * 写入记忆
     */
    async write(memory) {
        // 检查是否已存在
        if (this.store.has(memory.id)) {
            this.update(memory);
            return;
        }
        // 检查是否需要淘汰
        if (this.store.size >= this.config.maxSize) {
            await this.evict();
        }
        // 写入内存
        this.store.set(memory.id, memory);
        this.accessOrder.push(memory.id);
        // 自动持久化
        if (this.config.autoPersist) {
            await this.persist();
        }
        console.log(`[L0HotStore] 写入记忆 ${memory.id}, 当前大小：${this.store.size}`);
    }
    /**
     * 读取记忆
     */
    async read(id) {
        const memory = this.store.get(id);
        if (!memory) {
            return null;
        }
        // 检查是否过期
        if (this.isExpired(memory)) {
            await this.delete(id);
            return null;
        }
        // 更新访问顺序（LRU）
        if (this.config.eviction === 'lru') {
            const index = this.accessOrder.indexOf(id);
            if (index > -1) {
                this.accessOrder.splice(index, 1);
                this.accessOrder.push(id);
            }
        }
        return memory;
    }
    /**
     * 更新记忆
     */
    async update(memory) {
        const existing = this.store.get(memory.id);
        if (!existing) {
            throw new Error(`Memory ${memory.id} not found`);
        }
        const updated = { ...existing, ...memory };
        this.store.set(memory.id, updated);
        // 自动持久化
        if (this.config.autoPersist) {
            await this.persist();
        }
    }
    /**
     * 删除记忆
     */
    async delete(id) {
        const deleted = this.store.delete(id);
        if (deleted) {
            const index = this.accessOrder.indexOf(id);
            if (index > -1) {
                this.accessOrder.splice(index, 1);
            }
            // 自动持久化
            if (this.config.autoPersist) {
                await this.persist();
            }
        }
        return deleted;
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
     * 批量读取
     */
    async batchRead(ids) {
        return Promise.all(ids.map(id => this.read(id)));
    }
    /**
     * 获取所有记忆
     */
    getAll() {
        return Array.from(this.store.values());
    }
    /**
     * 获取记忆数量
     */
    size() {
        return this.store.size;
    }
    /**
     * 清空存储
     */
    async clear() {
        this.store.clear();
        this.accessOrder = [];
        if (this.config.autoPersist) {
            await this.persist();
        }
    }
    /**
     * 清理过期记忆
     */
    async cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (const [id, memory] of this.store.entries()) {
            if (now - memory.timestamp > this.config.ttl) {
                await this.delete(id);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`[L0HotStore] 清理了 ${cleaned} 条过期记忆`);
        }
        return cleaned;
    }
    /**
     * 淘汰记忆（当达到容量上限时）
     */
    async evict() {
        if (this.config.eviction === 'lru') {
            // LRU: 淘汰最久未访问的
            const oldestId = this.accessOrder[0];
            if (oldestId) {
                await this.delete(oldestId);
                console.log(`[L0HotStore] LRU 淘汰：${oldestId}`);
            }
        }
        else {
            // FIFO: 淘汰最早写入的
            const oldestId = this.accessOrder[0];
            if (oldestId) {
                await this.delete(oldestId);
                console.log(`[L0HotStore] FIFO 淘汰：${oldestId}`);
            }
        }
    }
    /**
     * 检查记忆是否过期
     */
    isExpired(memory) {
        return Date.now() - memory.timestamp > this.config.ttl;
    }
    /**
     * 持久化到磁盘
     */
    async persist() {
        try {
            // 确保目录存在
            const dir = this.config.persistPath;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // 写入索引
            const indexPath = path.join(dir, 'index.json');
            const data = {
                memories: this.getAll(),
                accessOrder: this.accessOrder,
                timestamp: Date.now(),
                size: this.store.size,
            };
            fs.writeFileSync(indexPath, JSON.stringify(data, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('[L0HotStore] 持久化失败:', error);
        }
    }
    /**
     * 获取统计信息
     */
    getStats() {
        // 估算内存使用（字节）
        let memoryUsage = 0;
        for (const memory of this.store.values()) {
            memoryUsage += JSON.stringify(memory).length * 2; // UTF-16
        }
        return {
            size: this.store.size,
            maxSize: this.config.maxSize,
            ttl: this.config.ttl,
            eviction: this.config.eviction,
            memoryUsage,
        };
    }
    /**
     * 搜索记忆（简单关键词匹配）
     */
    search(query, limit = 10) {
        const results = [];
        const queryLower = query.toLowerCase();
        for (const memory of this.store.values()) {
            let score = 0;
            // 内容匹配
            if (memory.content.toLowerCase().includes(queryLower)) {
                score += 10;
            }
            // 标签匹配
            if (memory.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
                score += 5;
            }
            // 类型匹配
            if (memory.type.toLowerCase().includes(queryLower)) {
                score += 3;
            }
            if (score > 0) {
                results.push({ memory, score });
            }
        }
        // 按评分排序
        results.sort((a, b) => b.score - a.score);
        // 返回 Top-K
        return results.slice(0, limit).map(r => r.memory);
    }
    /**
     * 销毁（停止定时器）
     */
    destroy() {
        if (this.persistTimer) {
            clearInterval(this.persistTimer);
        }
    }
}
exports.L0HotStore = L0HotStore;
