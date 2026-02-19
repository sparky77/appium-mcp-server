# TODO: Package.json Scripts to Add

## Status: PENDING
These npm scripts need to be added to package.json for easier test execution.

## Scripts to Add:

```json
"test:spec": "wdio wdio.conf.js --spec",
"test:tags": "wdio wdio.conf.js --cucumberOpts.tagExpression",
"test:smoke": "wdio wdio.conf.js --cucumberOpts.tagExpression='@smoke'",
"test:critical": "wdio wdio.conf.js --cucumberOpts.tagExpression='@critical'",
"test:broken": "wdio wdio.conf.js --cucumberOpts.tagExpression='@broken-demo'",
"test:broken:selector": "wdio wdio.conf.js --cucumberOpts.tagExpression='@broken-selector'",
"test:broken:wait": "wdio wdio.conf.js --cucumberOpts.tagExpression='@broken-wait'",
"test:broken:element": "wdio wdio.conf.js --cucumberOpts.tagExpression='@broken-element'",
"test:broken:state": "wdio wdio.conf.js --cucumberOpts.tagExpression='@broken-state'",
"test:search": "wdio wdio.conf.js --spec='features/wikipedia/*earch.feature'",
```

## Usage Examples:
```bash
# Run smoke tests
npm run test:smoke

# Run critical tests
npm run test:critical

# Run all broken tests for demo
npm run test:broken

# Run specific broken test category
npm run test:broken:selector

# Run search features (both search.feature and Broken_Search.feature)
npm run test:search
```

## Benefits:
- Easier test execution (no need to remember wdio command syntax)
- Consistent command patterns
- Better discoverability (npm run shows all available scripts)
- Documentation through script names

## Related Files:
- `package.json` - Target file for these scripts
- `run-tests-tags.ps1` - Alternative PowerShell approach
- `docs/TAG-REFERENCE.md` - Tag documentation

## Next Steps:
1. Review and approve these scripts
2. Add to package.json scripts section
3. Test each script works correctly
4. Update README.md with new npm scripts
