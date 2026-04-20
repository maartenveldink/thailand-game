import subprocess
import time
import socket
import os
import json
import pytest

NODE_PATH = r"C:\Program Files\nodejs"
NPM_CMD   = r"C:\Program Files\nodejs\npm.cmd"

TEST_PLAYER = "Emma"

def _wait_for_port(port, timeout=15):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            s = socket.create_connection(("localhost", port), timeout=0.5)
            s.close()
            return True
        except OSError:
            time.sleep(0.3)
    return False


@pytest.fixture(scope="session")
def game_server():
    env = os.environ.copy()
    env["PATH"] = NODE_PATH + os.pathsep + env.get("PATH", "")

    proc = subprocess.Popen(
        [NPM_CMD, "run", "dev", "--", "--port", "5174"],
        cwd="c:/projects/claude/thailand-game",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=env,
    )
    assert _wait_for_port(5174, timeout=20), "Vite dev server did not start"
    yield "http://localhost:5174"
    proc.terminate()


@pytest.fixture
def game_page(page, game_server):
    """Browser page at 390×844 with pre-populated save data (Bangkok unlocked)."""
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(game_server)
    page.wait_for_load_state("networkidle")

    save = {
        "version": 1,
        "playerName": TEST_PLAYER,
        "locations": [
            {"id": "bangkok",      "unlocked": True,  "completed": False, "stars": 0},
            {"id": "kanchanaburi","unlocked": False, "completed": False, "stars": 0},
            {"id": "nachttrein",  "unlocked": False, "completed": False, "stars": 0},
            {"id": "khaosok",     "unlocked": False, "completed": False, "stars": 0},
            {"id": "cheowlan",    "unlocked": False, "completed": False, "stars": 0},
            {"id": "samui",       "unlocked": False, "completed": False, "stars": 0},
            {"id": "terugbangkok","unlocked": False, "completed": False, "stars": 0},
        ],
        "totalStars": 0,
        "lastPlayed": None,
    }
    save_key = f"thailand_save_{TEST_PLAYER}"
    page.evaluate(f"""
        localStorage.setItem('thailand_active', {json.dumps(TEST_PLAYER)});
        localStorage.setItem('thailand_players', {json.dumps(json.dumps([TEST_PLAYER]))});
        localStorage.setItem({json.dumps(save_key)}, JSON.stringify({json.dumps(save)}));
    """)
    page.reload()
    page.wait_for_load_state("networkidle")
    return page
