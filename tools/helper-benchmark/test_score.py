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
if __name__ == '__main__':
    unittest.main()
