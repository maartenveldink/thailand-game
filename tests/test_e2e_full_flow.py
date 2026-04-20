"""
Full end-to-end flow tests for Thailand Avontuur.

Covers:
  - TestEachGameLoads: individual load + programmatic win for each of the 7 games
  - TestFullGameFlow: complete journey from name entry through all 7 games

Run:
    cd c:/projects/claude/thailand-game
    python -m pytest tests/test_e2e_full_flow.py -v
"""
import json
import pytest
from playwright.sync_api import expect


# ── Game registry ──────────────────────────────────────────────────────────────

# (aria-label on React map, Phaser scene key, location index in save)
GAMES = [
    ("Bangkok",        "BangkokMapGame",     0),
    ("Kanchanaburi",   "KanchanaburiMemory", 1),
    ("Nachttrein",     "TrainReflexGame",    2),
    ("Khao Sok",       "KhaoSokPuzzle",      3),
    ("Cheow Lan Meer", "LakeRaftGame",       4),
    ("Koh Samui",      "SamuiBeachGame",     5),
    ("Terug Bangkok",  "BangkokFinalGame",   6),
]

LOCATION_IDS = [
    "bangkok", "kanchanaburi", "nachttrein",
    "khaosok", "cheowlan", "samui", "terugbangkok",
]


# ── Save helpers ───────────────────────────────────────────────────────────────

def make_save(completed_through=-1):
    """
    Build a save where locations 0..completed_through are completed+unlocked,
    location completed_through+1 is unlocked (if it exists), and the rest locked.
    """
    locations = []
    for i, lid in enumerate(LOCATION_IDS):
        if i <= completed_through:
            locations.append({"id": lid, "unlocked": True, "completed": True,  "stars": 2})
        elif i == completed_through + 1:
            locations.append({"id": lid, "unlocked": True, "completed": False, "stars": 0})
        else:
            locations.append({"id": lid, "unlocked": False, "completed": False, "stars": 0})

    return {
        "version": 1,
        "playerName": "Speler 1",
        "locations": locations,
        "totalStars": max(0, completed_through + 1) * 2,
        "lastPlayed": None,
    }


def apply_save(page, save):
    active = page.evaluate("localStorage.getItem('thailand_active')") or 'Speler 1'
    page.evaluate(f"localStorage.setItem('thailand_active', {json.dumps(active)})")
    page.evaluate(f"localStorage.setItem('thailand_save_{active}', JSON.stringify({json.dumps(save)}))")


def get_save(page):
    active = page.evaluate("localStorage.getItem('thailand_active')")
    key = f'thailand_save_{active}' if active else 'thailand_save'
    raw = page.evaluate(f"localStorage.getItem({json.dumps(key)})")
    return json.loads(raw) if raw else None


# ── Navigation helpers ─────────────────────────────────────────────────────────

def wait_for_phaser_scene(page, scene_key, timeout=10000):
    page.wait_for_function(
        f"window._game && window._game.scene.isActive('{scene_key}')",
        timeout=timeout,
    )


def navigate_to_game(page, aria_label, scene_key):
    """Click a map marker and start the game through the React story drawer."""
    # force=True bypasses Playwright's overlap check (some markers are very close together)
    page.locator(f'[aria-label="{aria_label}"]').first.click(force=True)
    page.locator("button", has_text="Speel nu!").click()
    wait_for_phaser_scene(page, scene_key, timeout=12000)
    page.wait_for_timeout(300)


def return_to_map_from_win(page):
    """
    From WinScene, trigger the 'Terug naar de kaart' zone and wait for the
    React map to become visible again.
    """
    wait_for_phaser_scene(page, "WinScene", timeout=8000)
    page.wait_for_timeout(1500)  # allow WinScene animations to settle

    page.evaluate("""
        (function () {
            var scene = window._game.scene.getScene('WinScene');
            if (!scene) return;
            var zones = scene.children.list.filter(function (o) {
                return o.type === 'Zone' && o.input;
            });
            if (zones.length > 0) zones[zones.length - 1].emit('pointerdown');
        })()
    """)
    page.wait_for_timeout(800)
    expect(page.locator('img[alt="Kaart van Thailand"]')).to_be_visible(timeout=5000)


