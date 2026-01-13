# RNK?,? Hide 'Em v2.0.4 - Release Notes

## Package Information
- Module ID: rnk-hide-em
- Version: 2.0.4
- Foundry VTT Compatibility: v13
- Release Date: 2026-01-12

## Changelog
### v2.0.4
- Fixed macro directory toggle wiring and sidebar tab persistence
- Restored per-player sidebar tab selections in the configuration UI
- Expanded export/import/share payloads to include all visibility settings
- Defaulted preset page data to safe values during load

### v2.0.2
- Code quality improvements and tooling updates

## Test Coverage
- Lines: 100%
- Statements: 100%
- Branches: 100%
- Functions: 100%
- Total Tests: 44 passing

## Code Quality
- Comprehensive Vitest suite with Foundry VTT mocks
- ES module architecture
- Full i18n support (40+ languages)
- ESLint configured

## Features
- Advanced hotbar slot hiding with per-slot control
- Smooth animations (fade, slide)
- Preset system for quick configuration switching
- Export/import configuration
- Per-player visibility settings
- Hide labels, numbers, tooltips, controls

## Architecture
- Module Entry: scripts/module.js
- Core Logic: scripts/config.js, scripts/hooks.js, scripts/settings.js
- Features: scripts/features/ (animation, presets, export-import)
- Utilities: scripts/utils.js, scripts/styles.js
- Constants: scripts/constants.js
- Tests: tests/

## Installation
1. Open Foundry VTT
2. Navigate to Add-on Modules
3. Click "Install Module"
4. Paste manifest URL: https://raw.githubusercontent.com/RNK-Enterprise/rnk-hide-em/main/module.json
5. Click "Install"

## Support
- Author: Asgard Innovations / RNK?,?
- GitHub: https://github.com/RNK-Enterprise/rnk-hide-em
- Issues: https://github.com/RNK-Enterprise/rnk-hide-em/issues

---

RNK?,? Protocol Status: Package complete and ready for submission.
Test Coverage Achievement: 100% lines, statements, branches, functions.
Quality Assurance: All core functionality tested and verified.
