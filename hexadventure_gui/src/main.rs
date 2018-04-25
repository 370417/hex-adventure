extern crate bincode;
use bincode::{deserialize_from, serialize_into};

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
use hexadventure::grid::{Direction, Grid, Location, Pos};

mod sprite;
use sprite::{color_from_tile, darken, Sprite};

use std::error::Error;
use std::fs::File;

const SAVE_PATH: &str = "save.bincode";

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

// TODO: read from save file to load game here
impl MainState {
    fn new(ctx: &mut Context, width: usize, height: usize) -> Self {
        let mut spritebatch = sprite::load_spritebatch(ctx);
        let sprite_ids = Grid::new(width, height, |_pos| spritebatch.add(Default::default()));
        let game = match load_game() {
            Ok(game) => game,
            _ => Game::new(width, height),
        };
        MainState {
            game,
            spritebatch,
            sprite_ids,
            redraw: true,
        }
    }
}

fn load_game() -> Result<Game, Box<Error>> {
    let file = File::open(SAVE_PATH)?;
    let game = deserialize_from(file)?;
    Ok(game)
}

fn save_game(game: &Game) -> Result<(), Box<Error>> {
    let file = File::create(SAVE_PATH)?;
    serialize_into(file, game)?;
    Ok(())
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
                    src: sprite::sprite_src(Sprite::from(self.game.level_memory[pos].tile)),
                    dest: pos_to_point2(pos, &self.game.level),
                    color: Some(if self.game.level_memory[pos].turn == self.game.turn {
                        color_from_tile(self.game.level[pos])
                    } else if self.game.level_memory[pos].turn >= self.game.first_turn && self.game.level_memory[pos].turn > self.game.first_turn {
                        darken(color_from_tile(self.game.level[pos]))
                    } else {
                        graphics::Color::new(0.0, 0.0, 0.0, 0.0)
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
                offset: match self.game.player.facing {
                    Direction::West | Direction::Northwest | Direction::Southwest => {
                        Point2::new(0.0, 0.0)
                    }
                    Direction::East | Direction::Northeast | Direction::Southeast => {
                        Point2::new(1.0, 0.0)
                    }
                },
                scale: match self.game.player.facing {
                    Direction::West | Direction::Northwest | Direction::Southwest => {
                        Point2::new(1.0, 1.0)
                    }
                    Direction::East | Direction::Northeast | Direction::Southeast => {
                        Point2::new(-1.0, 1.0)
                    }
                },
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
    if let Err(e) = save_game(&state.game) {
        println!("Error in saving game: {}", e);
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
