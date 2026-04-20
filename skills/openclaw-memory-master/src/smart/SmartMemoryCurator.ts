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
import { AutoClassifier, ClassificationResult as ClassifierResult } from './AutoClassifier';
import { AutoTagger, TaggingResult as TaggerResult } from './AutoTagger';
import { DeduplicationEngine } from './DeduplicationEngine';
import { ImportanceScorer } from './ImportanceScorer';
import { RelationDiscoverer } from './RelationDiscoverer';

// ============ 类型定义 ============

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
  // 分类信息
  category: string;
  categoryConfidence: number;
  
  // 标签信息
  tags: string[];
  emotionTags: string[];
  keywordTags: string[];
  
  // 去重信息
  isDuplicate: boolean;
  duplicateOf?: string;  // 重复的记忆ID
  similarityScore?: number;  // 相似度得分 0-1
  
  // 重要性评分
  importance: number;  // 0-100
  importanceFactors: {
    contentLength: number;      // 内容长度因子
    emotionalIntensity: number; // 情感强度因子
    temporalRelevance: number;  // 时间相关性因子
    semanticRichness: number;   // 语义丰富度因子
  };
  
  // 关系发现
  relatedMemoryIds: string[];
  relationTypes: string[];  // 'similar', 'sequential', 'contrasting', etc.
  
  // 元数据增强
  enhancedMetadata: Record<string, any>;
  
  // 处理状态
  processedAt: number;
  processingTime: number;
}

/**
 * 分类器配置
 */
export interface ClassifierConfig {
  useLLM: boolean;              // 是否使用LLM进行精细分类
  llmThreshold: number;         // LLM分类置信度阈值 (0-1)
  ruleBasedFallback: boolean;   // 规则后备
  categories: string[];         // 预定义类别
}

/**
 * 打标器配置
 */
export interface TaggerConfig {
  maxKeywords: number;          // 最大关键词数量
  minKeywordLength: number;     // 最小关键词长度
  emotionDetection: boolean;    // 情感检测
  extractEntities: boolean;     // 实体提取
}

/**
 * 去重器配置
 */
export interface DeduplicationConfig {
  similarityThreshold: number;  // 相似度阈值 (0-1)
  semanticCheck: boolean;       // 语义相似度检查
  exactMatch: boolean;          // 精确匹配检查
  fuzzyMatch: boolean;          // 模糊匹配检查
}

/**
 * 重要性评分配置
 */
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

/**
 * 智能记忆整理器配置
 */
export interface SmartMemoryCuratorConfig {
  classifier: ClassifierConfig;
  tagger: TaggerConfig;
  deduplication: DeduplicationConfig;
  importance: ImportanceConfig;
  autoProcess: boolean;          // 是否自动处理新记忆
  batchSize: number;             // 批量处理大小
  cacheSize: number;             // 缓存大小
}

// ============ 默认配置 ============

export const DEFAULT_CONFIG: SmartMemoryCuratorConfig = {
  classifier: {
    useLLM: true,
    llmThreshold: 0.7,
    ruleBasedFallback: true,
    categories: [
      'technical',     // 技术
      'life',          // 生活
      'project',       // 项目
      'learning',      // 学习
      'entertainment', // 娱乐
      'work',          // 工作
      'health',        // 健康
      'finance',       // 财务
      'social',        // 社交
      'other',         // 其他
    ],
  },
  tagger: {
    maxKeywords: 10,
    minKeywordLength: 2,
    emotionDetection: true,
    extractEntities: true,
  },
  deduplication: {
    similarityThreshold: 0.85,
    semanticCheck: true,
    exactMatch: true,
    fuzzyMatch: true,
  },
  importance: {
    factors: {
      contentLengthWeight: 0.25,
      emotionalIntensityWeight: 0.20,
      temporalRelevanceWeight: 0.15,
      semanticRichnessWeight: 0.25,
      accessFrequencyWeight: 0.15,
    },
    normalization: 'minmax',
  },
  autoProcess: true,
  batchSize: 50,
  cacheSize: 1000,
};

