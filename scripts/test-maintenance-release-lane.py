#!/usr/bin/env python3
"""Exercise workflow tag selection and maintenance ancestry/frontend guards."""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

ENV = {key: value for key, value in os.environ.items() if key != 'BASH_ENV'}
ROOT = Path(__file__).resolve().parents[1]
ci = (ROOT / '.github/workflows/ci.yml').read_text()
publish = (ROOT / '.github/workflows/publish-release-image-tags.yml').read_text()

def check_concurrency_groups(work):
    block = re.search(r'^concurrency:\s*\n\s*group:\s*>-\s*\n(.*?)^  cancel-in-progress:', ci, re.M | re.S)
    assert block, 'CI must declare a workflow concurrency group'
    group = re.fullmatch(r'\s*\$\{\{\s*github\.workflow\s*\}\}-\$\{\{\s*github\.ref\s*\}\}\$\{\{(.*?)\}\}\s*', block[1], re.S)
    assert group, 'CI must keep a workflow and Git ref prefix'
    # Extract the routing values from the checked-in expression. Whitespace is
    # incidental, but notice selection must be gated on the event and marker.
    contains = r"contains\s*\(\s*fromJSON\s*\(\s*'([^']+)'\s*\)\s*,\s*github\.event\.client_payload\.submodule\s*\)"
    selector = re.fullmatch(
        r"\s*github\.event_name\s*==\s*'([^']+)'\s*&&\s*\(\s*" + contains
        + r"\s*\|\|\s*\(\s*github\.event\.client_payload\.engine_promotion\s*==\s*'([^']+)'\s*&&\s*" + contains
        + r"\s*\)\s*\)\s*&&\s*format\s*\(\s*'([^']+)'\s*,\s*github\.run_id\s*\)\s*\|\|\s*''\s*",
        group[1],
    )
    assert selector, 'CI must pair notification selection with a unique run suffix'
    event, always, marker, opt_in, suffix = selector.groups()
    event, marker = event.lower(), marker.lower()
    always = {source.lower() for source in json.loads(always)}
    opt_in = {source.lower() for source in json.loads(opt_in)}
    assert suffix.format(7001) != suffix.format(7002), 'notification groups must differ across runs'
    main_ref = 'refs/heads/main'
    cases = [
        ('push', main_ref, '', '', False, None),
        ('push', 'refs/heads/release/1.2.x', '', '', False, None),
        ('push', 'refs/heads/sirius-demo', '', '', False, None),
        ('pull_request', 'refs/pull/42/merge', '', '', False, None),
        ('repository_dispatch', main_ref, 'SiriusScan/go-api', '', True, 'notice'),
        ('repository_dispatch', main_ref, 'go-api', 'source-pin-v1', True, 'notice'),
        ('repository_dispatch', main_ref, 'SiriusScan/app-scanner', 'source-pin-v1', True, 'notice'),
        ('repository_dispatch', main_ref, 'app-scanner', '', True, 'notice'),
        ('repository_dispatch', main_ref, 'SiriusScan/app-terminal', 'source-pin-v1', True, 'notice'),
        ('repository_dispatch', main_ref, 'app-terminal', '', False, 'build'),
        ('repository_dispatch', main_ref, 'app-agent', '', False, 'build'),
        ('repository_dispatch', main_ref, 'SiriusScan/app-administrator', '', False, 'build'),
        ('repository_dispatch', main_ref, 'go-api', 'wrong', True, 'rejected'),
        ('repository_dispatch', main_ref, 'app-scanner', 'wrong', True, 'rejected'),
        ('repository_dispatch', main_ref, 'app-terminal', 'wrong', False, 'rejected'),
        ('repository_dispatch', main_ref, 'app-terminal', 'SOURCE-PIN-V1', True, 'rejected'),
        ('repository_dispatch', main_ref, 'app-agent', 'source-pin-v1', False, 'rejected'),
    ]
    output = work / 'dispatch-output'
    for name, ref, source, promotion, isolated, receiver in cases:
        notification = name.lower() == event and (
            source.lower() in always or (promotion.lower() == marker and source.lower() in opt_in)
        )
        reference_group = f'Sirius CI/CD Pipeline-{ref}'
        actual_group = reference_group + (suffix.format(7001) if notification else '')
        assert actual_group == reference_group + ('-notification-7001' if isolated else ''), (name, ref, source, promotion, actual_group)
        if receiver is None:
            continue
        output.write_text('')
        result = subprocess.run(
            ['bash', str(ROOT / 'scripts/ci-dispatch-allowlist.sh')],
            env={**ENV, 'SUBMODULE': source, 'COMMIT_SHA': 'a' * 40, 'ENGINE_PROMOTION': promotion,
                 'APPLY_PIN': '0', 'EMIT_CHANGES': '1', 'GITHUB_OUTPUT': str(output), 'GITHUB_STEP_SUMMARY': ''},
            text=True, capture_output=True,
        )
        flags = set(output.read_text().splitlines())
        if receiver == 'rejected':
            assert result.returncode != 0 and not flags, (source, promotion, result, flags)
        else:
            assert result.returncode == 0, (source, promotion, result)
            if receiver == 'notice':
                assert flags == {'sirius_api_changes=false', 'sirius_engine_changes=false'}, (source, flags)
            else:
                assert 'sirius_engine_changes=true' in flags, (source, flags)
    print('PASS per-ref build queues and informational component dispatches')

