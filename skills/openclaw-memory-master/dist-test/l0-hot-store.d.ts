/**
 * L0 Hot Store - 热记忆存储
 *
 * 存储最近 24 小时的记忆，常驻内存，提供毫秒级访问
 *
 * @author 小鬼 👻 + Jake
 * @version 4.2.0
 */
export interface HotMemory {
    id: string;
    content: string;
    timestamp: number;
    type: string;
    tags?: string[];
    metadata?: Record<string, any>;
}
export interface L0StoreConfig {
    maxSize?: number;
    ttl?: number;
    eviction?: 'lru' | 'fifo';
    persistPath?: string;
    autoPersist?: boolean;
}
/**
 * L0 热存储 - 常驻内存的高速缓存
 */
export declare class L0HotStore {
    private store;
    private accessOrder;
    private config;
    private persistTimer?;
    constructor(config?: L0StoreConfig);
    /**
     * 初始化持久化
     */
    private initPersist;
    /**
     * 启动清理定时器
     */
    private startCleanupTimer;
    /**
     * 写入记忆
     */
    write(memory: HotMemory): Promise<void>;
    /**
     * 读取记忆
     */
    read(id: string): Promise<HotMemory | null>;
    /**
     * 更新记忆
     */
    update(memory: Partial<HotMemory> & {
        id: string;
    }): Promise<void>;
    /**
     * 删除记忆
     */
    delete(id: string): Promise<boolean>;
    /**
     * 批量写入
     */
    batchWrite(memories: HotMemory[]): Promise<void>;
    /**
     * 批量读取
     */
    batchRead(ids: string[]): Promise<(HotMemory | null)[]>;
    /**
     * 获取所有记忆
     */
    getAll(): HotMemory[];
    /**
     * 获取记忆数量
     */
    size(): number;
    /**
     * 清空存储
     */
    clear(): Promise<void>;
    /**
     * 清理过期记忆
     */
    cleanup(): Promise<number>;
    /**
     * 淘汰记忆（当达到容量上限时）
     */
    private evict;
    /**
     * 检查记忆是否过期
     */
    private isExpired;
    /**
     * 持久化到磁盘
     */
    persist(): Promise<void>;
    /**
     * 获取统计信息
     */
    getStats(): {
        size: number;
        maxSize: number;
        ttl: number;
        eviction: string;
        memoryUsage: number;
    };
    /**
     * 搜索记忆（简单关键词匹配）
     */
    search(query: string, limit?: number): HotMemory[];
    /**
     * 销毁（停止定时器）
     */
    destroy(): void;
}
