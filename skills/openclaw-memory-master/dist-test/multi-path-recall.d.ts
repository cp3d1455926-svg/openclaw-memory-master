/**
 * Multi-Path Recall - 多路召回融合
 *
 * 结合三种检索方式：
 * 1. 语义检索（向量相似度）
 * 2. 关键词检索（BM25）
 * 3. 图检索（知识图谱遍历）
 *
 * 使用 RRF/Borda/加权融合进行结果融合
 *
 * @author 小鬼 👻 + Jake
 * @version 4.2.0
 */
export interface RecallResult {
    memoryId: string;
    score: number;
    source: 'semantic' | 'keyword' | 'graph';
    memory: any;
}
export interface FusedResult {
    memoryId: string;
    fusedScore: number;
    sources: Array<{
        source: 'semantic' | 'keyword' | 'graph';
        score: number;
        rank: number;
    }>;
    memory: any;
}
export interface BM25Config {
    k1?: number;
    b?: number;
}
export declare class BM25Index {
    private config;
    private documents;
    private termFreq;
    private docFreq;
    private avgDocLength;
    constructor(config?: BM25Config);
    /**
     * 添加文档
     */
    addDocument(id: string, content: string): void;
    /**
     * 批量添加文档
     */
    addDocuments(docs: Array<{
        id: string;
        content: string;
    }>): void;
    /**
     * 检索
     */
    search(query: string, topK?: number): Array<{
        id: string;
        score: number;
    }>;
    /**
     * 简单中文分词（按字符）
     * TODO: 集成 jieba 分词
     */
    private tokenize;
    /**
     * 删除文档
     */
    removeDocument(id: string): void;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalDocuments: number;
        totalTerms: number;
        avgDocLength: number;
    };
}
export type FusionMethod = 'rrf' | 'borda' | 'weighted' | 'reciprocal';
export interface FusionConfig {
    method?: FusionMethod;
    weights?: {
        semantic?: number;
        keyword?: number;
        graph?: number;
    };
    rrfK?: number;
}
export declare class FusionRanker {
    private config;
    constructor(config?: FusionConfig);
    /**
     * 融合多路检索结果
     */
    fuse(semantic: RecallResult[], keyword: RecallResult[], graph: RecallResult[]): FusedResult[];
    /**
     * RRF (Reciprocal Rank Fusion) - 倒排排名融合
     *
     * 公式：RRF(d) = Σ 1/(k + rank_i(d))
     * k 是常数（通常 60）
     */
    private rrfFusion;
    /**
     * Borda Count - 波达计数法
     *
     * 公式：Borda(d) = Σ (N - rank_i(d))
     * N 是候选集大小
     */
    private bordaFusion;
    /**
     * 加权融合
     *
     * 公式：Score(d) = w1*semantic + w2*keyword + w3*graph
     */
    private weightedFusion;
    /**
     * 倒数融合（简化版 RRF）
     */
    private reciprocalFusion;
    /**
     * 更新权重
     */
    updateWeights(weights: {
        semantic?: number;
        keyword?: number;
        graph?: number;
    }): void;
}
export interface MultiPathRecallConfig {
    basePath?: string;
    fusionMethod?: FusionMethod;
    weights?: {
        semantic?: number;
        keyword?: number;
        graph?: number;
    };
}
export declare class MultiPathRecallManager {
    private config;
    private bm25Index;
    private fusionRanker;
    private memoryStore;
    constructor(config?: MultiPathRecallConfig);
    /**
     * 添加记忆
     */
    addMemory(id: string, content: string, memory: any): Promise<void>;
    /**
     * 批量添加记忆
     */
    addMemories(memories: Array<{
        id: string;
        content: string;
        memory: any;
    }>): Promise<void>;
    /**
     * 多路召回
     */
    recall(query: string, options?: {
        topK?: number;
        useSemantic?: boolean;
        useKeyword?: boolean;
        useGraph?: boolean;
    }): Promise<FusedResult[]>;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalMemories: number;
        bm25Stats: {
            totalDocuments: number;
            totalTerms: number;
            avgDocLength: number;
        };
        fusionMethod: FusionMethod;
        weights: {
            semantic: number;
            keyword: number;
            graph: number;
        };
    };
    /**
     * 更新融合权重
     */
    updateWeights(weights: {
        semantic?: number;
        keyword?: number;
        graph?: number;
    }): void;
}
