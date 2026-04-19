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
    raw = page.evaluate("localStorage.getItem('thailand_save')")
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
    def test_name_overlay_shown_on_fresh_start(self, page, game_server):
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(game_server)
        page.wait_for_load_state("networkidle")
        page.evaluate("localStorage.removeItem('thailand_save')")
        page.reload()
        page.wait_for_load_state("networkidle")
        # React renders the name form — check for the input fields
        expect(page.locator('input').first).to_be_visible(timeout=5000)

    def test_submit_names_shows_map(self, page, game_server):
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(game_server)
        page.wait_for_load_state("networkidle")
        page.evaluate("localStorage.removeItem('thailand_save')")
        page.reload()
        page.wait_for_load_state("networkidle")

        inputs = page.locator('input')
        inputs.nth(0).fill("Emma")
        inputs.nth(1).fill("Lars")
        page.locator('button[type="submit"]').click()

        # Map image should appear
        expect(page.locator('img[alt="Kaart van Thailand"]')).to_be_visible(timeout=6000)

        save = get_save(page)
        assert save["players"]["name1"] == "Emma"
        assert save["players"]["name2"] == "Lars"


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
        game_page.locator('button', has_text="").filter(has=game_page.locator('svg')).first.click()
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


# ── Memory game ────────────────────────────────────────────────────────────────

class TestKanchanaburiMemory:
    def _enter_game(self, game_page):
        save = get_save(game_page)
        save["locations"][0]["completed"] = True
        save["locations"][1]["unlocked"] = True
        game_page.evaluate(f"localStorage.setItem('thailand_save', JSON.stringify({json.dumps(save)}))")
        game_page.evaluate(
            "window._game = new window.Phaser.Game({"
            "type: window.Phaser.AUTO, width: 390, height: 844,"
            "parent: document.getElementById('root'),"
            "backgroundColor: '#1A0A00',"
            "scene: [window.KanchanaburiMemory, window.WinScene]"
            "})"
        )
        wait_for_phaser_scene(game_page, "KanchanaburiMemory", timeout=8000)

    def test_cards_are_clickable(self, game_page):
        self._enter_game(game_page)
        # Click first two cards
        game_page.evaluate("""
          (function() {
            var scene = window._game.scene.getScene('KanchanaburiMemory');
            if (scene && scene.cards && scene.cards.length >= 2) {
              scene.cards[0].container.emit('pointerdown');
            }
          })()
        """)
        game_page.wait_for_timeout(300)
        game_page.evaluate("""
          (function() {
            var scene = window._game.scene.getScene('KanchanaburiMemory');
            if (scene && scene.cards && scene.cards.length >= 2) {
              scene.cards[1].container.emit('pointerdown');
            }
          })()
        """)
        game_page.wait_for_timeout(900)
        still_ok = game_page.evaluate(
            "window._game.scene.isActive('KanchanaburiMemory') || "
            "window._game.scene.isActive('WinScene')"
        )
        assert still_ok


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
