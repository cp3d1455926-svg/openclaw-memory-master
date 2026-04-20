/**
 * Auto Tagger - 自动打标器
 *
 * 智能标签提取系统，支持：
 * 1. 关键词提取（TF-IDF + 规则）
 * 2. 情感标签检测
 * 3. 实体识别（人物、地点、组织等）
 * 4. 主题标签生成
 * 5. 自定义标签规则
 *
 * @author 小鬼 👻 + Jake
 * @version 4.3.0
 * @module smart
 */
import { TaggerConfig } from './SmartMemoryCurator';
export interface TaggingResult {
    allTags: string[];
    keywordTags: string[];
    emotionTags: string[];
    entityTags: string[];
    topicTags: string[];
    customTags: string[];
    keywordScores: Record<string, number>;
    emotionScores: Record<string, number>;
    entityConfidences: Record<string, number>;
    extractedEntities: {
        persons: string[];
        locations: string[];
        organizations: string[];
        dates: string[];
        numbers: string[];
        urls: string[];
    };
    metadata: {
        processingTime: number;
        wordCount: number;
        uniqueWordCount: number;
        tagDensity: number;
        emotionDominance?: string;
    };
}
export interface Keyword {
    word: string;
    score: number;
    frequency: number;
    position: number;
}
export interface EmotionAnalysis {
    primary: string;
    secondary: string[];
    intensity: number;
    scores: Record<string, number>;
    triggers: string[];
}
export interface Entity {
    text: string;
    type: 'person' | 'location' | 'organization' | 'date' | 'number' | 'url' | 'other';
    confidence: number;
    start: number;
    end: number;
}
export interface TaggerRule {
    name: string;
    pattern: RegExp | string;
    tag: string;
    weight: number;
    description: string;
}
/**
 * 情感词典
 */
export declare const EMOTION_DICTIONARY: Record<string, string[]>;
/**
 * 常用停用词
 */
export declare const STOP_WORDS: Set<string>;
/**
 * 默认打标规则
 */
export declare const DEFAULT_TAGGER_RULES: TaggerRule[];
/**
 * 自动打标器
 *
 * 实现多维度标签提取和分析
 */
export declare class AutoTagger {
    private config;
    private rules;
    private emotionDictionary;
    private stopWords;
    private tagCache;
    constructor(config: TaggerConfig);
    /**
     * 打标主方法
     */
    tag(content: string): Promise<TaggingResult>;
    /**
     * 批量打标
     */
    batchTag(contents: string[]): Promise<TaggingResult[]>;
    /**
     * 添加自定义规则
     */
    addRule(rule: TaggerRule): void;
    /**
     * 添加情感词汇
     */
    addEmotionWords(emotion: string, words: string[]): void;
    /**
     * 添加停用词
     */
    addStopWords(words: string[]): void;
    /**
     * 获取统计信息
     */
    getStats(): {
        ruleCount: number;
        emotionCategoryCount: number;
        stopWordCount: number;
        cacheSize: number;
        averageProcessingTime: number;
    };
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 提取关键词
     */
    private extractKeywords;
    /**
     * 分析情感
     */
    private analyzeEmotions;
    /**
     * 提取实体
     */
    private extractEntities;
    /**
     * 应用规则打标
     */
    private applyRules;
    /**
     * 合并所有标签
     */
    private mergeTags;
    /**
     * 获取主导情感
     */
    private getDominantEmotion;
    /**
     * 分词
     */
    private tokenize;
    /**
     * 统计单词数
     */
    private countWords;
    /**
     * 统计唯一单词数
     */
    private countUniqueWords;
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
export declare function createTagger(config?: Partial<TaggerConfig>): AutoTagger;
/**
 * 快速打标函数
 */
export declare function quickTag(content: string, config?: Partial<TaggerConfig>): Promise<TaggingResult>;
