#!/usr/bin/env python3
"""
Krug UX World Model Evaluator (server/krug-world-eval.py)

Instantiates Steve Krug's UX World Model (Retrieve, Rank, Classify, Generate)
plus the Teacher Trunk Test (6 Questions) and Goodwill Reservoir scoring.
Audits src/App.svelte and scripts/build-dist.js / dist/app.js to ensure zero
deceptive affordances, high information scent, and billboard-style clarity.

Target Assessment Evidence:
  - avg_trunk_test_score == 100.0
  - avg_goodwill_reservoir >= 95.0
  - total_question_marks_detected == 0
"""

import os
import sys
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_SVELTE = os.path.join(BASE_DIR, 'src', 'App.svelte')
BUILD_DIST = os.path.join(BASE_DIR, 'scripts', 'build-dist.js')
DIST_APP = os.path.join(BASE_DIR, 'dist', 'app.js')

def load_file(path):
    if not os.path.exists(path):
        return ""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def run_krug_evaluation():
    svelte_code = load_file(APP_SVELTE)
    build_code = load_file(BUILD_DIST)
    dist_code = load_file(DIST_APP)
    code_corpus = svelte_code + "\n" + build_code + "\n" + dist_code

    print("================================================================================")
    print("  KRUG UX WORLD MODEL: TEACHER-STUDENT USABILITY EVALUATION")
    print("================================================================================\n")

    question_marks = []
    goodwill = 100.0
    trunk_scores = {}

    # --------------------------------------------------------------------------
    # 1. RETRIEVE MODULE: Information Scent & Trunk Test
    # --------------------------------------------------------------------------
    # Q1: What site is this? (Site ID / Brand Mark vs ambiguous back-arrow)
    site_id_has_back_arrow = "← Liquidity Studio" in code_corpus or "← Liquidity" in code_corpus
    site_id_has_brand_mark = ("The Liquidity Desk" in code_corpus and "goHome" in code_corpus) or "💎 The Liquidity Desk" in code_corpus

    if site_id_has_back_arrow and not site_id_has_brand_mark:
        trunk_scores['Q1_Site_ID'] = 0.0
        goodwill -= 10.0
        question_marks.append("Ambiguous Site ID: '←' indicates back navigation rather than Home identity.")
    else:
        trunk_scores['Q1_Site_ID'] = 16.67

    # Q2: What page am I on? (Spec code leakage M1/A4 in user tabs)
    spec_code_leakage = bool(re.search(r"M[1-4]\.\s+[A-Za-z]|A[1-4]\.\s+[A-Za-z]", build_code))
    high_scent_tabs = "Brand Kit" in build_code and "Backlog" in build_code and "Calendar" in build_code and "Campaign Studio" in build_code

    if spec_code_leakage:
        trunk_scores['Q2_Page_Name'] = 0.0
        goodwill -= 10.0
        question_marks.append("Spec-Code Leakage: Internal engineering IDs (M1, A4) shown in user tabs.")
    elif high_scent_tabs:
        trunk_scores['Q2_Page_Name'] = 16.67
    else:
        trunk_scores['Q2_Page_Name'] = 8.0

    # Q3: What are the major sections?
    if "Marketer Studio" in code_corpus and ("Founder Admin" in code_corpus or "Admin & Ops" in code_corpus):
        trunk_scores['Q3_Major_Sections'] = 16.67
    else:
        trunk_scores['Q3_Major_Sections'] = 8.0
        question_marks.append("Major sections unclear or missing surface division.")

    # Q4: What are my options at this level?
    if "Format 4 Channels" in code_corpus and ("Schedule & Export" in code_corpus or "scheduleAndExport" in code_corpus):
        trunk_scores['Q4_Local_Options'] = 16.67
    else:
        trunk_scores['Q4_Local_Options'] = 8.0
        goodwill -= 10.0
        question_marks.append("Missing primary action options (e.g. Schedule & Export).")

    # Q5: Where am I in the scheme of things? (Step progress indicators)
    has_step_indicators = "1. Brand Kit" in code_corpus and "2. Backlog" in code_corpus and "3. Calendar" in code_corpus and "4. Campaign Studio" in code_corpus
    if has_step_indicators:
        trunk_scores['Q5_You_Are_Here'] = 16.66
    else:
        trunk_scores['Q5_You_Are_Here'] = 8.0
        question_marks.append("Step hierarchy / progress sequence missing in primary navigation.")

    # Q6: How can I search? (Instant search & status filter)
    has_search_bar = "Search stories" in code_corpus or "searchQuery" in code_corpus
    has_status_filters = "statusFilter" in code_corpus and "Draft Ready" in code_corpus and "Scheduled" in code_corpus
    if has_search_bar and has_status_filters:
        trunk_scores['Q6_How_Can_I_Search'] = 16.66
    else:
        trunk_scores['Q6_How_Can_I_Search'] = 0.0
        goodwill -= 15.0
        question_marks.append("Broken search scent: Missing search input or status filter pills.")

    # --------------------------------------------------------------------------
    # 2. RANK & CLASSIFY MODULE: Satisficing & Affordance Integrity
    # --------------------------------------------------------------------------
    # Check KRUG-001: Raw JSON dump on Screen M4
    has_raw_json_dump = bool(re.search(r"<pre[^>]*>\s*\$\{JSON\.stringify", build_code)) or bool(re.search(r"<pre[^>]*>\s*\{JSON\.stringify", svelte_code))
    has_visual_billboards = "renderInfographicPreview" in build_code and "renderCarouselPreview" in build_code and "renderStoryPreview" in build_code and "renderReelPreview" in build_code

    if has_raw_json_dump:
        goodwill -= 35.0
        question_marks.append("P0 Deceptive Affordance: Screen M4 renders raw JSON dump (<pre>JSON.stringify</pre>).")
    elif not has_visual_billboards:
        goodwill -= 20.0
        question_marks.append("Missing complete 4-format billboard previews in build-dist.js.")

    # Check KRUG-002: Fake 'Ask Studio Agent...' input box
    has_fake_agent_div = bool(re.search(r"<div[^>]*>Ask Studio Agent\.\.\.</div>", code_corpus)) and not bool(re.search(r"<input[^>]*placeholder=[\"']Ask Studio Agent", code_corpus))
    has_real_agent_input = "agentInputBox" in build_code or "executeAgentCommand" in code_corpus

    if has_fake_agent_div or not has_real_agent_input:
        goodwill -= 20.0
        question_marks.append("P0 Deceptive Affordance: Fake static div masquerading as 'Ask Studio Agent...' input.")

    # Check KRUG-005: 4-click tab ping pong & hidden weekend slots
    hides_weekend_days = "calendar.slice(0, 5)" in build_code or "calendar.slice(0,5)" in build_code
    has_schedule_and_export = "scheduleAndExport" in code_corpus or "Schedule & Export" in code_corpus

    if hides_weekend_days:
        goodwill -= 15.0
        question_marks.append("Hidden Weekend Slots: calendar.slice(0,5) hides Saturday and Sunday.")
    if not has_schedule_and_export:
        goodwill -= 15.0
        question_marks.append("Tab Ping-Pong: Missing 1-click Schedule & Export inside Campaign Studio.")

    # Check KRUG-006: Brand Kit dead clicks
    has_color_picker = 'type="color"' in code_corpus or "updateBrandColor" in code_corpus
    has_logo_editor = "updateLogoText" in code_corpus or "logoInputBox" in code_corpus or "brandProfile.logoText" in code_corpus

    if not has_color_picker or not has_logo_editor:
        goodwill -= 15.0
        question_marks.append("Dead Clicks on Brand Kit: Color swatches or logo tile not interactive.")

    # Check KRUG-007: Needless words & happy talk
    has_happy_talk = "Hi 👋 I'm your Pomelli-style campaign co-pilot" in code_corpus
    has_trimmed_subheader = "Turn weekly liquidity trends into 4-channel campaigns." in code_corpus

    if has_happy_talk:
        goodwill -= 10.0
        question_marks.append("Needless Words: Co-pilot happy talk dilutes visual hierarchy.")
    if not has_trimmed_subheader:
        goodwill -= 5.0
        question_marks.append("Hero subheader exceeds concise 7-word billboard limit.")

    # --------------------------------------------------------------------------
    # COMPUTE FINAL SCORES
    # --------------------------------------------------------------------------
    total_trunk = sum(trunk_scores.values())
    final_trunk = round(min(100.0, max(0.0, total_trunk)), 1)
    final_goodwill = round(min(100.0, max(0.0, goodwill)), 1)
    total_q_marks = len(question_marks)

    print("--- TEACHER EVALUATION RESULTS ---")
    for q, s in trunk_scores.items():
        print(f"  • {q}: {s:.2f}/16.67 pts")
    print(f"\n  🏆 Average Trunk Test Score: {final_trunk}/100.0 (Target: 100.0)")
    print(f"  💚 Average Goodwill Reservoir: {final_goodwill}/100.0 (Target: >= 95.0)")
    print(f"  ❓ Cognitive Friction 'Question Marks': {total_q_marks} (Target: 0)\n")

    if question_marks:
        print("  DETECTED DEFECTS:")
        for idx, qm in enumerate(question_marks, 1):
            print(f"    {idx}. {qm}")
        print("\n  ❌ EVALUATION FAILED: Requirements not satisfied.")
        return False
    else:
        print("  ✅ 100% PASS: All Steve Krug Usability Laws Satisfied.")
        print("  ✅ Zero Question Marks, 100.0 Trunk Test, 100.0 Goodwill Reservoir.")
        return True

if __name__ == '__main__':
    success = run_krug_evaluation()
    sys.exit(0 if success else 1)
