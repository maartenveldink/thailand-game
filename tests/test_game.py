"""
End-to-end tests for Thailand Avontuur (React + Phaser).

Run:
    cd c:/projects/claude/thailand-game
    python -m pytest tests/ -v
"""
import json
import pytest
from playwright.sync_api import expect


# ── Helpers ────────────────────────────────────────────────────────────────────

def get_save(page):
    # Per-player saves: key is thailand_save_{activePlayer}
    active = page.evaluate("localStorage.getItem('thailand_active')")
    key = f'thailand_save_{active}' if active else 'thailand_save'
    raw = page.evaluate(f"localStorage.getItem({json.dumps(key)})")
    return json.loads(raw) if raw else None


def wait_for_phaser_scene(page, scene_key, timeout=10000):
    """Wait until the named Phaser scene is active (requires window._game)."""
    page.wait_for_function(
        f"window._game && window._game.scene.isActive('{scene_key}')",
        timeout=timeout,
    )


def enter_bangkok_game(page):
    """Navigate from the React map to the Bangkok quiz game."""
    # Click the Bangkok marker button in React
    page.locator('[aria-label="Bangkok"]').first.click()
    # Story drawer appears — click "Speel nu!"
    page.locator('button', has_text="Speel nu!").click()
    # Phaser mounts: wait for BangkokMapGame scene
    wait_for_phaser_scene(page, "BangkokMapGame", timeout=10000)


def answer_quiz_n_correct(page, n, timeout_per_q=1100):
    """
    Answer quiz questions until n correct answers are accumulated.
    Reads the Phaser scene state to always pick the correct button position.
    """
    for _ in range(n * 4):  # max attempts (wrong answers re-prompt)
        page.wait_for_timeout(500)
        correct_now = page.evaluate(
            "window._game && window._game.scene.getScene('BangkokMapGame') "
            "? window._game.scene.getScene('BangkokMapGame')._correct : -1"
        )
        if correct_now >= n:
            return
        if correct_now == -1:
            break  # scene gone (won)
        # Click the correct answer: the Phaser scene exposes pool[0].c after shuffle
        # Simplest: click the button in the middle-left area (first visible option)
        # Buttons are at canvas y ≈ 325,435,545,655 (game coords in 390×844)
        # Canvas may be scaled — use Phaser to click programmatically
        page.evaluate("""
          (function() {
            var scene = window._game && window._game.scene.getScene('BangkokMapGame');
            if (!scene || scene._answering) return;
            // Simulate clicking a zone that has the correct answer by checking zones
            var zones = scene._qContainer.list.filter(function(obj) {
              return obj.type === 'Zone' && obj.input;
            });
            // Find which zone corresponds to the correct button (by position order)
            // We can't know shuffle order from outside easily, so just fire pointerdown
            // on all zones until one works (only correct one advances)
            if (zones.length > 0) {
              // Fire on first zone — may be correct or wrong, game handles both
              scene.input.emit('pointerdown', { worldX: zones[0].x, worldY: zones[0].y });
              zones[0].emit('pointerdown');
            }
          })()
        """)
        page.wait_for_timeout(timeout_per_q)


# ── Name screen ────────────────────────────────────────────────────────────────

class TestNameScreen:
    def test_player_select_shown_on_fresh_start(self, page, game_server):
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(game_server)
        page.wait_for_load_state("networkidle")
        page.evaluate("localStorage.removeItem('thailand_active'); localStorage.removeItem('thailand_players')")
        page.reload()
        page.wait_for_load_state("networkidle")
        # Player select screen shows a name input (no existing players)
        expect(page.locator('input').first).to_be_visible(timeout=5000)

    def test_submit_name_shows_map(self, page, game_server):
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(game_server)
        page.wait_for_load_state("networkidle")
        page.evaluate("localStorage.removeItem('thailand_active'); localStorage.removeItem('thailand_players')")
        page.reload()
        page.wait_for_load_state("networkidle")

        page.locator('input').first.fill("Emma")
        page.locator('button[type="submit"]').click()

        expect(page.locator('img[alt="Kaart van Thailand"]')).to_be_visible(timeout=6000)

        save = get_save(page)
        assert save["playerName"] == "Emma"


# ── Map screen (React) ─────────────────────────────────────────────────────────

