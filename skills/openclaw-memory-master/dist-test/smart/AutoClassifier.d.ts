/**
 * Auto Classifier - 自动分类器
 *
 * 混合分类器：规则匹配 + LLM 精细分类
 * 支持多类别分类和置信度评分
 *
 * @author 小鬼 👻 + Jake
 * @version 4.3.0
 * @module smart
 */
import { ClassifierConfig } from './SmartMemoryCurator';
export interface ClassificationResult {
    category: string;
    confidence: number;
    subcategory?: string;
    explanation?: string;
    ruleMatches?: string[];
    llmUsed: boolean;
}
export interface ClassificationRule {
    category: string;
    patterns: string[];
    weight: number;
    description: string;
}
export interface LLMClassificationRequest {
    content: string;
    categories: string[];
    context?: string;
}
export interface LLMClassificationResponse {
    category: string;
    confidence: number;
    reasoning: string;
    alternativeCategories?: Array<{
        category: string;
        confidence: number;
    }>;
}
/**
 * 预定义分类规则
 * 基于关键词匹配的快速分类
 */
export declare const DEFAULT_CLASSIFICATION_RULES: ClassificationRule[];
/**
 * 自动分类器
 *
 * 实现规则匹配和LLM分类的混合策略
 */
export declare class AutoClassifier {
    private config;
    private rules;
    private ruleCache;
    constructor(config: ClassifierConfig);
    /**
     * 分类主方法
     */
    classify(content: string): Promise<ClassificationResult>;
    /**
     * 批量分类
     */
    batchClassify(contents: string[]): Promise<ClassificationResult[]>;
    /**
     * 添加自定义分类规则
     */
    addRule(rule: ClassificationRule): void;
    /**
     * 获取规则统计
     */
    getRuleStats(): Record<string, number>;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 规则分类
     */
    private ruleBasedClassify;
    /**
     * LLM分类
     */
    private llmClassify;
    /**
     * 判断是否需要LLM分类
     */
    private shouldUseLLM;
    /**
     * 调用LLM进行分类（占位实现）
     */
    private callLLMForClassification;
    /**
     * 计算最大可能得分
     */
    private calculateMaxPossibleScore;
    /**
     * 归一化置信度
     */
    private normalizeConfidence;
    /**
     * 置信度平滑
     */
    private smoothConfidence;
    /**
     * 生成缓存键
     */
    private generateCacheKey;
    /**
     * 简单哈希函数
     */
    private simpleHash;
    /**
     * 清理缓存
     */
    private cleanCache;
}
/**
 * 导出工具函数
 */
export declare function createClassifier(config?: Partial<ClassifierConfig>): AutoClassifier;
/**
 * 快速分类函数
 */
export declare function quickClassify(content: string, config?: Partial<ClassifierConfig>): Promise<ClassificationResult>;