// ============ 智能记忆整理器 ============

/**
 * 智能记忆整理器
 * 
 * 核心类，协调所有智能处理模块
 */
export class SmartMemoryCurator {
  private config: SmartMemoryCuratorConfig;
  private classifier: AutoClassifier;
  private tagger: AutoTagger;
  private deduper: DeduplicationEngine;
  private importanceScorer: ImportanceScorer;
  private relationDiscoverer: RelationDiscoverer;
  
  private analysisCache: Map<string, AnalysisResult>;
  private statistics: {
    totalProcessed: number;
    totalDuplicatesFound: number;
    totalImportanceScore: number;
    processingTimes: number[];
  };

  constructor(config: Partial<SmartMemoryCuratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // 初始化子模块
    this.classifier = new AutoClassifier(this.config.classifier);
    this.tagger = new AutoTagger(this.config.tagger);
    this.deduper = new DeduplicationEngine(this.config.deduplication);
    this.importanceScorer = new ImportanceScorer(this.config.importance);
    this.relationDiscoverer = new RelationDiscoverer();
    
    // 初始化缓存和统计
    this.analysisCache = new Map();
    this.statistics = {
      totalProcessed: 0,
      totalDuplicatesFound: 0,
      totalImportanceScore: 0,
      processingTimes: [],
    };
    
    console.log('[SmartMemoryCurator] 初始化完成');
  }

  /**
   * 分析单个记忆
   */
  async analyze(memory: RawMemory): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log(`[SmartMemoryCurator] 开始分析记忆: ${memory.id || 'new-memory'}`);
      
      // 1. 分类
      const classification = await this.classifier.classify(memory.content);
      
      // 2. 打标
      const tagging = await this.tagger.tag(memory.content);
      
      // 3. 去重检查（需要与其他记忆比较）
      const duplication = await this.deduper.checkDuplicate(memory);
      
      // 4. 重要性评分
      const importance = this.importanceScorer.calculate(
        memory.content,
        classification,
        tagging
      );
      
      // 5. 关系发现（需要访问记忆库，这里先返回空）
      const relations = await this.relationDiscoverer.discoverRelations(memory);
      
      // 构建分析结果
      const result: AnalysisResult = {
        category: classification.category,
        categoryConfidence: classification.confidence,
        tags: tagging.allTags,
        emotionTags: tagging.emotionTags,
        keywordTags: tagging.keywordTags,
        isDuplicate: duplication.isDuplicate,
        duplicateOf: duplication.duplicateOf,
        similarityScore: duplication.similarityScore,
        importance: importance.score,
        importanceFactors: importance.factors,
        relatedMemoryIds: relations.relatedIds,
        relationTypes: relations.relationTypes,
        enhancedMetadata: {
          ...memory.metadata,
          analyzed: true,
          classification,
          tagging,
          duplication,
          importance,
          relations,
        },
        processedAt: Date.now(),
        processingTime: 0, // 将在最后计算
      };
      
      // 计算处理时间
      const processingTime = Date.now() - startTime;
      result.processingTime = processingTime;
      
      // 更新统计
      this.statistics.totalProcessed++;
      this.statistics.processingTimes.push(processingTime);
      if (duplication.isDuplicate) {
        this.statistics.totalDuplicatesFound++;
      }
      this.statistics.totalImportanceScore += importance.score;
      
      // 缓存结果
      if (memory.id) {
        this.analysisCache.set(memory.id, result);
        // 保持缓存大小
        if (this.analysisCache.size > this.config.cacheSize) {
          const oldestKey = this.analysisCache.keys().next().value;
          this.analysisCache.delete(oldestKey);
        }
      }
      