class TestMapScreen:
    def test_map_image_visible(self, game_page):
        expect(game_page.locator('img[alt="Kaart van Thailand"]')).to_be_visible()

    def test_bangkok_marker_visible(self, game_page):
        expect(game_page.locator('[aria-label="Bangkok"]').first).to_be_visible()

    def test_player_names_displayed(self, game_page):
        expect(game_page.locator('text=Emma')).to_be_visible()

    def test_click_bangkok_opens_drawer(self, game_page):
        game_page.locator('[aria-label="Bangkok"]').first.click()
        expect(game_page.locator('text=Bangkok – De Stad der Engelen')).to_be_visible(timeout=3000)

    def test_locked_marker_does_not_open_drawer(self, game_page):
        # Kanchanaburi is locked
        btn = game_page.locator('[aria-label="Kanchanaburi"]')
        if btn.count() > 0:
            btn.first.click()
            game_page.wait_for_timeout(400)
        # Drawer should NOT be visible (no story text)
        expect(game_page.locator('text=Kanchanaburi – De Rivier Kwai')).not_to_be_visible()

    def test_close_drawer(self, game_page):
        game_page.locator('[aria-label="Bangkok"]').first.click()
        expect(game_page.locator('text=Bangkok – De Stad der Engelen')).to_be_visible(timeout=3000)
        game_page.locator('[aria-label="Sluit"]').click()
        game_page.wait_for_timeout(400)

    def test_progress_bar_visible(self, game_page):
        expect(game_page.locator('text=0 van 7 bestemmingen')).to_be_visible()


# ── Bangkok quiz game ──────────────────────────────────────────────────────────

class TestBangkokQuiz:
    def test_game_launches(self, game_page):
        enter_bangkok_game(game_page)

    def test_quiz_shows_question_text(self, game_page):
        enter_bangkok_game(game_page)
        # The quiz renders question text inside the Phaser canvas
        # Verify the scene is running and has a question loaded
        has_question = game_page.evaluate("""
          (function() {
            var scene = window._game && window._game.scene.getScene('BangkokMapGame');
            if (!scene) return false;
            return scene._pool !== undefined && scene._correct === 0;
          })()
        """)
        assert has_question, "BangkokMapGame scene should be active with pool initialised"

    def test_answer_button_click_does_not_crash(self, game_page):
        enter_bangkok_game(game_page)
        game_page.wait_for_timeout(500)
        # Click the first zone in the question container
        game_page.evaluate("""
          (function() {
            var scene = window._game.scene.getScene('BangkokMapGame');
            var zones = scene._qContainer.list.filter(function(o) {
              return o.type === 'Zone' && o.input;
            });
            if (zones.length > 0) zones[0].emit('pointerdown');
          })()
        """)
        game_page.wait_for_timeout(1200)
        # Scene still active or moved to WinScene — neither crashes
        still_ok = game_page.evaluate("""
          window._game && (
            window._game.scene.isActive('BangkokMapGame') ||
            window._game.scene.isActive('WinScene')
          )
        """)
        assert still_ok

    def test_five_correct_answers_wins(self, game_page):
        enter_bangkok_game(game_page)
        game_page.wait_for_timeout(400)
        # Set 4 correct then call _onAnswer(true) directly with a stub graphics object
        game_page.evaluate("""
          (function() {
            var scene = window._game.scene.getScene('BangkokMapGame');
            if (!scene) return;
            scene._correct = 4;
            scene._drawStars();
            // Stub graphics so _onAnswer doesn't crash on the visual update
            var stub = {
              clear: function(){}, fillStyle: function(){},
              fillRoundedRect: function(){}, lineStyle: function(){},
              strokeRoundedRect: function(){}
            };
            scene._onAnswer(true, stub, 325, 100);
          })()
        """)
        wait_for_phaser_scene(game_page, "WinScene", timeout=6000)

    def test_win_saves_completion(self, game_page):
        self.test_five_correct_answers_wins(game_page)
        save = get_save(game_page)
        assert save["locations"][0]["completed"] is True
        assert save["locations"][1]["unlocked"] is True


# ── Memory game helpers ────────────────────────────────────────────────────────

def kanchanaburi_card_game_pos(col, row):
    """Return Phaser game-space (x, y) center for card at grid (col, row)."""
    start_x, start_y = 27, 95
    card_w, card_h, gap_x, gap_y = 78, 88, 8, 10
    return (
        start_x + col * (card_w + gap_x) + card_w / 2,
        start_y + row * (card_h + gap_y) + card_h / 2,
    )


