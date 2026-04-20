/**
 * Deduplication Engine - 去重引擎
 *
 * 智能记忆去重系统，支持：
 * 1. 精确匹配去重
 * 2. 模糊匹配去重
 * 3. 语义相似度去重
 * 4. 批量去重处理
 * 5. 相似度评分
 *
 * @author 小鬼 👻 + Jake
 * @version 4.3.0
 * @module smart
 */
import { RawMemory } from './SmartMemoryCurator';
import { LayeredMemory } from '../layered-manager';
export interface DeduplicationConfig {
    similarityThreshold: number;
    semanticCheck: boolean;
    exactMatch: boolean;
    fuzzyMatch: boolean;
}
export interface DuplicateCheckResult {
    isDuplicate: boolean;
    duplicateOf?: string;
    similarityScore?: number;
    matchType?: 'exact' | 'fuzzy' | 'semantic' | 'none';
    explanation?: string;
}
export interface SimilarityResult {
    score: number;
    method: string;
    details?: Record<string, any>;
}
export interface BatchDeduplicationResult {
    originalCount: number;
    deduplicatedCount: number;
    duplicatesRemoved: number;
    duplicatePairs: Array<{
        id: string;
        duplicateOf: string;
        similarity: number;
    }>;
    statistics: {
        exactMatches: number;
        fuzzyMatches: number;
        semanticMatches: number;
        averageSimilarity: number;
    };
}
/**
 * 默认相似度阈值
 */
export declare const DEFAULT_SIMILARITY_THRESHOLDS: {
    exact: number;
    fuzzy: number;
    semantic: number;
};
/**
 * 去重引擎
 *
 * 实现多级去重策略：精确匹配 → 模糊匹配 → 语义匹配
 */
export declare class DeduplicationEngine {
    private config;
    private memoryIndex;
    private semanticCache;
    private statistics;
    constructor(config: DeduplicationConfig);
    /**
     * 检查单个记忆是否重复
     */
    checkDuplicate(memory: RawMemory): Promise<DuplicateCheckResult>;
    /**
     * 批量去重
     */
    deduplicateBatch(memories: LayeredMemory[]): Promise<LayeredMemory[]>;
    /**
     * 计算两个文本的相似度
     */
    calculateSimilarity(text1: string, text2: string): Promise<SimilarityResult>;
    /**
     * 获取统计信息
     */
    getStatistics(): {
        totalChecks: number;
        duplicatesFound: number;
        duplicateRate: number;
        exactMatches: number;
        fuzzyMatches: number;
        semanticMatches: number;
        averageProcessingTime: number;
        indexSize: number;
        cacheSize: number;
    };
    /**
     * 清除索引和缓存
     */
    clearIndex(): void;
    /**
     * 导出去重报告
     */
    exportReport(): string;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<DeduplicationConfig>): void;
    /**
     * 检查精确匹配
     */
    private checkExactMatch;
    /**
     * 检查模糊匹配
     */
    private checkFuzzyMatch;
    /**
     * 检查语义相似度
     */
    private checkSemanticSimilarity;
    /**
     * 添加到索引
     */
    private addToIndex;
    /**
     * 规范化文本
     */
    private normalizeText;
    /**
     * 计算Jaccard相似度
     */
    private calculateJaccardSimilarity;
    /**
     * 计算编辑距离相似度
     */
    private calculateEditDistanceSimilarity;
    /**
     * 生成内容哈希
     */
    private generateContentHash;
    /**
     * 记录处理时间
     */
    private recordProcessingTime;
    /**
     * 生成优化建议
     */
    private generateRecommendations;
}
/**
 * 导出工具函数
 */
export declare function createDeduplicationEngine(config?: Partial<DeduplicationConfig>): DeduplicationEngine;
/**
 * 快速去重检查函数
 */
export declare function quickDeduplicateCheck(memory: RawMemory, config?: Partial<DeduplicationConfig>): Promise<DuplicateCheckResult>;
