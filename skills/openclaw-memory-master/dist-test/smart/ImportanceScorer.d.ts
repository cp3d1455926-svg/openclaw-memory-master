/**
 * Importance Scorer - 重要性评分器
 *
 * 智能记忆重要性评分系统，基于多维度因素：
 * 1. 内容长度和质量
 * 2. 情感强度和类型
 * 3. 时间相关性和新鲜度
 * 4. 语义丰富度和独特性
 * 5. 访问频率和历史价值
 *
 * @author 小鬼 👻 + Jake
 * @version 4.3.0
 * @module smart
 */
import { ClassificationResult } from './AutoClassifier';
import { TaggingResult } from './AutoTagger';
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
export interface ImportanceScore {
    score: number;
    factors: {
        contentLength: number;
        emotionalIntensity: number;
        temporalRelevance: number;
        semanticRichness: number;
        accessFrequency?: number;
    };
    breakdown: {
        rawScores: Record<string, number>;
        weightedScores: Record<string, number>;
        normalization: string;
    };
    interpretation: string;
}
export interface ContentAnalysis {
    wordCount: number;
    sentenceCount: number;
    avgWordLength: number;
    readabilityScore: number;
    uniqueWordRatio: number;
}
export interface TemporalAnalysis {
    ageInHours: number;
    timeOfDay: number;
    dayOfWeek: number;
    isRecent: boolean;
    isPeakTime: boolean;
}
/**
 * 默认权重配置
 */
export declare const DEFAULT_IMPORTANCE_WEIGHTS: {
    contentLengthWeight: number;
    emotionalIntensityWeight: number;
    temporalRelevanceWeight: number;
    semanticRichnessWeight: number;
    accessFrequencyWeight: number;
};
/**
 * 重要性评分器
 *
 * 基于多维度因素计算记忆重要性
 */
export declare class ImportanceScorer {
    private config;
    private scoreCache;
    private statistics;
    constructor(config: ImportanceConfig);
    /**
     * 计算重要性得分
     */
    calculate(content: string, classification: ClassificationResult, tagging: TaggingResult): ImportanceScore;
    /**
     * 批量计算重要性
     */
    batchCalculate(items: Array<{
        content: string;
        classification: ClassificationResult;
        tagging: TaggingResult;
    }>): ImportanceScore[];
    /**
     * 获取统计信息
     */
    getStatistics(): {
        totalScored: number;
        averageScore: number;
        scoreDistribution: Record<string, number>;
        cacheSize: number;
        averageProcessingTime: number;
    };
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 导出来要性报告
     */
    exportReport(): string;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<ImportanceConfig>): void;
    /**
     * 分析内容
     */
    private analyzeContent;
    /**
     * 分析情感
     */
    private analyzeEmotions;
    /**
     * 分析时间
     */
    private analyzeTemporal;
    /**
     * 分析语义
     */
    private analyzeSemantic;
    /**
     * 计算原始得分
     */
    private calculateRawScores;
    /**
     * 应用权重
     */
    private applyWeights;
    /**
     * 计算最终得分
     */
    private computeFinalScore;
    /**
     * 生成解释
     */
    private generateInterpretation;
    /**
     * 计算可读性
     */
    private calculateReadability;
    /**
     * 计算时间相关性
     */
    private calculateTimeRelevance;
    /**
     * S型函数（将值映射到0-1）
     */
    private sigmoid;
    /**
     * 标准化得分
     */
    private normalizeScore;
    /**
     * 获取得分等级
     */
    private getScoreLevel;
    /**
     * 获取主导因子
     */
    private getDominantFactor;
    /**
     * 生成缓存键
     */
    private generateCacheKey;
    /**
     * 简单哈希函数
     */
    private simpleHash;
    /**
     * 更新统计
     */
    private updateStatistics;
    /**
     * 清理缓存
     */
    private cleanCache;
    /**
     * 获取降级得分
     */
    private getFallbackScore;
    /**
     * 生成优化建议
     */
    private generateRecommendations;
}
/**
 * 导出工具函数
 */
export declare function createImportanceScorer(config?: Partial<ImportanceConfig>): ImportanceScorer;
/**
 * 快速重要性评分函数
 */
export declare function quickImportanceScore(content: string, classification: ClassificationResult, tagging: TaggingResult, config?: Partial<ImportanceConfig>): ImportanceScore;