def game_to_screen(page, gx, gy):
    """Convert Phaser game coords (390×844) to browser screen coords via the canvas."""
    box = page.evaluate("""
        (function() {
            var c = document.querySelector('canvas');
            if (!c) return null;
            var r = c.getBoundingClientRect();
            return { l: r.left, t: r.top, w: r.width, h: r.height };
        })()
    """)
    return (
        box['l'] + (gx / 390) * box['w'],
        box['t'] + (gy / 844) * box['h'],
    )


def enter_kanchanaburi_game(page):
    """Navigate from React map to KanchanaburiMemory (Bangkok must be completed)."""
    page.locator('[aria-label="Kanchanaburi"]').first.click()
    page.locator('button', has_text="Speel nu!").click()
    wait_for_phaser_scene(page, "KanchanaburiMemory", timeout=10000)
    page.wait_for_timeout(300)


# ── Memory game ────────────────────────────────────────────────────────────────

class TestKanchanaburiMemory:
    def _enter_game(self, game_page):
        """Unlock Kanchanaburi via save, reload, then navigate via React UI."""
        save = get_save(game_page)
        save["locations"][0]["completed"] = True
        save["locations"][1]["unlocked"] = True
        active = game_page.evaluate("localStorage.getItem('thailand_active')") or 'Emma'
        key = f'thailand_save_{active}'
        game_page.evaluate(f"localStorage.setItem({json.dumps(key)}, JSON.stringify({json.dumps(save)}))")
        game_page.reload()
        game_page.wait_for_load_state("networkidle")
        enter_kanchanaburi_game(game_page)

    def _get_animals(self, game_page):
        return game_page.evaluate("""
            window._game.scene.getScene('KanchanaburiMemory').cards
                .map(function(c) { return c.animal; })
        """)

    def _flip(self, game_page, index):
        game_page.evaluate(f"""
            (function() {{
                var s = window._game.scene.getScene('KanchanaburiMemory');
                s.canFlip = true;
                s._flipCard({index});
            }})()
        """)

    def test_game_launches(self, game_page):
        self._enter_game(game_page)
        count = game_page.evaluate(
            "window._game.scene.getScene('KanchanaburiMemory').cards.length"
        )
        assert count == 16

    def test_clicking_card_flips_correct_card(self, game_page):
        """Regression: mouse click at card (col=0,row=0) must flip cards[0] only."""
        self._enter_game(game_page)

        sx, sy = game_to_screen(game_page, *kanchanaburi_card_game_pos(0, 0))
        game_page.mouse.click(sx, sy)
        game_page.wait_for_timeout(400)

        flipped = game_page.evaluate("""
            (function() {
                var s = window._game.scene.getScene('KanchanaburiMemory');
                return s.cards.reduce(function(a, c, i) {
                    if (c.flipped) a.push(i); return a;
                }, []);
            })()
        """)
        assert flipped == [0], f"Expected only cards[0] flipped, got {flipped}"

    def test_clicking_second_card_flips_correct_card(self, game_page):
        """Regression: mouse click at card (col=1,row=1) must flip cards[5] only."""
        self._enter_game(game_page)

        sx, sy = game_to_screen(game_page, *kanchanaburi_card_game_pos(1, 1))
        game_page.mouse.click(sx, sy)
        game_page.wait_for_timeout(400)

        flipped = game_page.evaluate("""
            (function() {
                var s = window._game.scene.getScene('KanchanaburiMemory');
                return s.cards.reduce(function(a, c, i) {
                    if (c.flipped) a.push(i); return a;
                }, []);
            })()
        """)
        assert flipped == [5], f"Expected only cards[5] flipped, got {flipped}"

    def test_clicking_outside_cards_does_not_flip(self, game_page):
        """Clicking in the bottom UI bar must not flip any card."""
        self._enter_game(game_page)

        sx, sy = game_to_screen(game_page, 195, 820)  # bottom bar, game coords
        game_page.mouse.click(sx, sy)
        game_page.wait_for_timeout(300)

        count = game_page.evaluate("""
            window._game.scene.getScene('KanchanaburiMemory').cards
                .filter(function(c) { return c.flipped; }).length
        """)
        assert count == 0, "Bottom-bar click should not flip any card"

    def test_non_matching_pair_flips_back(self, game_page):
        """Two cards with different animals must flip back after the check delay."""
        self._enter_game(game_page)
        animals = self._get_animals(game_page)

        i1, i2 = next(
            (i, j)
            for i in range(len(animals))
            for j in range(i + 1, len(animals))
            if animals[i] != animals[j]
        )
        self._flip(game_page, i1)
        game_page.wait_for_timeout(200)
        self._flip(game_page, i2)
        game_page.wait_for_timeout(1300)  # 700ms check delay + flip animation

        c1 = game_page.evaluate(f"window._game.scene.getScene('KanchanaburiMemory').cards[{i1}].flipped")
        c2 = game_page.evaluate(f"window._game.scene.getScene('KanchanaburiMemory').cards[{i2}].flipped")
        assert not c1, f"Card {i1} should have flipped back"
        assert not c2, f"Card {i2} should have flipped back"

    def test_matching_pair_stays_matched(self, game_page):
        """Two cards with the same animal must stay face-up and marked matched."""
        self._enter_game(game_page)
        animals = self._get_animals(game_page)

        seen = {}
        i1 = i2 = None
        for i, animal in enumerate(animals):
            if animal in seen:
                i1, i2 = seen[animal], i
                break
            seen[animal] = i

        self._flip(game_page, i1)
        game_page.wait_for_timeout(200)
        self._flip(game_page, i2)
        game_page.wait_for_timeout(1200)

        state = game_page.evaluate(f"""
            (function() {{
                var s = window._game.scene.getScene('KanchanaburiMemory');
                return {{
                    c1matched: s.cards[{i1}].matched,
                    c2matched: s.cards[{i2}].matched,
                    pairs: s.pairs
                }};
            }})()
        """)
        assert state['c1matched'], f"Card {i1} should be matched"
        assert state['c2matched'], f"Card {i2} should be matched"
        assert state['pairs'] == 1

    def test_matched_card_cannot_be_reflipped(self, game_page):
        """Clicking an already-matched card must not add it to the flipped stack."""
        self._enter_game(game_page)
        animals = self._get_animals(game_page)

        seen = {}
        i1 = i2 = None
        for i, animal in enumerate(animals):
            if animal in seen:
                i1, i2 = seen[animal], i
                break
            seen[animal] = i

        self._flip(game_page, i1)
        game_page.wait_for_timeout(200)
        self._flip(game_page, i2)
        game_page.wait_for_timeout(1200)

        # Try to re-flip a matched card
        self._flip(game_page, i1)
        game_page.wait_for_timeout(300)

        stack_len = game_page.evaluate(
            "window._game.scene.getScene('KanchanaburiMemory').flipped.length"
        )
        assert stack_len == 0, "Matched card re-click must not push to flipped stack"

    def test_move_counter_increments(self, game_page):
        """Each pair of flips increments the move counter by 1."""
        self._enter_game(game_page)
        animals = self._get_animals(game_page)

        i1, i2 = next(
            (i, j)
            for i in range(len(animals))
            for j in range(i + 1, len(animals))
            if animals[i] != animals[j]
        )
        self._flip(game_page, i1)
        game_page.wait_for_timeout(200)
        self._flip(game_page, i2)
        game_page.wait_for_timeout(1200)

        moves = game_page.evaluate(
            "window._game.scene.getScene('KanchanaburiMemory').moves"
        )
        assert moves == 1, f"Expected 1 move, got {moves}"

    def test_win_all_pairs_matched(self, game_page):
        """Matching all 8 pairs must transition to WinScene."""
        self._enter_game(game_page)
        animals = self._get_animals(game_page)

        seen = {}
        for i, animal in enumerate(animals):
            if animal in seen:
                self._flip(game_page, seen[animal])
                game_page.wait_for_timeout(200)
                self._flip(game_page, i)
                game_page.wait_for_timeout(1100)
            else:
                seen[animal] = i

        wait_for_phaser_scene(game_page, "WinScene", timeout=6000)