# ── Programmatic win JS per scene ──────────────────────────────────────────────

def _win_js(scene_key):
    s = f"window._game.scene.getScene('{scene_key}')"

    scripts = {
        "BangkokMapGame": f"""
            (function () {{
                var s = {s};
                if (!s) return;
                s.locationIndex = 0;
                s._correct = 5;
                s._doWin();
            }})()
        """,
        "KanchanaburiMemory": f"""
            (function () {{
                var s = {s};
                if (!s) return;
                s.pairs = 8;
                s._doWin();
            }})()
        """,
        "TrainReflexGame": f"""
            (function () {{
                var s = {s};
                if (!s) return;
                s.caught = 15;
                s.lives = 0;
                s._endGame();
            }})()
        """,
        "KhaoSokPuzzle": f"""
            (function () {{
                var s = {s};
                if (!s) return;
                s.correct = 10;
                s.qIndex = 15;
                s._doEnd();
            }})()
        """,
        "LakeRaftGame": f"""
            (function () {{
                var s = {s};
                if (!s) return;
                s.score = 12;
                s._doEnd();
            }})()
        """,
        "SamuiBeachGame": f"""
            (function () {{
                var s = {s};
                if (!s) return;
                s.results = [true, true, true];
                s.subIndex = 3;
                s._doFinalEnd();
            }})()
        """,
        "BangkokFinalGame": f"""
            (function () {{
                var s = {s};
                if (!s) return;
                s.score = 6;
                s._doEnd();
            }})()
        """,
    }
    return scripts[scene_key]


def _click_last_zone(page, scene_key):
    """Click the last interactive Zone in a scene (usually the 'Verder ▶' button)."""
    page.evaluate(f"""
        (function () {{
            var s = window._game.scene.getScene('{scene_key}');
            if (!s) return;
            var zones = s.children.list.filter(function (o) {{
                return o.type === 'Zone' && o.input;
            }});
            if (zones.length > 0) zones[zones.length - 1].emit('pointerdown');
        }})()
    """)


# Games whose _doEnd() / _doFinalEnd() shows an intermediate result screen before WinScene.
# These require an extra zone-click to proceed to WinScene.
NEEDS_CLICK_THROUGH = {
    "BangkokFinalGame", "KhaoSokPuzzle", "LakeRaftGame", "SamuiBeachGame",
}


def win_game(page, scene_key):
    """
    Programmatically win the active game scene.
    Games with an intermediate result screen require a zone-click to reach WinScene.
    """
    page.evaluate(_win_js(scene_key))

    if scene_key in NEEDS_CLICK_THROUGH:
        # Result overlay with 'Verder ▶' button — click last zone to proceed to WinScene
        page.wait_for_timeout(700)
        _click_last_zone(page, scene_key)


# ── Individual game tests ──────────────────────────────────────────────────────

