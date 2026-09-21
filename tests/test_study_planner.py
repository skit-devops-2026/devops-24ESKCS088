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
     
    def test_javascript_files_exist(self):
        project_root = Path(__file__).parent.parent

        required_files = [
            "js/Notes.js",
            "js/script.js",
            "js/task.js"
        ]

        for file in required_files:
            with self.subTest(file=file):
                self.assertTrue(
                    (project_root / file).exists(),
                    f"{file} is missing"
                )
    def test_html_files_have_basic_structure(self):
        project_root = Path(__file__).parent.parent

        html_files = [
            "index.html",
            "landing.html",
            "signup.html",
            "task.html",
            "Notes.html",
        ]

        for file in html_files:
            with self.subTest(file=file):
                content = (project_root / file).read_text(encoding="utf-8").lower()

                self.assertIn("<html", content, f"{file} has no <html> tag")
                self.assertIn("</html>", content, f"{file} has no closing </html> tag")
                
if __name__ == "__main__":
    unittest.main()