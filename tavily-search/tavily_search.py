#!/usr/bin/env python3
"""
Tavily Search Skill - Web search using Tavily API
Vetted: SAFE (MEDIUM risk - network + API key required)
"""

import os
import sys
import json
import io
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system("pip install requests")
    import requests

def get_api_key():
    """Get Tavily API key from environment or .env file"""
    # Check environment variable first
    api_key = os.environ.get('TAVILYAPIKEY')
    if api_key:
        return api_key
    
    # Try to read from .env file
    env_paths = [
        Path.home() / '.openclaw' / '.env',
        Path.home() / '.env',
        Path.cwd() / '.env'
    ]
    
    for env_path in env_paths:
        if env_path.exists():
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('TAVILYAPIKEY='):
                        return line.split('=', 1)[1].strip()
    
    return None

def tavily_search(query, num_results=5, search_depth="basic"):
    """
    Perform a search using Tavily API
    
    Args:
        query: Search query string
        num_results: Number of results to return (default: 5)
        search_depth: "basic" or "advanced"
    
    Returns:
        List of search results with title, url, and content/snippet
    """
    api_key = get_api_key()
    if not api_key:
        return {
            "error": "TAVILYAPIKEY not found. Please add it to ~/.openclaw/.env or set as environment variable."
        }
    
    url = "https://api.tavily.com/search"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "query": query,
        "num_results": num_results,
        "search_depth": search_depth,
        "include_answer": False,
        "include_raw_content": False
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for result in data.get('results', []):
            results.append({
                "title": result.get('title', 'No title'),
                "url": result.get('url', ''),
                "snippet": result.get('content', result.get('snippet', 'No snippet'))
            })
        
        return {"results": results}
    
    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse response: {str(e)}"}

def format_results_markdown(results):
    """Format search results as markdown"""
    if "error" in results:
        return f"[ERROR] Error: {results['error']}"
    
    if not results.get('results'):
        return "No results found."
    
    output = []
    for i, result in enumerate(results['results'], 1):
        output.append(f"### {i}. {result['title']}")
        output.append(f"**URL:** {result['url']}")
        output.append(f"{result['snippet']}")
        output.append("")
    
    return "\n".join(output)

def format_results_brave(results):
    """Format search results in Brave Search compatible format"""
    if "error" in results:
        return results
    
    output = {
        "web": {
            "results": []
        }
    }
    
    for result in results.get('results', []):
        output["web"]["results"].append({
            "title": result['title'],
            "url": result['url'],
            "description": result['snippet']
        })
    
    return output

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: tavily_search.py <query> [--format=markdown|brave|raw] [--num=5]")
        print("\nExample: tavily_search.py 'python tutorials' --format=markdown --num=10")
        sys.exit(1)
    
    # Parse arguments
    query_parts = []
    output_format = "markdown"
    num_results = 5
    
    for arg in sys.argv[1:]:
        if arg.startswith('--format='):
            output_format = arg.split('=', 1)[1]
        elif arg.startswith('--num='):
            num_results = int(arg.split('=', 1)[1])
        else:
            query_parts.append(arg)
    
    query = ' '.join(query_parts)
    
    # Perform search
    results = tavily_search(query, num_results=num_results)
    
    # Format output
    if output_format == "raw":
        print(json.dumps(results, indent=2))
    elif output_format == "brave":
        print(json.dumps(format_results_brave(results), indent=2))
    else:  # markdown (default)
        print(format_results_markdown(results))

if __name__ == "__main__":
    main()
