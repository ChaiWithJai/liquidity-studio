import json
import unittest
from score import EXPECTED_TITLE, score

class ScoreTests(unittest.TestCase):

    def test_invalid_enum_is_malformed_even_when_json_parses(self):
        result = score(json.dumps({'decision': 'review', 'observedTitle': EXPECTED_TITLE, 'action': None}), 'refresh', {'storyId': 'fixture', 'expectedRevision': 1}, 2)
        self.assertTrue(result['jsonValid'])
        self.assertFalse(result['schemaValid'])
        self.assertFalse(result['completeTaskValid'])

    def test_valid_protocol_does_not_hide_visual_identity_failure(self):
        result = score(json.dumps({'decision': 'refresh', 'observedTitle': 'Wrong paragraph', 'action': None}), 'refresh', {'storyId': 'fixture', 'expectedRevision': 1}, 2)
        self.assertTrue(result['protocolValid'])
        self.assertFalse(result['visualIdentityCorrect'])
        self.assertFalse(result['completeTaskValid'])

    def test_foreign_id_and_unexpected_action_fields_fail_protocol(self):
        action = {'kind': 'story.patch', 'storyId': 'foreign', 'expectedRevision': 1, 'patch': {'category': 'Reviewed source notes'}}
        result = score(json.dumps({'decision': 'propose', 'observedTitle': EXPECTED_TITLE, 'action': action}), 'propose', {'storyId': 'fixture', 'expectedRevision': 1}, 1)
        self.assertTrue(result['visualIdentityCorrect'])
        self.assertFalse(result['protocolValid'])
    def test_malformed_decision_types_return_rejection_without_crashing(self):
        for decision in [[], {}, None, True, 1]:
            with self.subTest(decision=decision):
                result = score(json.dumps({'decision': decision, 'observedTitle': EXPECTED_TITLE, 'action': None}), 'refresh', {'storyId': 'fixture', 'expectedRevision': 1}, 2)
                self.assertFalse(result['schemaValid'])
                self.assertFalse(result['completeTaskValid'])

    def test_non_string_titles_and_non_object_envelopes_do_not_crash(self):
        for title in [[], {}, None, True, 1]:
            with self.subTest(title=title):
                result = score(json.dumps({'decision': 'refresh', 'observedTitle': title, 'action': None}), 'refresh', {'storyId': 'fixture', 'expectedRevision': 1}, 2)
                self.assertFalse(result['schemaValid'])
                self.assertFalse(result['visualIdentityCorrect'])
        for value in [[], None, True, 1, 'text']:
            with self.subTest(envelope=value):
                self.assertFalse(score(json.dumps(value), 'refresh', {'storyId': 'fixture', 'expectedRevision': 1}, 2)['completeTaskValid'])

    def test_revision_requires_integer_not_boolean_or_float(self):
        for revision in [True, False, 1.0, '1', [], {}, None]:
            with self.subTest(revision=revision):
                action = {'kind': 'story.patch', 'storyId': 'fixture', 'expectedRevision': revision, 'patch': {'category': 'Reviewed source notes'}}
                result = score(json.dumps({'decision': 'propose', 'observedTitle': EXPECTED_TITLE, 'action': action}), 'propose', {'storyId': 'fixture', 'expectedRevision': 1}, 1)
                self.assertFalse(result['protocolValid'])
                self.assertFalse(result['completeTaskValid'])

if __name__ == '__main__':
    unittest.main()
