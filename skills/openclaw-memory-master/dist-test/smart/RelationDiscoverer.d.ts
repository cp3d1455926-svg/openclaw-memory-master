/**
 * Relation Discoverer - 关系发现器
 *
 * 智能记忆关系发现系统，基于：
 * 1. 实体共现（人物、地点、组织等）
 * 2. 时序关系（时间相近性）
 * 3. 语义相似度（内容相关性）
 * 4. 分类/标签相似度
 * 5. 因果关系和逻辑关联
 *
 * @author 小鬼 👻 + Jake
 * @version 4.3.0
 * @module smart
 */
import { RawMemory } from './SmartMemoryCurator';
export interface RelationConfig {
    similarityThreshold: number;
    entityWeight: number;
    temporalWeight: number;
    semanticWeight: number;
    categoryWeight: number;
    maxRelatedMemories: number;
    enableCausalInference: boolean;
}
export interface RelationResult {
    relatedIds: string[];
    relationTypes: string[];
    relationStrengths: number[];
    details: {
        entityMatches: Array<{
            id: string;
            entities: string[];
            matchScore: number;
        }>;
        temporalMatches: Array<{
            id: string;
            timeDiffHours: number;
            matchScore: number;
        }>;
        semanticMatches: Array<{
            id: string;
            similarity: number;
            matchScore: number;
        }>;
        categoryMatches: Array<{
            id: string;
            category: string;
            matchScore: number;
        }>;
    };
    explanation: string;
}
export interface EntityExtractionResult {
    persons: string[];
    locations: string[];
    organizations: string[];
    topics: string[];
    events: string[];
    dates: string[];
}
export interface TemporalAnalysis {
    timestamp: number;
    hourOfDay: number;
    dayOfWeek: number;
    month: number;
    isWeekend: boolean;
    season: string;
}
/**
 * 默认关系配置
 */
export declare const DEFAULT_RELATION_CONFIG: RelationConfig;
/**
 * 关系类型定义
 */
export declare const RELATION_TYPES: {
    ENTITY_COOCCURRENCE: string;
    TEMPORAL_PROXIMITY: string;
    SEMANTIC_SIMILARITY: string;
    CATEGORY_SIMILARITY: string;
    CAUSAL_RELATION: string;
    LOGICAL_ASSOCIATION: string;
    EMOTIONAL_CONNECTION: string;
    THEMATIC_RELATION: string;
};
/**
 * 关系强度映射
 */
export declare const RELATION_STRENGTH_MAPPING: {
    weak: number;
    moderate: number;
    strong: number;
    very_strong: number;
};
/**
 * 关系发现器
 *
 * 基于多维度分析发现记忆之间的关系
 */
export declare class RelationDiscoverer {
    private config;
    private memoryRegistry;
    private statistics;
    constructor(config?: Partial<RelationConfig>);
    /**
     * 发现记忆关系
     */
    discoverRelations(memory: RawMemory): Promise<{
        relatedIds: string[];
        relationTypes: string[];
    }>;
    /**
     * 批量发现关系（增强版）
     */
    discoverRelationsEnhanced(memory: RawMemory): Promise<RelationResult>;
    /**
     * 手动添加记忆到注册表
     */
    registerMemory(memory: RawMemory): void;
    /**
     * 获取统计信息
     */
    getStatistics(): {
        totalDiscoveries: number;
        averageRelationsPerMemory: number;
        relationTypeDistribution: Record<string, number>;
        registrySize: number;
        averageProcessingTime: number;
    };
    /**
     * 清除注册表
     */
    clearRegistry(): void;
    /**
     * 导出来系发现报告
     */
    exportReport(): string;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<RelationConfig>): void;
    /**
     * 提取记忆特征
     */
    private extractFeatures;
    /**
     * 提取实体
     */
    private extractEntities;
    /**
     * 分析时间特征
     */
    private analyzeTemporal;
    /**
     * 比较特征（基础版）
     */
    private compareFeatures;
    /**
     * 详细比较（增强版）
     */
    private detailedCompare;
    /**
     * 计算实体相似度
     */
    private calculateEntitySimilarity;
    /**
     * 计算时间相似度
     */
    private calculateTemporalSimilarity;
    /**
     * 计算语义相似度
     */
    private calculateSemanticSimilarity;
    /**
     * 计算分类相似度
     */
    private calculateCategorySimilarity;
    /**
     * 推断因果关系
     */
    private inferCausalRelation;
    /**
     * 计算情感重叠
     */
    private calculateEmotionalOverlap;
    /**
     * 找出匹配的实体
     */
    private findMatchedEntities;
    /**
     * 生成解释
     */
    private generateExplanation;
    /**
     * 获取关系类型名称
     */
    private getRelationTypeName;
    /**
     * 更新统计
     */
    private updateStatistics;
    /**
     * 生成优化建议
     */
    private generateRecommendations;
}
/**
 * 导出工具函数
 */
export declare function createRelationDiscoverer(config?: Partial<RelationConfig>): RelationDiscoverer;
/**
 * 快速关系发现函数
 */
export declare function quickDiscoverRelations(memory: RawMemory, config?: Partial<RelationConfig>): Promise<{
    relatedIds: string[];
    relationTypes: string[];
}>;
