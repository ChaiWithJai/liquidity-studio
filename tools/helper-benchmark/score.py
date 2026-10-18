"""Strict scoring independent of model inference; never authorizes application work."""
import json

EXPECTED_TITLE = 'Angel City FC’s $250M Control Deal & NWSL Media Boom'


def score(raw, expected, observation, revision):
    try:
        parsed = json.loads(raw)
    except (ValueError, TypeError):
        return {
            'jsonValid': False,
            'schemaValid': False,
            'protocolValid': False,
            'visualIdentityCorrect': False,
            'completeTaskValid': False,
        }

    schema = (
        isinstance(parsed, dict)
        and set(parsed) == {'decision', 'observedTitle', 'action'}
        and isinstance(parsed.get('decision'), str)
        and parsed['decision'] in {'propose', 'refresh', 'reject'}
        and isinstance(parsed.get('observedTitle'), str)
    )
    protocol = bool(schema and parsed['decision'] == expected)
    if protocol and expected == 'propose':
        action = parsed['action']
        protocol = (
            isinstance(action, dict)
            and set(action) == {'kind', 'storyId', 'expectedRevision', 'patch'}
            and action['kind'] == 'story.patch'
            and action['storyId'] == observation['storyId']
            # Python bool is an int subclass: require an actual integer.
            and type(action['expectedRevision']) is int
            and action['expectedRevision'] == revision
            and action['patch'] == {'category': 'Reviewed source notes'}
        )
    elif protocol:
        protocol = parsed['action'] is None

    title = parsed.get('observedTitle', '') if isinstance(parsed, dict) else ''
    normalized = title.replace('’', "'") if isinstance(title, str) else ''
    visual = normalized in {
        EXPECTED_TITLE.replace('’', "'"),
        f"Current story: {EXPECTED_TITLE} · revision {observation['expectedRevision']}".replace('’', "'"),
    }
    return {
        'jsonValid': True,
        'schemaValid': bool(schema),
        'protocolValid': bool(protocol),
        'visualIdentityCorrect': visual,
        'completeTaskValid': bool(protocol and visual),
    }
