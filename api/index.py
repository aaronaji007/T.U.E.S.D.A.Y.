import os
import sys

# Ensure repository root is available in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Signal Vercel environment to adapt filesystem and skip UDP broadcast sockets
os.environ["VERCEL"] = "1"

from engine.server import app

# Export for Vercel
__all__ = ["app"]
