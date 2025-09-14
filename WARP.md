# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Build and Development Commands

```bash
# Build TypeScript to JavaScript
npm run build

# Start the server (requires build first)
npm start

# Production build (same as build)
npm run production

# Run directly from source during development
npx tsx src/index.ts

# Test the server with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## Architecture Overview

This is a **Model Context Protocol (MCP) server** that provides web search and content extraction capabilities to AI assistants. The architecture consists of:

### Core Components

1. **MCP Server** (`src/index.ts` main server setup)
   - Uses `@modelcontextprotocol/sdk` for MCP protocol handling
   - Implements `StdioServerTransport` for stdio communication
   - Exposes exactly 2 tools: `DuckDuckGoWebSearch` and `UrlContentExtractor`

2. **DuckDuckGoSearcher Class**
   - Performs web searches via DuckDuckGo's HTML interface
   - Uses POST requests to avoid rate limiting
   - Parses HTML responses with cheerio
   - Returns structured SearchResult objects

3. **WebContentFetcher Class** 
   - Fetches and extracts clean text from web pages
   - **Critical**: Implements sophisticated memory management
   - Supports both single URL and batch processing (multiple URLs)
   - Uses temporary files for large content to prevent memory crashes

4. **RateLimiter Class**
   - Prevents API rate limiting by throttling requests
   - Default: 30 requests/minute for search, 20 requests/minute for fetching
   - Uses sliding window approach with request timestamp tracking

### Memory Management Strategy

The WebContentFetcher implements critical memory optimizations:

- **Size-based processing**: Content >5MB gets written to temp files
- **Memory-based processing**: Monitors system memory usage, switches to file processing at >70% usage
- **Batch size adjustment**: Dynamically adjusts concurrent URL processing (1-5 URLs) based on memory pressure
- **Cleanup mechanisms**: Automatic temp file cleanup on process exit/SIGINT
- **Garbage collection**: Forces GC when available between batches

### Communication Protocol

- **Input**: MCP protocol via stdio (JSON-RPC 2.0)
- **Output**: Structured text responses formatted for LLM consumption
- **Error handling**: Returns error objects with `isError: true` rather than throwing exceptions

## Tool Specifications

### DuckDuckGoWebSearch
- Input: `{query: string, maxResults?: number}`
- Default maxResults: 10
- Returns formatted text with numbered results, URLs, and snippets

### UrlContentExtractor  
- Input: `{url: string | string[]}`
- Supports both single URL (string) and multiple URLs (array)
- Returns clean text content or JSON object for multiple URLs
- Content is truncated at 8000 characters per page

## Key Implementation Details

### Search Implementation
- Uses DuckDuckGo HTML endpoint (not API) to avoid API key requirements
- Handles DuckDuckGo redirect URL cleanup (`//duckduckgo.com/l/?uddg=`)
- Filters out advertisement results
- 30-second timeout on requests

### Content Extraction
- Removes `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>` elements
- Normalizes whitespace and trims content
- Batch processing with memory-aware concurrency control
- 500ms delays between batches to allow system recovery

### Error Handling Philosophy
- Network errors return descriptive error messages instead of throwing
- Individual URL failures in batch operations don't fail the entire operation
- All errors are logged via the Context interface but processing continues

## Docker Usage

```bash
# Build container
docker build -t web-scout-mcp .

# Run container (stdio mode)
docker run -i web-scout-mcp

# The Dockerfile uses multi-stage builds for optimization
```

## MCP Client Integration

Add to MCP client config (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "web-scout": {
      "command": "npx",
      "args": ["-y", "@pinkpixel/web-scout-mcp"]
    }
  }
}
```

## Development Notes

- The server runs on **Node.js >=18.0.0**
- Uses ES modules (`"type": "module"` in package.json)
- TypeScript target is ES2020 with NodeNext module resolution
- Single source file architecture (`src/index.ts`) containing all functionality
- No test framework currently configured
- Uses cheerio for HTML parsing, axios for HTTP requests, and uuid for temp file naming

## Smithery Integration

- Configured for HTTP-based deployment (see `smithery.yaml`)
- Published on [Smithery](https://smithery.ai/server/@pinkpixel-dev/web-scout-mcp) for easy installation

## Performance Considerations

- **Memory**: Designed to handle large web pages without crashing
- **Rate limiting**: Built-in protection against API blocks  
- **Concurrency**: Smart batch processing based on system resources
- **Timeouts**: 30-second timeouts prevent hanging requests
- **Cleanup**: Automatic resource cleanup prevents memory leaks