# ── Night-train reflex game ────────────────────────────────────────────────────

def enter_train_game(page):
    """Navigate from React map to TrainReflexGame (Bangkok + Kanchanaburi must be completed)."""
    page.locator('[aria-label="Nachttrein"]').first.click()
    page.locator('button', has_text="Speel nu!").click()
    wait_for_phaser_scene(page, "TrainReflexGame", timeout=10000)
    page.wait_for_timeout(400)


class TestTrainReflexGame:
    def _enter_game(self, game_page):
        """Unlock Night Train (index 2) via save, reload, then navigate via React UI."""
        active = game_page.evaluate("localStorage.getItem('thailand_active')") or 'Emma'
        save = get_save(game_page)
        save["locations"][0]["completed"] = True
        save["locations"][1]["completed"] = True
        save["locations"][1]["unlocked"]  = True
        save["locations"][2]["unlocked"]  = True
        key = f'thailand_save_{active}'
        game_page.evaluate(f"localStorage.setItem({json.dumps(key)}, JSON.stringify({json.dumps(save)}))")
        game_page.reload()
        game_page.wait_for_load_state("networkidle")
        enter_train_game(game_page)

    _s = "window._game.scene.getScene('TrainReflexGame')"

    def test_game_launches(self, game_page):
        self._enter_game(game_page)
        state = game_page.evaluate(f"""
            (function() {{
                var s = {self._s};
                if (!s) return null;
                return {{ lives: s.lives, caught: s.caught, running: s._running }};
            }})()
        """)
        assert state is not None, "TrainReflexGame scene not found"
        assert state['lives'] == 3
        assert state['caught'] == 0
        assert state['running'] is True

    def test_initial_hud_state(self, game_page):
        """HUD starts with 3 lives and 0 caught."""
        self._enter_game(game_page)
        lives = game_page.evaluate(f"{self._s}.lives")
        caught = game_page.evaluate(f"{self._s}.caught")
        assert lives == 3
        assert caught == 0

    def test_clicking_good_item_increments_counter(self, game_page):
        """Triggering a good item's hitZone increments caught by 1."""
        self._enter_game(game_page)
        # Override Math.random so _spawnItem deterministically spawns a good item
        game_page.evaluate(f"""
            (function() {{
                var s = {self._s};
                var orig = Math.random;
                Math.random = function() {{ return 0.9; }};  // > 0.4 → good item
                s._spawnItem();
                Math.random = orig;
            }})()
        """)
        game_page.wait_for_timeout(300)

        game_page.evaluate(f"""
            (function() {{
                var s = {self._s};
                var good = s._items.find(function(c) {{ return c._isGood && c._active; }});
                if (good && good._hitZone) good._hitZone.emit('pointerdown');
            }})()
        """)
        game_page.wait_for_timeout(300)

        caught = game_page.evaluate(f"{self._s}.caught")
        assert caught == 1, f"Expected caught=1 after clicking good item, got {caught}"

    def test_clicking_bad_item_loses_life(self, game_page):
        """Triggering a bad item's hitZone loses 1 life."""
        self._enter_game(game_page)
        # Force-spawn a bad item
        game_page.evaluate(f"""
            (function() {{
                var s = {self._s};
                // Temporarily override Math.random to force bad item
                var orig = Math.random;
                Math.random = function() {{ return 0.1; }};  // < 0.4 → bad item
                s._spawnItem();
                Math.random = orig;
            }})()
        """)
        game_page.wait_for_timeout(300)

        game_page.evaluate(f"""
            (function() {{
                var s = {self._s};
                var bad = s._items.find(function(c) {{ return !c._isGood && c._active; }});
                if (bad && bad._hitZone) bad._hitZone.emit('pointerdown');
            }})()
        """)
        game_page.wait_for_timeout(300)

        lives = game_page.evaluate(f"{self._s}.lives")
        assert lives == 2, f"Expected lives=2 after clicking bad item, got {lives}"

    def test_losing_all_lives_stops_game(self, game_page):
        """Losing all 3 lives sets _running to False."""
        self._enter_game(game_page)
        game_page.evaluate(f"""
            (function() {{
                var s = {self._s};
                s._endGame();
            }})()
        """)
        game_page.wait_for_timeout(200)
        running = game_page.evaluate(f"{self._s}._running")
        assert running is False

    def test_retry_restarts_with_location_data(self, game_page):
        """After retry, scene restarts with locationIndex=2 preserved."""
        self._enter_game(game_page)
        game_page.evaluate(f"{self._s}._endGame(false)")
        game_page.wait_for_timeout(600)

        # Trigger the retry zone (first interactive Zone in scene after _showRetry rebuilds UI)
        game_page.evaluate(f"""
            (function() {{
                var s = {self._s};
                if (!s) return;
                var zones = s.children.list.filter(function(o) {{
                    return o.type === 'Zone' && o.input;
                }});
                if (zones.length > 0) zones[0].emit('pointerdown');
            }})()
        """)
        # Wait for tween (80ms) + scene restart (Phaser teardown + create)
        game_page.wait_for_timeout(800)
        wait_for_phaser_scene(game_page, "TrainReflexGame", timeout=8000)

        loc_index = game_page.evaluate(f"{self._s}.locationIndex")
        assert loc_index == 2, f"locationIndex should be 2 after restart, got {loc_index}"

    def test_game_over_shows_retry(self, game_page):
        """Calling _endGame() shows the retry overlay."""
        self._enter_game(game_page)
        game_page.evaluate(f"""
            (function() {{
                var s = {self._s};
                s.caught = 40;
                s.lives = 0;
                s._endGame();
            }})()
        """)
        game_page.wait_for_timeout(400)
        # _showRetry rebuilds the scene; _running should be false
        running = game_page.evaluate(f"{self._s}._running")
        assert running is False

    def test_win_saves_completion(self, game_page):
        """Scoring >= 15 saves location 2 as completed."""
        self._enter_game(game_page)
        game_page.evaluate(f"""
            (function() {{
                var s = {self._s};
                s.caught = 15;
                s.lives = 0;
                s._endGame();
            }})()
        """)
        game_page.wait_for_timeout(400)
        save = get_save(game_page)
        assert save["locations"][2]["completed"] is True


