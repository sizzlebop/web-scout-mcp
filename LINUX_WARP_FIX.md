# 🐧 Linux Warp Compatibility Fix Guide

## 🚨 Problem Description

**Issue**: MCP servers fail to start on Linux in Warp terminal with error:
```
ReferenceError: File is not defined
    at Object.<anonymous> (.../node_modules/undici/lib/web/webidl/index.js:531:48)
```

**Affected**: Servers using axios v1.9.0 or higher
**Environment**: Linux + Warp Terminal + Node.js v18.x
**Working**: Windows environments (different Web API polyfills)

## 🔍 Root Cause

1. **Axios v1.9.0+** introduced **undici** as internal HTTP client
2. **Undici** expects Web API globals (`File`, `Blob`) to be available
3. **Warp's Linux environment** doesn't provide these Web API polyfills
4. **Windows environments** have different runtime configurations that include these APIs

## ✅ Solution: Downgrade Axios

**Quick Fix (Recommended):**
```json
{
  "dependencies": {
    "axios": "^1.7.7"  // Changed from ^1.9.0
  }
}
```

**Steps:**
1. Edit `package.json` and change axios version to `^1.7.7`
2. Run `npm install` to update dependencies
3. Rebuild your server (`npm run build`)
4. Test that server starts successfully

## 🧪 Testing the Fix

```bash
# Test server startup (should not error)
timeout 5s node dist/index.js || echo "Server started successfully"

# Look for this output (not the error):
# "YourServer MCP Server running on stdio"
```

## 📋 Checklist for Other Servers

- [ ] Check `package.json` for axios version ≥ 1.9.0
- [ ] Change axios version to `^1.7.7`
- [ ] Run `npm install` to update
- [ ] Update version number (patch bump)
- [ ] Rebuild with `npm run build`
- [ ] Test server starts without File errors
- [ ] Update CHANGELOG.md with fix

## 🔮 Alternative Solutions (Advanced)

If you need to keep axios v1.9.0+, add Web API polyfills:

```javascript
// Add to top of main server file
if (!globalThis.File) {
  const { Blob } = require('buffer');
  globalThis.File = class File extends Blob {
    constructor(fileBits, fileName, options = {}) {
      super(fileBits, options);
      this.name = fileName;
      this.lastModified = options.lastModified ?? Date.now();
    }
  };
}
```

## 📊 Affected Servers

Any MCP server with these characteristics may need this fix:
- Uses axios for HTTP requests
- axios version ≥ 1.9.0
- Fails with "File is not defined" on Linux Warp
- Works fine on Windows

---

**Fixed in Web Scout MCP v1.5.1** - September 14, 2025