class TestEachGameLoads:
    """
    One test per game: unlock prerequisites via save → navigate → verify scene
    is active → win programmatically → verify WinScene reached → verify save.
    """

    def _setup(self, page, game_server):
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(f"{game_server}?unlock=all")
        page.wait_for_load_state("networkidle")

    def _run(self, page, game_server, label, scene_key, idx):
        self._setup(page, game_server)
        navigate_to_game(page, label, scene_key)

        active = page.evaluate(f"window._game.scene.isActive('{scene_key}')")
        assert active, f"{scene_key} should be the active Phaser scene"

        win_game(page, scene_key)
        wait_for_phaser_scene(page, "WinScene", timeout=8000)

        save = get_save(page)
        assert save["locations"][idx]["completed"] is True, \
            f"Location {idx} ({label}) should be marked completed in save"

    def test_bangkok_map_game(self, page, game_server):
        self._run(page, game_server, *GAMES[0])

    def test_kanchanaburi_memory(self, page, game_server):
        self._run(page, game_server, *GAMES[1])

    def test_train_reflex_game(self, page, game_server):
        # TrainReflexGame is now infinite: no WinScene, completes on score >= 15
        self._setup(page, game_server)
        label, scene_key, idx = GAMES[2]
        navigate_to_game(page, label, scene_key)
        active = page.evaluate(f"window._game.scene.isActive('{scene_key}')")
        assert active, f"{scene_key} should be the active Phaser scene"
        win_game(page, scene_key)
        page.wait_for_timeout(600)
        save = get_save(page)
        assert save["locations"][idx]["completed"] is True, \
            f"Location {idx} ({label}) should be marked completed in save"

    def test_khao_sok_puzzle(self, page, game_server):
        self._run(page, game_server, *GAMES[3])

    def test_lake_raft_game(self, page, game_server):
        self._run(page, game_server, *GAMES[4])

    def test_samui_beach_game(self, page, game_server):
        self._run(page, game_server, *GAMES[5])

    def test_bangkok_final_game(self, page, game_server):
        self._run(page, game_server, *GAMES[6])


# ── Full journey test ──────────────────────────────────────────────────────────

class TestFullGameFlow:
    """
    Walk through the entire game from the name-entry screen all the way through
    all 7 locations, asserting save state after every win.
    """

    def test_complete_journey(self, page, game_server):
        # ── 1. Fresh start via ?unlock=all (skips name screen with placeholder names)
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(game_server)  # must navigate before accessing localStorage
        page.evaluate("localStorage.removeItem('thailand_save'); localStorage.removeItem('thailand_active'); localStorage.removeItem('thailand_players'); localStorage.removeItem('thailand_save_Speler 1')")
        page.goto(f"{game_server}?unlock=all")
        page.wait_for_load_state("networkidle")

        expect(page.locator('img[alt="Kaart van Thailand"]')).to_be_visible(timeout=6000)

        save = get_save(page)
        assert save is not None
        assert save["playerName"] == "Speler 1"
        assert all(loc["unlocked"] for loc in save["locations"]), \
            "All locations should be unlocked by ?unlock=all"

        # ── 2. Play all 7 games in order ───────────────────────────────────
        for label, scene_key, idx in GAMES:
            navigate_to_game(page, label, scene_key)
            win_game(page, scene_key)

            if scene_key == "TrainReflexGame":
                # Infinite mode: no WinScene — shows retry overlay, return via back button zone
                page.wait_for_timeout(600)
                page.evaluate("""
                    (function () {
                        var s = window._game.scene.getScene('TrainReflexGame');
                        if (!s) return;
                        var zones = s.children.list.filter(function (o) {
                            return o.type === 'Zone' && o.input;
                        });
                        // Last zone in _showRetry is the "back to map" button
                        if (zones.length > 0) zones[zones.length - 1].emit('pointerdown');
                    })()
                """)
                page.wait_for_timeout(800)
                expect(page.locator('img[alt="Kaart van Thailand"]')).to_be_visible(timeout=5000)
            else:
                return_to_map_from_win(page)

            save = get_save(page)
            assert save["locations"][idx]["completed"] is True, \
                f"Location {idx} ({label}) should be completed after win"

            if idx < len(GAMES) - 1:
                assert save["locations"][idx + 1]["unlocked"] is True, \
                    f"Location {idx + 1} should be unlocked after completing {idx} ({label})"

        # ── 3. Final assertions ────────────────────────────────────────────
        save = get_save(page)

        for i, (label, _, _) in enumerate(GAMES):
            assert save["locations"][i]["completed"] is True, \
                f"Location {i} ({label}) should be completed at journey end"

        assert save["totalStars"] > 0, \
            "totalStars should be > 0 after completing all 7 games"