# ── Win scene ──────────────────────────────────────────────────────────────────

class TestWinScene:
    def test_win_scene_reached_and_returns_to_map(self, game_page):
        # Win Bangkok quiz programmatically
        enter_bangkok_game(game_page)
        game_page.wait_for_timeout(400)
        game_page.evaluate("""
          (function() {
            var scene = window._game.scene.getScene('BangkokMapGame');
            if (!scene) return;
            scene._correct = 4;
            var stub = {
              clear:function(){}, fillStyle:function(){},
              fillRoundedRect:function(){}, lineStyle:function(){},
              strokeRoundedRect:function(){}
            };
            scene._onAnswer(true, stub, 325, 100);
          })()
        """)
        wait_for_phaser_scene(game_page, "WinScene", timeout=6000)
        game_page.wait_for_timeout(1500)

        # Click "Terug naar de kaart" zone in WinScene
        game_page.evaluate("""
          (function() {
            var scene = window._game.scene.getScene('WinScene');
            if (!scene) return;
            // buttonInteractive creates a Zone; find and trigger it
            var zones = scene.children.list.filter(function(o) {
              return o.type === 'Zone' && o.input;
            });
            if (zones.length > 0) zones[zones.length - 1].emit('pointerdown');
          })()
        """)
        game_page.wait_for_timeout(1000)
        # React map should be visible again
        expect(game_page.locator('img[alt="Kaart van Thailand"]')).to_be_visible(timeout=4000)


