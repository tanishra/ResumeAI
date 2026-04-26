import os
import sys


os.environ.setdefault("PYTEST_DISABLE_PLUGIN_AUTOLOAD", "1")

import pytest


if __name__ == "__main__":
    args = ["backend/tests", *sys.argv[1:]]
    if "-p asyncio" not in " ".join(args):
        args.extend(["-p", "asyncio"])
    raise SystemExit(pytest.main(args))
