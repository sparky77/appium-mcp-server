# Sprint Planning & TODO

## Current Sprint: Sprint 3
**Status:** 🔄 In Progress  
**Focus:** Session Management, API Integration, Demo Framework, CI/CD

---

## 🔥 HIGH PRIORITY

### 1. GitHub Actions CI/CD Setup
**Status:** 🔄 In Progress  
**Category:** DevOps  
**Requirement:** REQ-006

**Tasks:**
- [x] Create workflow file (`.github/workflows/browserstack-tests.yml`)
- [x] Document setup process (`docs/GITHUB-ACTIONS-SETUP.md`)
- [ ] **Add secrets to GitHub repository**
  - `BROWSERSTACK_USERNAME`
  - `BROWSERSTACK_ACCESS_KEY`
  - `BS_APP_REFERENCE`
- [ ] Test workflow execution (commit and push)
- [ ] Verify smoke test stage works
- [ ] Verify critical test stage works
- [ ] Verify manual trigger works
- [ ] Verify artifact uploads (reports, dashboard)
- [ ] Configure branch protection rules

**Impact:** Critical for automated regression testing and PR validation  
**Effort:** 1-2 hours (mostly GitHub UI configuration)  
**Dependencies:** None - ready to implement

---

### 2. Validate Session Naming Fix
**Status:** 🔄 Testing Now  
**Category:** Test Infrastructure  
**Requirement:** REQ-003

**Tasks:**
- [x] Implement session isolation via `browser.reloadSession()`
- [x] Fix duplicate naming race condition (removed wdio.conf.js hook)
- [x] Move session naming to single `Before` hook in wikipedia-steps.js
- [ ] **Test with parallel execution** (currently running)
- [ ] **Verify BrowserStack dashboard shows proper session names**
- [ ] **Confirm NO "Test Session" default names**
- [ ] **Verify scenario annotations appear correctly**

**Impact:** Critical - affects test reporting accuracy  
**Effort:** 30 minutes testing + validation  
**Dependencies:** None - fix implemented, validation in progress
**Dependencies:** Current test run completing

---

## 📦 MEDIUM PRIORITY

### 3. npm Script Shortcuts
**Status:** 📋 Pending  
**Category:** Developer Experience  
**Requirement:** REQ-007

**Tasks:**
- [x] Create proposal document (`scripts/inDev/TODO-package-scripts.md`)
- [ ] Review proposed scripts for approval
- [ ] Add scripts to `package.json`
- [ ] Test each npm script:
  - `npm run test:smoke`
  - `npm run test:critical`
  - `npm run test:broken`
  - `npm run test:broken:selector/wait/element/state`
  - `npm run test:search`
- [ ] Update README.md with new scripts
- [ ] Add to TAG-REFERENCE.md usage examples

**Impact:** Medium - improves developer experience  
**Effort:** 1 hour  
**Dependencies:** None - can start immediately

---

### 4. Fix Remaining Selector Issues
**Status:** 📋 Pending  
**Category:** Test Stability  

**Tasks:**
- [ ] Run search.feature in isolation
- [ ] Identify any flaky scenarios
- [ ] Fix element selectors if needed
- [ ] Add explicit waits where missing
- [ ] Document any app changes affecting tests

**Impact:** Medium - needed for 100% pass rate  
**Effort:** 1-2 hours  
**Dependencies:** Session naming fix validated first

---

## 🔮 LOW PRIORITY / FUTURE

### 5. Allure Report Publishing
**Status:** 🔮 Future  
**Category:** Reporting  
**Requirement:** REQ-009

**Tasks:**
- [ ] Research GitHub Pages deployment options
- [ ] Create workflow for report publishing
- [ ] Configure report history retention
- [ ] Add to CI/CD pipeline

**Impact:** Low - nice to have  
**Effort:** 2-3 hours  
**Dependencies:** CI/CD pipeline working

---

### 6. Multi-Device Matrix Testing
**Status:** 🔮 Future  
**Category:** Test Coverage  
**Requirement:** REQ-008

**Tasks:**
- [ ] Define device matrix (3-5 devices)
- [ ] Update `wdio.conf.js` with capabilities array
- [ ] Configure GitHub Actions matrix strategy
- [ ] Validate parallel execution across devices
- [ ] Update dashboard to show device breakdown

**Impact:** Low - future enhancement  
**Effort:** 3-4 hours  
**Dependencies:** CI/CD pipeline working

---

### 7. Slack/Teams Notifications
**Status:** 🔮 Future  
**Category:** Communication  
**Requirement:** REQ-010

