# mcp-nav/ - MCP Discovery & Context

**Purpose**: AI's working memory for mobile app exploration using MCP tools.

##  What's In This Folder

### Core Documentation
- **WikiDiscovery.md** - Complete Wikipedia app discovery session (3 screens mapped)
- **app-map.md** - Element locator reference (IDs, XPaths, accessibility labels)
- **test-registry.md** - Test scenario tracking and coverage matrix

### Context Files  
- **project-context.md** - High-level project goals and architecture
- **decisions.md** - Technical decisions and rationale

##  How To Use

### Starting New AI Session
1. Load **/SESSION-CONTEXT.md** (root folder) into new chat
2. Reference mcp-nav/WikiDiscovery.md for MCP tool replay steps
3. Check mcp-nav/test-registry.md for current coverage

### During App Exploration
1. Run MCP inspect_screen tool
2. Document findings in app-map.md
3. Update test-registry.md with new scenarios

### Before Demo
- Review WikiDiscovery.md for live demo replay
- Verify all element IDs in app-map.md still valid
- Check test-registry.md for coverage gaps

---

**This folder = AI's notebook showing how it learned the app structure**
