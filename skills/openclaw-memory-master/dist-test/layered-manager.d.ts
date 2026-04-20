/**
 * Layered Memory Manager - 分层记忆管理器
 *
 * 统一管理 L0/L1/L2 三层存储，提供透明的读写接口
 * 自动处理层级迁移、缓存管理、跨层检索
 *
 * @author 小鬼 👻 + Jake
 * @version 4.2.0
 */
export interface LayeredMemory {
    id: string;
    content: string;
    timestamp: number;
    type: string;
    tags?: string[];
    metadata?: Record<string, any>;
    layer: 'L0' | 'L1' | 'L2';
    compressed?: boolean;
    compressionRatio?: number;
    archivePath?: string;
}
export interface WriteOptions {
    type?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    skipL0?: boolean;
}
export interface SearchOptions {
    limit?: number;
    layers?: Array<'L0' | 'L1' | 'L2'>;
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    type?: string;
    tags?: string[];
}
export interface MigrationResult {
    l0ToL1: number;
    l1ToL2: number;
    total: number;
}
export interface LayeredStats {
    l0: {
        size: number;
        maxSize: number;
        memoryUsage: number;
    };
    l1: {
        totalMemories: number;
        totalDays: number;
        cacheUsage: number;
    };
    l2: {
        totalMemories: number;
        totalMonths: number;
        archivedMonths: number;
    };
    total: number;
}
/**
 * 分层记忆管理器
 */
export declare class LayeredMemoryManager {
    private l0;
    private l1;
    private l2;
    private migrationInterval?;
    constructor(basePath?: string);
    /**
     * 写入记忆（自动分层）
     */
    write(content: string, options?: WriteOptions): Promise<string>;
    /**
     * 批量写入
     */
    batchWrite(items: Array<{
        content: string;
        options?: WriteOptions;
    }>): Promise<string[]>;
    /**
     * 读取记忆（自动从合适层级加载）
     */
    read(id: string): Promise<LayeredMemory | null>;
    /**
     * 批量读取
     */
    batchRead(ids: string[]): Promise<(LayeredMemory | null)[]>;
    /**
     * 删除记忆
     */
    delete(id: string): Promise<boolean>;
    /**
     * 搜索记忆（跨层检索）
     */
    search(query: string, options?: SearchOptions): Promise<LayeredMemory[]>;
    /**
     * 按类型筛选
     */
    getByType(type: string, limit?: number): Promise<LayeredMemory[]>;
    /**
     * 按标签筛选
     */
    getByTags(tags: string[], limit?: number): Promise<LayeredMemory[]>;
    /**
     * 按时间范围筛选
     */
    getByTimeRange(start: Date, end: Date, limit?: number): Promise<LayeredMemory[]>;
    /**
     * 层级迁移（后台任务）
     */
    migrate(): Promise<MigrationResult>;
    /**
     * 启动后台迁移任务
     */
    private startMigrationTask;
    /**
     * 获取统计信息
     */
    getStats(): LayeredStats;
    /**
     * 清空所有层
     */
    clear(): Promise<void>;
    /**
     * 销毁（停止后台任务）
     */
    destroy(): void;
    /**
     * 生成唯一 ID
     */
    private generateId;
    /**
     * 计算搜索评分
     */
    private calculateScore;
    /**
     * 检查是否匹配过滤条件
     */
    private matchesFilter;
}
