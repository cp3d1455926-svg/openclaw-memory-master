"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationDiscoverer = exports.RELATION_STRENGTH_MAPPING = exports.RELATION_TYPES = exports.DEFAULT_RELATION_CONFIG = void 0;
exports.createRelationDiscoverer = createRelationDiscoverer;
exports.quickDiscoverRelations = quickDiscoverRelations;
// ============ 常量定义 ============
/**
 * 默认关系配置
 */
exports.DEFAULT_RELATION_CONFIG = {
    similarityThreshold: 0.6,
    entityWeight: 0.35,
    temporalWeight: 0.25,
    semanticWeight: 0.25,
    categoryWeight: 0.15,
    maxRelatedMemories: 5,
    enableCausalInference: true,
};
/**
 * 关系类型定义
 */
exports.RELATION_TYPES = {
    ENTITY_COOCCURRENCE: 'entity_cooccurrence', // 实体共现
    TEMPORAL_PROXIMITY: 'temporal_proximity', // 时间相近
    SEMANTIC_SIMILARITY: 'semantic_similarity', // 语义相似
    CATEGORY_SIMILARITY: 'category_similarity', // 分类相似
    CAUSAL_RELATION: 'causal_relation', // 因果关系
    LOGICAL_ASSOCIATION: 'logical_association', // 逻辑关联
    EMOTIONAL_CONNECTION: 'emotional_connection', // 情感连接
    THEMATIC_RELATION: 'thematic_relation', // 主题相关
};
/**
 * 关系强度映射
 */
exports.RELATION_STRENGTH_MAPPING = {
    weak: 0.3, // 弱关系
    moderate: 0.6, // 中等关系
    strong: 0.85, // 强关系
    very_strong: 0.95, // 很强关系
};
// ============ 关系发现器 ============
/**
 * 关系发现器
 *
 * 基于多维度分析发现记忆之间的关系
 */
