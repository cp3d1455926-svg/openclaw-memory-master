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

// ============ 类型定义 ============

export interface ImportanceConfig {
  factors: {
    contentLengthWeight: number;    // 内容长度权重
    emotionalIntensityWeight: number; // 情感强度权重
    temporalRelevanceWeight: number;  // 时间相关性权重
    semanticRichnessWeight: number;   // 语义丰富度权重
    accessFrequencyWeight: number;    // 访问频率权重
  };
  normalization: 'minmax' | 'zscore' | 'decimal'; // 标准化方法
}

export interface ImportanceScore {
  score: number;                     // 综合重要性得分 0-100
  factors: {
    contentLength: number;           // 内容长度因子 0-1
    emotionalIntensity: number;      // 情感强度因子 0-1
    temporalRelevance: number;       // 时间相关性因子 0-1
    semanticRichness: number;        // 语义丰富度因子 0-1
    accessFrequency?: number;        // 访问频率因子 0-1（可选）
  };
  breakdown: {
    rawScores: Record<string, number>;      // 原始得分
    weightedScores: Record<string, number>; // 加权得分
    normalization: string;                   // 使用的标准化方法
  };
  interpretation: string;            // 重要性解释
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
  timeOfDay: number;      // 0-23
  dayOfWeek: number;      // 0-6
  isRecent: boolean;      // 是否近期（24小时内）
  isPeakTime: boolean;    // 是否高峰时间（9-17点）
}

// ============ 常量定义 ============

/**
 * 默认权重配置
 */
export const DEFAULT_IMPORTANCE_WEIGHTS = {
  contentLengthWeight: 0.25,
  emotionalIntensityWeight: 0.20,
  temporalRelevanceWeight: 0.15,
  semanticRichnessWeight: 0.25,
  accessFrequencyWeight: 0.15,
};

/**
 * 情感强度映射
 */
const EMOTION_INTENSITY_MAP: Record<string, number> = {
  // 高强度情感
  'anger': 0.9,
  'fear': 0.8,
  'joy': 0.7,
  'sadness': 0.8,
  'surprise': 0.6,
  'love': 0.7,
  'pride': 0.6,
  'gratitude': 0.5,
  'hope': 0.5,
  
  // 中低强度情感
  'disgust': 0.4,
  'shame': 0.4,
  'guilt': 0.4,
  'neutral': 0.2,
  'confusion': 0.3,
  'curiosity': 0.3,
};

/**
 * 时间衰减函数参数
 */
const TIME_DECAY_PARAMS = {
  halfLifeHours: 168, // 半衰期：7天（168小时）
  minRelevance: 0.1,  // 最小相关性
  maxRelevance: 1.0,  // 最大相关性
};

// ============ 重要性评分器 ============

/**
 * 重要性评分器
 * 
 * 基于多维度因素计算记忆重要性
 */
export class ImportanceScorer {
  private config: ImportanceConfig;
  private scoreCache: Map<string, ImportanceScore>;
  private statistics: {
    totalScored: number;
    averageScore: number;
    scoreDistribution: Record<string, number>; // 得分分布
    processingTimes: number[];
  };

  constructor(config: ImportanceConfig) {
    this.config = config;
    this.scoreCache = new Map();
    this.statistics = {
      totalScored: 0,
      averageScore: 0,
      scoreDistribution: {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0,
      },
      processingTimes: [],
    };
    
    console.log('[ImportanceScorer] 初始化完成');
  }

