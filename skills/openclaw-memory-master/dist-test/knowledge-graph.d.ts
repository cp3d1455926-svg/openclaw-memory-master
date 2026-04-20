/**
 * Knowledge Graph Engine - 知识图谱引擎
 *
 * 基于 HippoRAG + ZEP + Ontology 最佳实践
 * 支持实体管理、关系管理、图遍历、自动构建
 *
 * @author 小鬼 👻 + Jake
 * @version 4.2.0
 */
export type EntityType = 'Person' | 'Project' | 'Task' | 'Skill' | 'Memory' | 'Event' | 'Concept';
export interface GraphEntity {
    id: string;
    type: EntityType;
    name: string;
    attributes: Record<string, any>;
    createdAt: number;
    updatedAt: number;
}
export type RelationType = 'works_on' | 'knows' | 'created' | 'has_task' | 'uses_skill' | 'owned_by' | 'assigned_to' | 'part_of' | 'depends_on' | 'related_to' | 'attended_by' | 'about' | 'references';
export interface GraphRelation {
    id: string;
    from: string;
    to: string;
    type: RelationType;
    description: string;
    weight: number;
    createdAt: number;
}
export interface GraphPath {
    start: string;
    end: string;
    nodes: string[];
    relations: string[];
    length: number;
}
export interface TraverseOptions {
    maxDepth?: number;
    relationTypes?: RelationType[];
    direction?: 'forward' | 'backward' | 'both';
}
export interface NeighborQuery {
    entityId: string;
    relationType?: RelationType;
    direction?: 'in' | 'out' | 'both';
    limit?: number;
}
export interface NeighborResult {
    entityId: string;
    neighbors: Array<{
        entityId: string;
        relationType: RelationType;
        direction: 'in' | 'out';
        relationId: string;
    }>;
}
export interface GraphConfig {
    basePath?: string;
    autoSave?: boolean;
    autoSaveInterval?: number;
}
export declare class KnowledgeGraph {
    private config;
    private entities;
    private relations;
    private adjacencyList;
    private reverseIndex;
    private saveTimer?;
    constructor(config?: GraphConfig);
    /**
     * 初始化图谱
     */
    private init;
    /**
     * 加载数据
     */
    private load;
    /**
     * 保存数据
     */
    private save;
    /**
     * 启动自动保存
     */
    private startAutoSave;
    /**
     * 重建索引
     */
    private rebuildIndex;
    /**
     * 添加实体
     */
    addEntity(entity: Omit<GraphEntity, 'createdAt' | 'updatedAt'>): Promise<string>;
    /**
     * 获取实体
     */
    getEntity(id: string): Promise<GraphEntity | null>;
    /**
     * 更新实体
     */
    updateEntity(id: string, updates: Partial<GraphEntity>): Promise<void>;
    /**
     * 删除实体
     */
    deleteEntity(id: string): Promise<void>;
    /**
     * 查询实体（按类型）
     */
    queryEntitiesByType(type: EntityType): Promise<GraphEntity[]>;
    /**
     * 搜索实体（按名称）
     */
    searchEntities(query: string, limit?: number): Promise<GraphEntity[]>;
    /**
     * 添加关系
     */
    addRelation(relation: Omit<GraphRelation, 'id' | 'createdAt'>): Promise<string>;
    /**
     * 获取关系
     */
    getRelation(id: string): Promise<GraphRelation | null>;
    /**
     * 删除关系
     */
    deleteRelation(id: string): Promise<void>;
    /**
     * 获取实体的关系
     */
    getEntityRelations(entityId: string, type?: RelationType): Promise<GraphRelation[]>;
    /**
     * 获取邻居
     */
    getNeighbors(options: NeighborQuery): Promise<NeighborResult>;
    /**
     * 图遍历（BFS）
     */
    traverse(startId: string, options?: TraverseOptions): Promise<GraphPath[]>;
    /**
     * 查找最短路径（BFS）
     */
    findShortestPath(fromId: string, toId: string): Promise<GraphPath | null>;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalEntities: number;
        totalRelations: number;
        entitiesByType: Record<EntityType, number>;
        relationsByType: Record<RelationType, number>;
        avgRelationsPerEntity: number;
    };
    /**
     * 清空图谱
     */
    clear(): Promise<void>;
    /**
     * 销毁（停止自动保存）
     */
    destroy(): void;
}
