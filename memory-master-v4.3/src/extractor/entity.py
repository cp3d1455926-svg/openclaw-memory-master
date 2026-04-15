"""
EntityExtractor - 实体提取器
"""

from typing import List, Dict
from dataclasses import dataclass, asdict
from enum import Enum
import os
import json
from datetime import datetime


class EntityType(Enum):
    """实体类型"""
    PERSON = "Person"        # 人物
    PROJECT = "Project"      # 项目
    TASK = "Task"           # 任务
    EVENT = "Event"         # 事件
    DOCUMENT = "Document"   # 文档
    CONCEPT = "Concept"     # 概念


@dataclass
class Entity:
    """实体"""
    id: str
    name: str
    type: EntityType
    description: str
    metadata: Dict
    created_at: str


class EntityExtractor:
    """实体提取器 - 使用 LLM 从文本中自动识别实体"""
    
    def __init__(self, model: str = "qwen3.5-plus"):
        self.model = model
        self.extraction_prompt = """
你是一个实体提取专家。从以下文本中识别所有实体，并分类为：Person, Project, Task, Event, Document, Concept。

文本：
{text}

请以 JSON 格式返回，格式如下：
```json
[
  {{
    "name": "实体名称",
    "type": "Person|Project|Task|Event|Document|Concept",
    "description": "实体描述",
    "metadata": {{"key": "value"}}
  }}
]
```

只返回 JSON，不要其他内容。
"""
        
    def extract(self, text: str) -> List[Entity]:
        """从文本中提取实体"""
        import json
        from datetime import datetime
        
        # 调用 LLM
        prompt = self.extraction_prompt.format(text=text)
        response = self._call_llm(prompt)
        
        # 解析 JSON
        try:
            entities_data = json.loads(response)
        except json.JSONDecodeError:
            # 尝试提取 JSON 部分
            start = response.find('[\n')
            end = response.rfind(']') + 1
            if start != -1 and end != -1:
                entities_data = json.loads(response[start:end])
            else:
                return []
        
        # 转换为 Entity 对象
        entities = []
        for data in entities_data:
            entity = Entity(
                id=self._generate_id(data['name']),
                name=data['name'],
                type=EntityType(data['type']),
                description=data.get('description', ''),
                metadata=data.get('metadata', {}),
                created_at=datetime.now().isoformat()
            )
            entities.append(entity)
        
        return entities
        
    def extract_batch(self, texts: List[str]) -> List[Entity]:
        """批量提取实体"""
        all_entities = []
        for text in texts:
            entities = self.extract(text)
            all_entities.extend(entities)
        return self.merge_entities(all_entities)
        
    def merge_entities(self, entities: List[Entity]) -> List[Entity]:
        """合并重复实体（同名同类型）"""
        seen = {}
        merged = []
        
        for entity in entities:
            key = f"{entity.name.lower()}_{entity.type.value}"
            if key not in seen:
                seen[key] = entity
                merged.append(entity)
            else:
                # 合并元数据
                existing = seen[key]
                for k, v in entity.metadata.items():
                    if k not in existing.metadata:
                        existing.metadata[k] = v
                # 更新描述（如果有更详细的）
                if len(entity.description) > len(existing.description):
                    existing.description = entity.description
        
        return merged
        
    def validate(self, entity: Entity) -> bool:
        """验证实体"""
        # 基本验证
        if not entity.name or not entity.type:
            return False
        
        # 名称长度检查
        if len(entity.name) < 1 or len(entity.name) > 200:
            return False
        
        # 类型检查
        if entity.type not in EntityType:
            return False
        
        return True
    
    def _generate_id(self, name: str) -> str:
        """生成实体 ID"""
        import hashlib
        import time
        timestamp = str(time.time())
        hash_obj = hashlib.md5(f"{name}{timestamp}".encode())
        return f"entity_{hash_obj.hexdigest()[:12]}"
    
    def _call_llm(self, prompt: str) -> str:
        """调用 LLM"""
        try:
            # 尝试使用 OpenClaw 的 sessions_send
            from sessions_send import sessions_send
            response = sessions_send(
                message=f"请提取实体：{prompt}",
                timeoutSeconds=30
            )
            return response.get('content', '[]')
        except ImportError:
            # 如果不在 OpenClaw 环境中，使用 requests 调用 API
            try:
                import requests
                # 这里需要配置实际的 API endpoint
                # 示例：使用阿里云百炼 API
                api_key = os.getenv('DASHSCOPE_API_KEY', '')
                headers = {
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                }
                payload = {
                    'model': self.model,
                    'messages': [{'role': 'user', 'content': prompt}],
                    'max_tokens': 1000
                }
                response = requests.post(
                    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
                    headers=headers,
                    json=payload
                )
                result = response.json()
                return result['output']['text']
            except Exception as e:
                print(f"⚠️ LLM 调用失败：{e}")
                return "[]"
        except Exception as e:
            print(f"⚠️ 实体提取失败：{e}")
            return "[]"


def demo():
    """演示示例"""
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print("EntityExtractor 演示\n")
    
    extractor = EntityExtractor()
    
    # 测试文本
    test_texts = [
        "Jake 正在开发 Memory-Master 项目，这是一个 OpenClaw 的记忆系统。",
        "昨天参加了 AI 开发者大会，见到了李明和王芳，他们也在做类似的项目。",
        "需要完成实体提取器的开发，这是 v4.3.0 的核心功能。",
    ]
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n测试文本 {i}: {text}")
        print("-" * 50)
        
        # 实际调用需要 LLM，这里演示数据结构
        # entities = extractor.extract(text)
        
        # 示例输出
        print("预期提取的实体:")
        print("  - Person: Jake, 李明，王芳")
        print("  - Project: Memory-Master")
        print("  - Concept: OpenClaw, 记忆系统")
        print("  - Event: AI 开发者大会")
        print("  - Task: 实体提取器的开发")
    
    print("\n演示完成！")


if __name__ == "__main__":
    demo()