  /**
   * 计算重要性得分
   */
  calculate(
    content: string,
    classification: ClassificationResult,
    tagging: TaggingResult
  ): ImportanceScore {
    const startTime = Date.now();
    
    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(content, classification, tagging);
      
      // 检查缓存
      const cached = this.scoreCache.get(cacheKey);
      if (cached) {
        console.log(`[ImportanceScorer] 缓存命中: ${cached.score.toFixed(1)}`);
        return cached;
      }
      
      console.log(`[ImportanceScorer] 计算重要性: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
      
      // 1. 内容分析
      const contentAnalysis = this.analyzeContent(content);
      
      // 2. 情感分析
      const emotionAnalysis = this.analyzeEmotions(tagging);
      
      // 3. 时间分析
      const temporalAnalysis = this.analyzeTemporal();
      
      // 4. 语义分析
      const semanticAnalysis = this.analyzeSemantic(content, tagging);
      
      // 5. 计算各维度得分
      const rawScores = this.calculateRawScores(
        contentAnalysis,
        emotionAnalysis,
        temporalAnalysis,
        semanticAnalysis
      );
      
      // 6. 应用权重
      const weightedScores = this.applyWeights(rawScores);
      
      // 7. 计算综合得分
      const finalScore = this.computeFinalScore(weightedScores);
      
      // 8. 生成解释
      const interpretation = this.generateInterpretation(
        finalScore,
        rawScores,
        weightedScores
      );
      
      // 构建结果
      const result: ImportanceScore = {
        score: finalScore,
        factors: {
          contentLength: rawScores.contentLength,
          emotionalIntensity: rawScores.emotionalIntensity,
          temporalRelevance: rawScores.temporalRelevance,
          semanticRichness: rawScores.semanticRichness,
        },
        breakdown: {
          rawScores,
          weightedScores,
          normalization: this.config.normalization,
        },
        interpretation,
      };
      
      // 更新统计
      this.updateStatistics(result.score);
      
      // 缓存结果
      this.scoreCache.set(cacheKey, result);
      this.cleanCache();
      
      const processingTime = Date.now() - startTime;
      this.statistics.processingTimes.push(processingTime);
      
      console.log(`[ImportanceScorer] 重要性得分: ${result.score.toFixed(1)} (${processingTime}ms)`);
      console.log(`  - 内容长度: ${(rawScores.contentLength * 100).toFixed(0)}%`);
      console.log(`  - 情感强度: ${(rawScores.emotionalIntensity * 100).toFixed(0)}%`);
      console.log(`  - 时间相关: ${(rawScores.temporalRelevance * 100).toFixed(0)}%`);
      console.log(`  - 语义丰富: ${(rawScores.semanticRichness * 100).toFixed(0)}%`);
      
      return result;
      
    } catch (error) {
      console.error('[ImportanceScorer] 重要性计算失败:', error);
      
      // 返回默认得分
      return this.getFallbackScore(content, classification, tagging);
    }
  }

  /**
   * 批量计算重要性
   */
  batchCalculate(
    items: Array<{ content: string; classification: ClassificationResult; tagging: TaggingResult }>
  ): ImportanceScore[] {
    const results: ImportanceScore[] = [];
    
    for (let i = 0; i < items.length; i++) {
      console.log(`[ImportanceScorer] 批量计算: ${i + 1}/${items.length}`);
      const { content, classification, tagging } = items[i];
      const result = this.calculate(content, classification, tagging);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const avgProcessingTime = this.statistics.processingTimes.length > 0
      ? this.statistics.processingTimes.reduce((a, b) => a + b, 0) / this.statistics.processingTimes.length
      : 0;
    
    return {
      totalScored: this.statistics.totalScored,
      averageScore: this.statistics.averageScore,
      scoreDistribution: this.statistics.scoreDistribution,
      cacheSize: this.scoreCache.size,
      averageProcessingTime: avgProcessingTime,
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.scoreCache.clear();
    console.log('[ImportanceScorer] 缓存已清除');
  }

  /**
   * 导出来要性报告
   */
  exportReport(): string {
    const stats = this.getStatistics();
    const now = new Date();
    
    return `
重要性评分报告
=============

生成时间: ${now.toISOString()}

统计概览
--------
- 总评分次数: ${stats.totalScored}
- 平均重要性得分: ${stats.averageScore.toFixed(1)}
- 平均处理时间: ${stats.averageProcessingTime.toFixed(1)}ms
- 缓存大小: ${stats.cacheSize}

得分分布
--------
- 0-20分: ${stats.scoreDistribution['0-20']} 次
- 21-40分: ${stats.scoreDistribution['21-40']} 次
- 41-60分: ${stats.scoreDistribution['41-60']} 次
- 61-80分: ${stats.scoreDistribution['61-80']} 次
- 81-100分: ${stats.scoreDistribution['81-100']} 次

权重配置
--------
- 内容长度权重: ${this.config.factors.contentLengthWeight}
- 情感强度权重: ${this.config.factors.emotionalIntensityWeight}
- 时间相关权重: ${this.config.factors.temporalRelevanceWeight}
- 语义丰富权重: ${this.config.factors.semanticRichnessWeight}
- 访问频率权重: ${this.config.factors.accessFrequencyWeight}

建议
----
${this.generateRecommendations(stats)}
`;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ImportanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[ImportanceScorer] 配置已更新');
  }

  // ============ 私有方法 ============

  /**
   * 分析内容
   */
  private analyzeContent(content: string): ContentAnalysis {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = content.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    
    const wordCount = words.length;
    const sentenceCount = Math.max(sentences.length, 1);
    const avgWordLength = wordCount > 0
      ? words.reduce((sum, word) => sum + word.length, 0) / wordCount
      : 0;
    
    // 简单的可读性评分（基于句子长度和词汇多样性）
    const avgSentenceLength = wordCount / sentenceCount;
    const readabilityScore = this.calculateReadability(avgSentenceLength, avgWordLength);
    
    const uniqueWordRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;
    
    return {
      wordCount,
      sentenceCount,
      avgWordLength,
      readabilityScore,
      uniqueWordRatio,
    };
  }

  /**
   * 分析情感
   */
  private analyzeEmotions(tagging: TaggingResult): {
    primaryEmotion: string;
    intensity: number;
    emotionCount: number;
  } {
    if (!tagging.emotionTags || tagging.emotionTags.length === 0) {
      return {
        primaryEmotion: 'neutral',
        intensity: 0.2,
        emotionCount: 0,
      };
    }
    
    // 使用情感得分计算主要情感
    let primaryEmotion = 'neutral';
    let maxScore = 0;
    
    for (const [emotion, score] of Object.entries(tagging.emotionScores || {})) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    }
    
    // 计算情感强度
    const baseIntensity = EMOTION_INTENSITY_MAP[primaryEmotion] || 0.3;
    const intensity = Math.min(baseIntensity + (maxScore * 0.3), 1.0);
    
    return {
      primaryEmotion,
      intensity,
      emotionCount: tagging.emotionTags.length,
    };
  }

  /**
   * 分析时间
   */
  private analyzeTemporal(): TemporalAnalysis {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    return {
      ageInHours: 0, // 假设是新内容
      timeOfDay: hour,
      dayOfWeek: day,
      isRecent: true, // 总是认为是最近的（简化）
      isPeakTime: hour >= 9 && hour <= 17,
    };
  }

  /**
   * 分析语义
   */
  private analyzeSemantic(content: string, tagging: TaggingResult): {
    keywordCount: number;
    entityCount: number;
    tagDensity: number;
    semanticDiversity: number;
  } {
    const keywordCount = tagging.keywordTags?.length || 0;
    const entityCount = Object.values(tagging.extractedEntities || {}).flat().length;
    const wordCount = content.split(/\s+/).length;
    
    const tagDensity = wordCount > 0
      ? (keywordCount + entityCount) / wordCount
      : 0;
    
    // 简单的语义多样性评分
    const semanticDiversity = Math.min(
      (keywordCount * 0.3) + (entityCount * 0.2) + (tagDensity * 0.5),
      1.0
    );
    
    return {
      keywordCount,
      entityCount,
      tagDensity,
      semanticDiversity,
    };
  }

  /**
   * 计算原始得分
   */
  private calculateRawScores(
    content: ContentAnalysis,
    emotions: ReturnType<typeof this.analyzeEmotions>,
    temporal: TemporalAnalysis,
    semantic: ReturnType<typeof this.analyzeSemantic>
  ): Record<string, number> {
    // 1. 内容长度得分（基于词数，S型函数）
    const contentLengthScore = this.sigmoid(content.wordCount, 50, 0.05);
    
    // 2. 情感强度得分
    const emotionalIntensityScore = emotions.intensity;
    
    // 3. 时间相关性得分（基于时间衰减）
    const temporalRelevanceScore = this.calculateTimeRelevance(temporal);
    
    // 4. 语义丰富度得分
    const semanticRichnessScore = semantic.semanticDiversity;
    
    // 5. 访问频率得分（默认为0.5，需要实际数据）
    const accessFrequencyScore = 0.5;
    
    return {
      contentLength: contentLengthScore,
      emotionalIntensity: emotionalIntensityScore,
      temporalRelevance: temporalRelevanceScore,
      semanticRichness: semanticRichnessScore,
      accessFrequency: accessFrequencyScore,
    };
  }

  /**
   * 应用权重
   */
  private applyWeights(rawScores: Record<string, number>): Record<string, number> {
    return {
      contentLength: rawScores.contentLength * this.config.factors.contentLengthWeight,
      emotionalIntensity: rawScores.emotionalIntensity * this.config.factors.emotionalIntensityWeight,
      temporalRelevance: rawScores.temporalRelevance * this.config.factors.temporalRelevanceWeight,
      semanticRichness: rawScores.semanticRichness * this.config.factors.semanticRichnessWeight,
      accessFrequency: (rawScores.accessFrequency || 0) * this.config.factors.accessFrequencyWeight,
    };
  }

  /**
   * 计算最终得分
   */
  private computeFinalScore(weightedScores: Record<string, number>): number {
    const sum = Object.values(weightedScores).reduce((a, b) => a + b, 0);
    const normalized = this.normalizeScore(sum);
    
    // 转换为0-100分
    return Math.round(normalized * 100);
  }

  /**
   * 生成解释
   */
  private generateInterpretation(
    finalScore: number,
    rawScores: Record<string, number>,
    weightedScores: Record<string, number>
  ): string {
    const scoreLevel = this.getScoreLevel(finalScore);
    const dominantFactor = this.getDominantFactor(weightedScores);
    
    let interpretation = `重要性评分: ${finalScore}/100 (${scoreLevel})`;
    
    if (dominantFactor) {
      interpretation += `。主要影响因子: ${dominantFactor}`;
    }
    
    // 添加详细解释
    if (finalScore >= 80) {
      interpretation += '。这是一条非常重要、高质量的记忆，建议优先保存和回顾。';
    } else if (finalScore >= 60) {
      interpretation += '。这是一条比较重要的记忆，值得妥善管理。';
    } else if (finalScore >= 40) {
      interpretation += '。这是一条普通记忆，可根据需要处理。';
    } else {
      interpretation += '。这是一条低重要性记忆，可以考虑精简或归档。';
    }
    
    return interpretation;
  }

  /**
   * 计算可读性
   */
  private calculateReadability(avgSentenceLength: number, avgWordLength: number): number {
    // 简单的可读性公式（越小越难读）
    const difficulty = (avgSentenceLength * 0.5) + (avgWordLength * 0.5);
    
    // 转换为0-1得分（越高越易读）
    return Math.max(0, 1 - (difficulty / 20));
  }

  /**
   * 计算时间相关性
   */
  private calculateTimeRelevance(temporal: TemporalAnalysis): number {
    // 时间衰减函数
    const decayFactor = Math.pow(0.5, temporal.ageInHours / TIME_DECAY_PARAMS.halfLifeHours);
    const timeRelevance = TIME_DECAY_PARAMS.minRelevance + 
      (TIME_DECAY_PARAMS.maxRelevance - TIME_DECAY_PARAMS.minRelevance) * decayFactor;
    
    // 时间加成（高峰时间内容可能更重要）
    const timeBonus = temporal.isPeakTime ? 0.1 : 0;
    
    return Math.min(timeRelevance + timeBonus, 1.0);
  }

  /**
   * S型函数（将值映射到0-1）
   */
  private sigmoid(x: number, midpoint: number, steepness: number): number {
    return 1 / (1 + Math.exp(-steepness * (x - midpoint)));
  }

  /**
   * 标准化得分
   */
  private normalizeScore(score: number): number {
    switch (this.config.normalization) {
      case 'minmax':
        // 简单的最小-最大标准化到0-1
        return Math.max(0, Math.min(score, 1));
      
      case 'zscore':
        // Z-score标准化（简化版）
        return (score - 0.5) / 0.2;
      
      case 'decimal':
      default:
        return score;
    }
  }

  /**
   * 获取得分等级
   */
  private getScoreLevel(score: number): string {
    if (score >= 90) return '极高';
    if (score >= 80) return '高';
    if (score >= 70) return '中高';
    if (score >= 60) return '中等';
    if (score >= 50) return '中低';
    if (score >= 40) return '低';
    return '极低';
  }

  /**
   * 获取主导因子
   */
  private getDominantFactor(weightedScores: Record<string, number>): string {
    const factorNames: Record<string, string> = {
      contentLength: '内容长度',
      emotionalIntensity: '情感强度',
      temporalRelevance: '时间相关',
      semanticRichness: '语义丰富',
      accessFrequency: '访问频率',
    };
    
    let dominantFactor = '';
    let maxWeight = 0;
    
    for (const [factor, weight] of Object.entries(weightedScores)) {
      if (weight > maxWeight) {
        maxWeight = weight;
        dominantFactor = factorNames[factor] || factor;
      }
    }
    
    return dominantFactor;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    content: string,
    classification: ClassificationResult,
    tagging: TaggingResult
  ): string {
    const contentHash = this.simpleHash(content.substring(0, 100));
    const category = classification.category;
    const tagCount = tagging.allTags?.length || 0;
    
    return `importance_${contentHash}_${category}_${tagCount}`;
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < Math.min(str.length, 100); i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }

  /**
   * 更新统计
   */
  private updateStatistics(score: number): void {
    this.statistics.totalScored++;
    
    // 更新平均分
    this.statistics.averageScore = 
      ((this.statistics.averageScore * (this.statistics.totalScored - 1)) + score) / 
      this.statistics.totalScored;
    
    // 更新得分分布
    let bucket: string;
    if (score <= 20) bucket = '0-20';
    else if (score <= 40) bucket = '21-40';
    else if (score <= 60) bucket = '41-60';
    else if (score <= 80) bucket = '61-80';
    else bucket = '81-100';
    
    this.statistics.scoreDistribution[bucket]++;
  }

  /**
   * 清理缓存
   */
  private cleanCache(): void {
    const maxCacheSize = 1000;
    
    if (this.scoreCache.size > maxCacheSize) {
      const keysToRemove = Array.from(this.scoreCache.keys())
        .slice(0, this.scoreCache.size - maxCacheSize);
      
      for (const key of keysToRemove) {
        this.scoreCache.delete(key);
      }
      
      console.log(`[ImportanceScorer] 清理缓存: 移除了 ${keysToRemove.length} 个条目`);
    }
  }

  /**
   * 获取降级得分
   */
  private getFallbackScore(
    content: string,
    classification: ClassificationResult,
    tagging: TaggingResult
  ): ImportanceScore {
    const wordCount = content.split(/\s+/).length;
    const contentLengthScore = Math.min(wordCount / 100, 1.0);
    
    const defaultScore = 50;
    
    return {
      score: defaultScore,
      factors: {
        contentLength: contentLengthScore,
        emotionalIntensity: 0.5,
        temporalRelevance: 0.5,
        semanticRichness: 0.5,
      },
      breakdown: {
        rawScores: {
          contentLength: contentLengthScore,
          emotionalIntensity: 0.5,
          temporalRelevance: 0.5,
          semanticRichness: 0.5,
          accessFrequency: 0.5,
        },
        weightedScores: {
          contentLength: contentLengthScore * this.config.factors.contentLengthWeight,
          emotionalIntensity: 0.5 * this.config.factors.emotionalIntensityWeight,
          temporalRelevance: 0.5 * this.config.factors.temporalRelevanceWeight,
          semanticRichness: 0.5 * this.config.factors.semanticRichnessWeight,
          accessFrequency: 0.5 * this.config.factors.accessFrequencyWeight,
        },
        normalization: this.config.normalization,
      },
      interpretation: '重要性计算失败，使用默认得分',
    };
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(stats: any): string {
    const recommendations: string[] = [];
    
    if (stats.averageScore < 40) {
      recommendations.push('- 平均重要性得分较低(<40)，建议检查内容质量或调整权重配置');
    }
    
    if (stats.scoreDistribution['81-100'] === 0) {
      recommendations.push('- 缺乏高重要性记忆(81-100分)，建议关注高质量内容创建');
    }
    
    if (stats.scoreDistribution['0-20'] > stats.totalScored * 0.5) {
      recommendations.push('- 低重要性记忆占比过高(>50%)，建议优化记忆筛选标准');
    }
    
    if (stats.averageProcessingTime > 100) {
      recommendations.push('- 处理时间较长(>100ms)，建议优化算法或启用缓存');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- 系统运行良好，暂无优化建议');
    }
    
    return recommendations.join('\n');
  }
}

/**
 * 导出工具函数
 */
export function createImportanceScorer(config?: Partial<ImportanceConfig>): ImportanceScorer {
  const fullConfig: ImportanceConfig = {
    factors: DEFAULT_IMPORTANCE_WEIGHTS,
    normalization: 'minmax',
    ...config,
  };
  
  return new ImportanceScorer(fullConfig);
}

/**
 * 快速重要性评分函数
 */
export function quickImportanceScore(
  content: string,
  classification: ClassificationResult,
  tagging: TaggingResult,
  config?: Partial<ImportanceConfig>
): ImportanceScore {
  const scorer = createImportanceScorer(config);
  return scorer.calculate(content, classification, tagging);
}