class RelationDiscoverer {
    constructor(config) {
        this.config = { ...exports.DEFAULT_RELATION_CONFIG, ...config };
        this.memoryRegistry = new Map();
        this.statistics = {
            totalDiscoveries: 0,
            averageRelationsPerMemory: 0,
            relationTypeDistribution: {},
            processingTimes: [],
        };
        // 初始化关系类型统计
        Object.values(exports.RELATION_TYPES).forEach(type => {
            this.statistics.relationTypeDistribution[type] = 0;
        });
        console.log('[RelationDiscoverer] 初始化完成');
    }
    /**
     * 发现记忆关系
     */
    async discoverRelations(memory) {
        const startTime = Date.now();
        try {
            console.log(`[RelationDiscoverer] 发现关系: ${memory.id || 'new-memory'}`);
            // 如果没有足够的历史记忆，返回空结果
            if (this.memoryRegistry.size === 0) {
                console.log('[RelationDiscoverer] 无历史记忆，跳过关系发现');
                return { relatedIds: [], relationTypes: [] };
            }
            // 1. 提取当前记忆的特征
            const currentFeatures = await this.extractFeatures(memory);
            // 2. 与历史记忆比较
            const candidateMatches = [];
            for (const [memId, existingMemory] of this.memoryRegistry.entries()) {
                if (memId === memory.id) {
                    continue; // 跳过自身
                }
                const existingFeatures = await this.extractFeatures(existingMemory);
                const matchResult = await this.compareFeatures(currentFeatures, existingFeatures, memory, existingMemory);
                if (matchResult.strength >= this.config.similarityThreshold) {
                    candidateMatches.push({
                        id: memId,
                        relationTypes: matchResult.relationTypes,
                        strength: matchResult.strength,
                        details: matchResult.details,
                    });
                }
            }
            // 3. 按关系强度排序，取前N个
            candidateMatches.sort((a, b) => b.strength - a.strength);
            const topMatches = candidateMatches.slice(0, this.config.maxRelatedMemories);
            // 4. 构建结果
            const relatedIds = topMatches.map(match => match.id);
            const relationTypes = Array.from(new Set(topMatches.flatMap(match => match.relationTypes)));
            // 5. 更新统计
            this.updateStatistics(relatedIds.length, relationTypes);
            // 6. 注册当前记忆（用于后续发现）
            if (memory.id) {
                this.memoryRegistry.set(memory.id, memory);
                // 保持注册表大小
                if (this.memoryRegistry.size > 1000) {
                    const oldestKey = this.memoryRegistry.keys().next().value;
                    this.memoryRegistry.delete(oldestKey);
                }
            }
            const processingTime = Date.now() - startTime;
            this.statistics.processingTimes.push(processingTime);
            console.log(`[RelationDiscoverer] 发现 ${relatedIds.length} 个相关记忆`);
            console.log(`  - 关系类型: ${relationTypes.join(', ')}`);
            console.log(`  - 处理时间: ${processingTime}ms`);
            // 为了兼容现有接口，只返回ID和类型
            return { relatedIds, relationTypes };
        }
        catch (error) {
            console.error('[RelationDiscoverer] 关系发现失败:', error);
            return {
                relatedIds: [],
                relationTypes: [],
            };
        }
    }
    /**
     * 批量发现关系（增强版）
     */
    async discoverRelationsEnhanced(memory) {
        const startTime = Date.now();
        try {
            console.log(`[RelationDiscoverer] 增强关系发现: ${memory.id || 'new-memory'}`);
            if (this.memoryRegistry.size === 0) {
                return {
                    relatedIds: [],
                    relationTypes: [],
                    relationStrengths: [],
                    details: {
                        entityMatches: [],
                        temporalMatches: [],
                        semanticMatches: [],
                        categoryMatches: [],
                    },
                    explanation: '无历史记忆可供比较',
                };
            }
            const currentFeatures = await this.extractFeatures(memory);
            const entityMatches = [];
            const temporalMatches = [];
            const semanticMatches = [];
            const categoryMatches = [];
            const allMatches = [];
            for (const [memId, existingMemory] of this.memoryRegistry.entries()) {
                if (memId === memory.id) {
                    continue;
                }
                const existingFeatures = await this.extractFeatures(existingMemory);
                const comparison = await this.detailedCompare(currentFeatures, existingFeatures, memory, existingMemory);
                if (comparison.overallScore >= this.config.similarityThreshold) {
                    allMatches.push({
                        id: memId,
                        relationTypes: comparison.relationTypes,
                        strength: comparison.overallScore,
                        entityScore: comparison.entityScore,
                        temporalScore: comparison.temporalScore,
                        semanticScore: comparison.semanticScore,
                        categoryScore: comparison.categoryScore,
                    });
                    // 记录详细匹配信息
                    if (comparison.entityScore > 0) {
                        entityMatches.push({
                            id: memId,
                            entities: comparison.matchedEntities,
                            matchScore: comparison.entityScore,
                        });
                    }
                    if (comparison.temporalScore > 0) {
                        temporalMatches.push({
                            id: memId,
                            timeDiffHours: comparison.timeDiffHours,
                            matchScore: comparison.temporalScore,
                        });
                    }
                    if (comparison.semanticScore > 0) {
                        semanticMatches.push({
                            id: memId,
                            similarity: comparison.semanticSimilarity,
                            matchScore: comparison.semanticScore,
                        });
                    }
                    if (comparison.categoryScore > 0) {
                        categoryMatches.push({
                            id: memId,
                            category: existingFeatures.category || 'unknown',
                            matchScore: comparison.categoryScore,
                        });
                    }
                }
            }
            // 排序和筛选
            allMatches.sort((a, b) => b.strength - a.strength);
            const topMatches = allMatches.slice(0, this.config.maxRelatedMemories);
            const relatedIds = topMatches.map(match => match.id);
            const relationTypes = Array.from(new Set(topMatches.flatMap(match => match.relationTypes)));
            const relationStrengths = topMatches.map(match => match.strength);
            // 生成解释
            const explanation = this.generateExplanation(relatedIds.length, relationTypes, topMatches);
            const processingTime = Date.now() - startTime;
            // 注册当前记忆
            if (memory.id) {
                this.memoryRegistry.set(memory.id, memory);
            }
            this.statistics.processingTimes.push(processingTime);
            return {
                relatedIds,
                relationTypes,
                relationStrengths,
                details: {
                    entityMatches,
                    temporalMatches,
                    semanticMatches,
                    categoryMatches,
                },
                explanation,
            };
        }
        catch (error) {
            console.error('[RelationDiscoverer] 增强关系发现失败:', error);
            return {
                relatedIds: [],
                relationTypes: [],
                relationStrengths: [],
                details: {
                    entityMatches: [],
                    temporalMatches: [],
                    semanticMatches: [],
                    categoryMatches: [],
                },
                explanation: `关系发现失败: ${error}`,
            };
        }
    }
    /**
     * 手动添加记忆到注册表
     */
    registerMemory(memory) {
        if (!memory.id) {
            console.warn('[RelationDiscoverer] 无法注册无ID的记忆');
            return;
        }
        this.memoryRegistry.set(memory.id, memory);
        console.log(`[RelationDiscoverer] 注册记忆: ${memory.id}`);
    }
    /**
     * 获取统计信息
     */
    getStatistics() {
        const avgProcessingTime = this.statistics.processingTimes.length > 0
            ? this.statistics.processingTimes.reduce((a, b) => a + b, 0) / this.statistics.processingTimes.length
            : 0;
        return {
            totalDiscoveries: this.statistics.totalDiscoveries,
            averageRelationsPerMemory: this.statistics.averageRelationsPerMemory,
            relationTypeDistribution: this.statistics.relationTypeDistribution,
            registrySize: this.memoryRegistry.size,
            averageProcessingTime: avgProcessingTime,
        };
    }
    /**
     * 清除注册表
     */
    clearRegistry() {
        this.memoryRegistry.clear();
        console.log('[RelationDiscoverer] 注册表已清除');
    }
    /**
     * 导出来系发现报告
     */
    exportReport() {
        const stats = this.getStatistics();
        const now = new Date();
        return `
关系发现报告
===========

生成时间: ${now.toISOString()}

统计概览
--------
- 总发现次数: ${stats.totalDiscoveries}
- 平均每记忆关系数: ${stats.averageRelationsPerMemory.toFixed(1)}
- 注册表大小: ${stats.registrySize}
- 平均处理时间: ${stats.averageProcessingTime.toFixed(1)}ms

关系类型分布
------------
${Object.entries(stats.relationTypeDistribution)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => `- ${type}: ${count} 次`)
            .join('\n')}

配置信息
--------
- 相似度阈值: ${this.config.similarityThreshold}
- 最大相关记忆数: ${this.config.maxRelatedMemories}
- 实体权重: ${this.config.entityWeight}
- 时间权重: ${this.config.temporalWeight}
- 语义权重: ${this.config.semanticWeight}
- 分类权重: ${this.config.categoryWeight}
- 因果推断: ${this.config.enableCausalInference ? '开启' : '关闭'}

建议
----
${this.generateRecommendations(stats)}
`;
    }
    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('[RelationDiscoverer] 配置已更新');
    }
    // ============ 私有方法 ============
    /**
     * 提取记忆特征
     */
    async extractFeatures(memory) {
        // 简化实现，实际应该使用更复杂的NLP处理
        return {
            entities: this.extractEntities(memory.content),
            temporal: this.analyzeTemporal(memory),
            content: memory.content,
            category: memory.metadata?.category,
            keywords: memory.metadata?.keywords,
            emotions: memory.metadata?.emotions,
        };
    }
    /**
     * 提取实体
     */
    extractEntities(content) {
        // 简化实体提取，实际应该使用NLP库
        const entities = {
            persons: [],
            locations: [],
            organizations: [],
            topics: [],
            events: [],
            dates: [],
        };
        if (!content)
            return entities;
        // 简单关键词提取（实际应该用更复杂的方法）
        const words = content.toLowerCase().split(/\s+/);
        // 简单规则提取（示例）
        words.forEach(word => {
            if (word.length > 3) {
                if (word.includes('公司') || word.includes('组织') || word.includes('团队')) {
                    entities.organizations.push(word);
                }
                else if (word.includes('日') || word.includes('月') || word.includes('年')) {
                    entities.dates.push(word);
                }
            }
        });
        // 提取可能的主题（基于常见词汇）
        const commonTopics = ['技术', '设计', '开发', '学习', '工作', '生活', '健康', '旅行'];
        commonTopics.forEach(topic => {
            if (content.includes(topic)) {
                entities.topics.push(topic);
            }
        });
        return entities;
    }
    /**
     * 分析时间特征
     */
    analyzeTemporal(memory) {
        const timestamp = memory.timestamp || Date.now();
        const date = new Date(timestamp);
        const hour = date.getHours();
        const day = date.getDay();
        const month = date.getMonth() + 1;
        let season = 'unknown';
        if (month >= 3 && month <= 5)
            season = 'spring';
        else if (month >= 6 && month <= 8)
            season = 'summer';
        else if (month >= 9 && month <= 11)
            season = 'autumn';
        else
            season = 'winter';
        return {
            timestamp,
            hourOfDay: hour,
            dayOfWeek: day,
            month,
            isWeekend: day === 0 || day === 6,
            season,
        };
    }
    /**
     * 比较特征（基础版）
     */
    async compareFeatures(current, existing, currentMemory, existingMemory) {
        const relationTypes = [];
        let totalScore = 0;
        let factorCount = 0;
        const details = {};
        // 1. 实体匹配
        const entityScore = this.calculateEntitySimilarity(current.entities, existing.entities);
        if (entityScore > 0) {
            relationTypes.push(exports.RELATION_TYPES.ENTITY_COOCCURRENCE);
            totalScore += entityScore * this.config.entityWeight;
            factorCount++;
            details.entityScore = entityScore;
        }
        // 2. 时间匹配
        const temporalScore = this.calculateTemporalSimilarity(current.temporal, existing.temporal);
        if (temporalScore > 0) {
            relationTypes.push(exports.RELATION_TYPES.TEMPORAL_PROXIMITY);
            totalScore += temporalScore * this.config.temporalWeight;
            factorCount++;
            details.temporalScore = temporalScore;
        }
        // 3. 语义匹配
        const semanticScore = await this.calculateSemanticSimilarity(current.content, existing.content);
        if (semanticScore > 0) {
            relationTypes.push(exports.RELATION_TYPES.SEMANTIC_SIMILARITY);
            totalScore += semanticScore * this.config.semanticWeight;
            factorCount++;
            details.semanticScore = semanticScore;
        }
        // 4. 分类匹配
        const categoryScore = this.calculateCategorySimilarity(current.category, existing.category);
        if (categoryScore > 0) {
            relationTypes.push(exports.RELATION_TYPES.CATEGORY_SIMILARITY);
            totalScore += categoryScore * this.config.categoryWeight;
            factorCount++;
            details.categoryScore = categoryScore;
        }
        // 5. 因果推断（如果启用）
        if (this.config.enableCausalInference) {
            const causalScore = await this.inferCausalRelation(currentMemory, existingMemory, current, existing);
            if (causalScore > 0) {
                relationTypes.push(exports.RELATION_TYPES.CAUSAL_RELATION);
                totalScore += causalScore * 0.1; // 较小权重
                factorCount++;
                details.causalScore = causalScore;
            }
        }
        // 计算平均分
        const strength = factorCount > 0 ? totalScore / factorCount : 0;
        return {
            relationTypes,
            strength,
            details,
        };
    }
    /**
     * 详细比较（增强版）
     */
    async detailedCompare(current, existing, currentMemory, existingMemory) {
        // 计算各个维度的得分
        const entityScore = this.calculateEntitySimilarity(current.entities, existing.entities);
        const temporalScore = this.calculateTemporalSimilarity(current.temporal, existing.temporal);
        const semanticSimilarity = await this.calculateSemanticSimilarity(current.content, existing.content);
        const semanticScore = semanticSimilarity; // 直接使用相似度
        const categoryScore = this.calculateCategorySimilarity(current.category, existing.category);
        // 计算时间差
        const timeDiffMs = Math.abs(current.temporal.timestamp - existing.temporal.timestamp);
        const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
        // 找出匹配的实体
        const matchedEntities = this.findMatchedEntities(current.entities, existing.entities);
        // 确定关系类型
        const relationTypes = [];
        if (entityScore > 0.3)
            relationTypes.push(exports.RELATION_TYPES.ENTITY_COOCCURRENCE);
        if (temporalScore > 0.3)
            relationTypes.push(exports.RELATION_TYPES.TEMPORAL_PROXIMITY);
        if (semanticScore > 0.3)
            relationTypes.push(exports.RELATION_TYPES.SEMANTIC_SIMILARITY);
        if (categoryScore > 0.3)
            relationTypes.push(exports.RELATION_TYPES.CATEGORY_SIMILARITY);
        // 逻辑关联推断
        if (semanticScore > 0.6 || entityScore > 0.5) {
            relationTypes.push(exports.RELATION_TYPES.LOGICAL_ASSOCIATION);
        }
        // 情感连接推断
        if (current.emotions && existing.emotions) {
            const emotionalOverlap = this.calculateEmotionalOverlap(current.emotions, existing.emotions);
            if (emotionalOverlap > 0.5) {
                relationTypes.push(exports.RELATION_TYPES.EMOTIONAL_CONNECTION);
            }
        }
        // 主题相关
        if (current.entities.topics.some(topic => existing.entities.topics.includes(topic))) {
            relationTypes.push(exports.RELATION_TYPES.THEMATIC_RELATION);
        }
        // 计算综合得分（加权平均）
        const overallScore = (entityScore * this.config.entityWeight +
            temporalScore * this.config.temporalWeight +
            semanticScore * this.config.semanticWeight +
            categoryScore * this.config.categoryWeight) / (this.config.entityWeight + this.config.temporalWeight +
            this.config.semanticWeight + this.config.categoryWeight);
        return {
            relationTypes,
            overallScore,
            entityScore,
            temporalScore,
            semanticScore,
            categoryScore,
            semanticSimilarity,
            timeDiffHours,
            matchedEntities,
        };
    }
    /**
     * 计算实体相似度
     */
    calculateEntitySimilarity(entities1, entities2) {
        if (!entities1 || !entities2)
            return 0;
        let totalMatches = 0;
        let totalEntities = 0;
        // 检查所有实体类别
        const categories = ['persons', 'locations', 'organizations', 'topics', 'events', 'dates'];
        for (const category of categories) {
            const list1 = entities1[category] || [];
            const list2 = entities2[category] || [];
            totalEntities += list1.length + list2.length;
            // 计算匹配数
            const matches = list1.filter(entity => list2.includes(entity)).length;
            totalMatches += matches;
        }
        if (totalEntities === 0)
            return 0;
        // Jaccard相似度
        return totalMatches / totalEntities;
    }
    /**
     * 计算时间相似度
     */
    calculateTemporalSimilarity(temporal1, temporal2) {
        const timeDiffMs = Math.abs(temporal1.timestamp - temporal2.timestamp);
        const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
        // 时间衰减函数：1天内为1.0，7天内衰减到0.5，30天内衰减到0.1
        let score = 0;
        if (timeDiffHours <= 24) {
            score = 1.0;
        }
        else if (timeDiffHours <= 168) { // 7天
            score = 0.5;
        }
        else if (timeDiffHours <= 720) { // 30天
            score = 0.1;
        }
        // 额外加成：同一天中的相似时间
        const hourDiff = Math.abs(temporal1.hourOfDay - temporal2.hourOfDay);
        const hourBonus = hourDiff <= 2 ? 0.1 : 0;
        // 额外加成：同一季节
        const seasonBonus = temporal1.season === temporal2.season ? 0.05 : 0;
        return Math.min(score + hourBonus + seasonBonus, 1.0);
    }
    /**
     * 计算语义相似度
     */
    async calculateSemanticSimilarity(text1, text2) {
        if (!text1 || !text2)
            return 0;
        // 简化实现：基于文本重叠
        // 实际应该使用向量嵌入或高级NLP
        const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 1));
        const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 1));
        if (words1.size === 0 || words2.size === 0)
            return 0;
        const intersection = new Set([...words1].filter(w => words2.has(w)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    /**
     * 计算分类相似度
     */
    calculateCategorySimilarity(category1, category2) {
        if (!category1 || !category2)
            return 0;
        if (category1 === category2) {
            return 1.0;
        }
        // 简单分类相似度（可以扩展为分类树距离）
        const similarCategories = {
            'technical': ['development', 'coding', 'programming', 'technology'],
            'personal': ['life', 'family', 'friends', 'hobbies'],
            'work': ['business', 'career', 'projects', 'meetings'],
            'learning': ['study', 'education', 'research', 'knowledge'],
        };
        for (const [main, subs] of Object.entries(similarCategories)) {
            if (subs.includes(category1) && subs.includes(category2)) {
                return 0.7;
            }
            if (category1 === main && subs.includes(category2)) {
                return 0.8;
            }
            if (subs.includes(category1) && category2 === main) {
                return 0.8;
            }
        }
        return 0;
    }
    /**
     * 推断因果关系
     */
    async inferCausalRelation(currentMemory, existingMemory, currentFeatures, existingFeatures) {
        // 简化实现：基于时间顺序和内容暗示
        // 检查时间顺序
        const isCurrentLater = currentMemory.timestamp > existingMemory.timestamp;
        if (!isCurrentLater) {
            return 0; // 当前记忆在之前，不可能是结果
        }
        // 检查内容暗示因果关系的关键词
        const causalKeywords = [
            '因为', '所以', '导致', '引起', '结果', '因此', '于是',
            'because', 'so', 'therefore', 'thus', 'consequently', 'as a result',
        ];
        let keywordScore = 0;
        for (const keyword of causalKeywords) {
            if (currentMemory.content.includes(keyword) || existingMemory.content.includes(keyword)) {
                keywordScore += 0.1;
            }
        }
        // 检查实体连续性
        const entityContinuity = this.calculateEntitySimilarity(currentFeatures.entities, existingFeatures.entities);
        return Math.min(keywordScore + entityContinuity * 0.3, 1.0);
    }
    /**
     * 计算情感重叠
     */
    calculateEmotionalOverlap(emotions1, emotions2) {
        if (!emotions1 || !emotions2)
            return 0;
        const set1 = new Set(emotions1);
        const set2 = new Set(emotions2);
        const intersection = new Set([...set1].filter(e => set2.has(e)));
        const union = new Set([...set1, ...set2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    /**
     * 找出匹配的实体
     */
    findMatchedEntities(entities1, entities2) {
        const matched = [];
        const categories = ['persons', 'locations', 'organizations', 'topics', 'events', 'dates'];
        for (const category of categories) {
            const list1 = entities1[category] || [];
            const list2 = entities2[category] || [];
            const matches = list1.filter(entity => list2.includes(entity));
            matched.push(...matches);
        }
        return [...new Set(matched)]; // 去重
    }
    /**
     * 生成解释
     */
    generateExplanation(relationCount, relationTypes, topMatches) {
        if (relationCount === 0) {
            return '未发现相关记忆';
        }
        const mainRelation = relationTypes[0] || 'unknown';
        const strength = topMatches[0]?.strength || 0;
        let explanation = `发现 ${relationCount} 个相关记忆`;
        if (relationTypes.length === 1) {
            explanation += `，主要基于 ${this.getRelationTypeName(mainRelation)}`;
        }
        else {
            explanation += `，基于 ${relationTypes.map(t => this.getRelationTypeName(t)).join('、')} 等多种关系`;
        }
        if (strength > 0.8) {
            explanation += '（关系强度很高）';
        }
        else if (strength > 0.6) {
            explanation += '（关系强度中等）';
        }
        else {
            explanation += '（关系强度一般）';
        }
        return explanation;
    }
    /**
     * 获取关系类型名称
     */
    getRelationTypeName(relationType) {
        const nameMap = {
            [exports.RELATION_TYPES.ENTITY_COOCCURRENCE]: '实体共现',
            [exports.RELATION_TYPES.TEMPORAL_PROXIMITY]: '时间相近',
            [exports.RELATION_TYPES.SEMANTIC_SIMILARITY]: '语义相似',
            [exports.RELATION_TYPES.CATEGORY_SIMILARITY]: '分类相似',
            [exports.RELATION_TYPES.CAUSAL_RELATION]: '因果关系',
            [exports.RELATION_TYPES.LOGICAL_ASSOCIATION]: '逻辑关联',
            [exports.RELATION_TYPES.EMOTIONAL_CONNECTION]: '情感连接',
            [exports.RELATION_TYPES.THEMATIC_RELATION]: '主题相关',
        };
        return nameMap[relationType] || relationType;
    }
    /**
     * 更新统计
     */
    updateStatistics(relationCount, relationTypes) {
        this.statistics.totalDiscoveries++;
        // 更新平均关系数
        const oldTotal = this.statistics.averageRelationsPerMemory * (this.statistics.totalDiscoveries - 1);
        this.statistics.averageRelationsPerMemory = (oldTotal + relationCount) / this.statistics.totalDiscoveries;
        // 更新关系类型分布
        for (const type of relationTypes) {
            if (this.statistics.relationTypeDistribution[type] !== undefined) {
                this.statistics.relationTypeDistribution[type]++;
            }
        }
    }
    /**
     * 生成优化建议
     */
    generateRecommendations(stats) {
        const recommendations = [];
        if (stats.averageRelationsPerMemory < 0.5) {
            recommendations.push('- 平均每记忆关系数较低(<0.5)，建议降低相似度阈值或增加记忆注册');
        }
        if (stats.registrySize < 10) {
            recommendations.push('- 注册记忆数量较少(<10)，建议收集更多历史记忆以提高发现准确性');
        }
        if (stats.averageProcessingTime > 500) {
            recommendations.push('- 处理时间较长(>500ms)，建议优化特征提取算法或启用缓存');
        }
        if (Object.values(stats.relationTypeDistribution).every(count => count === 0)) {
            recommendations.push('- 未发现任何关系，建议检查配置或输入数据');
        }
        if (recommendations.length === 0) {
            recommendations.push('- 系统运行良好，暂无优化建议');
        }
        return recommendations.join('\n');
    }
}
exports.RelationDiscoverer = RelationDiscoverer;
/**
 * 导出工具函数
 */
function createRelationDiscoverer(config) {
    return new RelationDiscoverer(config);
}
/**
 * 快速关系发现函数
 */
async function quickDiscoverRelations(memory, config) {
    const discoverer = createRelationDiscoverer(config);
    return discoverer.discoverRelations(memory);
}
