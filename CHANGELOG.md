# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.1] - 2025-09-14

### Fixed
- Fixed Linux compatibility issue with Warp terminal by downgrading axios from v1.9.0 to v1.7.7
- Resolved "File is not defined" error when running on Linux systems with recent Warp updates
- Server now starts successfully on both Windows and Linux environments

### Changed
- Downgraded axios dependency to avoid undici Web API compatibility issues

## [1.5.0] - 2025-05-10

### Added
- Initial release of the Web Scout MCP Server
- DuckDuckGo search functionality
- Web content extraction with memory optimizations
- Support for extracting content from multiple URLs in parallel
- Rate limiting to prevent API blocks
- Memory management to prevent application crashes
- Error handling and context logging
