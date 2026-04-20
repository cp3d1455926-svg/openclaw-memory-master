"use strict";
/**
 * Knowledge Graph Engine - 知识图谱引擎
 *
 * 基于 HippoRAG + ZEP + Ontology 最佳实践
 * 支持实体管理、关系管理、图遍历、自动构建
 *
 * @author 小鬼 👻 + Jake
 * @version 4.2.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeGraph = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ============ 知识图谱引擎 ============
class KnowledgeGraph {
    constructor(config = {}) {
        this.config = {
            basePath: config.basePath ?? 'memory/knowledge-graph',
            autoSave: config.autoSave ?? true,
            autoSaveInterval: config.autoSaveInterval ?? 5 * 60 * 1000, // 5 分钟
        };
        this.entities = new Map();
        this.relations = new Map();
        this.adjacencyList = new Map();
        this.reverseIndex = new Map();
        // 初始化
        this.init();
    }
    /**
     * 初始化图谱
     */
    async init() {
        try {
            // 确保目录存在
            if (!fs.existsSync(this.config.basePath)) {
                fs.mkdirSync(this.config.basePath, { recursive: true });
            }
            // 加载数据
            await this.load();
            // 启动自动保存
            if (this.config.autoSave) {
                this.startAutoSave();
            }
            console.log(`[KnowledgeGraph] 初始化完成，加载了 ${this.entities.size} 个实体，${this.relations.size} 个关系`);
        }
        catch (error) {
            console.warn('[KnowledgeGraph] 初始化失败:', error);
        }
    }
    /**
     * 加载数据
     */
    async load() {
        const entitiesPath = path.join(this.config.basePath, 'entities.json');
        const relationsPath = path.join(this.config.basePath, 'relations.json');
        if (fs.existsSync(entitiesPath)) {
            const data = fs.readFileSync(entitiesPath, 'utf-8');
            const entities = JSON.parse(data);
            this.entities = new Map(Object.entries(entities));
        }
        if (fs.existsSync(relationsPath)) {
            const data = fs.readFileSync(relationsPath, 'utf-8');
            const relations = JSON.parse(data);
            this.relations = new Map(Object.entries(relations));
        }
        // 重建索引
        this.rebuildIndex();
    }
    /**
     * 保存数据
     */
    async save() {
        try {
            // 确保目录存在
            if (!fs.existsSync(this.config.basePath)) {
                fs.mkdirSync(this.config.basePath, { recursive: true });
            }
            // 保存实体
            const entitiesPath = path.join(this.config.basePath, 'entities.json');
            fs.writeFileSync(entitiesPath, JSON.stringify(Object.fromEntries(this.entities), null, 2), 'utf-8');
            // 保存关系
            const relationsPath = path.join(this.config.basePath, 'relations.json');
            fs.writeFileSync(relationsPath, JSON.stringify(Object.fromEntries(this.relations), null, 2), 'utf-8');
            console.log(`[KnowledgeGraph] 保存完成：${this.entities.size} 实体，${this.relations.size} 关系`);
        }
        catch (error) {
            console.error('[KnowledgeGraph] 保存失败:', error);
        }
    }
    /**
     * 启动自动保存
     */
    startAutoSave() {
        this.saveTimer = setInterval(() => {
            this.save();
        }, this.config.autoSaveInterval);
    }
    /**
     * 重建索引
     */
    rebuildIndex() {
        this.adjacencyList.clear();
        this.reverseIndex.clear();
        for (const relation of this.relations.values()) {
            // 正向索引
            if (!this.adjacencyList.has(relation.from)) {
                this.adjacencyList.set(relation.from, new Set());
            }
            this.adjacencyList.get(relation.from).add(relation.to);
            // 反向索引
            if (!this.reverseIndex.has(relation.to)) {
                this.reverseIndex.set(relation.to, new Set());
            }
            this.reverseIndex.get(relation.to).add(relation.from);
        }
    }
    // ============ 实体操作 ============
    /**
     * 添加实体
     */
    async addEntity(entity) {
        const id = entity.id || `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();
        const fullEntity = {
            ...entity,
            id,
            createdAt: now,
            updatedAt: now,
        };
        this.entities.set(id, fullEntity);
        // 初始化邻接表
        if (!this.adjacencyList.has(id)) {
            this.adjacencyList.set(id, new Set());
        }
        if (!this.reverseIndex.has(id)) {
            this.reverseIndex.set(id, new Set());
        }
        if (this.config.autoSave) {
            await this.save();
        }
        console.log(`[KnowledgeGraph] 添加实体：${id} (${entity.type}:${entity.name})`);
        return id;
    }
    /**
     * 获取实体
     */
    async getEntity(id) {
        return this.entities.get(id) || null;
    }
    /**
     * 更新实体
     */
    async updateEntity(id, updates) {
        const entity = this.entities.get(id);
        if (!entity) {
            throw new Error(`Entity ${id} not found`);
        }
        const updated = {
            ...entity,
            ...updates,
            updatedAt: Date.now(),
        };
        this.entities.set(id, updated);
        if (this.config.autoSave) {
            await this.save();
        }
    }
    /**
     * 删除实体
     */
    async deleteEntity(id) {
        // 删除相关关系
        const relationsToDelete = Array.from(this.relations.values())
            .filter(r => r.from === id || r.to === id);
        for (const relation of relationsToDelete) {
            await this.deleteRelation(relation.id);
        }
        // 删除实体
        this.entities.delete(id);
        this.adjacencyList.delete(id);
        this.reverseIndex.delete(id);
        if (this.config.autoSave) {
            await this.save();
        }
    }
    /**
     * 查询实体（按类型）
     */
    async queryEntitiesByType(type) {
        return Array.from(this.entities.values()).filter(e => e.type === type);
    }
    /**
     * 搜索实体（按名称）
     */
    async searchEntities(query, limit = 20) {
        const queryLower = query.toLowerCase();
        const results = [];
        for (const entity of this.entities.values()) {
            let score = 0;
            // 名称匹配
            if (entity.name.toLowerCase().includes(queryLower)) {
                score += 10;
            }
            // 属性匹配
            for (const value of Object.values(entity.attributes)) {
                if (String(value).toLowerCase().includes(queryLower)) {
                    score += 5;
                    break;
                }
            }
            if (score > 0) {
                results.push({ entity, score });
            }
        }
        // 按评分排序
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, limit).map(r => r.entity);
    }
    // ============ 关系操作 ============
    /**
     * 添加关系
     */
    async addRelation(relation) {
        const id = `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();
        const fullRelation = {
            ...relation,
            id,
            createdAt: now,
        };
        this.relations.set(id, fullRelation);
        // 更新索引
        if (!this.adjacencyList.has(relation.from)) {
            this.adjacencyList.set(relation.from, new Set());
        }
        this.adjacencyList.get(relation.from).add(relation.to);
        if (!this.reverseIndex.has(relation.to)) {
            this.reverseIndex.set(relation.to, new Set());
        }
        this.reverseIndex.get(relation.to).add(relation.from);
        if (this.config.autoSave) {
            await this.save();
        }
        console.log(`[KnowledgeGraph] 添加关系：${relation.from} -[${relation.type}]-> ${relation.to}`);
        return id;
    }
    /**
     * 获取关系
     */
    async getRelation(id) {
        return this.relations.get(id) || null;
    }
    /**
     * 删除关系
     */
    async deleteRelation(id) {
        const relation = this.relations.get(id);
        if (!relation) {
            return;
        }
        this.relations.delete(id);
        // 更新索引
        const targets = this.adjacencyList.get(relation.from);
        if (targets) {
            targets.delete(relation.to);
        }
        const sources = this.reverseIndex.get(relation.to);
        if (sources) {
            sources.delete(relation.from);
        }
        if (this.config.autoSave) {
            await this.save();
        }
    }
    /**
     * 获取实体的关系
     */
    async getEntityRelations(entityId, type) {
        return Array.from(this.relations.values()).filter(r => {
            const matchesEntity = r.from === entityId || r.to === entityId;
            const matchesType = !type || r.type === type;
            return matchesEntity && matchesType;
        });
    }
    // ============ 图遍历 ============
    /**
     * 获取邻居
     */
    async getNeighbors(options) {
        const { entityId, relationType, direction = 'both', limit = 50 } = options;
        const neighbors = [];
        // 出边
        if (direction === 'out' || direction === 'both') {
            const targets = this.adjacencyList.get(entityId);
            if (targets) {
                for (const relation of this.relations.values()) {
                    if (relation.from === entityId) {
                        if (!relationType || relation.type === relationType) {
                            neighbors.push({
                                entityId: relation.to,
                                relationType: relation.type,
                                direction: 'out',
                                relationId: relation.id,
                            });
                        }
                    }
                }
            }
        }
        // 入边
        if (direction === 'in' || direction === 'both') {
            const sources = this.reverseIndex.get(entityId);
            if (sources) {
                for (const relation of this.relations.values()) {
                    if (relation.to === entityId) {
                        if (!relationType || relation.type === relationType) {
                            neighbors.push({
                                entityId: relation.from,
                                relationType: relation.type,
                                direction: 'in',
                                relationId: relation.id,
                            });
                        }
                    }
                }
            }
        }
        return {
            entityId,
            neighbors: neighbors.slice(0, limit),
        };
    }
    /**
     * 图遍历（BFS）
     */
    async traverse(startId, options = {}) {
        const { maxDepth = 5, relationTypes, direction = 'forward' } = options;
        const paths = [];
        const visited = new Set();
        const queue = [
            { nodeId: startId, path: [startId], relations: [], depth: 0 },
        ];
        while (queue.length > 0) {
            const { nodeId, path, relations, depth } = queue.shift();
            if (depth >= maxDepth) {
                continue;
            }
            // 获取邻居
            const neighborResult = await this.getNeighbors({
                entityId: nodeId,
                relationType: relationTypes?.[0],
                direction: direction === 'forward' ? 'out' : direction === 'backward' ? 'in' : 'both',
            });
            for (const neighbor of neighborResult.neighbors) {
                if (visited.has(neighbor.entityId)) {
                    continue;
                }
                const newPath = [...path, neighbor.entityId];
                const newRelations = [...relations, neighbor.relationId];
                // 记录路径
                paths.push({
                    start: startId,
                    end: neighbor.entityId,
                    nodes: newPath,
                    relations: newRelations,
                    length: newPath.length,
                });
                visited.add(neighbor.entityId);
                // 继续遍历
                queue.push({
                    nodeId: neighbor.entityId,
                    path: newPath,
                    relations: newRelations,
                    depth: depth + 1,
                });
            }
        }
        return paths;
    }
    /**
     * 查找最短路径（BFS）
     */
    async findShortestPath(fromId, toId) {
        if (fromId === toId) {
            return { start: fromId, end: toId, nodes: [fromId], relations: [], length: 0 };
        }
        const visited = new Set();
        const queue = [
            { nodeId: fromId, path: [fromId], relations: [] },
        ];
        while (queue.length > 0) {
            const { nodeId, path, relations } = queue.shift();
            const neighborResult = await this.getNeighbors({
                entityId: nodeId,
                direction: 'out',
            });
            for (const neighbor of neighborResult.neighbors) {
                if (neighbor.entityId === toId) {
                    return {
                        start: fromId,
                        end: toId,
                        nodes: [...path, toId],
                        relations: [...relations, neighbor.relationId],
                        length: path.length + 1,
                    };
                }
                if (!visited.has(neighbor.entityId)) {
                    visited.add(neighbor.entityId);
                    queue.push({
                        nodeId: neighbor.entityId,
                        path: [...path, neighbor.entityId],
                        relations: [...relations, neighbor.relationId],
                    });
                }
            }
        }
        return null; // 无路径
    }
    // ============ 统计信息 ============
    /**
     * 获取统计信息
     */
    getStats() {
        const entitiesByType = {};
        const relationsByType = {};
        for (const entity of this.entities.values()) {
            entitiesByType[entity.type] = (entitiesByType[entity.type] || 0) + 1;
        }
        for (const relation of this.relations.values()) {
            relationsByType[relation.type] = (relationsByType[relation.type] || 0) + 1;
        }
        return {
            totalEntities: this.entities.size,
            totalRelations: this.relations.size,
            entitiesByType: entitiesByType,
            relationsByType: relationsByType,
            avgRelationsPerEntity: this.relations.size / Math.max(1, this.entities.size),
        };
    }
    /**
     * 清空图谱
     */
    async clear() {
        this.entities.clear();
        this.relations.clear();
        this.adjacencyList.clear();
        this.reverseIndex.clear();
        if (this.config.autoSave) {
            await this.save();
        }
    }
    /**
     * 销毁（停止自动保存）
     */
    destroy() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
        }
        // 最后保存一次
        this.save();
    }
}
exports.KnowledgeGraph = KnowledgeGraph;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia25vd2xlZGdlLWdyYXBoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2tub3dsZWRnZS1ncmFwaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUEwRjdCLG1DQUFtQztBQUVuQyxNQUFhLGNBQWM7SUFRekIsWUFBWSxTQUFzQixFQUFFO1FBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFDWixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsSUFBSSx3QkFBd0I7WUFDckQsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSTtZQUNqQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsT0FBTztTQUNwRSxDQUFDO1FBRUYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTlCLE1BQU07UUFDTixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLLENBQUMsSUFBSTtRQUNoQixJQUFJLENBQUM7WUFDSCxTQUFTO1lBQ1QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUN6QyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENB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QUFLLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3pCLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BCLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPO1FBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbkIsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBQ0QsU0FBUztRQUNULElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7Q0FDRjtBQTNpQkQsd0NBMmlCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogS25vd2xlZGdlIEdyYXBoIEVuZ2luZSAtIOefpeivhuWbvuiwseW8leaTjlxuICogXG4gKiDln7rkuo4gSGlwcG9SQUcgKyBaRVAgKyBPbnRvbG9neSDmnIDkvbPlrp7ot7VcbiAqIOaUr+aMgeWunuS9k+euoeeQhuOAgeWFs+ezu+euoeeQhuOAgeWbvumBjeWOhuOAgeiHquWKqOaehOW7ulxuICogXG4gKiBAYXV0aG9yIOWwj+msvCDwn5G7ICsgSmFrZVxuICogQHZlcnNpb24gNC4yLjBcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyA9PT09PT09PT09PT0g5a6e5L2T57G75Z6L5a6a5LmJID09PT09PT09PT09PVxuXG5leHBvcnQgdHlwZSBFbnRpdHlUeXBlID0gXG4gIHwgJ1BlcnNvbicgICAgICAvLyDkurrnialcbiAgfCAnUHJvamVjdCcgICAgIC8vIOmhueebrlxuICB8ICdUYXNrJyAgICAgICAgLy8g5Lu75YqhXG4gIHwgJ1NraWxsJyAgICAgICAvLyDmioDog71cbiAgfCAnTWVtb3J5JyAgICAgIC8vIOiusOW/hlxuICB8ICdFdmVudCcgICAgICAgLy8g5LqL5Lu2XG4gIHwgJ0NvbmNlcHQnOyAgICAvLyDmpoLlv7VcblxuZXhwb3J0IGludGVyZmFjZSBHcmFwaEVudGl0eSB7XG4gIGlkOiBzdHJpbmc7XG4gIHR5cGU6IEVudGl0eVR5cGU7XG4gIG5hbWU6IHN0cmluZztcbiAgYXR0cmlidXRlczogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgY3JlYXRlZEF0OiBudW1iZXI7XG4gIHVwZGF0ZWRBdDogbnVtYmVyO1xufVxuXG4vLyA9PT09PT09PT09PT0g5YWz57O757G75Z6L5a6a5LmJID09PT09PT09PT09PVxuXG5leHBvcnQgdHlwZSBSZWxhdGlvblR5cGUgPVxuICB8ICd3b3Jrc19vbicgICAgICAgIC8vIOW3peS9nOS6jlxuICB8ICdrbm93cycgICAgICAgICAgIC8vIOefpemBk1xuICB8ICdjcmVhdGVkJyAgICAgICAgIC8vIOWIm+W7ulxuICB8ICdoYXNfdGFzaycgICAgICAgIC8vIOacieS7u+WKoVxuICB8ICd1c2VzX3NraWxsJyAgICAgIC8vIOS9v+eUqOaKgOiDvVxuICB8ICdvd25lZF9ieScgICAgICAgIC8vIOWxnuS6jlxuICB8ICdhc3NpZ25lZF90bycgICAgIC8vIOWIhumFjee7mVxuICB8ICdwYXJ0X29mJyAgICAgICAgIC8vIOWxnuS6ju+8iOmDqOWIhu+8iVxuICB8ICdkZXBlbmRzX29uJyAgICAgIC8vIOS+nei1luS6jlxuICB8ICdyZWxhdGVkX3RvJyAgICAgIC8vIOebuOWFs1xuICB8ICdhdHRlbmRlZF9ieScgICAgIC8vIOWPguS4juiAhVxuICB8ICdhYm91dCcgICAgICAgICAgIC8vIOWFs+S6jlxuICB8ICdyZWZlcmVuY2VzJzsgICAgIC8vIOW8leeUqFxuXG5leHBvcnQgaW50ZXJmYWNlIEdyYXBoUmVsYXRpb24ge1xuICBpZDogc3RyaW5nO1xuICBmcm9tOiBzdHJpbmc7ICAgICAgIC8vIOa6kOWunuS9kyBJRFxuICB0bzogc3RyaW5nOyAgICAgICAgIC8vIOebruagh+WunuS9kyBJRFxuICB0eXBlOiBSZWxhdGlvblR5cGU7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIHdlaWdodDogbnVtYmVyOyAgICAgLy8g5p2D6YeNIDAtMVxuICBjcmVhdGVkQXQ6IG51bWJlcjtcbn1cblxuLy8gPT09PT09PT09PT09IOWbvumBjeWOhiA9PT09PT09PT09PT1cblxuZXhwb3J0IGludGVyZmFjZSBHcmFwaFBhdGgge1xuICBzdGFydDogc3RyaW5nO1xuICBlbmQ6IHN0cmluZztcbiAgbm9kZXM6IHN0cmluZ1tdOyAgICAvLyDot6/lvoTkuIrnmoTlrp7kvZMgSURcbiAgcmVsYXRpb25zOiBzdHJpbmdbXTsgLy8g6Lev5b6E5LiK55qE5YWz57O7IElEXG4gIGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRyYXZlcnNlT3B0aW9ucyB7XG4gIG1heERlcHRoPzogbnVtYmVyO1xuICByZWxhdGlvblR5cGVzPzogUmVsYXRpb25UeXBlW107XG4gIGRpcmVjdGlvbj86ICdmb3J3YXJkJyB8ICdiYWNrd2FyZCcgfCAnYm90aCc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmVpZ2hib3JRdWVyeSB7XG4gIGVudGl0eUlkOiBzdHJpbmc7XG4gIHJlbGF0aW9uVHlwZT86IFJlbGF0aW9uVHlwZTtcbiAgZGlyZWN0aW9uPzogJ2luJyB8ICdvdXQnIHwgJ2JvdGgnO1xuICBsaW1pdD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZWlnaGJvclJlc3VsdCB7XG4gIGVudGl0eUlkOiBzdHJpbmc7XG4gIG5laWdoYm9yczogQXJyYXk8e1xuICAgIGVudGl0eUlkOiBzdHJpbmc7XG4gICAgcmVsYXRpb25UeXBlOiBSZWxhdGlvblR5cGU7XG4gICAgZGlyZWN0aW9uOiAnaW4nIHwgJ291dCc7XG4gICAgcmVsYXRpb25JZDogc3RyaW5nO1xuICB9Pjtcbn1cblxuLy8gPT09PT09PT09PT09IOmFjee9riA9PT09PT09PT09PT1cblxuZXhwb3J0IGludGVyZmFjZSBHcmFwaENvbmZpZyB7XG4gIGJhc2VQYXRoPzogc3RyaW5nO1xuICBhdXRvU2F2ZT86IGJvb2xlYW47XG4gIGF1dG9TYXZlSW50ZXJ2YWw/OiBudW1iZXI7IC8vIOavq+enklxufVxuXG4vLyA9PT09PT09PT09PT0g55+l6K+G5Zu+6LCx5byV5pOOID09PT09PT09PT09PVxuXG5leHBvcnQgY2xhc3MgS25vd2xlZGdlR3JhcGgge1xuICBwcml2YXRlIGNvbmZpZzogUmVxdWlyZWQ8R3JhcGhDb25maWc+O1xuICBwcml2YXRlIGVudGl0aWVzOiBNYXA8c3RyaW5nLCBHcmFwaEVudGl0eT47XG4gIHByaXZhdGUgcmVsYXRpb25zOiBNYXA8c3RyaW5nLCBHcmFwaFJlbGF0aW9uPjtcbiAgcHJpdmF0ZSBhZGphY2VuY3lMaXN0OiBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj47IC8vIOmCu+aOpeihqFxuICBwcml2YXRlIHJldmVyc2VJbmRleDogTWFwPHN0cmluZywgU2V0PHN0cmluZz4+OyAgLy8g5Y+N5ZCR57Si5byVXG4gIHByaXZhdGUgc2F2ZVRpbWVyPzogTm9kZUpTLlRpbWVvdXQ7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBHcmFwaENvbmZpZyA9IHt9KSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBiYXNlUGF0aDogY29uZmlnLmJhc2VQYXRoID8/ICdtZW1vcnkva25vd2xlZGdlLWdyYXBoJyxcbiAgICAgIGF1dG9TYXZlOiBjb25maWcuYXV0b1NhdmUgPz8gdHJ1ZSxcbiAgICAgIGF1dG9TYXZlSW50ZXJ2YWw6IGNvbmZpZy5hdXRvU2F2ZUludGVydmFsID8/IDUgKiA2MCAqIDEwMDAsIC8vIDUg5YiG6ZKfXG4gICAgfTtcblxuICAgIHRoaXMuZW50aXRpZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5yZWxhdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5hZGphY2VuY3lMaXN0ID0gbmV3IE1hcCgpO1xuICAgIHRoaXMucmV2ZXJzZUluZGV4ID0gbmV3IE1hcCgpO1xuXG4gICAgLy8g5Yid5aeL5YyWXG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICog5Yid5aeL5YyW5Zu+6LCxXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGluaXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIOehruS/neebruW9leWtmOWcqFxuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMuY29uZmlnLmJhc2VQYXRoKSkge1xuICAgICAgICBmcy5ta2RpclN5bmModGhpcy5jb25maWcuYmFzZVBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyDliqDovb3mlbDmja5cbiAgICAgIGF3YWl0IHRoaXMubG9hZCgpO1xuXG4gICAgICAvLyDlkK/liqjoh6rliqjkv53lrZhcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvU2F2ZSkge1xuICAgICAgICB0aGlzLnN0YXJ0QXV0b1NhdmUoKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coYFtLbm93bGVkZ2VHcmFwaF0g5Yid5aeL5YyW5a6M5oiQ77yM5Yqg6L295LqGICR7dGhpcy5lbnRpdGllcy5zaXplfSDkuKrlrp7kvZPvvIwke3RoaXMucmVsYXRpb25zLnNpemV9IOS4quWFs+ezu2ApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tLbm93bGVkZ2VHcmFwaF0g5Yid5aeL5YyW5aSx6LSlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5Yqg6L295pWw5o2uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZW50aXRpZXNQYXRoID0gcGF0aC5qb2luKHRoaXMuY29uZmlnLmJhc2VQYXRoLCAnZW50aXRpZXMuanNvbicpO1xuICAgIGNvbnN0IHJlbGF0aW9uc1BhdGggPSBwYXRoLmpvaW4odGhpcy5jb25maWcuYmFzZVBhdGgsICdyZWxhdGlvbnMuanNvbicpO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZW50aXRpZXNQYXRoKSkge1xuICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhlbnRpdGllc1BhdGgsICd1dGYtOCcpO1xuICAgICAgY29uc3QgZW50aXRpZXMgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgdGhpcy5lbnRpdGllcyA9IG5ldyBNYXAoT2JqZWN0LmVudHJpZXMoZW50aXRpZXMpKTtcbiAgICB9XG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhyZWxhdGlvbnNQYXRoKSkge1xuICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhyZWxhdGlvbnNQYXRoLCAndXRmLTgnKTtcbiAgICAgIGNvbnN0IHJlbGF0aW9ucyA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB0aGlzLnJlbGF0aW9ucyA9IG5ldyBNYXAoT2JqZWN0LmVudHJpZXMocmVsYXRpb25zKSk7XG4gICAgfVxuXG4gICAgLy8g6YeN5bu657Si5byVXG4gICAgdGhpcy5yZWJ1aWxkSW5kZXgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDkv53lrZjmlbDmja5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgc2F2ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgLy8g56Gu5L+d55uu5b2V5a2Y5ZyoXG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy5jb25maWcuYmFzZVBhdGgpKSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyh0aGlzLmNvbmZpZy5iYXNlUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIOS/neWtmOWunuS9k1xuICAgICAgY29uc3QgZW50aXRpZXNQYXRoID0gcGF0aC5qb2luKHRoaXMuY29uZmlnLmJhc2VQYXRoLCAnZW50aXRpZXMuanNvbicpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICAgZW50aXRpZXNQYXRoLFxuICAgICAgICBKU09OLnN0cmluZ2lmeShPYmplY3QuZnJvbUVudHJpZXModGhpcy5lbnRpdGllcyksIG51bGwsIDIpLFxuICAgICAgICAndXRmLTgnXG4gICAgICApO1xuXG4gICAgICAvLyDkv53lrZjlhbPns7tcbiAgICAgIGNvbnN0IHJlbGF0aW9uc1BhdGggPSBwYXRoLmpvaW4odGhpcy5jb25maWcuYmFzZVBhdGgsICdyZWxhdGlvbnMuanNvbicpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICAgcmVsYXRpb25zUGF0aCxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmZyb21FbnRyaWVzKHRoaXMucmVsYXRpb25zKSwgbnVsbCwgMiksXG4gICAgICAgICd1dGYtOCdcbiAgICAgICk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGBbS25vd2xlZGdlR3JhcGhdIOS/neWtmOWujOaIkO+8miR7dGhpcy5lbnRpdGllcy5zaXplfSDlrp7kvZPvvIwke3RoaXMucmVsYXRpb25zLnNpemV9IOWFs+ezu2ApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbS25vd2xlZGdlR3JhcGhdIOS/neWtmOWksei0pTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOWQr+WKqOiHquWKqOS/neWtmFxuICAgKi9cbiAgcHJpdmF0ZSBzdGFydEF1dG9TYXZlKCk6IHZvaWQge1xuICAgIHRoaXMuc2F2ZVRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdGhpcy5zYXZlKCk7XG4gICAgfSwgdGhpcy5jb25maWcuYXV0b1NhdmVJbnRlcnZhbCk7XG4gIH1cblxuICAvKipcbiAgICog6YeN5bu657Si5byVXG4gICAqL1xuICBwcml2YXRlIHJlYnVpbGRJbmRleCgpOiB2b2lkIHtcbiAgICB0aGlzLmFkamFjZW5jeUxpc3QuY2xlYXIoKTtcbiAgICB0aGlzLnJldmVyc2VJbmRleC5jbGVhcigpO1xuXG4gICAgZm9yIChjb25zdCByZWxhdGlvbiBvZiB0aGlzLnJlbGF0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgLy8g5q2j5ZCR57Si5byVXG4gICAgICBpZiAoIXRoaXMuYWRqYWNlbmN5TGlzdC5oYXMocmVsYXRpb24uZnJvbSkpIHtcbiAgICAgICAgdGhpcy5hZGphY2VuY3lMaXN0LnNldChyZWxhdGlvbi5mcm9tLCBuZXcgU2V0KCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5hZGphY2VuY3lMaXN0LmdldChyZWxhdGlvbi5mcm9tKSEuYWRkKHJlbGF0aW9uLnRvKTtcblxuICAgICAgLy8g5Y+N5ZCR57Si5byVXG4gICAgICBpZiAoIXRoaXMucmV2ZXJzZUluZGV4LmhhcyhyZWxhdGlvbi50bykpIHtcbiAgICAgICAgdGhpcy5yZXZlcnNlSW5kZXguc2V0KHJlbGF0aW9uLnRvLCBuZXcgU2V0KCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXZlcnNlSW5kZXguZ2V0KHJlbGF0aW9uLnRvKSEuYWRkKHJlbGF0aW9uLmZyb20pO1xuICAgIH1cbiAgfVxuXG4gIC8vID09PT09PT09PT09PSDlrp7kvZPmk43kvZwgPT09PT09PT09PT09XG5cbiAgLyoqXG4gICAqIOa3u+WKoOWunuS9k1xuICAgKi9cbiAgYXN5bmMgYWRkRW50aXR5KGVudGl0eTogT21pdDxHcmFwaEVudGl0eSwgJ2NyZWF0ZWRBdCcgfCAndXBkYXRlZEF0Jz4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGlkID0gZW50aXR5LmlkIHx8IGBlbnRpdHlfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG5cbiAgICBjb25zdCBmdWxsRW50aXR5OiBHcmFwaEVudGl0eSA9IHtcbiAgICAgIC4uLmVudGl0eSxcbiAgICAgIGlkLFxuICAgICAgY3JlYXRlZEF0OiBub3csXG4gICAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgICB9O1xuXG4gICAgdGhpcy5lbnRpdGllcy5zZXQoaWQsIGZ1bGxFbnRpdHkpO1xuXG4gICAgLy8g5Yid5aeL5YyW6YK75o6l6KGoXG4gICAgaWYgKCF0aGlzLmFkamFjZW5jeUxpc3QuaGFzKGlkKSkge1xuICAgICAgdGhpcy5hZGphY2VuY3lMaXN0LnNldChpZCwgbmV3IFNldCgpKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnJldmVyc2VJbmRleC5oYXMoaWQpKSB7XG4gICAgICB0aGlzLnJldmVyc2VJbmRleC5zZXQoaWQsIG5ldyBTZXQoKSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY29uZmlnLmF1dG9TYXZlKSB7XG4gICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgW0tub3dsZWRnZUdyYXBoXSDmt7vliqDlrp7kvZPvvJoke2lkfSAoJHtlbnRpdHkudHlwZX06JHtlbnRpdHkubmFtZX0pYCk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWunuS9k1xuICAgKi9cbiAgYXN5bmMgZ2V0RW50aXR5KGlkOiBzdHJpbmcpOiBQcm9taXNlPEdyYXBoRW50aXR5IHwgbnVsbD4ge1xuICAgIHJldHVybiB0aGlzLmVudGl0aWVzLmdldChpZCkgfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiDmm7TmlrDlrp7kvZNcbiAgICovXG4gIGFzeW5jIHVwZGF0ZUVudGl0eShpZDogc3RyaW5nLCB1cGRhdGVzOiBQYXJ0aWFsPEdyYXBoRW50aXR5Pik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuZW50aXRpZXMuZ2V0KGlkKTtcbiAgICBpZiAoIWVudGl0eSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbnRpdHkgJHtpZH0gbm90IGZvdW5kYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlZCA9IHtcbiAgICAgIC4uLmVudGl0eSxcbiAgICAgIC4uLnVwZGF0ZXMsXG4gICAgICB1cGRhdGVkQXQ6IERhdGUubm93KCksXG4gICAgfTtcblxuICAgIHRoaXMuZW50aXRpZXMuc2V0KGlkLCB1cGRhdGVkKTtcblxuICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvU2F2ZSkge1xuICAgICAgYXdhaXQgdGhpcy5zYXZlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOWIoOmZpOWunuS9k1xuICAgKi9cbiAgYXN5bmMgZGVsZXRlRW50aXR5KGlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyDliKDpmaTnm7jlhbPlhbPns7tcbiAgICBjb25zdCByZWxhdGlvbnNUb0RlbGV0ZSA9IEFycmF5LmZyb20odGhpcy5yZWxhdGlvbnMudmFsdWVzKCkpXG4gICAgICAuZmlsdGVyKHIgPT4gci5mcm9tID09PSBpZCB8fCByLnRvID09PSBpZCk7XG5cbiAgICBmb3IgKGNvbnN0IHJlbGF0aW9uIG9mIHJlbGF0aW9uc1RvRGVsZXRlKSB7XG4gICAgICBhd2FpdCB0aGlzLmRlbGV0ZVJlbGF0aW9uKHJlbGF0aW9uLmlkKTtcbiAgICB9XG5cbiAgICAvLyDliKDpmaTlrp7kvZNcbiAgICB0aGlzLmVudGl0aWVzLmRlbGV0ZShpZCk7XG4gICAgdGhpcy5hZGphY2VuY3lMaXN0LmRlbGV0ZShpZCk7XG4gICAgdGhpcy5yZXZlcnNlSW5kZXguZGVsZXRlKGlkKTtcblxuICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvU2F2ZSkge1xuICAgICAgYXdhaXQgdGhpcy5zYXZlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOafpeivouWunuS9k++8iOaMieexu+Wei++8iVxuICAgKi9cbiAgYXN5bmMgcXVlcnlFbnRpdGllc0J5VHlwZSh0eXBlOiBFbnRpdHlUeXBlKTogUHJvbWlzZTxHcmFwaEVudGl0eVtdPiB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5lbnRpdGllcy52YWx1ZXMoKSkuZmlsdGVyKGUgPT4gZS50eXBlID09PSB0eXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmkJzntKLlrp7kvZPvvIjmjInlkI3np7DvvIlcbiAgICovXG4gIGFzeW5jIHNlYXJjaEVudGl0aWVzKHF1ZXJ5OiBzdHJpbmcsIGxpbWl0OiBudW1iZXIgPSAyMCk6IFByb21pc2U8R3JhcGhFbnRpdHlbXT4ge1xuICAgIGNvbnN0IHF1ZXJ5TG93ZXIgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgZW50aXR5OiBHcmFwaEVudGl0eTsgc2NvcmU6IG51bWJlciB9PiA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcy52YWx1ZXMoKSkge1xuICAgICAgbGV0IHNjb3JlID0gMDtcblxuICAgICAgLy8g5ZCN56ew5Yy56YWNXG4gICAgICBpZiAoZW50aXR5Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeUxvd2VyKSkge1xuICAgICAgICBzY29yZSArPSAxMDtcbiAgICAgIH1cblxuICAgICAgLy8g5bGe5oCn5Yy56YWNXG4gICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC52YWx1ZXMoZW50aXR5LmF0dHJpYnV0ZXMpKSB7XG4gICAgICAgIGlmIChTdHJpbmcodmFsdWUpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnlMb3dlcikpIHtcbiAgICAgICAgICBzY29yZSArPSA1O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHsgZW50aXR5LCBzY29yZSB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmjInor4TliIbmjpLluo9cbiAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcblxuICAgIHJldHVybiByZXN1bHRzLnNsaWNlKDAsIGxpbWl0KS5tYXAociA9PiByLmVudGl0eSk7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT0g5YWz57O75pON5L2cID09PT09PT09PT09PVxuXG4gIC8qKlxuICAgKiDmt7vliqDlhbPns7tcbiAgICovXG4gIGFzeW5jIGFkZFJlbGF0aW9uKHJlbGF0aW9uOiBPbWl0PEdyYXBoUmVsYXRpb24sICdpZCcgfCAnY3JlYXRlZEF0Jz4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGlkID0gYHJlbF8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgIGNvbnN0IGZ1bGxSZWxhdGlvbjogR3JhcGhSZWxhdGlvbiA9IHtcbiAgICAgIC4uLnJlbGF0aW9uLFxuICAgICAgaWQsXG4gICAgICBjcmVhdGVkQXQ6IG5vdyxcbiAgICB9O1xuXG4gICAgdGhpcy5yZWxhdGlvbnMuc2V0KGlkLCBmdWxsUmVsYXRpb24pO1xuXG4gICAgLy8g5pu05paw57Si5byVXG4gICAgaWYgKCF0aGlzLmFkamFjZW5jeUxpc3QuaGFzKHJlbGF0aW9uLmZyb20pKSB7XG4gICAgICB0aGlzLmFkamFjZW5jeUxpc3Quc2V0KHJlbGF0aW9uLmZyb20sIG5ldyBTZXQoKSk7XG4gICAgfVxuICAgIHRoaXMuYWRqYWNlbmN5TGlzdC5nZXQocmVsYXRpb24uZnJvbSkhLmFkZChyZWxhdGlvbi50byk7XG5cbiAgICBpZiAoIXRoaXMucmV2ZXJzZUluZGV4LmhhcyhyZWxhdGlvbi50bykpIHtcbiAgICAgIHRoaXMucmV2ZXJzZUluZGV4LnNldChyZWxhdGlvbi50bywgbmV3IFNldCgpKTtcbiAgICB9XG4gICAgdGhpcy5yZXZlcnNlSW5kZXguZ2V0KHJlbGF0aW9uLnRvKSEuYWRkKHJlbGF0aW9uLmZyb20pO1xuXG4gICAgaWYgKHRoaXMuY29uZmlnLmF1dG9TYXZlKSB7XG4gICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgW0tub3dsZWRnZUdyYXBoXSDmt7vliqDlhbPns7vvvJoke3JlbGF0aW9uLmZyb219IC1bJHtyZWxhdGlvbi50eXBlfV0tPiAke3JlbGF0aW9uLnRvfWApO1xuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blhbPns7tcbiAgICovXG4gIGFzeW5jIGdldFJlbGF0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPEdyYXBoUmVsYXRpb24gfCBudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zLmdldChpZCkgfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKDpmaTlhbPns7tcbiAgICovXG4gIGFzeW5jIGRlbGV0ZVJlbGF0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByZWxhdGlvbiA9IHRoaXMucmVsYXRpb25zLmdldChpZCk7XG4gICAgaWYgKCFyZWxhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVsYXRpb25zLmRlbGV0ZShpZCk7XG5cbiAgICAvLyDmm7TmlrDntKLlvJVcbiAgICBjb25zdCB0YXJnZXRzID0gdGhpcy5hZGphY2VuY3lMaXN0LmdldChyZWxhdGlvbi5mcm9tKTtcbiAgICBpZiAodGFyZ2V0cykge1xuICAgICAgdGFyZ2V0cy5kZWxldGUocmVsYXRpb24udG8pO1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZXMgPSB0aGlzLnJldmVyc2VJbmRleC5nZXQocmVsYXRpb24udG8pO1xuICAgIGlmIChzb3VyY2VzKSB7XG4gICAgICBzb3VyY2VzLmRlbGV0ZShyZWxhdGlvbi5mcm9tKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb25maWcuYXV0b1NhdmUpIHtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blrp7kvZPnmoTlhbPns7tcbiAgICovXG4gIGFzeW5jIGdldEVudGl0eVJlbGF0aW9ucyhlbnRpdHlJZDogc3RyaW5nLCB0eXBlPzogUmVsYXRpb25UeXBlKTogUHJvbWlzZTxHcmFwaFJlbGF0aW9uW10+IHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnJlbGF0aW9ucy52YWx1ZXMoKSkuZmlsdGVyKHIgPT4ge1xuICAgICAgY29uc3QgbWF0Y2hlc0VudGl0eSA9IHIuZnJvbSA9PT0gZW50aXR5SWQgfHwgci50byA9PT0gZW50aXR5SWQ7XG4gICAgICBjb25zdCBtYXRjaGVzVHlwZSA9ICF0eXBlIHx8IHIudHlwZSA9PT0gdHlwZTtcbiAgICAgIHJldHVybiBtYXRjaGVzRW50aXR5ICYmIG1hdGNoZXNUeXBlO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09IOWbvumBjeWOhiA9PT09PT09PT09PT1cblxuICAvKipcbiAgICog6I635Y+W6YK75bGFXG4gICAqL1xuICBhc3luYyBnZXROZWlnaGJvcnMob3B0aW9uczogTmVpZ2hib3JRdWVyeSk6IFByb21pc2U8TmVpZ2hib3JSZXN1bHQ+IHtcbiAgICBjb25zdCB7IGVudGl0eUlkLCByZWxhdGlvblR5cGUsIGRpcmVjdGlvbiA9ICdib3RoJywgbGltaXQgPSA1MCB9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0IG5laWdoYm9yczogTmVpZ2hib3JSZXN1bHRbJ25laWdoYm9ycyddID0gW107XG5cbiAgICAvLyDlh7rovrlcbiAgICBpZiAoZGlyZWN0aW9uID09PSAnb3V0JyB8fCBkaXJlY3Rpb24gPT09ICdib3RoJykge1xuICAgICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMuYWRqYWNlbmN5TGlzdC5nZXQoZW50aXR5SWQpO1xuICAgICAgaWYgKHRhcmdldHMpIHtcbiAgICAgICAgZm9yIChjb25zdCByZWxhdGlvbiBvZiB0aGlzLnJlbGF0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgICAgIGlmIChyZWxhdGlvbi5mcm9tID09PSBlbnRpdHlJZCkge1xuICAgICAgICAgICAgaWYgKCFyZWxhdGlvblR5cGUgfHwgcmVsYXRpb24udHlwZSA9PT0gcmVsYXRpb25UeXBlKSB7XG4gICAgICAgICAgICAgIG5laWdoYm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBlbnRpdHlJZDogcmVsYXRpb24udG8sXG4gICAgICAgICAgICAgICAgcmVsYXRpb25UeXBlOiByZWxhdGlvbi50eXBlLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ291dCcsXG4gICAgICAgICAgICAgICAgcmVsYXRpb25JZDogcmVsYXRpb24uaWQsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWFpei+uVxuICAgIGlmIChkaXJlY3Rpb24gPT09ICdpbicgfHwgZGlyZWN0aW9uID09PSAnYm90aCcpIHtcbiAgICAgIGNvbnN0IHNvdXJjZXMgPSB0aGlzLnJldmVyc2VJbmRleC5nZXQoZW50aXR5SWQpO1xuICAgICAgaWYgKHNvdXJjZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCByZWxhdGlvbiBvZiB0aGlzLnJlbGF0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgICAgIGlmIChyZWxhdGlvbi50byA9PT0gZW50aXR5SWQpIHtcbiAgICAgICAgICAgIGlmICghcmVsYXRpb25UeXBlIHx8IHJlbGF0aW9uLnR5cGUgPT09IHJlbGF0aW9uVHlwZSkge1xuICAgICAgICAgICAgICBuZWlnaGJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgZW50aXR5SWQ6IHJlbGF0aW9uLmZyb20sXG4gICAgICAgICAgICAgICAgcmVsYXRpb25UeXBlOiByZWxhdGlvbi50eXBlLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ2luJyxcbiAgICAgICAgICAgICAgICByZWxhdGlvbklkOiByZWxhdGlvbi5pZCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVudGl0eUlkLFxuICAgICAgbmVpZ2hib3JzOiBuZWlnaGJvcnMuc2xpY2UoMCwgbGltaXQpLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICog5Zu+6YGN5Y6G77yIQkZT77yJXG4gICAqL1xuICBhc3luYyB0cmF2ZXJzZShzdGFydElkOiBzdHJpbmcsIG9wdGlvbnM6IFRyYXZlcnNlT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxHcmFwaFBhdGhbXT4ge1xuICAgIGNvbnN0IHsgbWF4RGVwdGggPSA1LCByZWxhdGlvblR5cGVzLCBkaXJlY3Rpb24gPSAnZm9yd2FyZCcgfSA9IG9wdGlvbnM7XG5cbiAgICBjb25zdCBwYXRoczogR3JhcGhQYXRoW10gPSBbXTtcbiAgICBjb25zdCB2aXNpdGVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgcXVldWU6IEFycmF5PHsgbm9kZUlkOiBzdHJpbmc7IHBhdGg6IHN0cmluZ1tdOyByZWxhdGlvbnM6IHN0cmluZ1tdOyBkZXB0aDogbnVtYmVyIH0+ID0gW1xuICAgICAgeyBub2RlSWQ6IHN0YXJ0SWQsIHBhdGg6IFtzdGFydElkXSwgcmVsYXRpb25zOiBbXSwgZGVwdGg6IDAgfSxcbiAgICBdO1xuXG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHsgbm9kZUlkLCBwYXRoLCByZWxhdGlvbnMsIGRlcHRoIH0gPSBxdWV1ZS5zaGlmdCgpITtcblxuICAgICAgaWYgKGRlcHRoID49IG1heERlcHRoKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyDojrflj5bpgrvlsYVcbiAgICAgIGNvbnN0IG5laWdoYm9yUmVzdWx0ID0gYXdhaXQgdGhpcy5nZXROZWlnaGJvcnMoe1xuICAgICAgICBlbnRpdHlJZDogbm9kZUlkLFxuICAgICAgICByZWxhdGlvblR5cGU6IHJlbGF0aW9uVHlwZXM/LlswXSxcbiAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb24gPT09ICdmb3J3YXJkJyA/ICdvdXQnIDogZGlyZWN0aW9uID09PSAnYmFja3dhcmQnID8gJ2luJyA6ICdib3RoJyxcbiAgICAgIH0pO1xuXG4gICAgICBmb3IgKGNvbnN0IG5laWdoYm9yIG9mIG5laWdoYm9yUmVzdWx0Lm5laWdoYm9ycykge1xuICAgICAgICBpZiAodmlzaXRlZC5oYXMobmVpZ2hib3IuZW50aXR5SWQpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXdQYXRoID0gWy4uLnBhdGgsIG5laWdoYm9yLmVudGl0eUlkXTtcbiAgICAgICAgY29uc3QgbmV3UmVsYXRpb25zID0gWy4uLnJlbGF0aW9ucywgbmVpZ2hib3IucmVsYXRpb25JZF07XG5cbiAgICAgICAgLy8g6K6w5b2V6Lev5b6EXG4gICAgICAgIHBhdGhzLnB1c2goe1xuICAgICAgICAgIHN0YXJ0OiBzdGFydElkLFxuICAgICAgICAgIGVuZDogbmVpZ2hib3IuZW50aXR5SWQsXG4gICAgICAgICAgbm9kZXM6IG5ld1BhdGgsXG4gICAgICAgICAgcmVsYXRpb25zOiBuZXdSZWxhdGlvbnMsXG4gICAgICAgICAgbGVuZ3RoOiBuZXdQYXRoLmxlbmd0aCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmlzaXRlZC5hZGQobmVpZ2hib3IuZW50aXR5SWQpO1xuXG4gICAgICAgIC8vIOe7p+e7remBjeWOhlxuICAgICAgICBxdWV1ZS5wdXNoKHtcbiAgICAgICAgICBub2RlSWQ6IG5laWdoYm9yLmVudGl0eUlkLFxuICAgICAgICAgIHBhdGg6IG5ld1BhdGgsXG4gICAgICAgICAgcmVsYXRpb25zOiBuZXdSZWxhdGlvbnMsXG4gICAgICAgICAgZGVwdGg6IGRlcHRoICsgMSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGhzO1xuICB9XG5cbiAgLyoqXG4gICAqIOafpeaJvuacgOefrei3r+W+hO+8iEJGU++8iVxuICAgKi9cbiAgYXN5bmMgZmluZFNob3J0ZXN0UGF0aChmcm9tSWQ6IHN0cmluZywgdG9JZDogc3RyaW5nKTogUHJvbWlzZTxHcmFwaFBhdGggfCBudWxsPiB7XG4gICAgaWYgKGZyb21JZCA9PT0gdG9JZCkge1xuICAgICAgcmV0dXJuIHsgc3RhcnQ6IGZyb21JZCwgZW5kOiB0b0lkLCBub2RlczogW2Zyb21JZF0sIHJlbGF0aW9uczogW10sIGxlbmd0aDogMCB9O1xuICAgIH1cblxuICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBxdWV1ZTogQXJyYXk8eyBub2RlSWQ6IHN0cmluZzsgcGF0aDogc3RyaW5nW107IHJlbGF0aW9uczogc3RyaW5nW10gfT4gPSBbXG4gICAgICB7IG5vZGVJZDogZnJvbUlkLCBwYXRoOiBbZnJvbUlkXSwgcmVsYXRpb25zOiBbXSB9LFxuICAgIF07XG5cbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgeyBub2RlSWQsIHBhdGgsIHJlbGF0aW9ucyB9ID0gcXVldWUuc2hpZnQoKSE7XG5cbiAgICAgIGNvbnN0IG5laWdoYm9yUmVzdWx0ID0gYXdhaXQgdGhpcy5nZXROZWlnaGJvcnMoe1xuICAgICAgICBlbnRpdHlJZDogbm9kZUlkLFxuICAgICAgICBkaXJlY3Rpb246ICdvdXQnLFxuICAgICAgfSk7XG5cbiAgICAgIGZvciAoY29uc3QgbmVpZ2hib3Igb2YgbmVpZ2hib3JSZXN1bHQubmVpZ2hib3JzKSB7XG4gICAgICAgIGlmIChuZWlnaGJvci5lbnRpdHlJZCA9PT0gdG9JZCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydDogZnJvbUlkLFxuICAgICAgICAgICAgZW5kOiB0b0lkLFxuICAgICAgICAgICAgbm9kZXM6IFsuLi5wYXRoLCB0b0lkXSxcbiAgICAgICAgICAgIHJlbGF0aW9uczogWy4uLnJlbGF0aW9ucywgbmVpZ2hib3IucmVsYXRpb25JZF0sXG4gICAgICAgICAgICBsZW5ndGg6IHBhdGgubGVuZ3RoICsgMSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF2aXNpdGVkLmhhcyhuZWlnaGJvci5lbnRpdHlJZCkpIHtcbiAgICAgICAgICB2aXNpdGVkLmFkZChuZWlnaGJvci5lbnRpdHlJZCk7XG4gICAgICAgICAgcXVldWUucHVzaCh7XG4gICAgICAgICAgICBub2RlSWQ6IG5laWdoYm9yLmVudGl0eUlkLFxuICAgICAgICAgICAgcGF0aDogWy4uLnBhdGgsIG5laWdoYm9yLmVudGl0eUlkXSxcbiAgICAgICAgICAgIHJlbGF0aW9uczogWy4uLnJlbGF0aW9ucywgbmVpZ2hib3IucmVsYXRpb25JZF0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDsgLy8g5peg6Lev5b6EXG4gIH1cblxuICAvLyA9PT09PT09PT09PT0g57uf6K6h5L+h5oGvID09PT09PT09PT09PVxuXG4gIC8qKlxuICAgKiDojrflj5bnu5/orqHkv6Hmga9cbiAgICovXG4gIGdldFN0YXRzKCk6IHtcbiAgICB0b3RhbEVudGl0aWVzOiBudW1iZXI7XG4gICAgdG90YWxSZWxhdGlvbnM6IG51bWJlcjtcbiAgICBlbnRpdGllc0J5VHlwZTogUmVjb3JkPEVudGl0eVR5cGUsIG51bWJlcj47XG4gICAgcmVsYXRpb25zQnlUeXBlOiBSZWNvcmQ8UmVsYXRpb25UeXBlLCBudW1iZXI+O1xuICAgIGF2Z1JlbGF0aW9uc1BlckVudGl0eTogbnVtYmVyO1xuICB9IHtcbiAgICBjb25zdCBlbnRpdGllc0J5VHlwZTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuICAgIGNvbnN0IHJlbGF0aW9uc0J5VHlwZTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcy52YWx1ZXMoKSkge1xuICAgICAgZW50aXRpZXNCeVR5cGVbZW50aXR5LnR5cGVdID0gKGVudGl0aWVzQnlUeXBlW2VudGl0eS50eXBlXSB8fCAwKSArIDE7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCByZWxhdGlvbiBvZiB0aGlzLnJlbGF0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgcmVsYXRpb25zQnlUeXBlW3JlbGF0aW9uLnR5cGVdID0gKHJlbGF0aW9uc0J5VHlwZVtyZWxhdGlvbi50eXBlXSB8fCAwKSArIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvdGFsRW50aXRpZXM6IHRoaXMuZW50aXRpZXMuc2l6ZSxcbiAgICAgIHRvdGFsUmVsYXRpb25zOiB0aGlzLnJlbGF0aW9ucy5zaXplLFxuICAgICAgZW50aXRpZXNCeVR5cGU6IGVudGl0aWVzQnlUeXBlIGFzIFJlY29yZDxFbnRpdHlUeXBlLCBudW1iZXI+LFxuICAgICAgcmVsYXRpb25zQnlUeXBlOiByZWxhdGlvbnNCeVR5cGUgYXMgUmVjb3JkPFJlbGF0aW9uVHlwZSwgbnVtYmVyPixcbiAgICAgIGF2Z1JlbGF0aW9uc1BlckVudGl0eTogdGhpcy5yZWxhdGlvbnMuc2l6ZSAvIE1hdGgubWF4KDEsIHRoaXMuZW50aXRpZXMuc2l6ZSksXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmuIXnqbrlm77osLFcbiAgICovXG4gIGFzeW5jIGNsZWFyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuZW50aXRpZXMuY2xlYXIoKTtcbiAgICB0aGlzLnJlbGF0aW9ucy5jbGVhcigpO1xuICAgIHRoaXMuYWRqYWNlbmN5TGlzdC5jbGVhcigpO1xuICAgIHRoaXMucmV2ZXJzZUluZGV4LmNsZWFyKCk7XG5cbiAgICBpZiAodGhpcy5jb25maWcuYXV0b1NhdmUpIHtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDplIDmr4HvvIjlgZzmraLoh6rliqjkv53lrZjvvIlcbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2F2ZVRpbWVyKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuc2F2ZVRpbWVyKTtcbiAgICB9XG4gICAgLy8g5pyA5ZCO5L+d5a2Y5LiA5qyhXG4gICAgdGhpcy5zYXZlKCk7XG4gIH1cbn1cbiJdfQ==