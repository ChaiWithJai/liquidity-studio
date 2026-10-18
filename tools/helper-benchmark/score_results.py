"""Rescore historical raw outputs without rerunning inference or changing raw text."""
import argparse
import json
from pathlib import Path
from score import score
parser = argparse.ArgumentParser()
parser.add_argument('--initial', required=True)
parser.add_argument('--correction', required=True)
parser.add_argument('--observations', required=True)
args = parser.parse_args()
obs = json.loads(Path(args.observations).read_text())['observations'][0]
initial = json.loads(Path(args.initial).read_text())
rows = [{'case': r['case'], **score(r['rawOutput'], r['expectedDecision'], obs, obs['expectedRevision'] + (r['case'] == 'stale'))} for r in initial['results']]
correction = json.loads(Path(args.correction).read_text())
print(json.dumps({'initial': rows, 'correction': [{'case': r['case'], **score(r['rawOutput'], r['expectedDecision'], obs, obs['expectedRevision'] + 1)} for r in correction['results']]}, indent=2))
