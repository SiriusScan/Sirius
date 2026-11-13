#!/usr/bin/env python3
"""Exercise workflow tag selection and maintenance ancestry/frontend guards."""
import os
from pathlib import Path
import re
import subprocess
import tempfile

ENV = {key: value for key, value in os.environ.items() if key != 'BASH_ENV'}
ROOT = Path(__file__).resolve().parents[1]
ci = (ROOT / '.github/workflows/ci.yml').read_text()
publish = (ROOT / '.github/workflows/publish-release-image-tags.yml').read_text()
blocks = re.findall(r'      - name: Generate image tag[^\n]*\n        id: meta\n(?:        env:\n(?:          [^\n]*\n)*)?        run: \|\n(.*?)(?=\n      - name:|\Z)', ci, re.S)
assert len(blocks) == 8, len(blocks)
blocks += re.findall(r'      - name: Determine image tag\n        id: tag\n        run: \|\n(.*?)(?=\n      - name:|\Z)', ci, re.S)
assert len(blocks) == 9, len(blocks)
with tempfile.TemporaryDirectory(prefix='maintenance-lane-test-') as directory:
    work = Path(directory)
    for branch, expected in [('main', 'latest'), ('release/1.2.x', 'maintenance-1.2')]:
        for i, block in enumerate(blocks):
            script = '\n'.join(line[10:] for line in block.rstrip().splitlines())
            for key, value in {'github.event_name': 'push', 'github.ref': 'refs/heads/' + branch, 'github.event.number': '1'}.items():
                script = script.replace('${{ ' + key + ' }}', value)
            assert '${{' not in script
            output = work / f'{i}.out'
            output.write_text('')
            subprocess.run(['bash', '-eu', '-c', script], check=True, env={**ENV, 'EVENT_NAME': 'push', 'GIT_REF': 'refs/heads/' + branch, 'PR_NUMBER': '1', 'GITHUB_OUTPUT': str(output)})
            fields = dict(line.split('=', 1) for line in output.read_text().splitlines())
            assert fields['image_tag'] == expected + ('-amd64' if i == 8 else ''), fields
            if branch != 'main':
                assert fields.get('also_tag_beta') != 'true', fields
    selector = publish.split('          SOURCE_BRANCH=main\n', 1)[1].split('          RELEASE_STATE=', 1)[0]
    selector = 'SOURCE_BRANCH=main\n' + '\n'.join(line[10:] for line in selector.rstrip().splitlines()) + '\nprintf "%s\\n" "$SOURCE_BRANCH"\n'
    def git(*args):
        return subprocess.check_output(['git', '-C', str(work), *args], text=True).strip()
    git('init', '-q', '-b', 'main')
    (work / 'sirius-ui').mkdir()
    (work / 'sirius-ui/view').write_text('baseline')
    def commit(message):
        git('add', '.')
        git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', message)
        return git('rev-parse', 'HEAD')
    base = commit('baseline')
    git('tag', 'v1.2.5')
    git('update-ref', 'refs/remotes/origin/main', base)
    (work / 'backend').write_text('fix')
    good = commit('backend fix')
    git('update-ref', 'refs/remotes/origin/release/1.2.x', good)
    def select(sha):
        return subprocess.run(['bash', '-eu', '-c', selector], cwd=work, env={**ENV, 'SOURCE_COMMIT': sha}, text=True, capture_output=True)
    result = select(good)
    assert result.returncode == 0 and result.stdout.strip() == 'release/1.2.x', result
    (work / 'sirius-ui/view').write_text('changed frontend')
    bad = commit('frontend change')
    git('update-ref', 'refs/remotes/origin/release/1.2.x', bad)
    assert select(bad).returncode != 0
    git('checkout', '-q', '--detach', base)
    (work / 'unreviewed-backend').write_text('unrelated')
    unrelated = commit('unreviewed source')
    assert select(unrelated).returncode != 0
    git('update-ref', '-d', 'refs/remotes/origin/release/1.2.x')
    assert select(base).stdout.strip() == 'main'
    changed = ci.split('            if [ "${EVENT_NAME}" = "pull_request" ]; then', 1)[1].split('            if grep', 1)[0]
    changed = 'if [ "${EVENT_NAME}" = "pull_request" ]; then\n' + '\n'.join(line[12:] for line in changed.rstrip().splitlines())
    subprocess.run(['bash', '-eu', '-c', changed], cwd=work, check=True, env={**ENV, 'EVENT_NAME': 'push', 'PUSH_BEFORE': '0' * 40, 'PUSH_AFTER': good})
    files = (work / 'changed_files.txt').read_text().splitlines()
    assert 'backend' in files and 'sirius-ui/view' in files, files
assert 'DEFAULT_BRANCH: ${{ needs.validate-inputs.outputs.source_branch }}' in publish
assert 'release/1.2.x' not in ci.split('  # Canary dispatch', 1)[1]
print('PASS maintenance image tags, unchanged main tags, approved source ancestry and identical UI-tree guard')