      console.log(`[SmartMemoryCurator] 分析完成: ${memory.id || 'new-memory'} (${processingTime}ms)`);
      console.log(`  - 分类: ${classification.category} (${classification.confidence.toFixed(2)})`);
      console.log(`  - 标签: ${tagging.allTags.slice(0, 5).join(', ')}${tagging.allTags.length > 5 ? '...' : ''}`);
      console.log(`  - 去重: ${duplication.isDuplicate ? '是' : '否'} ${duplication.isDuplicate ? `(相似度: ${duplication.similarityScore?.toFixed(2)})` : ''}`);
      console.log(`  - 重要性: ${importance.score.toFixed(1)}/100`);
      
      return result;
      
    } catch (error) {
      console.error('[SmartMemoryCurator] 分析失败:', error);
      
      // 返回降级结果
      const fallbackResult: AnalysisResult = {
        category: 'other',
        categoryConfidence: 0.5,
        tags: ['unprocessed'],
        emotionTags: [],
        keywordTags: [],
        isDuplicate: false,
        importance: 50,
        importanceFactors: {
          contentLength: 0.5,
          emotionalIntensity: 0.5,
          temporalRelevance: 0.5,
          semanticRichness: 0.5,
        },
        relatedMemoryIds: [],
        relationTypes: [],
        enhancedMetadata: {
          ...memory.metadata,
          analyzed: false,
          error: String(error),
        },
        processedAt: Date.now(),
        processingTime: Date.now() - startTime,
      };
      
      return fallbackResult;
    }
  }

  /**
   * 批量分析记忆
   */
  async batchAnalyze(memories: RawMemory[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    // 分批处理
    for (let i = 0; i < memories.length; i += this.config.batchSize) {
      const batch = memories.slice(i, i + this.config.batchSize);
      console.log(`[SmartMemoryCurator] 批量处理: ${i + 1}-${Math.min(i + this.config.batchSize, memories.length)}/${memories.length}`);
      
      const batchResults = await Promise.all(
        batch.map(memory => this.analyze(memory))
      );
      
      results.push(...batchResults);
      
      // 避免过载
      if (i + this.config.batchSize < memories.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * 获取缓存的分析结果
   */
  getCachedAnalysis(memoryId: string): AnalysisResult | null {
    return this.analysisCache.get(memoryId) || null;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.analysisCache.clear();
    console.log('[SmartMemoryCurator] 缓存已清除');
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const avgProcessingTime = this.statistics.processingTimes.length > 0
      ? this.statistics.processingTimes.reduce((a, b) => a + b, 0) / this.statistics.processingTimes.length
      : 0;
    
    const avgImportance = this.statistics.totalProcessed > 0
      ? this.statistics.totalImportanceScore / this.statistics.totalProcessed
      : 0;
    
    const duplicateRate = this.statistics.totalProcessed > 0
      ? this.statistics.totalDuplicatesFound / this.statistics.totalProcessed
      : 0;
    
    return {
      totalProcessed: this.statistics.totalProcessed,
      totalDuplicatesFound: this.statistics.totalDuplicatesFound,
      duplicateRate: duplicateRate,
      averageProcessingTime: avgProcessingTime,
      averageImportanceScore: avgImportance,
      cacheSize: this.analysisCache.size,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  /**
   * 智能整理记忆库（高级功能）
   */
  async organizeMemoryBank(memories: LayeredMemory[]): Promise<{
    organized: LayeredMemory[];
    duplicatesRemoved: number;
    categoriesUpdated: number;
    tagsAdded: number;
  }> {
    console.log(`[SmartMemoryCurator] 开始智能整理记忆库: ${memories.length} 条记忆`);
    
    let duplicatesRemoved = 0;
    let categoriesUpdated = 0;
    let tagsAdded = 0;
    
    const organized: LayeredMemory[] = [];
    const processedIds = new Set<string>();
    
    for (const memory of memories) {
      if (processedIds.has(memory.id)) {
        continue;
      }
      
      try {
        // 分析记忆
        const analysis = await this.analyze({
          id: memory.id,
          content: memory.content,
          timestamp: memory.timestamp,
          metadata: memory.metadata,
        });
        
        // 更新记忆的元数据
        const updatedMemory: LayeredMemory = {
          ...memory,
          type: analysis.category,
          tags: [...(memory.tags || []), ...analysis.tags].filter((tag, index, array) => 
            array.indexOf(tag) === index
          ),
          metadata: {
            ...memory.metadata,
            ...analysis.enhancedMetadata,
          },
        };
        
        organized.push(updatedMemory);
        processedIds.add(memory.id);
        
        // 统计更新
        if (memory.type !== analysis.category) {
          categoriesUpdated++;
        }
        if (analysis.tags.length > 0) {
          tagsAdded += analysis.tags.length;
        }
        
      } catch (error) {
        console.error(`[SmartMemoryCurator] 整理记忆失败 ${memory.id}:`, error);
        organized.push(memory); // 保留原始记忆
        processedIds.add(memory.id);
      }
    }
    
    // 去重处理
    const deduplicated = await this.deduper.deduplicateBatch(organized);
    duplicatesRemoved = organized.length - deduplicated.length;
    
    console.log(`[SmartMemoryCurator] 智能整理完成:`);
    console.log(`  - 整理后记忆: ${deduplicated.length} 条`);
    console.log(`  - 移除重复: ${duplicatesRemoved} 条`);
    console.log(`  - 更新分类: ${categoriesUpdated} 条`);
    console.log(`  - 添加标签: ${tagsAdded} 个`);
    
    return {
      organized: deduplicated,
      duplicatesRemoved,
      categoriesUpdated,
      tagsAdded,
    };
  }

  /**
   * 导出分析报告
   */
  exportReport(): string {
    const stats = this.getStatistics();
    const now = new Date();
    
    return `
智能记忆整理报告
==================

生成时间: ${now.toISOString()}

统计概览
--------
- 总处理记忆数: ${stats.totalProcessed}
- 发现重复记忆: ${stats.totalDuplicatesFound}
- 平均重复率: ${(stats.duplicateRate * 100).toFixed(1)}%
- 平均处理时间: ${stats.averageProcessingTime.toFixed(1)}ms
- 平均重要性评分: ${stats.averageImportanceScore.toFixed(1)}/100
- 缓存大小: ${stats.cacheSize}
- 缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%

配置信息
--------
- 自动分类: ${this.config.classifier.useLLM ? 'LLM+规则' : '仅规则'}
- 情感检测: ${this.config.tagger.emotionDetection ? '开启' : '关闭'}
- 实体提取: ${this.config.tagger.extractEntities ? '开启' : '关闭'}
- 去重阈值: ${this.config.deduplication.similarityThreshold}
- 自动处理: ${this.config.autoProcess ? '开启' : '关闭'}

建议
----
${this.generateRecommendations(stats)}
`;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<SmartMemoryCuratorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[SmartMemoryCurator] 配置已更新');
  }

  /**
   * 销毁资源
   */
  destroy(): void {
    this.clearCache();
    console.log('[SmartMemoryCurator] 资源已清理');
  }

  // ============ 私有方法 ============

  /**
   * 计算缓存命中率（简化版）
   */
  private calculateCacheHitRate(): number {
    // 这里应该实现实际的缓存命中率计算
    // 简化实现：返回一个估计值
    return this.analysisCache.size > 100 ? 0.75 : 0.5;
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(stats: any): string {
    const recommendations: string[] = [];
    
    if (stats.duplicateRate > 0.3) {
      recommendations.push('- 重复率较高(>30%)，建议降低去重相似度阈值');
    }
    
    if (stats.averageProcessingTime > 1000) {
      recommendations.push('- 处理时间较长(>1s)，建议减少LLM调用或增大批量处理大小');
    }
    
    if (stats.cacheHitRate < 0.6) {
      recommendations.push('- 缓存命中率较低(<60%)，建议增大缓存大小');
    }
    
    if (stats.averageImportanceScore < 40) {
      recommendations.push('- 平均重要性评分较低(<40)，建议检查内容质量');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- 系统运行良好，暂无优化建议');
    }
    
    return recommendations.join('\n');
  }
}