blocks = re.findall(r'      - name: Generate image tag[^\n]*\n        id: meta\n(?:        env:\n(?:          [^\n]*\n)*)?        run: \|\n(.*?)(?=\n      - name:|\Z)', ci, re.S)
assert len(blocks) == 8, len(blocks)
blocks += re.findall(r'      - name: Determine image tag\n        id: tag\n        run: \|\n(.*?)(?=\n      - name:|\Z)', ci, re.S)
assert len(blocks) == 9, len(blocks)
with tempfile.TemporaryDirectory(prefix='maintenance-lane-test-') as directory:
    work = Path(directory)
    check_concurrency_groups(work)
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
    baseline = ci.split('          BASE_REF=""\n', 1)[1].split('          if [ -z "${BASE_REF}" ]; then', 1)[0]
    baseline = 'BASE_REF=""\n' + '\n'.join(line[10:] for line in baseline.rstrip().splitlines()) + '\nprintf "%s\n" "$BASE_REF"\n'
    for before, expected in [(good, good), ('0' * 40, 'v1.2.5')]:
        result = subprocess.check_output(['bash', '-eu', '-c', baseline], cwd=work, env={**ENV, 'EVENT_NAME': 'push', 'GIT_REF': 'refs/heads/release/1.2.x', 'PUSH_BEFORE': before, 'PR_BASE_SHA': ''}, text=True)
        assert result.strip() == expected, result
    publishing = publish.split('          if [ "${SOURCE_BRANCH}" = "release/1.2.x" ]; then', 1)[1].split('\n          fi', 1)[0]
    publishing = 'if [ "${SOURCE_BRANCH}" = "release/1.2.x" ]; then\n' + '\n'.join(line[10:] for line in publishing.splitlines()) + '\nfi\n'
    (work / 'bin').mkdir()
    command = work / 'bin/gh'
    command.write_text('#!/bin/sh\nprintf "%s\\n" "$*" > "$CAPTURE"\n')
    command.chmod(0o755)
    for branch in ['main', 'release/1.2.x']:
        capture = work / 'release-command'
        subprocess.run(['bash', '-eu', '-c', publishing], check=True, env={**ENV, 'PATH': str(work / 'bin') + os.pathsep + ENV['PATH'], 'SOURCE_BRANCH': branch, 'TARGET_TAG': 'v9.9.9', 'CAPTURE': str(capture)})
        assert ('--latest=false' in capture.read_text()) == (branch != 'main')
assert 'DEFAULT_BRANCH: ${{ needs.validate-inputs.outputs.source_branch }}' in publish
assert 'release/1.2.x' not in ci.split('  # Canary dispatch', 1)[1]
print('PASS maintenance image tags, unchanged main tags, approved source ancestry and identical UI-tree guard')
