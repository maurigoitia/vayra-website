# Dead Ends Log

| Iteration | Approach Tried | Why It Failed | Files Touched |
|---|---|---|---|
| 1 | Node -c AST parsing alone for JS verification without headless browser runtime execution; un-guarded element binding `$('exit-copy')` and unclosed CSS media query block at line 407 | Failed in live headless Chrome with `TypeError: Cannot read properties of null (reading 'addEventListener')` at line 1325:19, preventing `renderCalc()` execution and unclosed `@media` trapping desktop rules | `public/index.html` |
