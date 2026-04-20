/**
 * L1 Warm Store - 温记忆存储
 *
 * 存储最近 7 天的记忆，按需加载，平衡速度和容量
 *
 * @author 小鬼 👻 + Jake
 * @version 4.2.0
 */
export interface WarmMemory {
    id: string;
    content: string;
    timestamp: number;
    type: string;
    tags?: string[];
    metadata?: Record<string, any>;
    compressed?: boolean;
    compressionRatio?: number;
}
export interface L1StoreConfig {
    basePath?: string;
    cacheSize?: number;
    ttl?: number;
    compressThreshold?: number;
}
interface DaySummary {
    date: string;
    memoryIds: string[];
    totalSize: number;
    compressedSize?: number;
    summary?: string;
}
/**
 * L1 温存储 - 按天组织的温数据存储
 */
export declare class L1WarmStore {
    private config;
    private cache;
    private daySummaries;
    private index;
    constructor(config?: L1StoreConfig);
    /**
     * 初始化存储
     */
    private init;
    /**
     * 预加载最近的记忆
     */
    private preloadRecent;
    /**
     * 写入记忆
     */
    write(memory: WarmMemory): Promise<void>;
    /**
     * 批量写入
     */
    batchWrite(memories: WarmMemory[]): Promise<void>;
    /**
     * 读取记忆
     */
    read(id: string): Promise<WarmMemory | null>;
    /**
     * 批量读取
     */
    batchRead(ids: string[]): Promise<(WarmMemory | null)[]>;
    /**
     * 按日期范围读取
     */
    readByDateRange(start: Date, end: Date): Promise<WarmMemory[]>;
    /**
     * 删除记忆
     */
    delete(id: string): Promise<boolean>;
    /**
     * 获取记忆数量
     */
    size(): number;
    /**
     * 获取日摘要
     */
    getDaySummary(dateStr: string): DaySummary | null;
    /**
     * 获取所有日摘要
     */
    getAllDaySummaries(): DaySummary[];
    /**
     * 搜索记忆
     */
    search(query: string, limit?: number): Promise<WarmMemory[]>;
    /**
     * 计算搜索评分
     */
    private calculateScore;
    /**
     * 加载到缓存
     */
    private loadToCache;
    /**
     * 添加到缓存（带淘汰）
     */
    private addToCache;
    /**
     * 持久化索引
     */
    private persistIndex;
    /**
     * 日期转字符串
     */
    private toDateString;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalMemories: number;
        totalDays: number;
        cacheSize: number;
        cacheUsage: number;
        totalSize: number;
    };
    /**
     * 清理过期记忆
     */
    cleanup(): Promise<number>;
}
export {};
