"use strict";
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
exports.MultiPathRecallManager = exports.FusionRanker = exports.BM25Index = void 0;
const fs = __importStar(require("fs"));
class BM25Index {
    constructor(config = {}) {
        this.config = {
            k1: config.k1 ?? 1.2,
            b: config.b ?? 0.75,
        };
        this.documents = new Map();
        this.termFreq = new Map();
        this.docFreq = new Map();
        this.avgDocLength = 0;
    }
    /**
     * 添加文档
     */
    addDocument(id, content) {
        this.documents.set(id, content);
        // 分词（简单中文分词）
        const terms = this.tokenize(content);
        // 计算词频
        const tf = new Map();
        for (const term of terms) {
            tf.set(term, (tf.get(term) || 0) + 1);
        }
        this.termFreq.set(id, tf);
        // 更新文档频率
        for (const term of tf.keys()) {
            this.docFreq.set(term, (this.docFreq.get(term) || 0) + 1);
        }
        // 更新平均长度
        const totalLength = Array.from(this.documents.values())
            .reduce((sum, doc) => sum + this.tokenize(doc).length, 0);
        this.avgDocLength = totalLength / this.documents.size;
    }
    /**
     * 批量添加文档
     */
    addDocuments(docs) {
        for (const doc of docs) {
            this.addDocument(doc.id, doc.content);
        }
    }
    /**
     * 检索
     */
    search(query, topK = 20) {
        const queryTerms = this.tokenize(query);
        const scores = new Map();
        // BM25 评分
        for (const [docId, content] of this.documents.entries()) {
            const docLength = this.tokenize(content).length;
            let score = 0;
            for (const term of queryTerms) {
                const tf = this.termFreq.get(docId)?.get(term) || 0;
                const df = this.docFreq.get(term) || 0;
                if (tf > 0 && df > 0) {
                    // IDF
                    const idf = Math.log((this.documents.size - df + 0.5) / (df + 0.5) + 1);
                    // 词频部分
                    const numerator = tf * (this.config.k1 + 1);
                    const denominator = tf + this.config.k1 * (1 - this.config.b + this.config.b * (docLength / this.avgDocLength));
                    score += idf * (numerator / denominator);
                }
            }
            if (score > 0) {
                scores.set(docId, score);
            }
        }
        // 排序
        const results = Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topK);
        return results.map(([id, score]) => ({ id, score }));
    }
    /**
     * 简单中文分词（按字符）
     * TODO: 集成 jieba 分词
     */
    tokenize(text) {
        // 移除标点，保留中文、英文、数字
        const cleaned = text.replace(/[^\w\u4e00-\u9fa5]/g, ' ');
        // 简单分词：中文按字，英文按词
        const terms = [];
        let currentWord = '';
        for (const char of cleaned) {
            if (/[\u4e00-\u9fa5]/.test(char)) {
                // 中文字符：单独成词
                if (currentWord) {
                    terms.push(currentWord);
                    currentWord = '';
                }
                terms.push(char);
            }
            else if (/\w/.test(char)) {
                // 英文/数字：累积成词
                currentWord += char;
            }
            else {
                // 空格/标点：分隔
                if (currentWord) {
                    terms.push(currentWord);
                    currentWord = '';
                }
            }
        }
        if (currentWord) {
            terms.push(currentWord);
        }
        return terms.filter(t => t.length > 0);
    }
    /**
     * 删除文档
     */
    removeDocument(id) {
        const content = this.documents.get(id);
        if (!content)
            return;
        // 更新文档频率
        const tf = this.termFreq.get(id);
        if (tf) {
            for (const term of tf.keys()) {
                const df = this.docFreq.get(term) || 0;
                if (df > 0) {
                    this.docFreq.set(term, df - 1);
                }
            }
        }
        this.documents.delete(id);
        this.termFreq.delete(id);
        // 重新计算平均长度
        if (this.documents.size > 0) {
            const totalLength = Array.from(this.documents.values())
                .reduce((sum, doc) => sum + this.tokenize(doc).length, 0);
            this.avgDocLength = totalLength / this.documents.size;
        }
    }
    /**
     * 获取统计信息
     */
    getStats() {
        const totalTerms = Array.from(this.docFreq.keys()).length;
        return {
            totalDocuments: this.documents.size,
            totalTerms,
            avgDocLength: this.avgDocLength,
        };
    }
}
exports.BM25Index = BM25Index;
class FusionRanker {
    constructor(config = {}) {
        this.config = {
            method: config.method ?? 'rrf',
            weights: {
                semantic: config.weights?.semantic ?? 0.4,
                keyword: config.weights?.keyword ?? 0.3,
                graph: config.weights?.graph ?? 0.3,
            },
            rrfK: config.rrfK ?? 60,
        };
    }
    /**
     * 融合多路检索结果
     */
    fuse(semantic, keyword, graph) {
        switch (this.config.method) {
            case 'rrf':
                return this.rrfFusion(semantic, keyword, graph);
            case 'borda':
                return this.bordaFusion(semantic, keyword, graph);
            case 'weighted':
                return this.weightedFusion(semantic, keyword, graph);
            case 'reciprocal':
                return this.reciprocalFusion(semantic, keyword, graph);
            default:
                return this.rrfFusion(semantic, keyword, graph);
        }
    }
    /**
     * RRF (Reciprocal Rank Fusion) - 倒排排名融合
     *
     * 公式：RRF(d) = Σ 1/(k + rank_i(d))
     * k 是常数（通常 60）
     */
    rrfFusion(semantic, keyword, graph) {
        const fused = new Map();
        const k = this.config.rrfK;
        // 合并所有结果
        const allResults = [
            { source: 'semantic', results: semantic },
            { source: 'keyword', results: keyword },
            { source: 'graph', results: graph },
        ];
        for (const { source, results } of allResults) {
            for (let rank = 0; rank < results.length; rank++) {
                const result = results[rank];
                if (!fused.has(result.memoryId)) {
                    fused.set(result.memoryId, {
                        memoryId: result.memoryId,
                        fusedScore: 0,
                        sources: [],
                        memory: result.memory,
                    });
                }
                const fusedResult = fused.get(result.memoryId);
                // RRF 评分
                const rrfScore = 1 / (k + rank + 1);
                fusedResult.fusedScore += rrfScore;
                // 记录来源
                fusedResult.sources.push({
                    source,
                    score: result.score,
                    rank: rank + 1,
                });
            }
        }
        // 按融合评分排序
        return Array.from(fused.values())
            .sort((a, b) => b.fusedScore - a.fusedScore);
    }
    /**
     * Borda Count - 波达计数法
     *
     * 公式：Borda(d) = Σ (N - rank_i(d))
     * N 是候选集大小
     */
    bordaFusion(semantic, keyword, graph) {
        const fused = new Map();
        const allResults = [
            { source: 'semantic', results: semantic },
            { source: 'keyword', results: keyword },
            { source: 'graph', results: graph },
        ];
        for (const { source, results } of allResults) {
            const n = results.length;
            for (let rank = 0; rank < results.length; rank++) {
                const result = results[rank];
                if (!fused.has(result.memoryId)) {
                    fused.set(result.memoryId, {
                        memoryId: result.memoryId,
                        fusedScore: 0,
                        sources: [],
                        memory: result.memory,
                    });
                }
                const fusedResult = fused.get(result.memoryId);
                // Borda 评分
                const bordaScore = n - rank;
                fusedResult.fusedScore += bordaScore;
                fusedResult.sources.push({
                    source,
                    score: result.score,
                    rank: rank + 1,
                });
            }
        }
        return Array.from(fused.values())
            .sort((a, b) => b.fusedScore - a.fusedScore);
    }
    /**
     * 加权融合
     *
     * 公式：Score(d) = w1*semantic + w2*keyword + w3*graph
     */
    weightedFusion(semantic, keyword, graph) {
        const fused = new Map();
        const weights = this.config.weights;
        const allResults = [
            { source: 'semantic', results: semantic, weight: weights.semantic },
            { source: 'keyword', results: keyword, weight: weights.keyword },
            { source: 'graph', results: graph, weight: weights.graph },
        ];
        for (const { source, results, weight } of allResults) {
            for (let rank = 0; rank < results.length; rank++) {
                const result = results[rank];
                if (!fused.has(result.memoryId)) {
                    fused.set(result.memoryId, {
                        memoryId: result.memoryId,
                        fusedScore: 0,
                        sources: [],
                        memory: result.memory,
                    });
                }
                const fusedResult = fused.get(result.memoryId);
                // 加权评分
                const weightedScore = result.score * (weight ?? 0.33);
                fusedResult.fusedScore += weightedScore;
                fusedResult.sources.push({
                    source,
                    score: result.score,
                    rank: rank + 1,
                });
            }
        }
        return Array.from(fused.values())
            .sort((a, b) => b.fusedScore - a.fusedScore);
    }
    /**
     * 倒数融合（简化版 RRF）
     */
    reciprocalFusion(semantic, keyword, graph) {
        const fused = new Map();
        const allResults = [
            { source: 'semantic', results: semantic },
            { source: 'keyword', results: keyword },
            { source: 'graph', results: graph },
        ];
        for (const { source, results } of allResults) {
            for (let rank = 0; rank < results.length; rank++) {
                const result = results[rank];
                if (!fused.has(result.memoryId)) {
                    fused.set(result.memoryId, {
                        memoryId: result.memoryId,
                        fusedScore: 0,
                        sources: [],
                        memory: result.memory,
                    });
                }
                const fusedResult = fused.get(result.memoryId);
                // 倒数评分
                const reciprocalScore = 1 / (rank + 1);
                fusedResult.fusedScore += reciprocalScore;
                fusedResult.sources.push({
                    source,
                    score: result.score,
                    rank: rank + 1,
                });
            }
        }
        return Array.from(fused.values())
            .sort((a, b) => b.fusedScore - a.fusedScore);
    }
    /**
     * 更新权重
     */
    updateWeights(weights) {
        if (weights.semantic !== undefined) {
            this.config.weights.semantic = weights.semantic;
        }
        if (weights.keyword !== undefined) {
            this.config.weights.keyword = weights.keyword;
        }
        if (weights.graph !== undefined) {
            this.config.weights.graph = weights.graph;
        }
        // 归一化
        const total = (this.config.weights.semantic ?? 0.33) +
            (this.config.weights.keyword ?? 0.33) +
            (this.config.weights.graph ?? 0.34);
        if (total > 0) {
            this.config.weights.semantic = (this.config.weights.semantic ?? 0.33) / total;
            this.config.weights.keyword = (this.config.weights.keyword ?? 0.33) / total;
            this.config.weights.graph = (this.config.weights.graph ?? 0.34) / total;
        }
    }
}
exports.FusionRanker = FusionRanker;
class MultiPathRecallManager {
    constructor(config = {}) {
        this.config = {
            basePath: config.basePath ?? 'memory/multi-path-recall',
            fusionMethod: config.fusionMethod ?? 'rrf',
            weights: {
                semantic: config.weights?.semantic ?? 0.4,
                keyword: config.weights?.keyword ?? 0.3,
                graph: config.weights?.graph ?? 0.3,
            },
        };
        this.bm25Index = new BM25Index();
        this.fusionRanker = new FusionRanker({
            method: this.config.fusionMethod,
            weights: {
                semantic: this.config.weights.semantic ?? 0.4,
                keyword: this.config.weights.keyword ?? 0.3,
                graph: this.config.weights.graph ?? 0.3,
            },
        });
        this.memoryStore = new Map();
        // 确保目录存在
        if (!fs.existsSync(this.config.basePath)) {
            fs.mkdirSync(this.config.basePath, { recursive: true });
        }
    }
    /**
     * 添加记忆
     */
    async addMemory(id, content, memory) {
        this.memoryStore.set(id, memory);
        this.bm25Index.addDocument(id, content);
    }
    /**
     * 批量添加记忆
     */
    async addMemories(memories) {
        for (const m of memories) {
            await this.addMemory(m.id, m.content, m.memory);
        }
    }
    /**
     * 多路召回
     */
    async recall(query, options = {}) {
        const { topK = 20, useSemantic = true, useKeyword = true, useGraph = true, } = options;
        const results = {
            semantic: [],
            keyword: [],
            graph: [],
        };
        // 1. 关键词检索（BM25）
        if (useKeyword) {
            const bm25Results = this.bm25Index.search(query, topK * 2);
            results.keyword = bm25Results.map(r => ({
                memoryId: r.id,
                score: r.score,
                source: 'keyword',
                memory: this.memoryStore.get(r.id),
            }));
        }
        // 2. 语义检索（TODO: 向量检索）
        if (useSemantic) {
            // 暂时用 BM25 模拟语义检索
            // 实际应该用向量相似度
            results.semantic = results.keyword.slice(0, topK);
        }
        // 3. 图检索（TODO: 知识图谱）
        if (useGraph) {
            // 暂时返回空结果
            // 实际应该用 KnowledgeGraph 检索
            results.graph = [];
        }
        // 4. 融合排序
        const fused = this.fusionRanker.fuse(results.semantic, results.keyword, results.graph);
        // 5. 返回 Top-K
        return fused.slice(0, topK);
    }
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalMemories: this.memoryStore.size,
            bm25Stats: this.bm25Index.getStats(),
            fusionMethod: this.config.fusionMethod,
            weights: this.config.weights,
        };
    }
    /**
     * 更新融合权重
     */
    updateWeights(weights) {
        this.fusionRanker.updateWeights(weights);
    }
}
exports.MultiPathRecallManager = MultiPathRecallManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGktcGF0aC1yZWNhbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbXVsdGktcGF0aC1yZWNhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7R0FZRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsdUNBQXlCO0FBOEJ6QixNQUFhLFNBQVM7SUFPcEIsWUFBWSxTQUFxQixFQUFFO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFDWixFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxHQUFHO1lBQ3BCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUk7U0FDcEIsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVcsQ0FBQyxFQUFVLEVBQUUsT0FBZTtRQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFaEMsYUFBYTtRQUNiLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckMsT0FBTztRQUNQLE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1FBQ3JDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7WUFDekIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFD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QUFJLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQscUJBQXFCO1FBQ3JCLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixVQUFVO1lBQ1YsMEJBQTBCO1lBQzFCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFFRCxVQUFVO1FBQ1YsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQ2xDLE9BQU8sQ0FBQyxRQUFRLEVBQ2hCLE9BQU8sQ0FBQyxPQUFPLEVBQ2YsT0FBTyxDQUFDLEtBQUssQ0FDZCxDQUFDO1FBRUYsY0FBYztRQUNkLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQWNOLE9BQU87WUFDTCxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJO1lBQ3BDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtZQUNwQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZO1lBQ3RDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87U0FDN0IsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNILGFBQWEsQ0FBQyxPQUFnRTtRQUM1RSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQyxDQUFDO0NBQ0Y7QUEzSkQsd0RBMkpDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNdWx0aS1QYXRoIFJlY2FsbCAtIOWkmui3r+WPrOWbnuiejeWQiFxuICogXG4gKiDnu5PlkIjkuInnp43mo4DntKLmlrnlvI/vvJpcbiAqIDEuIOivreS5ieajgOe0ou+8iOWQkemHj+ebuOS8vOW6pu+8iVxuICogMi4g5YWz6ZSu6K+N5qOA57Si77yIQk0yNe+8iVxuICogMy4g5Zu+5qOA57Si77yI55+l6K+G5Zu+6LCx6YGN5Y6G77yJXG4gKiBcbiAqIOS9v+eUqCBSUkYvQm9yZGEv5Yqg5p2D6J6N5ZCI6L+b6KGM57uT5p6c6J6N5ZCIXG4gKiBcbiAqIEBhdXRob3Ig5bCP6ay8IPCfkbsgKyBKYWtlXG4gKiBAdmVyc2lvbiA0LjIuMFxuICovXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8vID09PT09PT09PT09PSDmo4DntKLnu5PmnpwgPT09PT09PT09PT09XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjYWxsUmVzdWx0IHtcbiAgbWVtb3J5SWQ6IHN0cmluZztcbiAgc2NvcmU6IG51bWJlcjtcbiAgc291cmNlOiAnc2VtYW50aWMnIHwgJ2tleXdvcmQnIHwgJ2dyYXBoJztcbiAgbWVtb3J5OiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRnVzZWRSZXN1bHQge1xuICBtZW1vcnlJZDogc3RyaW5nO1xuICBmdXNlZFNjb3JlOiBudW1iZXI7XG4gIHNvdXJjZXM6IEFycmF5PHtcbiAgICBzb3VyY2U6ICdzZW1hbnRpYycgfCAna2V5d29yZCcgfCAnZ3JhcGgnO1xuICAgIHNjb3JlOiBudW1iZXI7XG4gICAgcmFuazogbnVtYmVyO1xuICB9PjtcbiAgbWVtb3J5OiBhbnk7XG59XG5cbi8vID09PT09PT09PT09PSBCTTI1IOWFs+mUruivjeajgOe0oiA9PT09PT09PT09PT1cblxuZXhwb3J0IGludGVyZmFjZSBCTTI1Q29uZmlnIHtcbiAgazE/OiBudW1iZXI7ICAgICAgIC8vIOivjemikemlseWSjOW6puWPguaVsO+8iOm7mOiupCAxLjLvvIlcbiAgYj86IG51bWJlcjsgICAgICAgIC8vIOmVv+W6puW9kuS4gOWMluWPguaVsO+8iOm7mOiupCAwLjc177yJXG59XG5cbmV4cG9ydCBjbGFzcyBCTTI1SW5kZXgge1xuICBwcml2YXRlIGNvbmZpZzogUmVxdWlyZWQ8Qk0yNUNvbmZpZz47XG4gIHByaXZhdGUgZG9jdW1lbnRzOiBNYXA8c3RyaW5nLCBzdHJpbmc+OyAgLy8gaWQgLT4gY29udGVudFxuICBwcml2YXRlIHRlcm1GcmVxOiBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBudW1iZXI+PjsgIC8vIGlkIC0+IHt0ZXJtOiBmcmVxfVxuICBwcml2YXRlIGRvY0ZyZXE6IE1hcDxzdHJpbmcsIG51bWJlcj47ICAvLyB0ZXJtIC0+IGRvYyBjb3VudFxuICBwcml2YXRlIGF2Z0RvY0xlbmd0aDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogQk0yNUNvbmZpZyA9IHt9KSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBrMTogY29uZmlnLmsxID8/IDEuMixcbiAgICAgIGI6IGNvbmZpZy5iID8/IDAuNzUsXG4gICAgfTtcbiAgICB0aGlzLmRvY3VtZW50cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnRlcm1GcmVxID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuZG9jRnJlcSA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmF2Z0RvY0xlbmd0aCA9IDA7XG4gIH1cblxuICAvKipcbiAgICog5re75Yqg5paH5qGjXG4gICAqL1xuICBhZGREb2N1bWVudChpZDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmRvY3VtZW50cy5zZXQoaWQsIGNvbnRlbnQpO1xuXG4gICAgLy8g5YiG6K+N77yI566A5Y2V5Lit5paH5YiG6K+N77yJXG4gICAgY29uc3QgdGVybXMgPSB0aGlzLnRva2VuaXplKGNvbnRlbnQpO1xuICAgIFxuICAgIC8vIOiuoeeul+ivjemikVxuICAgIGNvbnN0IHRmID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpIHtcbiAgICAgIHRmLnNldCh0ZXJtLCAodGYuZ2V0KHRlcm0pIHx8IDApICsgMSk7XG4gICAgfVxuICAgIHRoaXMudGVybUZyZXEuc2V0KGlkLCB0Zik7XG5cbiAgICAvLyDmm7TmlrDmlofmoaPpopHnjodcbiAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGYua2V5cygpKSB7XG4gICAgICB0aGlzLmRvY0ZyZXEuc2V0KHRlcm0sICh0aGlzLmRvY0ZyZXEuZ2V0KHRlcm0pIHx8IDApICsgMSk7XG4gICAgfVxuXG4gICAgLy8g5pu05paw5bmz5Z2H6ZW/5bqmXG4gICAgY29uc3QgdG90YWxMZW5ndGggPSBBcnJheS5mcm9tKHRoaXMuZG9jdW1lbnRzLnZhbHVlcygpKVxuICAgICAgLnJlZHVjZSgoc3VtLCBkb2MpID0+IHN1bSArIHRoaXMudG9rZW5pemUoZG9jKS5sZW5ndGgsIDApO1xuICAgIHRoaXMuYXZnRG9jTGVuZ3RoID0gdG90YWxMZW5ndGggLyB0aGlzLmRvY3VtZW50cy5zaXplO1xuICB9XG5cbiAgLyoqXG4gICAqIOaJuemHj+a3u+WKoOaWh+aho1xuICAgKi9cbiAgYWRkRG9jdW1lbnRzKGRvY3M6IEFycmF5PHsgaWQ6IHN0cmluZzsgY29udGVudDogc3RyaW5nIH0+KTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgdGhpcy5hZGREb2N1bWVudChkb2MuaWQsIGRvYy5jb250ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qOA57SiXG4gICAqL1xuICBzZWFyY2gocXVlcnk6IHN0cmluZywgdG9wSzogbnVtYmVyID0gMjApOiBBcnJheTx7IGlkOiBzdHJpbmc7IHNjb3JlOiBudW1iZXIgfT4ge1xuICAgIGNvbnN0IHF1ZXJ5VGVybXMgPSB0aGlzLnRva2VuaXplKHF1ZXJ5KTtcbiAgICBjb25zdCBzY29yZXMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuXG4gICAgLy8gQk0yNSDor4TliIZcbiAgICBmb3IgKGNvbnN0IFtkb2NJZCwgY29udGVudF0gb2YgdGhpcy5kb2N1bWVudHMuZW50cmllcygpKSB7XG4gICAgICBjb25zdCBkb2NMZW5ndGggPSB0aGlzLnRva2VuaXplKGNvbnRlbnQpLmxlbmd0aDtcbiAgICAgIGxldCBzY29yZSA9IDA7XG5cbiAgICAgIGZvciAoY29uc3QgdGVybSBvZiBxdWVyeVRlcm1zKSB7XG4gICAgICAgIGNvbnN0IHRmID0gdGhpcy50ZXJtRnJlcS5nZXQoZG9jSWQpPy5nZXQodGVybSkgfHwgMDtcbiAgICAgICAgY29uc3QgZGYgPSB0aGlzLmRvY0ZyZXEuZ2V0KHRlcm0pIHx8IDA7XG4gICAgICAgIFxuICAgICAgICBpZiAodGYgPiAwICYmIGRmID4gMCkge1xuICAgICAgICAgIC8vIElERlxuICAgICAgICAgIGNvbnN0IGlkZiA9IE1hdGgubG9nKCh0aGlzLmRvY3VtZW50cy5zaXplIC0gZGYgKyAwLjUpIC8gKGRmICsgMC41KSArIDEpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIOivjemikemDqOWIhlxuICAgICAgICAgIGNvbnN0IG51bWVyYXRvciA9IHRmICogKHRoaXMuY29uZmlnLmsxICsgMSk7XG4gICAgICAgICAgY29uc3QgZGVub21pbmF0b3IgPSB0ZiArIHRoaXMuY29uZmlnLmsxICogKFxuICAgICAgICAgICAgMSAtIHRoaXMuY29uZmlnLmIgKyB0aGlzLmNvbmZpZy5iICogKGRvY0xlbmd0aCAvIHRoaXMuYXZnRG9jTGVuZ3RoKVxuICAgICAgICAgICk7XG4gICAgICAgICAgXG4gICAgICAgICAgc2NvcmUgKz0gaWRmICogKG51bWVyYXRvciAvIGRlbm9taW5hdG9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc2NvcmUgPiAwKSB7XG4gICAgICAgIHNjb3Jlcy5zZXQoZG9jSWQsIHNjb3JlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmjpLluo9cbiAgICBjb25zdCByZXN1bHRzID0gQXJyYXkuZnJvbShzY29yZXMuZW50cmllcygpKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGJbMV0gLSBhWzFdKVxuICAgICAgLnNsaWNlKDAsIHRvcEspO1xuXG4gICAgcmV0dXJuIHJlc3VsdHMubWFwKChbaWQsIHNjb3JlXSkgPT4gKHsgaWQsIHNjb3JlIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDnroDljZXkuK3mlofliIbor43vvIjmjInlrZfnrKbvvIlcbiAgICogVE9ETzog6ZuG5oiQIGppZWJhIOWIhuivjVxuICAgKi9cbiAgcHJpdmF0ZSB0b2tlbml6ZSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgLy8g56e76Zmk5qCH54K577yM5L+d55WZ5Lit5paH44CB6Iux5paH44CB5pWw5a2XXG4gICAgY29uc3QgY2xlYW5lZCA9IHRleHQucmVwbGFjZSgvW15cXHdcXHU0ZTAwLVxcdTlmYTVdL2csICcgJyk7XG4gICAgXG4gICAgLy8g566A5Y2V5YiG6K+N77ya5Lit5paH5oyJ5a2X77yM6Iux5paH5oyJ6K+NXG4gICAgY29uc3QgdGVybXM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IGN1cnJlbnRXb3JkID0gJyc7XG4gICAgXG4gICAgZm9yIChjb25zdCBjaGFyIG9mIGNsZWFuZWQpIHtcbiAgICAgIGlmICgvW1xcdTRlMDAtXFx1OWZhNV0vLnRlc3QoY2hhcikpIHtcbiAgICAgICAgLy8g5Lit5paH5a2X56ym77ya5Y2V54us5oiQ6K+NXG4gICAgICAgIGlmIChjdXJyZW50V29yZCkge1xuICAgICAgICAgIHRlcm1zLnB1c2goY3VycmVudFdvcmQpO1xuICAgICAgICAgIGN1cnJlbnRXb3JkID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgdGVybXMucHVzaChjaGFyKTtcbiAgICAgIH0gZWxzZSBpZiAoL1xcdy8udGVzdChjaGFyKSkge1xuICAgICAgICAvLyDoi7Hmlocv5pWw5a2X77ya57Sv56ev5oiQ6K+NXG4gICAgICAgIGN1cnJlbnRXb3JkICs9IGNoYXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDnqbrmoLwv5qCH54K577ya5YiG6ZqUXG4gICAgICAgIGlmIChjdXJyZW50V29yZCkge1xuICAgICAgICAgIHRlcm1zLnB1c2goY3VycmVudFdvcmQpO1xuICAgICAgICAgIGN1cnJlbnRXb3JkID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYgKGN1cnJlbnRXb3JkKSB7XG4gICAgICB0ZXJtcy5wdXNoKGN1cnJlbnRXb3JkKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRlcm1zLmZpbHRlcih0ID0+IHQubGVuZ3RoID4gMCk7XG4gIH1cblxuICAvKipcbiAgICog5Yig6Zmk5paH5qGjXG4gICAqL1xuICByZW1vdmVEb2N1bWVudChpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY29udGVudCA9IHRoaXMuZG9jdW1lbnRzLmdldChpZCk7XG4gICAgaWYgKCFjb250ZW50KSByZXR1cm47XG5cbiAgICAvLyDmm7TmlrDmlofmoaPpopHnjodcbiAgICBjb25zdCB0ZiA9IHRoaXMudGVybUZyZXEuZ2V0KGlkKTtcbiAgICBpZiAodGYpIHtcbiAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0Zi5rZXlzKCkpIHtcbiAgICAgICAgY29uc3QgZGYgPSB0aGlzLmRvY0ZyZXEuZ2V0KHRlcm0pIHx8IDA7XG4gICAgICAgIGlmIChkZiA+IDApIHtcbiAgICAgICAgICB0aGlzLmRvY0ZyZXEuc2V0KHRlcm0sIGRmIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmRvY3VtZW50cy5kZWxldGUoaWQpO1xuICAgIHRoaXMudGVybUZyZXEuZGVsZXRlKGlkKTtcblxuICAgIC8vIOmHjeaWsOiuoeeul+W5s+Wdh+mVv+W6plxuICAgIGlmICh0aGlzLmRvY3VtZW50cy5zaXplID4gMCkge1xuICAgICAgY29uc3QgdG90YWxMZW5ndGggPSBBcnJheS5mcm9tKHRoaXMuZG9jdW1lbnRzLnZhbHVlcygpKVxuICAgICAgICAucmVkdWNlKChzdW0sIGRvYykgPT4gc3VtICsgdGhpcy50b2tlbml6ZShkb2MpLmxlbmd0aCwgMCk7XG4gICAgICB0aGlzLmF2Z0RvY0xlbmd0aCA9IHRvdGFsTGVuZ3RoIC8gdGhpcy5kb2N1bWVudHMuc2l6ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W57uf6K6h5L+h5oGvXG4gICAqL1xuICBnZXRTdGF0cygpOiB7XG4gICAgdG90YWxEb2N1bWVudHM6IG51bWJlcjtcbiAgICB0b3RhbFRlcm1zOiBudW1iZXI7XG4gICAgYXZnRG9jTGVuZ3RoOiBudW1iZXI7XG4gIH0ge1xuICAgIGNvbnN0IHRvdGFsVGVybXMgPSBBcnJheS5mcm9tKHRoaXMuZG9jRnJlcS5rZXlzKCkpLmxlbmd0aDtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgdG90YWxEb2N1bWVudHM6IHRoaXMuZG9jdW1lbnRzLnNpemUsXG4gICAgICB0b3RhbFRlcm1zLFxuICAgICAgYXZnRG9jTGVuZ3RoOiB0aGlzLmF2Z0RvY0xlbmd0aCxcbiAgICB9O1xuICB9XG59XG5cbi8vID09PT09PT09PT09PSDono3lkIjmjpLluo8gPT09PT09PT09PT09XG5cbmV4cG9ydCB0eXBlIEZ1c2lvbk1ldGhvZCA9ICdycmYnIHwgJ2JvcmRhJyB8ICd3ZWlnaHRlZCcgfCAncmVjaXByb2NhbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRnVzaW9uQ29uZmlnIHtcbiAgbWV0aG9kPzogRnVzaW9uTWV0aG9kO1xuICB3ZWlnaHRzPzoge1xuICAgIHNlbWFudGljPzogbnVtYmVyO1xuICAgIGtleXdvcmQ/OiBudW1iZXI7XG4gICAgZ3JhcGg/OiBudW1iZXI7XG4gIH07XG4gIHJyZks/OiBudW1iZXI7ICAvLyBSUkYg5bi45pWw77yI6buY6K6kIDYw77yJXG59XG5cbmV4cG9ydCBjbGFzcyBGdXNpb25SYW5rZXIge1xuICBwcml2YXRlIGNvbmZpZzogUmVxdWlyZWQ8RnVzaW9uQ29uZmlnPjtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IEZ1c2lvbkNvbmZpZyA9IHt9KSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBtZXRob2Q6IGNvbmZpZy5tZXRob2QgPz8gJ3JyZicsXG4gICAgICB3ZWlnaHRzOiB7XG4gICAgICAgIHNlbWFudGljOiBjb25maWcud2VpZ2h0cz8uc2VtYW50aWMgPz8gMC40LFxuICAgICAgICBrZXl3b3JkOiBjb25maWcud2VpZ2h0cz8ua2V5d29yZCA/PyAwLjMsXG4gICAgICAgIGdyYXBoOiBjb25maWcud2VpZ2h0cz8uZ3JhcGggPz8gMC4zLFxuICAgICAgfSxcbiAgICAgIHJyZks6IGNvbmZpZy5ycmZLID8/IDYwLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICog6J6N5ZCI5aSa6Lev5qOA57Si57uT5p6cXG4gICAqL1xuICBmdXNlKFxuICAgIHNlbWFudGljOiBSZWNhbGxSZXN1bHRbXSxcbiAgICBrZXl3b3JkOiBSZWNhbGxSZXN1bHRbXSxcbiAgICBncmFwaDogUmVjYWxsUmVzdWx0W11cbiAgKTogRnVzZWRSZXN1bHRbXSB7XG4gICAgc3dpdGNoICh0aGlzLmNvbmZpZy5tZXRob2QpIHtcbiAgICAgIGNhc2UgJ3JyZic6XG4gICAgICAgIHJldHVybiB0aGlzLnJyZkZ1c2lvbihzZW1hbnRpYywga2V5d29yZCwgZ3JhcGgpO1xuICAgICAgY2FzZSAnYm9yZGEnOlxuICAgICAgICByZXR1cm4gdGhpcy5ib3JkYUZ1c2lvbihzZW1hbnRpYywga2V5d29yZCwgZ3JhcGgpO1xuICAgICAgY2FzZSAnd2VpZ2h0ZWQnOlxuICAgICAgICByZXR1cm4gdGhpcy53ZWlnaHRlZEZ1c2lvbihzZW1hbnRpYywga2V5d29yZCwgZ3JhcGgpO1xuICAgICAgY2FzZSAncmVjaXByb2NhbCc6XG4gICAgICAgIHJldHVybiB0aGlzLnJlY2lwcm9jYWxGdXNpb24oc2VtYW50aWMsIGtleXdvcmQsIGdyYXBoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnJyZkZ1c2lvbihzZW1hbnRpYywga2V5d29yZCwgZ3JhcGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSUkYgKFJlY2lwcm9jYWwgUmFuayBGdXNpb24pIC0g5YCS5o6S5o6S5ZCN6J6N5ZCIXG4gICAqIFxuICAgKiDlhazlvI/vvJpSUkYoZCkgPSDOoyAxLyhrICsgcmFua19pKGQpKVxuICAgKiBrIOaYr+W4uOaVsO+8iOmAmuW4uCA2MO+8iVxuICAgKi9cbiAgcHJpdmF0ZSBycmZGdXNpb24oXG4gICAgc2VtYW50aWM6IFJlY2FsbFJlc3VsdFtdLFxuICAgIGtleXdvcmQ6IFJlY2FsbFJlc3VsdFtdLFxuICAgIGdyYXBoOiBSZWNhbGxSZXN1bHRbXVxuICApOiBGdXNlZFJlc3VsdFtdIHtcbiAgICBjb25zdCBmdXNlZCA9IG5ldyBNYXA8c3RyaW5nLCBGdXNlZFJlc3VsdD4oKTtcbiAgICBjb25zdCBrID0gdGhpcy5jb25maWcucnJmSztcblxuICAgIC8vIOWQiOW5tuaJgOaciee7k+aenFxuICAgIGNvbnN0IGFsbFJlc3VsdHMgPSBbXG4gICAgICB7IHNvdXJjZTogJ3NlbWFudGljJyBhcyBjb25zdCwgcmVzdWx0czogc2VtYW50aWMgfSxcbiAgICAgIHsgc291cmNlOiAna2V5d29yZCcgYXMgY29uc3QsIHJlc3VsdHM6IGtleXdvcmQgfSxcbiAgICAgIHsgc291cmNlOiAnZ3JhcGgnIGFzIGNvbnN0LCByZXN1bHRzOiBncmFwaCB9LFxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IHsgc291cmNlLCByZXN1bHRzIH0gb2YgYWxsUmVzdWx0cykge1xuICAgICAgZm9yIChsZXQgcmFuayA9IDA7IHJhbmsgPCByZXN1bHRzLmxlbmd0aDsgcmFuaysrKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3VsdHNbcmFua107XG4gICAgICAgIFxuICAgICAgICBpZiAoIWZ1c2VkLmhhcyhyZXN1bHQubWVtb3J5SWQpKSB7XG4gICAgICAgICAgZnVzZWQuc2V0KHJlc3VsdC5tZW1vcnlJZCwge1xuICAgICAgICAgICAgbWVtb3J5SWQ6IHJlc3VsdC5tZW1vcnlJZCxcbiAgICAgICAgICAgIGZ1c2VkU2NvcmU6IDAsXG4gICAgICAgICAgICBzb3VyY2VzOiBbXSxcbiAgICAgICAgICAgIG1lbW9yeTogcmVzdWx0Lm1lbW9yeSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZ1c2VkUmVzdWx0ID0gZnVzZWQuZ2V0KHJlc3VsdC5tZW1vcnlJZCkhO1xuICAgICAgICBcbiAgICAgICAgLy8gUlJGIOivhOWIhlxuICAgICAgICBjb25zdCBycmZTY29yZSA9IDEgLyAoayArIHJhbmsgKyAxKTtcbiAgICAgICAgZnVzZWRSZXN1bHQuZnVzZWRTY29yZSArPSBycmZTY29yZTtcblxuICAgICAgICAvLyDorrDlvZXmnaXmupBcbiAgICAgICAgZnVzZWRSZXN1bHQuc291cmNlcy5wdXNoKHtcbiAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgc2NvcmU6IHJlc3VsdC5zY29yZSxcbiAgICAgICAgICByYW5rOiByYW5rICsgMSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5oyJ6J6N5ZCI6K+E5YiG5o6S5bqPXG4gICAgcmV0dXJuIEFycmF5LmZyb20oZnVzZWQudmFsdWVzKCkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi5mdXNlZFNjb3JlIC0gYS5mdXNlZFNjb3JlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb3JkYSBDb3VudCAtIOazoui+vuiuoeaVsOazlVxuICAgKiBcbiAgICog5YWs5byP77yaQm9yZGEoZCkgPSDOoyAoTiAtIHJhbmtfaShkKSlcbiAgICogTiDmmK/lgJnpgInpm4blpKflsI9cbiAgICovXG4gIHByaXZhdGUgYm9yZGFGdXNpb24oXG4gICAgc2VtYW50aWM6IFJlY2FsbFJlc3VsdFtdLFxuICAgIGtleXdvcmQ6IFJlY2FsbFJlc3VsdFtdLFxuICAgIGdyYXBoOiBSZWNhbGxSZXN1bHRbXVxuICApOiBGdXNlZFJlc3VsdFtdIHtcbiAgICBjb25zdCBmdXNlZCA9IG5ldyBNYXA8c3RyaW5nLCBGdXNlZFJlc3VsdD4oKTtcbiAgICBjb25zdCBhbGxSZXN1bHRzID0gW1xuICAgICAgeyBzb3VyY2U6ICdzZW1hbnRpYycgYXMgY29uc3QsIHJlc3VsdHM6IHNlbWFudGljIH0sXG4gICAgICB7IHNvdXJjZTogJ2tleXdvcmQnIGFzIGNvbnN0LCByZXN1bHRzOiBrZXl3b3JkIH0sXG4gICAgICB7IHNvdXJjZTogJ2dyYXBoJyBhcyBjb25zdCwgcmVzdWx0czogZ3JhcGggfSxcbiAgICBdO1xuXG4gICAgZm9yIChjb25zdCB7IHNvdXJjZSwgcmVzdWx0cyB9IG9mIGFsbFJlc3VsdHMpIHtcbiAgICAgIGNvbnN0IG4gPSByZXN1bHRzLmxlbmd0aDtcbiAgICAgIFxuICAgICAgZm9yIChsZXQgcmFuayA9IDA7IHJhbmsgPCByZXN1bHRzLmxlbmd0aDsgcmFuaysrKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3VsdHNbcmFua107XG4gICAgICAgIFxuICAgICAgICBpZiAoIWZ1c2VkLmhhcyhyZXN1bHQubWVtb3J5SWQpKSB7XG4gICAgICAgICAgZnVzZWQuc2V0KHJlc3VsdC5tZW1vcnlJZCwge1xuICAgICAgICAgICAgbWVtb3J5SWQ6IHJlc3VsdC5tZW1vcnlJZCxcbiAgICAgICAgICAgIGZ1c2VkU2NvcmU6IDAsXG4gICAgICAgICAgICBzb3VyY2VzOiBbXSxcbiAgICAgICAgICAgIG1lbW9yeTogcmVzdWx0Lm1lbW9yeSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZ1c2VkUmVzdWx0ID0gZnVzZWQuZ2V0KHJlc3VsdC5tZW1vcnlJZCkhO1xuICAgICAgICBcbiAgICAgICAgLy8gQm9yZGEg6K+E5YiGXG4gICAgICAgIGNvbnN0IGJvcmRhU2NvcmUgPSBuIC0gcmFuaztcbiAgICAgICAgZnVzZWRSZXN1bHQuZnVzZWRTY29yZSArPSBib3JkYVNjb3JlO1xuXG4gICAgICAgIGZ1c2VkUmVzdWx0LnNvdXJjZXMucHVzaCh7XG4gICAgICAgICAgc291cmNlLFxuICAgICAgICAgIHNjb3JlOiByZXN1bHQuc2NvcmUsXG4gICAgICAgICAgcmFuazogcmFuayArIDEsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBBcnJheS5mcm9tKGZ1c2VkLnZhbHVlcygpKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuZnVzZWRTY29yZSAtIGEuZnVzZWRTY29yZSk7XG4gIH1cblxuICAvKipcbiAgICog5Yqg5p2D6J6N5ZCIXG4gICAqIFxuICAgKiDlhazlvI/vvJpTY29yZShkKSA9IHcxKnNlbWFudGljICsgdzIqa2V5d29yZCArIHczKmdyYXBoXG4gICAqL1xuICBwcml2YXRlIHdlaWdodGVkRnVzaW9uKFxuICAgIHNlbWFudGljOiBSZWNhbGxSZXN1bHRbXSxcbiAgICBrZXl3b3JkOiBSZWNhbGxSZXN1bHRbXSxcbiAgICBncmFwaDogUmVjYWxsUmVzdWx0W11cbiAgKTogRnVzZWRSZXN1bHRbXSB7XG4gICAgY29uc3QgZnVzZWQgPSBuZXcgTWFwPHN0cmluZywgRnVzZWRSZXN1bHQ+KCk7XG4gICAgY29uc3Qgd2VpZ2h0cyA9IHRoaXMuY29uZmlnLndlaWdodHM7XG5cbiAgICBjb25zdCBhbGxSZXN1bHRzID0gW1xuICAgICAgeyBzb3VyY2U6ICdzZW1hbnRpYycgYXMgY29uc3QsIHJlc3VsdHM6IHNlbWFudGljLCB3ZWlnaHQ6IHdlaWdodHMuc2VtYW50aWMgfSxcbiAgICAgIHsgc291cmNlOiAna2V5d29yZCcgYXMgY29uc3QsIHJlc3VsdHM6IGtleXdvcmQsIHdlaWdodDogd2VpZ2h0cy5rZXl3b3JkIH0sXG4gICAgICB7IHNvdXJjZTogJ2dyYXBoJyBhcyBjb25zdCwgcmVzdWx0czogZ3JhcGgsIHdlaWdodDogd2VpZ2h0cy5ncmFwaCB9LFxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IHsgc291cmNlLCByZXN1bHRzLCB3ZWlnaHQgfSBvZiBhbGxSZXN1bHRzKSB7XG4gICAgICBmb3IgKGxldCByYW5rID0gMDsgcmFuayA8IHJlc3VsdHMubGVuZ3RoOyByYW5rKyspIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzdWx0c1tyYW5rXTtcbiAgICAgICAgXG4gICAgICAgIGlmICghZnVzZWQuaGFzKHJlc3VsdC5tZW1vcnlJZCkpIHtcbiAgICAgICAgICBmdXNlZC5zZXQocmVzdWx0Lm1lbW9yeUlkLCB7XG4gICAgICAgICAgICBtZW1vcnlJZDogcmVzdWx0Lm1lbW9yeUlkLFxuICAgICAgICAgICAgZnVzZWRTY29yZTogMCxcbiAgICAgICAgICAgIHNvdXJjZXM6IFtdLFxuICAgICAgICAgICAgbWVtb3J5OiByZXN1bHQubWVtb3J5LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZnVzZWRSZXN1bHQgPSBmdXNlZC5nZXQocmVzdWx0Lm1lbW9yeUlkKSE7XG4gICAgICAgIFxuICAgICAgICAvLyDliqDmnYPor4TliIZcbiAgICAgICAgY29uc3Qgd2VpZ2h0ZWRTY29yZSA9IHJlc3VsdC5zY29yZSAqICh3ZWlnaHQgPz8gMC4zMyk7XG4gICAgICAgIGZ1c2VkUmVzdWx0LmZ1c2VkU2NvcmUgKz0gd2VpZ2h0ZWRTY29yZTtcblxuICAgICAgICBmdXNlZFJlc3VsdC5zb3VyY2VzLnB1c2goe1xuICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICBzY29yZTogcmVzdWx0LnNjb3JlLFxuICAgICAgICAgIHJhbms6IHJhbmsgKyAxLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShmdXNlZC52YWx1ZXMoKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiLmZ1c2VkU2NvcmUgLSBhLmZ1c2VkU2NvcmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWAkuaVsOiejeWQiO+8iOeugOWMlueJiCBSUkbvvIlcbiAgICovXG4gIHByaXZhdGUgcmVjaXByb2NhbEZ1c2lvbihcbiAgICBzZW1hbnRpYzogUmVjYWxsUmVzdWx0W10sXG4gICAga2V5d29yZDogUmVjYWxsUmVzdWx0W10sXG4gICAgZ3JhcGg6IFJlY2FsbFJlc3VsdFtdXG4gICk6IEZ1c2VkUmVzdWx0W10ge1xuICAgIGNvbnN0IGZ1c2VkID0gbmV3IE1hcDxzdHJpbmcsIEZ1c2VkUmVzdWx0PigpO1xuICAgIGNvbnN0IGFsbFJlc3VsdHMgPSBbXG4gICAgICB7IHNvdXJjZTogJ3NlbWFudGljJyBhcyBjb25zdCwgcmVzdWx0czogc2VtYW50aWMgfSxcbiAgICAgIHsgc291cmNlOiAna2V5d29yZCcgYXMgY29uc3QsIHJlc3VsdHM6IGtleXdvcmQgfSxcbiAgICAgIHsgc291cmNlOiAnZ3JhcGgnIGFzIGNvbnN0LCByZXN1bHRzOiBncmFwaCB9LFxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IHsgc291cmNlLCByZXN1bHRzIH0gb2YgYWxsUmVzdWx0cykge1xuICAgICAgZm9yIChsZXQgcmFuayA9IDA7IHJhbmsgPCByZXN1bHRzLmxlbmd0aDsgcmFuaysrKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3VsdHNbcmFua107XG4gICAgICAgIFxuICAgICAgICBpZiAoIWZ1c2VkLmhhcyhyZXN1bHQubWVtb3J5SWQpKSB7XG4gICAgICAgICAgZnVzZWQuc2V0KHJlc3VsdC5tZW1vcnlJZCwge1xuICAgICAgICAgICAgbWVtb3J5SWQ6IHJlc3VsdC5tZW1vcnlJZCxcbiAgICAgICAgICAgIGZ1c2VkU2NvcmU6IDAsXG4gICAgICAgICAgICBzb3VyY2VzOiBbXSxcbiAgICAgICAgICAgIG1lbW9yeTogcmVzdWx0Lm1lbW9yeSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZ1c2VkUmVzdWx0ID0gZnVzZWQuZ2V0KHJlc3VsdC5tZW1vcnlJZCkhO1xuICAgICAgICBcbiAgICAgICAgLy8g5YCS5pWw6K+E5YiGXG4gICAgICAgIGNvbnN0IHJlY2lwcm9jYWxTY29yZSA9IDEgLyAocmFuayArIDEpO1xuICAgICAgICBmdXNlZFJlc3VsdC5mdXNlZFNjb3JlICs9IHJlY2lwcm9jYWxTY29yZTtcblxuICAgICAgICBmdXNlZFJlc3VsdC5zb3VyY2VzLnB1c2goe1xuICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICBzY29yZTogcmVzdWx0LnNjb3JlLFxuICAgICAgICAgIHJhbms6IHJhbmsgKyAxLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShmdXNlZC52YWx1ZXMoKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiLmZ1c2VkU2NvcmUgLSBhLmZ1c2VkU2NvcmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIOabtOaWsOadg+mHjVxuICAgKi9cbiAgdXBkYXRlV2VpZ2h0cyh3ZWlnaHRzOiB7IHNlbWFudGljPzogbnVtYmVyOyBrZXl3b3JkPzogbnVtYmVyOyBncmFwaD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgaWYgKHdlaWdodHMuc2VtYW50aWMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb25maWcud2VpZ2h0cy5zZW1hbnRpYyA9IHdlaWdodHMuc2VtYW50aWM7XG4gICAgfVxuICAgIGlmICh3ZWlnaHRzLmtleXdvcmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb25maWcud2VpZ2h0cy5rZXl3b3JkID0gd2VpZ2h0cy5rZXl3b3JkO1xuICAgIH1cbiAgICBpZiAod2VpZ2h0cy5ncmFwaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmNvbmZpZy53ZWlnaHRzLmdyYXBoID0gd2VpZ2h0cy5ncmFwaDtcbiAgICB9XG5cbiAgICAvLyDlvZLkuIDljJZcbiAgICBjb25zdCB0b3RhbCA9ICh0aGlzLmNvbmZpZy53ZWlnaHRzLnNlbWFudGljID8/IDAuMzMpICsgXG4gICAgICAgICAgICAgICAgICAodGhpcy5jb25maWcud2VpZ2h0cy5rZXl3b3JkID8/IDAuMzMpICsgXG4gICAgICAgICAgICAgICAgICAodGhpcy5jb25maWcud2VpZ2h0cy5ncmFwaCA/PyAwLjM0KTtcbiAgICBcbiAgICBpZiAodG90YWwgPiAwKSB7XG4gICAgICB0aGlzLmNvbmZpZy53ZWlnaHRzLnNlbWFudGljID0gKHRoaXMuY29uZmlnLndlaWdodHMuc2VtYW50aWMgPz8gMC4zMykgLyB0b3RhbDtcbiAgICAgIHRoaXMuY29uZmlnLndlaWdodHMua2V5d29yZCA9ICh0aGlzLmNvbmZpZy53ZWlnaHRzLmtleXdvcmQgPz8gMC4zMykgLyB0b3RhbDtcbiAgICAgIHRoaXMuY29uZmlnLndlaWdodHMuZ3JhcGggPSAodGhpcy5jb25maWcud2VpZ2h0cy5ncmFwaCA/PyAwLjM0KSAvIHRvdGFsO1xuICAgIH1cbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT0g5aSa6Lev5Y+s5Zue566h55CG5ZmoID09PT09PT09PT09PVxuXG5leHBvcnQgaW50ZXJmYWNlIE11bHRpUGF0aFJlY2FsbENvbmZpZyB7XG4gIGJhc2VQYXRoPzogc3RyaW5nO1xuICBmdXNpb25NZXRob2Q/OiBGdXNpb25NZXRob2Q7XG4gIHdlaWdodHM/OiB7XG4gICAgc2VtYW50aWM/OiBudW1iZXI7XG4gICAga2V5d29yZD86IG51bWJlcjtcbiAgICBncmFwaD86IG51bWJlcjtcbiAgfTtcbn1cblxuZXhwb3J0IGNsYXNzIE11bHRpUGF0aFJlY2FsbE1hbmFnZXIge1xuICBwcml2YXRlIGNvbmZpZzogTXVsdGlQYXRoUmVjYWxsQ29uZmlnICYge1xuICAgIGJhc2VQYXRoOiBzdHJpbmc7XG4gICAgZnVzaW9uTWV0aG9kOiBGdXNpb25NZXRob2Q7XG4gICAgd2VpZ2h0czoge1xuICAgICAgc2VtYW50aWM6IG51bWJlcjtcbiAgICAgIGtleXdvcmQ6IG51bWJlcjtcbiAgICAgIGdyYXBoOiBudW1iZXI7XG4gICAgfTtcbiAgfTtcbiAgcHJpdmF0ZSBibTI1SW5kZXg6IEJNMjVJbmRleDtcbiAgcHJpdmF0ZSBmdXNpb25SYW5rZXI6IEZ1c2lvblJhbmtlcjtcbiAgcHJpdmF0ZSBtZW1vcnlTdG9yZTogTWFwPHN0cmluZywgYW55PjsgIC8vIOS4tOaXtuWtmOWCqO+8jOWunumZheW6lOivpeeUqCBMYXllcmVkTWVtb3J5TWFuYWdlclxuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogTXVsdGlQYXRoUmVjYWxsQ29uZmlnID0ge30pIHtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIGJhc2VQYXRoOiBjb25maWcuYmFzZVBhdGggPz8gJ21lbW9yeS9tdWx0aS1wYXRoLXJlY2FsbCcsXG4gICAgICBmdXNpb25NZXRob2Q6IGNvbmZpZy5mdXNpb25NZXRob2QgPz8gJ3JyZicsXG4gICAgICB3ZWlnaHRzOiB7XG4gICAgICAgIHNlbWFudGljOiBjb25maWcud2VpZ2h0cz8uc2VtYW50aWMgPz8gMC40LFxuICAgICAgICBrZXl3b3JkOiBjb25maWcud2VpZ2h0cz8ua2V5d29yZCA/PyAwLjMsXG4gICAgICAgIGdyYXBoOiBjb25maWcud2VpZ2h0cz8uZ3JhcGggPz8gMC4zLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgdGhpcy5ibTI1SW5kZXggPSBuZXcgQk0yNUluZGV4KCk7XG4gICAgdGhpcy5mdXNpb25SYW5rZXIgPSBuZXcgRnVzaW9uUmFua2VyKHtcbiAgICAgIG1ldGhvZDogdGhpcy5jb25maWcuZnVzaW9uTWV0aG9kLFxuICAgICAgd2VpZ2h0czoge1xuICAgICAgICBzZW1hbnRpYzogdGhpcy5jb25maWcud2VpZ2h0cy5zZW1hbnRpYyA/PyAwLjQsXG4gICAgICAgIGtleXdvcmQ6IHRoaXMuY29uZmlnLndlaWdodHMua2V5d29yZCA/PyAwLjMsXG4gICAgICAgIGdyYXBoOiB0aGlzLmNvbmZpZy53ZWlnaHRzLmdyYXBoID8/IDAuMyxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgdGhpcy5tZW1vcnlTdG9yZSA9IG5ldyBNYXAoKTtcblxuICAgIC8vIOehruS/neebruW9leWtmOWcqFxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmNvbmZpZy5iYXNlUGF0aCkpIHtcbiAgICAgIGZzLm1rZGlyU3luYyh0aGlzLmNvbmZpZy5iYXNlUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOa3u+WKoOiusOW/hlxuICAgKi9cbiAgYXN5bmMgYWRkTWVtb3J5KGlkOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgbWVtb3J5OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLm1lbW9yeVN0b3JlLnNldChpZCwgbWVtb3J5KTtcbiAgICB0aGlzLmJtMjVJbmRleC5hZGREb2N1bWVudChpZCwgY29udGVudCk7XG4gIH1cblxuICAvKipcbiAgICog5om56YeP5re75Yqg6K6w5b+GXG4gICAqL1xuICBhc3luYyBhZGRNZW1vcmllcyhtZW1vcmllczogQXJyYXk8eyBpZDogc3RyaW5nOyBjb250ZW50OiBzdHJpbmc7IG1lbW9yeTogYW55IH0+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgZm9yIChjb25zdCBtIG9mIG1lbW9yaWVzKSB7XG4gICAgICBhd2FpdCB0aGlzLmFkZE1lbW9yeShtLmlkLCBtLmNvbnRlbnQsIG0ubWVtb3J5KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5aSa6Lev5Y+s5ZueXG4gICAqL1xuICBhc3luYyByZWNhbGwoXG4gICAgcXVlcnk6IHN0cmluZyxcbiAgICBvcHRpb25zOiB7XG4gICAgICB0b3BLPzogbnVtYmVyO1xuICAgICAgdXNlU2VtYW50aWM/OiBib29sZWFuO1xuICAgICAgdXNlS2V5d29yZD86IGJvb2xlYW47XG4gICAgICB1c2VHcmFwaD86IGJvb2xlYW47XG4gICAgfSA9IHt9XG4gICk6IFByb21pc2U8RnVzZWRSZXN1bHRbXT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIHRvcEsgPSAyMCxcbiAgICAgIHVzZVNlbWFudGljID0gdHJ1ZSxcbiAgICAgIHVzZUtleXdvcmQgPSB0cnVlLFxuICAgICAgdXNlR3JhcGggPSB0cnVlLFxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgY29uc3QgcmVzdWx0czoge1xuICAgICAgc2VtYW50aWM6IFJlY2FsbFJlc3VsdFtdO1xuICAgICAga2V5d29yZDogUmVjYWxsUmVzdWx0W107XG4gICAgICBncmFwaDogUmVjYWxsUmVzdWx0W107XG4gICAgfSA9IHtcbiAgICAgIHNlbWFudGljOiBbXSxcbiAgICAgIGtleXdvcmQ6IFtdLFxuICAgICAgZ3JhcGg6IFtdLFxuICAgIH07XG5cbiAgICAvLyAxLiDlhbPplK7or43mo4DntKLvvIhCTTI177yJXG4gICAgaWYgKHVzZUtleXdvcmQpIHtcbiAgICAgIGNvbnN0IGJtMjVSZXN1bHRzID0gdGhpcy5ibTI1SW5kZXguc2VhcmNoKHF1ZXJ5LCB0b3BLICogMik7XG4gICAgICByZXN1bHRzLmtleXdvcmQgPSBibTI1UmVzdWx0cy5tYXAociA9PiAoe1xuICAgICAgICBtZW1vcnlJZDogci5pZCxcbiAgICAgICAgc2NvcmU6IHIuc2NvcmUsXG4gICAgICAgIHNvdXJjZTogJ2tleXdvcmQnIGFzIGNvbnN0LFxuICAgICAgICBtZW1vcnk6IHRoaXMubWVtb3J5U3RvcmUuZ2V0KHIuaWQpLFxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8vIDIuIOivreS5ieajgOe0ou+8iFRPRE86IOWQkemHj+ajgOe0ou+8iVxuICAgIGlmICh1c2VTZW1hbnRpYykge1xuICAgICAgLy8g5pqC5pe255SoIEJNMjUg5qih5ouf6K+t5LmJ5qOA57SiXG4gICAgICAvLyDlrp7pmYXlupTor6XnlKjlkJHph4/nm7jkvLzluqZcbiAgICAgIHJlc3VsdHMuc2VtYW50aWMgPSByZXN1bHRzLmtleXdvcmQuc2xpY2UoMCwgdG9wSyk7XG4gICAgfVxuXG4gICAgLy8gMy4g5Zu+5qOA57Si77yIVE9ETzog55+l6K+G5Zu+6LCx77yJXG4gICAgaWYgKHVzZUdyYXBoKSB7XG4gICAgICAvLyDmmoLml7bov5Tlm57nqbrnu5PmnpxcbiAgICAgIC8vIOWunumZheW6lOivpeeUqCBLbm93bGVkZ2VHcmFwaCDmo4DntKJcbiAgICAgIHJlc3VsdHMuZ3JhcGggPSBbXTtcbiAgICB9XG5cbiAgICAvLyA0LiDono3lkIjmjpLluo9cbiAgICBjb25zdCBmdXNlZCA9IHRoaXMuZnVzaW9uUmFua2VyLmZ1c2UoXG4gICAgICByZXN1bHRzLnNlbWFudGljLFxuICAgICAgcmVzdWx0cy5rZXl3b3JkLFxuICAgICAgcmVzdWx0cy5ncmFwaFxuICAgICk7XG5cbiAgICAvLyA1LiDov5Tlm54gVG9wLUtcbiAgICByZXR1cm4gZnVzZWQuc2xpY2UoMCwgdG9wSyk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W57uf6K6h5L+h5oGvXG4gICAqL1xuICBnZXRTdGF0cygpOiB7XG4gICAgdG90YWxNZW1vcmllczogbnVtYmVyO1xuICAgIGJtMjVTdGF0czoge1xuICAgICAgdG90YWxEb2N1bWVudHM6IG51bWJlcjtcbiAgICAgIHRvdGFsVGVybXM6IG51bWJlcjtcbiAgICAgIGF2Z0RvY0xlbmd0aDogbnVtYmVyO1xuICAgIH07XG4gICAgZnVzaW9uTWV0aG9kOiBGdXNpb25NZXRob2Q7XG4gICAgd2VpZ2h0czoge1xuICAgICAgc2VtYW50aWM6IG51bWJlcjtcbiAgICAgIGtleXdvcmQ6IG51bWJlcjtcbiAgICAgIGdyYXBoOiBudW1iZXI7XG4gICAgfTtcbiAgfSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRvdGFsTWVtb3JpZXM6IHRoaXMubWVtb3J5U3RvcmUuc2l6ZSxcbiAgICAgIGJtMjVTdGF0czogdGhpcy5ibTI1SW5kZXguZ2V0U3RhdHMoKSxcbiAgICAgIGZ1c2lvbk1ldGhvZDogdGhpcy5jb25maWcuZnVzaW9uTWV0aG9kLFxuICAgICAgd2VpZ2h0czogdGhpcy5jb25maWcud2VpZ2h0cyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIOabtOaWsOiejeWQiOadg+mHjVxuICAgKi9cbiAgdXBkYXRlV2VpZ2h0cyh3ZWlnaHRzOiB7IHNlbWFudGljPzogbnVtYmVyOyBrZXl3b3JkPzogbnVtYmVyOyBncmFwaD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgdGhpcy5mdXNpb25SYW5rZXIudXBkYXRlV2VpZ2h0cyh3ZWlnaHRzKTtcbiAgfVxufVxuIl19