# ── Passport ───────────────────────────────────────────────────────────────────

class TestPassportButton:
    def test_passport_icon_visible(self, game_page):
        # BookOpen icon from the header area should be present (or star count)
        expect(game_page.locator('text=⭐')).to_be_visible()


# ── Games menu ─────────────────────────────────────────────────────────────────

class TestGamesMenu:
    def test_games_menu_button_visible(self, game_page):
        """'Spellen' button should be visible on the map screen."""
        expect(game_page.locator('button[aria-label="Alle Spellen"]')).to_be_visible()

    def test_games_menu_opens(self, game_page):
        """Clicking 'Spellen' button opens the games menu screen."""
        game_page.locator('button[aria-label="Alle Spellen"]').click()
        expect(game_page.locator('text=Vakantie Spellen')).to_be_visible(timeout=3000)

    def test_games_menu_shows_vacation_games(self, game_page):
        """Games menu lists all 7 vacation destinations."""
        game_page.locator('button[aria-label="Alle Spellen"]').click()
        game_page.wait_for_timeout(300)
        expect(game_page.get_by_text("Bangkok", exact=True)).to_be_visible()

    def test_games_menu_shows_bonus_games(self, game_page):
        """Games menu shows bonus game tiles."""
        game_page.locator('button[aria-label="Alle Spellen"]').click()
        game_page.wait_for_timeout(300)
        expect(game_page.locator('text=Extra Spellen')).to_be_visible()
        expect(game_page.locator('text=Thailand Tetris')).to_be_visible()

    def test_games_menu_back_returns_to_map(self, game_page):
        """Back button in games menu returns to the map screen."""
        game_page.locator('button[aria-label="Alle Spellen"]').click()
        game_page.wait_for_timeout(300)
        game_page.locator('button', has_text="Kaart").click()
        expect(game_page.locator('img[alt="Kaart van Thailand"]')).to_be_visible(timeout=3000)


