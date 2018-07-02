extern crate bincode;
use bincode::{deserialize_from, serialize_into};

extern crate app_dirs;
use app_dirs::{app_root, AppInfo, AppDataType};

extern crate ggez;
use ggez::conf::{Conf, WindowMode, WindowSetup};
use ggez::event;
use ggez::event::{EventHandler, Keycode, Mod};
use ggez::graphics;
use ggez::graphics::spritebatch::SpriteBatch;
use ggez::graphics::{DrawParam, Point2};
use ggez::{Context, GameResult};

extern crate image;

extern crate hexadventure;
use hexadventure::game::Game;
use hexadventure::grid::{self, pos_to_location, Direction, Grid, Location, Pos};
use hexadventure::level::tile::FullTileView;

mod sprite;
use sprite::{color_from_tile, darken, sprite_from_mob, Sprite};

mod side;

use std::error::Error;
use std::fs::File;

const SAVE_NAME: &str = "save.bincode";
const APP_INFO: AppInfo = AppInfo { name: "hex-adventure", author: "as-f" };

struct MainState {
    game: Game,
    spritebatch: SpriteBatch,
    redraw: bool,
    dests: Grid<Point2>,
}

fn pos_to_point2(pos: Pos) -> Point2 {
    let Location { x, y } = pos_to_location(pos);
    Point2::new((x * 9) as f32, (y * 16 - 7) as f32)
}

impl MainState {
    fn new(ctx: &mut Context) -> Self {
        let spritebatch = sprite::load_spritebatch(ctx);
        let mut dests = Grid::new(|_pos| Point2::new(0.0, 0.0));
        for pos in grid::positions() {
            dests[pos] = pos_to_point2(pos);
        }
        let game = match load_game() {
            Ok(game) => game,
            _ => Game::new(),
        };
        MainState {
            game,
            spritebatch,
            redraw: true,
            dests,
        }
    }
}

fn load_game() -> Result<Game, Box<Error>> {
    let mut path = app_root(AppDataType::UserData, &APP_INFO)?;
    path.push(SAVE_NAME);
    let file = File::open(path)?;
    let game = deserialize_from(file)?;
    Ok(game)
}

fn save_game(game: &Game) -> Result<(), Box<Error>> {
    let mut path = app_root(AppDataType::UserData, &APP_INFO)?;
    path.push(SAVE_NAME);
    let file = File::create(path)?;
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
        side::Sidebar::new().draw(ctx, Point2::new((grid::WIDTH * 18 + 9) as f32, 0.0))?;
        self.spritebatch.clear();
        for pos in grid::positions() {
            match self.game.tile(pos) {
                FullTileView::Seen { terrain, mob: None } => {
                    self.spritebatch.add(DrawParam {
                        src: sprite::sprite_src(Sprite::from(terrain)),
                        dest: self.dests[pos],
                        color: Some(color_from_tile(terrain)),
                        ..Default::default()
                    });
                }
                FullTileView::Seen { mob: Some(mob), .. } => {
                    self.spritebatch.add(DrawParam {
                        src: sprite::sprite_src(sprite_from_mob(mob)),
                        dest: self.dests[pos],
                        offset: match mob.facing {
                            Direction::West | Direction::Northwest | Direction::Southwest => {
                                Point2::new(0.0, 0.0)
                            }
                            Direction::East | Direction::Northeast | Direction::Southeast => {
                                Point2::new(1.0, 0.0)
                            }
                        },
                        scale: match mob.facing {
                            Direction::West | Direction::Northwest | Direction::Southwest => {
                                Point2::new(1.0, 1.0)
                            }
                            Direction::East | Direction::Northeast | Direction::Southeast => {
                                Point2::new(-1.0, 1.0)
                            }
                        },
                        ..Default::default()
                    });
                }
                FullTileView::Remembered(terrain) => {
                    self.spritebatch.add(DrawParam {
                        src: sprite::sprite_src(Sprite::from(terrain)),
                        dest: self.dests[pos],
                        color: Some(darken(color_from_tile(terrain))),
                        ..Default::default()
                    });
                }
                FullTileView::None => (),
            }
        }
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
    let mut ctx = Context::load_from_conf("hex-adventure", "as-f", conf())
        .expect("Failed to load context from configuration.");
    graphics::set_default_filter(&mut ctx, graphics::FilterMode::Nearest);
    graphics::set_background_color(&mut ctx, graphics::BLACK);
    let mut state = MainState::new(&mut ctx);
    if let Err(e) = event::run(&mut ctx, &mut state) {
        println!("Error encountered: {}", e);
    }
    if let Err(e) = save_game(&state.game) {
        println!("Error in saving game: {}", e);
    }
}

fn conf() -> Conf {
    let level_width = grid::WIDTH as u32 * 18 + 9;
    let side_width = side::WIDTH * 9;
    Conf {
        window_mode: WindowMode {
            width: level_width + side_width,
            height: grid::HEIGHT as u32 * 16 + 2,
            ..Default::default()
        },
        window_setup: WindowSetup {
            title: "Hex Adventure".to_owned(),
            ..Default::default()
        },
        ..Default::default()
    }
}
