# App Map - Wikipedia Alpha

**App:** Wikipedia Alpha for Android
**Package:** org.wikipedia.alpha
**Platform:** Android 15.0
**Device:** Samsung Galaxy Tab S10 Plus
**BrowserStack App ID:** bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1

---

## 📱 Screens Mapped

### 1. Main Feed (Native)

**Context:** `NATIVE_APP`
**Page Object:** `src/page-objects/wikipedia/WikipediaMainPage.js`
**Coverage:** Tested via Cucumber (see feature files)

**Purpose:** Wikipedia main landing page with featured content and search access

#### Elements Discovered

| Element | Selector | Type | Tested | Notes |
|---------|----------|------|--------|-------|
| Search Container | `id=org.wikipedia.alpha:id/search_container` | Button | ✅ | Opens search view |
| Main Feed View | `id=org.wikipedia.alpha:id/feed_view` | ScrollView | ✅ | Content feed |
| Nav Tab Explore | `id=org.wikipedia.alpha:id/nav_tab_explore` | Tab | ❌ | Bottom navigation |
| Version Dialog | `android:id/button1` | Button | ✅ | OK button on warning dialog |

#### User Flows From This Screen

1. **Search Flow:** Tap search_container → Navigate to Search View
2. **Navigation:** Tap explore tab → Stay on main feed
3. **Dialog Handling:** Dismiss version warning on first launch

#### Coverage Analysis

- **Elements Found:** 17 (from MCP discovery)
- **Elements Tested:** 4 (via Cucumber tests)
- **Critical Gaps:** Bottom navigation tabs, feed content interactions

---

### 2. Search View (Native)

**Context:** `NATIVE_APP`
**Page Object:** `src/page-objects/wikipedia/SearchPage.js`
**Coverage:** Partially tested

**Purpose:** Search interface with history and suggestions

#### Elements Discovered

| Element | Selector | Type | Tested | Notes |
|---------|----------|------|--------|-------|
| Search Toolbar | `id=org.wikipedia.alpha:id/search_toolbar` | Toolbar | ✅ | Top bar |
| Search Bar | `id=org.wikipedia.alpha:id/search_bar` | EditText | ⚠️ | Input field (selector issues) |
| Voice Search | `id=org.wikipedia.alpha:id/voice_search_button` | Button | ❌ | Not yet tested |
| Language Selector | `~Wikipedia language` | Button | ❌ | Change language |
| Recent Searches | `~Recent searches:` | Section | ❌ | Search history |

#### User Flows From This Screen

1. **Text Search:** Enter text → View suggestions → Select result → Article page
2. **Voice Search:** Tap mic button → Speak query → Results
3. **Language Change:** Tap language selector → Choose language
4. **History:** View recent searches → Tap to repeat

#### Coverage Analysis

- **Elements Found:** 15
- **Elements Tested:** 2 (search toolbar, basic text entry)
- **Critical Gaps:** Voice search, language switching, suggestions handling

---

### 3. Article Page (Native)

**Context:** `NATIVE_APP`
**Page Object:** `src/page-objects/wikipedia/ArticlePage.js`
**Coverage:** Limited testing

**Purpose:** Display Wikipedia article content

#### Elements Discovered

| Element | Selector | Type | Tested | Notes |
|---------|----------|------|--------|-------|
| Article Content | `id=org.wikipedia.alpha:id/page_web_view` | WebView | ⚠️ | Main content area |
| Toolbar | `id=org.wikipedia.alpha:id/page_toolbar` | Toolbar | ❌ | Article actions |
| Back Button | `Navigate up` | Button | ❌ | Return to previous |

#### User Flows From This Screen

1. **Reading:** Scroll article content
2. **Navigation:** Tap back → Return to search/feed
3. **Actions:** Share, bookmark, settings (via toolbar)

#### Coverage Analysis

- **Elements Found:** 8
- **Elements Tested:** 1 (basic navigation)
- **Critical Gaps:** Content scrolling, toolbar actions, webview interactions

---

## 🧭 Navigation Map

```
[App Launch]
    ↓
[Version Warning Dialog] → Dismiss (button1)
    ↓
[Main Feed]
    ↓ (tap search_container)
[Search View]
    ↓ (enter text + select result)
[Article Page]
    ↓ (back button)
[Main Feed or Search View]
```

---

## 📊 Overall Coverage

| Screen | Elements | Tested | Coverage | Notes |
|--------|----------|--------|----------|-------|
| Main Feed | 17 | 4 | 24% | Core flow working |
| Search View | 15 | 2 | 13% | Selector issues |
| Article Page | 8 | 1 | 13% | Limited coverage |
| **TOTAL** | **40** | **7** | **18%** | Via Cucumber tests |

**Note:** Coverage shown here is from Cucumber test execution, not MCP tool usage. MCP coverage tracking is in-memory only.

---

## 🎯 High-Priority Elements to Test

1. **Search Flow** - Fix selectors, test complete search → article navigation
2. **Voice Search** - Test voice search button and speech input
3. **Language Switching** - Test language selector functionality
4. **Article Content** - Test scrolling, reading, and content interactions
5. **Bottom Navigation** - Test all navigation tabs

---

## 💡 Coverage Tracking Note

**Two Types of Coverage:**

1. **MCP Tool Coverage** (in-memory):
   - Tracks usage of `inspect_screen`, `gesture`, `smart_action`
   - Only persists during MCP server runtime
   - Used for AI-guided exploration
   - Resets when server restarts

2. **Cucumber Test Coverage** (documented here):
   - Based on implemented step definitions
   - Tracked manually in feature files
   - Persists across sessions
   - Represents actual test automation

**Current Status:** Tests run via `npx wdio` don't update MCP coverage. Coverage here represents what's actually tested in CI/CD.

---

**Last Updated:** February 18, 2026 (v0.3.0)
**Next Review:** After implementing missing step definitions
