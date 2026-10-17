#!/usr/bin/env python3
"""Bounded source contract checks. These do not measure usability or factual truth.
Real interaction evidence lives in tests/studio.spec.js and preflight uses DOM boxes.
"""
from pathlib import Path
import json
import sys
root = Path(__file__).resolve().parent.parent
app = (root / 'src/App.svelte').read_text()
emulator = (root / 'src/Emulator.svelte').read_text()
preflight = (root / 'server/preflight.js').read_text()
checks = {
    'single_svelte_entry': "import App from './App.svelte'" in (root / 'src/main.js').read_text() and "from 'vite'" in (root / 'scripts/build-dist.js').read_text(),
    'clear_navigation': all(label in app for label in ['Story backlog', 'Content calendar', 'Campaign Studio', 'Brand Kit', 'Operations']),
    'authenticated_scoped_requests': all(value in app for value in ['/api/auth/session', '/api/auth/login', 'organizationId', 'brandId', 'scopeQuery']),
    'interactive_emulator_controls': all(value in emulator for value in ['In-Situ Instagram', '3×3 Profile Grid', 'Reel scrubber', 'Local comment', 'Caption fold threshold', 'Simulated safe-zone overlay']),
    'measured_not_confidence': 'getBoundingClientRect' in emulator and 'computePreflight' in emulator and 'requiresReview: true' in preflight and 'confidenceScore' not in preflight,
    'actual_browser_suite': (root / 'tests/studio.spec.js').exists(),
}
print(json.dumps({'kind': 'source_contract_checks_only', 'checks': checks, 'limits': 'Does not establish usability, platform pixel accuracy, accessibility compliance, factual accuracy or provider readiness.'}, indent=2))
sys.exit(0 if all(checks.values()) else 1)