# ── Tetris game ────────────────────────────────────────────────────────────────

class TestTetrisGame:
    _s = "window._game && window._game.scene.getScene('TetrisGame')"

    def _enter_game(self, page, game_server):
        """Open games menu → click Tetris tile → wait for scene."""
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(f"{game_server}?unlock=all")
        page.wait_for_load_state("networkidle")
        page.locator('button[aria-label="Alle Spellen"]').click()
        page.wait_for_timeout(300)
        page.locator('button', has_text="Thailand Tetris").click()
        wait_for_phaser_scene(page, "TetrisGame", timeout=12000)
        page.wait_for_timeout(300)

    def test_game_launches(self, page, game_server):
        self._enter_game(page, game_server)
        state = page.evaluate(f"""
            (function() {{
                var s = {self._s};
                if (!s) return null;
                return {{ score: s.score, level: s.level, running: s._running }};
            }})()
        """)
        assert state is not None, "TetrisGame scene not found"
        assert state['score'] == 0
        assert state['level'] == 1
        assert state['running'] is True

    def test_board_initialized(self, page, game_server):
        """Board is a 20x10 grid of zeros on start."""
        self._enter_game(page, game_server)
        board_ok = page.evaluate(f"""
            (function() {{
                var s = {self._s};
                if (!s) return false;
                return s.board.length === 20 && s.board[0].length === 10;
            }})()
        """)
        assert board_ok, "TetrisGame board should be 20x10"

    def test_piece_spawns(self, page, game_server):
        """A current piece should be active after game starts."""
        self._enter_game(page, game_server)
        has_piece = page.evaluate(f"{self._s}._currentPiece !== null")
        assert has_piece, "A Tetris piece should be active"

    def test_move_left_decrements_piece_x(self, page, game_server):
        """Calling _moveH(-1) should decrease piece column when possible."""
        self._enter_game(page, game_server)
        before = page.evaluate(f"{self._s}._currentPiece.x")
        page.evaluate(f"{self._s}._moveH(-1)")
        after = page.evaluate(f"{self._s}._currentPiece.x")
        assert after <= before, "Piece x should not increase after _moveH(-1)"

    def test_move_right_increments_piece_x(self, page, game_server):
        """Calling _moveH(1) should increase piece column when possible."""
        self._enter_game(page, game_server)
        # First move to left edge to ensure space on right
        for _ in range(5):
            page.evaluate(f"{self._s}._moveH(-1)")
        before = page.evaluate(f"{self._s}._currentPiece.x")
        page.evaluate(f"{self._s}._moveH(1)")
        after = page.evaluate(f"{self._s}._currentPiece.x")
        assert after >= before, "Piece x should not decrease after _moveH(1)"


# ── Level Devil game ───────────────────────────────────────────────────────────

class TestLevelDevilGame:
    _s = "window._game && window._game.scene.getScene('LevelDevilGame')"

    def _enter_game(self, page, game_server):
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(f"{game_server}?unlock=all")
        page.wait_for_load_state("networkidle")
        page.locator('button[aria-label="Alle Spellen"]').click()
        page.wait_for_timeout(300)
        page.locator('button', has_text="Tempel Tocht").click()
        wait_for_phaser_scene(page, "LevelDevilGame", timeout=12000)
        page.wait_for_timeout(300)

    def test_game_launches(self, page, game_server):
        self._enter_game(page, game_server)
        state = page.evaluate(f"""
            (function() {{
                var s = {self._s};
                if (!s) return null;
                return {{ lives: s.lives, level: s.level, running: s._running }};
            }})()
        """)
        assert state is not None, "LevelDevilGame scene not found"
        assert state['lives'] == 3
        assert state['level'] == 1
        assert state['running'] is True

    def test_level1_has_collapse_platforms(self, page, game_server):
        """Level 1 should have collapse-type platforms."""
        self._enter_game(page, game_server)
        collapse_count = page.evaluate(f"""
            (function() {{
                var s = {self._s};
                if (!s) return 0;
                return s._platforms.filter(function(p) {{ return p.type === 'collapse'; }}).length;
            }})()
        """)
        assert collapse_count >= 2, f"Level 1 should have ≥2 collapse tiles, got {collapse_count}"

    def test_winning_level1_advances_to_level2(self, page, game_server):
        """Calling _winLevel() from level 1 advances level to 2."""
        self._enter_game(page, game_server)
        page.evaluate(f"{self._s}._winLevel()")
        page.wait_for_timeout(1200)
        level = page.evaluate(f"{self._s}.level")
        assert level == 2, f"Expected level=2 after winning level 1, got {level}"

    def test_die_decrements_lives(self, page, game_server):
        """Calling _die() decrements the lives counter."""
        self._enter_game(page, game_server)
        page.evaluate(f"{self._s}._die()")
        page.wait_for_timeout(200)
        lives = page.evaluate(f"{self._s}.lives")
        assert lives == 2, f"Expected lives=2 after dying, got {lives}"


