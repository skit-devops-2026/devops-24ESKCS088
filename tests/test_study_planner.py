import unittest
from pathlib import Path


class TestStudyPlanner(unittest.TestCase):

    def test_main_files_exist(self):
        project_root = Path(__file__).parent.parent

        required_files = [
            "index.html",
            "landing.html",
            "signup.html",
            "task.html",
            "Notes.html",
        ]

        for file in required_files:
            with self.subTest(file=file):
                self.assertTrue(
                    (project_root / file).exists(),
                    f"{file} is missing"
                )

    def test_css_folder_exists(self):
        project_root = Path(__file__).parent.parent
        self.assertTrue((project_root / "css").is_dir())


if __name__ == "__main__":
    unittest.main()