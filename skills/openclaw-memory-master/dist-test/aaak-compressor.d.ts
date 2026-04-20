/**
 * AAAK Compressor - AAAK 压缩算法核心
 *
 * 基于 MemPalace 的 AAAK 压缩理念
 * Abstract → Align → Anchor → Knowledge
 *
 * 压缩流程：
 * 1. Abstract: 提取核心摘要，移除冗余
 * 2. Align: 对齐上下文，建立关联
 * 3. Anchor: 识别关键锚点，标记重点
 * 4. Knowledge: 结构化知识，生成压缩表示
 *
 * @author 小鬼 👻 + Jake
 * @version 4.2.0
 */
export interface CompressedMemory {
    id: string;
    original?: string;
    abstract: string;
    align: Alignment[];
    anchors: Anchor[];
    knowledge: Knowledge;
    metadata: CompressionMetadata;
    checksum: string;
}
export interface Alignment {
    type: 'temporal' | 'semantic' | 'relational';
    source: string;
    target: string;
    relation: string;
    confidence: number;
}
export interface Anchor {
    id: string;
    type: 'entity' | 'concept' | 'event' | 'action';
    text: string;
    position: number;
    weight: number;
    references: string[];
}
export interface Knowledge {
    entities: Entity[];
    relations: Relation[];
    summary: string;
    keywords: string[];
    categories: string[];
}
export interface Entity {
    id: string;
    name: string;
    type: string;
    attributes: Record<string, any>;
}
export interface Relation {
    from: string;
    to: string;
    type: string;
    description: string;
}
export interface CompressionMetadata {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    timestamp: number;
    version: string;
    stages: {
        abstract: boolean;
        align: boolean;
        anchor: boolean;
        knowledge: boolean;
    };
}
export interface CompressionOptions {
    targetRatio?: number;
    preserveOriginal?: boolean;
    preserveEntities?: boolean;
    preserveRelations?: boolean;
    minAnchorWeight?: number;
}
/**
 * AAAK 压缩器
 */
export declare class AAAKCompressor {
    private config;
    constructor(options?: CompressionOptions);
    /**
     * 压缩记忆
     */
    compress(content: string, id?: string): Promise<CompressedMemory>;
    /**
     * 解压记忆（无损还原）
     */
    decompress(compressed: CompressedMemory): Promise<string>;
    /**
     * 从知识重建文本（有损）
     */
    private reconstructFromKnowledge;
    /**
     * 阶段 1: 提取摘要
     */
    private extractAbstract;
    /**
     * 阶段 2: 上下文对齐
     */
    private alignContext;
    /**
     * 阶段 3: 识别锚点
     */
    private identifyAnchors;
    /**
     * 阶段 4: 构建知识
     */
    private structureKnowledge;
    /**
     * 分类锚点类型
     */
    private classifyAnchorType;
    /**
     * 计算锚点权重
     */
    private calculateAnchorWeight;
    /**
     * 分类内容
     */
    private classifyContent;
    /**
     * 计算校验和
     */
    private calculateChecksum;
    /**
     * 计算压缩后大小
     */
    private calculateCompressedSize;
    /**
     * 批量压缩
     */
    batchCompress(contents: string[]): Promise<CompressedMemory[]>;
    /**
     * 压缩质量评估
     */
    evaluateQuality(original: string, compressed: CompressedMemory): QualityReport;
}
export interface QualityReport {
    compressionRatio: number;
    informationRetention: number;
    entityAccuracy: number;
    relationAccuracy: number;
    overallScore: number;
}
