---
name: tavily-search
version: 1.0.0
description: Web search using Tavily API. Alternative to Brave Search when needed.
---

# Tavily Search 🔍

Web search skill using Tavily API. Use when Brave Search is unavailable or as an alternative search provider.

## Setup

1. Get a free API key from [Tavily](https://tavily.com/)
2. Add to your `~/.openclaw/.env`:
   ```
   TAVILYAPIKEY=your-api-key-here
   ```

## Usage

```
search <query>
```

Returns search results in markdown format with titles, URLs, and snippets.

## Output Formats

- **default**: Markdown formatted results
- **raw**: Raw JSON from Tavily API
- **brave**: Brave Search compatible format

## Rate Limits

Free tier: 1000 searches/month

## Security Notes

- Only reads TAVILYAPIKEY from .env
- Sends queries only to https://api.tavily.com/search
- No data exfiltration, no credential harvesting
- Code is transparent and auditable

---

*Vetted and approved ✅ - See vetting report in workspace memory*
