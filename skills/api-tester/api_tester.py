#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API Tester - API 测试工具
RESTful API 快速测试、请求构建、响应分析
"""

import json
import time
from typing import List, Dict
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# 内置 API 模板
API_TEMPLATES = {
    'httpbin': {
        'base_url': 'https://httpbin.org',
        'endpoints': [
            {'name': 'GET 请求', 'method': 'GET', 'path': '/get'},
            {'name': 'POST 请求', 'method': 'POST', 'path': '/post'},
            {'name': '状态码测试', 'method': 'GET', 'path': '/status/200'},
            {'name': '延迟测试', 'method': 'GET', 'path': '/delay/2'},
        ]
    },
    'jsonplaceholder': {
        'base_url': 'https://jsonplaceholder.typicode.com',
        'endpoints': [
            {'name': '获取帖子', 'method': 'GET', 'path': '/posts'},
            {'name': '获取用户', 'method': 'GET', 'path': '/users'},
            {'name': '获取评论', 'method': 'GET', 'path': '/comments'},
        ]
    }
}


def make_request(url: str, method: str = 'GET', headers: Dict = None, 
                 data: Dict = None, timeout: int = 10) -> Dict:
    """发送 HTTP 请求"""
    try:
        start_time = time.time()
        
        # 准备请求
        if data and method in ['POST', 'PUT', 'PATCH']:
            data = json.dumps(data).encode('utf-8')
        
        req = Request(url, data=data, method=method)
        
        if headers:
            for key, value in headers.items():
                req.add_header(key, value)
        
        if data:
            req.add_header('Content-Type', 'application/json')
        
        # 发送请求
        response = urlopen(req, timeout=timeout)
        
        # 解析响应
        response_data = response.read().decode('utf-8')
        end_time = time.time()
        
        return {
            'success': True,
            'status_code': response.status,
            'headers': dict(response.headers),
            'body': response_data,
            'time_ms': round((end_time - start_time) * 1000, 2)
        }
    
    except HTTPError as e:
        return {
            'success': False,
            'status_code': e.code,
            'error': str(e),
            'time_ms': 0
        }
    except URLError as e:
        return {
            'success': False,
            'error': str(e.reason),
            'time_ms': 0
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'time_ms': 0
        }


def get_templates() -> List[Dict]:
    """获取 API 模板"""
    return [
        {
            'name': name,
            'base_url': template['base_url'],
            'endpoints': template['endpoints']
        }
        for name, template in API_TEMPLATES.items()
    ]


def format_response(result: Dict) -> str:
    """格式化响应"""
    lines = []
    
    if result.get('success'):
        lines.append(f"✅ 请求成功")
        lines.append(f"状态码：{result.get('status_code')}")
        lines.append(f"耗时：{result.get('time_ms')}ms")
        
        # 尝试解析 JSON
        try:
            body = json.loads(result.get('body', '{}'))
            lines.append(f"\n响应内容:")
            lines.append(json.dumps(body, indent=2, ensure_ascii=False)[:500])
        except:
            lines.append(f"\n响应内容:\n{result.get('body', '')[:500]}")
    else:
        lines.append(f"❌ 请求失败")
        lines.append(f"错误：{result.get('error', '未知错误')}")
        if result.get('status_code'):
            lines.append(f"状态码：{result.get('status_code')}")
    
    return '\n'.join(lines)


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'get' or command == 'GET':
        if not args:
            return "❌ 请提供 URL"
        
        url = args[0]
        result = make_request(url, 'GET')
        
        return format_response(result)
    
    elif command == 'post' or command == 'POST':
        if len(args) < 2:
            return "❌ 用法：post [URL] [JSON 数据]"
        
        url = args[0]
        try:
            data = json.loads(' '.join(args[1:]))
            result = make_request(url, 'POST', data=data)
            return format_response(result)
        except json.JSONDecodeError:
            return "❌ JSON 格式错误"
    
    elif command == 'test' or command == '测试':
        # 测试内置 API
        template_name = args[0] if args else 'httpbin'
        template = API_TEMPLATES.get(template_name)
        
        if not template:
            available = ', '.join(API_TEMPLATES.keys())
            return f"❌ 未知模板 '{template_name}'\n可用：{available}"
        
        lines = [f"🔌 测试 {template_name} API:\n"]
        
        for endpoint in template['endpoints'][:3]:
            url = template['base_url'] + endpoint['path']
            lines.append(f"├─ {endpoint['name']}: {endpoint['method']} {endpoint['path']}")
            
            result = make_request(url, endpoint['method'])
            status = "✅" if result.get('success') else "❌"
            time_ms = result.get('time_ms', 0)
            lines.append(f"│  {status} {result.get('status_code', 'N/A')} ({time_ms}ms)")
        
        return '\n'.join(lines)
    
    elif command == 'templates' or command == '模板':
        templates = get_templates()
        
        lines = ["🔌 API 模板:"]
        for t in templates:
            lines.append(f"\n{t['name']}:")
            lines.append(f"├─ 基础 URL: {t['base_url']}")
            lines.append("├─ 端点:")
            for ep in t['endpoints']:
                lines.append(f"│  ├─ {ep['method']} {ep['path']} ({ep['name']})")
        
        return '\n'.join(lines)
    
    elif command == 'curl' or command == 'CURL':
        # 解析 curl 命令
        return """
📝 请将 curl 命令转换为以下格式:

get [URL]
post [URL] {"key": "value"}

示例:
curl https://api.example.com/users
→ get https://api.example.com/users

curl -X POST https://api.example.com/users -d '{"name":"test"}'
→ post https://api.example.com/users {"name":"test"}
        """.strip()
    
    elif command == 'help' or command == '帮助':
        return """
🔌 API Tester - API 测试工具

可用命令:
  get/GET [URL]              - 发送 GET 请求
  post/POST [URL] [JSON]      - 发送 POST 请求
  test/测试 [模板名]          - 测试内置 API
  templates/模板              - 查看 API 模板
  curl/CURL                   - curl 命令转换
  help/帮助                   - 显示帮助

内置模板:
- httpbin (HTTP 测试服务)
- jsonplaceholder (REST API 测试)

示例:
  GET 请求：get https://httpbin.org/get
  POST 请求：post https://httpbin.org/post {"name":"test"}
  测试 API: test httpbin
        """.strip()
    
    else:
        return "❌ 未知命令，输入 help 查看帮助"


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print(run('help'))
    else:
        command = sys.argv[1]
        args = sys.argv[2:]
        print(run(command, args))
