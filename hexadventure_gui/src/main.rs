extern crate ggez;
use ggez::conf::{Conf, WindowMode, WindowSetup};
use ggez::event;
use ggez::event::{EventHandler, Keycode, Mod};
use ggez::graphics;
use ggez::graphics::spritebatch::{SpriteBatch, SpriteIdx};
use ggez::graphics::{DrawParam, Point2};
use ggez::{Context, GameResult};

extern crate image;

extern crate hexadventure;
use hexadventure::game::Game;
use hexadventure::level::tile::Tile;
use hexadventure::util::grid::{Direction, Grid, Location, Pos};

mod sprite;

struct MainState {
    game: Game,
    spritebatch: SpriteBatch,
    sprite_ids: Grid<SpriteIdx>,
    redraw: bool,
}

fn pos_to_point2<T>(pos: Pos, grid: &Grid<T>) -> Point2 {
    let Location { x, y } = grid.pos_to_location(pos);
    Point2::new((x * 9) as f32, (y * 16 - 7) as f32)
}

impl MainState {
    fn new(ctx: &mut Context, width: usize, height: usize) -> Self {
        let mut spritebatch = sprite::load_spritebatch(ctx);
        let sprite_ids = Grid::new(width, height, |_pos| spritebatch.add(Default::default()));
        MainState {
            game: Game::new(width, height),
            spritebatch,
            sprite_ids,
            redraw: true,
        }
    }
}

impl EventHandler for MainState {
    fn update(&mut self, _ctx: &mut Context) -> GameResult<()> {
        Ok(())
    }

    fn draw(&mut self, ctx: &mut Context) -> GameResult<()> {
        if !self.redraw {
            return Ok(());
        }
        self.redraw = false;
        graphics::clear(ctx);
        for pos in self.game.level.positions() {
            let sprite_id = self.sprite_ids[pos];
            self.spritebatch.set(
                sprite_id,
                DrawParam {
                    src: sprite::sprite_src(match self.game.level[pos] {
                        Tile::Wall => sprite::Sprite::Wall,
                        Tile::Floor => sprite::Sprite::Floor,
                        Tile::ShortGrass => sprite::Sprite::ShortGrass,
                        Tile::Exit => sprite::Sprite::Stairs,
                        Tile::Entrance => sprite::Sprite::Stairs,
                    }),
                    dest: pos_to_point2(pos, &self.game.level),
                    color: Some(if self.game.level_memory[pos].turn == self.game.turn {
                        graphics::Color::new(1.0, 1.0, 1.0, 1.0)
                    } else if self.game.level_memory[pos].turn >= self.game.first_turn {
                        graphics::Color::new(0.5, 0.5, 0.5, 1.0)
                    } else {
                        graphics::BLACK
                    }),
                    ..Default::default()
                },
            )?;
        }
        let player_pos = self.game.player.pos;
        let player_sprite = self.sprite_ids[player_pos];
        self.spritebatch.set(
            player_sprite,
            DrawParam {
                src: sprite::sprite_src(sprite::Sprite::Player),
                dest: pos_to_point2(player_pos, &self.game.level),
                ..Default::default()
            },
        )?;
        graphics::draw(ctx, &self.spritebatch, Point2::new(0.0, 0.0), 0.0)?;
        graphics::present(ctx);
        Ok(())
    }

    fn key_down_event(
        &mut self,
        _ctx: &mut Context,
        keycode: Keycode,
        _keymod: Mod,
        _repeat: bool,
    ) {
        match keycode {
            Keycode::W => self.game.move_player(Direction::Northwest),
            Keycode::E => self.game.move_player(Direction::Northeast),
            Keycode::A => self.game.move_player(Direction::West),
            Keycode::D => self.game.move_player(Direction::East),
            Keycode::Z => self.game.move_player(Direction::Southwest),
            Keycode::X => self.game.move_player(Direction::Southeast),
            _ => (),
        }
        self.redraw = true;
    }
}

fn main() {
    let width = 40;
    let height = 26;
    let config = generate_config(width, height);
    let mut ctx = Context::load_from_conf("hex-adventure", "as-f", config)
        .expect("Failed to load context from configuration.");
    graphics::set_default_filter(&mut ctx, graphics::FilterMode::Nearest);
    graphics::set_background_color(&mut ctx, graphics::BLACK);
    let mut state = MainState::new(&mut ctx, width, height);
    match event::run(&mut ctx, &mut state) {
        Err(e) => println!("Error encountered: {}", e),
        _ => println!("Game exited cleanly"),
    }
}

fn generate_config(width: usize, height: usize) -> Conf {
    Conf {
        window_mode: WindowMode {
            width: width as u32 * 18 + 9,
            height: height as u32 * 16 + 2,
            ..Default::default()
        },
        window_setup: WindowSetup {
            title: "Hex Adventure".to_owned(),
            ..Default::default()
        },
        ..Default::default()
    }
}