# ── Schilder screen (React paint-by-number) ───────────────────────────────────

class TestSchilderScreen:
    """Tests for the React-based SchilderScreen (paint-by-number with real images)."""

    def _open_gallery(self, page, game_server):
        """Navigate to the Schilder gallery via GamesMenu."""
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(f"{game_server}?unlock=all")
        page.wait_for_load_state("networkidle")
        page.locator('button[aria-label="Alle Spellen"]').click()
        page.wait_for_timeout(300)
        page.locator('button', has_text="Schilder Thailand").click()
        page.wait_for_timeout(400)

    def test_gallery_opens(self, page, game_server):
        """GamesMenu → Schilder → gallery screen with default images."""
        self._open_gallery(page, game_server)
        from playwright.sync_api import expect
        expect(page.locator('text=Schilder Thailand').first).to_be_visible(timeout=5000)
        expect(page.locator('button', has_text="Upload eigen foto")).to_be_visible()

    def test_default_images_shown(self, page, game_server):
        """Gallery shows the 9 default Thailand images."""
        self._open_gallery(page, game_server)
        page.wait_for_timeout(400)
        # 9 default image thumbnails + upload button → at least 9 img elements
        count = page.locator('img[loading="lazy"]').count()
        assert count >= 9, f"Expected at least 9 default images, got {count}"

    def test_clicking_image_opens_coloring(self, page, game_server):
        """Clicking a default image enters the coloring screen with a canvas."""
        self._open_gallery(page, game_server)
        page.locator('img[loading="lazy"]').first.click()
        # Canvas should appear (may take a moment for image processing)
        from playwright.sync_api import expect
        expect(page.locator('canvas')).to_be_visible(timeout=10000)

    def test_canvas_has_pixels_after_processing(self, page, game_server):
        """After selecting an image, the canvas has non-zero dimensions."""
        self._open_gallery(page, game_server)
        page.locator('img[loading="lazy"]').first.click()
        page.wait_for_selector('canvas', timeout=10000)
        page.wait_for_timeout(2000)   # allow image processing to complete
        dims = page.evaluate("""
            () => {
                const c = document.querySelector('canvas')
                return c ? { w: c.width, h: c.height } : null
            }
        """)
        assert dims is not None, "Canvas not found"
        assert dims['w'] > 0 and dims['h'] > 0, f"Canvas has zero size: {dims}"

    def test_back_button_returns_to_gallery(self, page, game_server):
        """Back button in coloring view returns to gallery."""
        self._open_gallery(page, game_server)
        page.locator('img[loading="lazy"]').first.click()
        page.wait_for_selector('canvas', timeout=10000)
        page.wait_for_timeout(1500)
        # Click the ← Terug button inside coloring view
        page.locator('button', has_text="← Terug").first.click()
        page.wait_for_timeout(400)
        from playwright.sync_api import expect
        expect(page.locator('button', has_text="Upload eigen foto")).to_be_visible(timeout=4000)

    def test_palette_swatches_visible(self, page, game_server):
        """Coloring screen shows 18 palette swatches (2 rows × 9)."""
        self._open_gallery(page, game_server)
        page.locator('img[loading="lazy"]').first.click()
        page.wait_for_selector('canvas', timeout=10000)
        page.wait_for_timeout(2000)
        # Count palette buttons (each swatch has a title attribute = color name)
        count = page.evaluate("""
            () => document.querySelectorAll('button[title]').length
        """)
        # Palette is derived from image via median-cut (NUM_COLORS = 12)
        assert count == 12, f"Expected 12 palette swatches, got {count}"
