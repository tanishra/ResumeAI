import os
import sys


os.environ.setdefault("PYTEST_DISABLE_PLUGIN_AUTOLOAD", "1")

import pytest


if __name__ == "__main__":
    raise SystemExit(pytest.main(["backend/tests", *sys.argv[1:]]))
