/**
 * Smart Memory Curator - 智能记忆整理器
 *
 * AI-driven memory management with automatic:
 * 1. Classification (规则 + LLM)
 * 2. Tagging (关键词 + 情感标签)
 * 3. Deduplication (语义相似度)
 * 4. Importance scoring (访问频率 + 内容长度 + 情感强度)
 * 5. Relation discovery (实体共现 + 时序关系)
 *
 * @author 小鬼 👻 + Jake
 * @version 4.3.0
 * @module smart
 */
import { LayeredMemory } from '../layered-manager';
/**
 * 原始记忆输入
 */
export interface RawMemory {
    id?: string;
    content: string;
    timestamp?: number;
    metadata?: Record<string, any>;
}
/**
 * 分析结果
 */
export interface AnalysisResult {
    category: string;
    categoryConfidence: number;
    tags: string[];
    emotionTags: string[];
    keywordTags: string[];
    isDuplicate: boolean;
    duplicateOf?: string;
    similarityScore?: number;
    importance: number;
    importanceFactors: {
        contentLength: number;
        emotionalIntensity: number;
        temporalRelevance: number;
        semanticRichness: number;
    };
    relatedMemoryIds: string[];
    relationTypes: string[];
    enhancedMetadata: Record<string, any>;
    processedAt: number;
    processingTime: number;
}
/**
 * 分类器配置
 */
export interface ClassifierConfig {
    useLLM: boolean;
    llmThreshold: number;
    ruleBasedFallback: boolean;
    categories: string[];
}
/**
 * 打标器配置
 */
export interface TaggerConfig {
    maxKeywords: number;
    minKeywordLength: number;
    emotionDetection: boolean;
    extractEntities: boolean;
}
/**
 * 去重器配置
 */
export interface DeduplicationConfig {
    similarityThreshold: number;
    semanticCheck: boolean;
    exactMatch: boolean;
    fuzzyMatch: boolean;
}
/**
 * 重要性评分配置
 */
export interface ImportanceConfig {
    factors: {
        contentLengthWeight: number;
        emotionalIntensityWeight: number;
        temporalRelevanceWeight: number;
        semanticRichnessWeight: number;
        accessFrequencyWeight: number;
    };
    normalization: 'minmax' | 'zscore' | 'decimal';
}
/**
 * 智能记忆整理器配置
 */
export interface SmartMemoryCuratorConfig {
    classifier: ClassifierConfig;
    tagger: TaggerConfig;
    deduplication: DeduplicationConfig;
    importance: ImportanceConfig;
    autoProcess: boolean;
    batchSize: number;
    cacheSize: number;
}
export declare const DEFAULT_CONFIG: SmartMemoryCuratorConfig;
/**
 * 智能记忆整理器
 *
 * 核心类，协调所有智能处理模块
 */
export declare class SmartMemoryCurator {
    private config;
    private classifier;
    private tagger;
    private deduper;
    private importanceScorer;
    private relationDiscoverer;
    private analysisCache;
    private statistics;
    constructor(config?: Partial<SmartMemoryCuratorConfig>);
    /**
     * 分析单个记忆
     */
    analyze(memory: RawMemory): Promise<AnalysisResult>;
    /**
     * 批量分析记忆
     */
    batchAnalyze(memories: RawMemory[]): Promise<AnalysisResult[]>;
    /**
     * 获取缓存的分析结果
     */
    getCachedAnalysis(memoryId: string): AnalysisResult | null;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 获取统计信息
     */
    getStatistics(): {
        totalProcessed: number;
        totalDuplicatesFound: number;
        duplicateRate: number;
        averageProcessingTime: number;
        averageImportanceScore: number;
        cacheSize: number;
        cacheHitRate: number;
    };
    /**
     * 智能整理记忆库（高级功能）
     */
    organizeMemoryBank(memories: LayeredMemory[]): Promise<{
        organized: LayeredMemory[];
        duplicatesRemoved: number;
        categoriesUpdated: number;
        tagsAdded: number;
    }>;
    /**
     * 导出分析报告
     */
    exportReport(): string;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<SmartMemoryCuratorConfig>): void;
    /**
     * 销毁资源
     */
    destroy(): void;
    /**
     * 计算缓存命中率（简化版）
     */
    private calculateCacheHitRate;
    /**
     * 生成优化建议
     */
    private generateRecommendations;
}
