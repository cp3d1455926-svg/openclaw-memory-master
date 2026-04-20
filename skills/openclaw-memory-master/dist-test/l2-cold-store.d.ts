/**
 * L2 Cold Store - 冷记忆存储
 *
 * 存储历史记忆，磁盘存储，懒加载，容量无限制
 *
 * @author 小鬼 👻 + Jake
 * @version 4.2.0
 */
export interface ColdMemory {
    id: string;
    content: string;
    timestamp: number;
    type: string;
    tags?: string[];
    metadata?: Record<string, any>;
    compressed: boolean;
    compressionRatio?: number;
    archivePath?: string;
}
export interface L2StoreConfig {
    basePath?: string;
    compressAll?: boolean;
    archiveAfterDays?: number;
}
interface MonthArchive {
    month: string;
    memoryIds: string[];
    totalSize: number;
    compressedSize?: number;
    archived: boolean;
    archivePath?: string;
}
/**
 * L2 冷存储 - 按月归档的长期存储
 */
export declare class L2ColdStore {
    private config;
    private index;
    private monthArchives;
    private queryCache;
    constructor(config?: L2StoreConfig);
    /**
     * 初始化存储
     */
    private init;
    /**
     * 加载归档索引
     */
    private loadArchives;
    /**
     * 写入记忆
     */
    write(memory: ColdMemory): Promise<void>;
    /**
     * 批量写入
     */
    batchWrite(memories: ColdMemory[]): Promise<void>;
    /**
     * 读取记忆
     */
    read(id: string): Promise<ColdMemory | null>;
    /**
     * 批量读取
     */
    batchRead(ids: string[]): Promise<(ColdMemory | null)[]>;
    /**
     * 按月范围读取
     */
    readByMonthRange(startMonth: string, endMonth: string): Promise<ColdMemory[]>;
    /**
     * 删除记忆
     */
    delete(id: string): Promise<boolean>;
    /**
     * 获取记忆数量
     */
    size(): number;
    /**
     * 获取月归档
     */
    getMonthArchive(monthStr: string): MonthArchive | null;
    /**
     * 获取所有月归档
     */
    getAllMonthArchives(): MonthArchive[];
    /**
     * 搜索记忆（懒加载）
     */
    search(query: string, limit?: number): Promise<ColdMemory[]>;
    /**
     * 计算搜索评分
     */
    private calculateScore;
    /**
     * 归档月份数据
     */
    archiveMonth(monthStr: string): Promise<void>;
    /**
     * 自动归档（后台任务）
     */
    autoArchive(): Promise<number>;
    /**
     * 持久化索引
     */
    private persistIndex;
    /**
     * 月份字符串
     */
    private toMonthString;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalMemories: number;
        totalMonths: number;
        archivedMonths: number;
        totalSize: number;
    };
    /**
     * 清理查询缓存
     */
    clearQueryCache(): void;
}
export {};