**Tasks:**
- [ ] Create Slack webhook
- [ ] Add notification step to workflow
- [ ] Design failure message template
- [ ] Include BrowserStack session links
- [ ] Test notification delivery

**Impact:** Low - team communication enhancement  
**Effort:** 1 hour  
**Dependencies:** CI/CD pipeline working

---

### 8. AI-Powered Test Operations Dashboard (POST-DEMO)
**Status:** 🔮 Future Sprint 4+  
**Category:** Product Evolution  
**Requirement:** REQ-011

**Vision:**
Transform MCP from developer tool → team platform with centralized dashboard for test operations + AI-powered debugging.

**Phase 1: Intelligent Reporting (Sprint 4)**
- [ ] Build web dashboard (Next.js/React)
- [ ] Integrate BrowserStack API for real-time results
- [ ] AI failure summaries via Claude API
- [ ] Display copy-paste MCP prompts (leverage current work!)
- [ ] Click to view session details + screenshots

**Phase 2: Remote MCP Integration (Sprint 5)**
- [ ] Design MCP Gateway HTTP/WebSocket service
- [ ] "Analyze with MCP" button → triggers inspect_screen remotely
- [ ] Show AI recommendations in dashboard UI
- [ ] "Apply Fix" → updates code, triggers re-run
- [ ] Live progress updates (WebSocket)

**Phase 3: Team Collaboration (Sprint 6+)**
- [ ] Multi-user access with authentication
- [ ] Fix history / audit log
- [ ] Share MCP analysis with team
- [ ] Scheduled automated MCP health checks
- [ ] Session queue for concurrent MCP operations

**Technical Approach:**
- Start simple: Dashboard → BrowserStack API → AI summaries
- Current copy-paste prompts = MVP integration
- Then build MCP HTTP gateway for remote execution
- Finally add real-time collaboration features

**Impact:** HIGH - Differentiates from traditional test automation, creates platform moat  
**Effort:** 8-12 weeks across multiple sprints  
**Dependencies:** Sprint 3 complete, demo validated, stakeholder buy-in

---

## 📊 Sprint 3 Progress Summary

**Total Tasks:** 31  
**Completed:** 18 (58%)  
**In Progress:** 2 (6%)  
**Pending:** 7 (23%)  
**Future:** 4 (13%)

### Completed This Sprint ✅
- Parallel test execution (REQ-001)
- Tag-based test filtering (REQ-002)
- BrowserStack API integration (REQ-004)
- Intentional test failures demo (REQ-005)
- Session management improvements (REQ-003)
- Demo framework with repeatability
- PowerShell execution scripts
- Comprehensive documentation

### Critical Path for Sprint Completion
1. ✅ Fix session naming regression → **DONE (testing now)**
2. 🔥 Complete GitHub Actions setup → **HIGH PRIORITY**
3. 📦 Add npm scripts → **MEDIUM PRIORITY**
4. ✅ Validate all features work together → **TESTING NOW**

---

## 🎯 Definition of Done (Sprint 3)

A task is considered "Done" when:
- [x] Code implemented and tested locally
- [x] Documentation updated
- [ ] **GitHub Actions workflow tested** (pending)
- [x] No regressions introduced
- [x] Related files updated (README, TAG-REFERENCE, etc.)
- [ ] **All search.feature tests passing** (pending)

---

## 📝 Next Sprint Preparation (Sprint 4)

**Tentative Focus:** Test Portal Web Application

**Research Tasks:**
- Evaluate Next.js vs Vite + React
- Design dashboard UI/UX
- Plan database schema (test results storage)
- Evaluate hosting options (Vercel, GitHub Pages, Netlify)

**Dependencies:**
- Sprint 3 CI/CD pipeline working
- BrowserStack API integration stable
- Allure report generation consistent

---

## 📚 Related Documents

- [SPRINT-3-IN-PROGRESS.md](SPRINT-3-IN-PROGRESS.md) - Detailed sprint log
- [REQUIREMENTS-EVOLUTION.md](REQUIREMENTS-EVOLUTION.md) - Requirements tracker
- [GITHUB-ACTIONS-SETUP.md](GITHUB-ACTIONS-SETUP.md) - CI/CD setup guide
- [TAG-REFERENCE.md](TAG-REFERENCE.md) - Tag documentation
- [DEMO-MCP-DEBUGGING.md](DEMO-MCP-DEBUGGING.md) - Demo workflow
- [TODO-package-scripts.md](../scripts/inDev/TODO-package-scripts.md) - npm scripts proposal

**Last Updated:** February 18, 2026  
**Next Review:** After current test run completes
