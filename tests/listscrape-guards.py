"""Run the collector against a fake backend: no Windows input or screenshots."""
import json, os, runpy, sys, tempfile, types, unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/dev/listscrape.py'

class Guards(unittest.TestCase):
    def collect(self, scenario):
        state = {'now': 100, 'foreground': 123, 'sent': [], 'reads': 0}
        class Picture:
            def convert(self, *_): return self
            def save(self, *_args, **_kwargs): pass
        class Run:
            def __init__(self, *_): pass
            def window(self, *_): return {'hwnd': 123}
            def focus(self, *_): raise AssertionError('Collector must never focus')
            def _mouse(self, flags, *_args, **_): return flags
            def _send(self, flags):
                state['sent'].append(flags)
                if scenario == 'wheel-focus-loss': state['foreground'] = 999
            def read_rect(self, *_):
                state['reads'] += 1
                if scenario == 'ocr-focus-loss': state['foreground'] = 999
                return [{'y': 10, 'x': 10, 'text': 'fixture'}]
            def grab(self, *_): return Picture()
        def sleep(_):
            if scenario == 'sleep-expiry': state['now'] = 201
        user = types.SimpleNamespace(GetForegroundWindow=lambda: state['foreground'],
            GetSystemMetrics=lambda n: {76:0,77:0,78:2000,79:1000}[n])
        fake = types.SimpleNamespace(Run=Run, user=user)
        scratch = SCRIPT.parents[2] / 'workspace'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as tmp:
            out = Path(tmp) / 'capture.jsonl'
            if scenario == 'stop-before-start': Path(str(out)+'.stop').touch()
            deadline = '99' if scenario == 'expired' else 'inf' if scenario == 'infinite' else '200'
            with patch.dict(sys.modules, {'playtest_runner': fake}), \
                 patch.dict(os.environ, {'MILIASTRA_CAPTURE_DEADLINE': deadline}), \
                 patch.object(sys, 'argv', [str(SCRIPT),str(out),'0','0','100','100','1','4']), \
                 patch('time.sleep', sleep), patch('time.time', lambda: state['now']):
                try: runpy.run_path(str(SCRIPT), run_name='__main__')
                except SystemExit: state['exited'] = True
            state['rows'] = [json.loads(x) for x in out.read_text().splitlines()] if out.exists() else []
        return state

    def test_start_rejection_never_sends(self):
        for scenario in ['expired','infinite','stop-before-start']:
            result = self.collect(scenario)
            self.assertTrue(result['exited']); self.assertEqual(result['sent'], [])

    def test_wait_and_ocr_recheck(self):
        for scenario in ['sleep-expiry','ocr-focus-loss']:
            result = self.collect(scenario)
            self.assertEqual(result['sent'], [])
            self.assertFalse(result['rows'][-1]['completed'])
            self.assertEqual(result['rows'][-1]['steps'], 0)

    def test_wheel_stop_is_reported(self):
        result = self.collect('wheel-focus-loss')
        self.assertNotIn(0x0800, result['sent'])
        self.assertFalse(result['rows'][-1]['completed'])

    def test_stable_end_is_completed(self):
        result = self.collect('normal')
        self.assertTrue(result['rows'][-1]['completed'])
        self.assertEqual(result['rows'][-1]['steps'], 4)

if __name__ == '__main__': unittest.main()
