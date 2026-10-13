import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from capture_geometry import client_capture_rect, crop_edge_occlusion


class ClientGeometry(unittest.TestCase):
    def test_taskbar_edge_is_excluded_and_source_rect_is_unchanged(self):
        rect = dict(left=576, top=0, right=3840, bottom=2160)
        result = crop_edge_occlusion(rect, dict(left=0, top=2158, right=3840, bottom=2228))
        self.assertEqual(result, dict(left=576, top=0, right=3840, bottom=2158))
        self.assertEqual(rect['bottom'], 2160)

    def test_interior_partial_and_fully_covering_windows_are_rejected(self):
        rect = dict(left=0, top=0, right=1000, bottom=800)
        for blocker in [dict(left=0, top=300, right=1000, bottom=400),
                        dict(left=900, top=600, right=1100, bottom=900),
                        dict(left=-1, top=-1, right=1100, bottom=900)]:
            with self.assertRaises(ValueError):
                crop_edge_occlusion(rect, blocker)

    def test_left_and_top_crops_preserve_physical_offsets(self):
        rect = dict(left=-1000, top=0, right=0, bottom=800)
        result = crop_edge_occlusion(rect, dict(left=-1100, top=-1, right=-980, bottom=900))
        result = crop_edge_occlusion(result, dict(left=-1000, top=0, right=1, bottom=20))
        self.assertEqual(result, dict(left=-980, top=20, right=0, bottom=800))

    def test_native_dialog_excludes_title_and_border(self):
        window = dict(left=0, top=0, right=1200, bottom=900)
        client = dict(left=12, top=52, right=1188, bottom=888)
        actual = client_capture_rect(window, client, (1176, 836))
        self.assertEqual((actual['left']-window['left'], actual['top']-window['top']), (12, 52))

    def test_borderless_and_negative_monitor_coordinates(self):
        rect = dict(left=-1920, top=0, right=0, bottom=1080)
        self.assertEqual(client_capture_rect(rect, rect, (1920, 1080)), rect)

    def test_dpi_or_layout_mismatch_cannot_produce_actionable_coordinates(self):
        window = dict(left=0, top=0, right=1200, bottom=900)
        with self.assertRaises(ValueError):
            client_capture_rect(window, window, (800, 600))
        with self.assertRaises(ValueError):
            client_capture_rect(window, dict(left=-1, top=0, right=1199, bottom=900), (1200, 900))


if __name__ == '__main__':
    unittest.main()
