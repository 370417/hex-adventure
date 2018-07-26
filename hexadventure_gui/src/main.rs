extern crate bincode;
use bincode::{deserialize_from, serialize_into};

extern crate app_dirs;
use app_dirs::{app_root, AppDataType, AppInfo};

extern crate ggez;
use ggez::conf::{Conf, WindowMode, WindowSetup};
use ggez::event;
use ggez::event::{EventHandler, Keycode, Mod};
use ggez::graphics;
use ggez::graphics::spritebatch::SpriteBatch;
use ggez::graphics::{Color, DrawParam, Point2};
use ggez::{Context, GameResult};

extern crate image;

extern crate hexadventure;
use hexadventure::grid::{pos_to_location, Location};
use hexadventure::level::tile::TileView;
use hexadventure::prelude::*;
use hexadventure::world::action;
use hexadventure::world::mob::PLAYER_ID;

mod sprite;
use sprite::{color_from_tile, darken, sprite_from_species, sprite_src, Sprite};

mod side;

use std::error::Error;
use std::fs::File;

const SAVE_NAME: &str = "save.bincode";
const APP_INFO: AppInfo = AppInfo {
    name: "hex-adventure",
    author: "as-f",
};

enum Arrow {
    None,
    Up,
    Down,
    Left { diagonal: bool },
    Right { diagonal: bool },
}

struct MainState {
    world: World,
    spritebatch: SpriteBatch,
    redraw: bool,
    dests: Grid<Point2>,
    pressed_arrow: Arrow,
}

fn pos_to_point2(pos: Pos) -> Point2 {
    let Location { x, y } = pos_to_location(pos);
    Point2::new((1 + x * 9) as f32, (1 + y * 16 - 7) as f32)
}

impl MainState {
    fn new(ctx: &mut Context) -> Self {
        let spritebatch = sprite::load_spritebatch(ctx);
        let mut dests = Grid::new(|_pos| Point2::new(0.0, 0.0));
        for pos in grid::positions() {
            dests[pos] = pos_to_point2(pos);
        }
        let world = match load_world() {
            Ok(world) => world,
            _ => World::new(),
        };
        MainState {
            world,
            spritebatch,
            redraw: true,
            dests,
            pressed_arrow: Arrow::None,
        }
    }
}

fn load_world() -> Result<World, Box<Error>> {
    let mut path = app_root(AppDataType::UserData, &APP_INFO)?;
    path.push(SAVE_NAME);
    let file = File::open(path)?;
    let game = deserialize_from(file)?;
    Ok(game)
}

fn save_world(game: &World) -> Result<(), Box<Error>> {
    let mut path = app_root(AppDataType::UserData, &APP_INFO)?;
    path.push(SAVE_NAME);
    let file = File::create(path)?;
    serialize_into(file, game)?;
    Ok(())
}

impl MainState {
    fn draw_tile(&mut self, sprite: Sprite, pos: Pos, color: Color, flip: bool) {
        self.spritebatch.add(DrawParam {
            src: sprite_src(sprite),
            dest: self.dests[pos],
            color: Some(color),
            offset: if flip {
                Point2::new(1.0, 0.0)
            } else {
                Point2::new(0.0, 0.0)
            },
            scale: if flip {
                Point2::new(-1.0, 1.0)
            } else {
                Point2::new(1.0, 1.0)
            },
            ..Default::default()
        });
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
        self.spritebatch.clear();
        side::Sidebar::new().draw(
            ctx,
            Point2::new((grid::WIDTH * 18 + 9) as f32, 0.0),
            &self.world,
            &mut self.spritebatch,
        )?;
        for pos in grid::positions() {
            match self.world.fov[pos] {
                TileView::Visible => {
                    if let Some(mob_id) = self.world.level[pos].mob_id {
                        let sprite = sprite_from_species(&self.world[mob_id].species);
                        let flip = match self.world[mob_id].facing {
                            Direction::West | Direction::Northwest | Direction::Southwest => false,
                            Direction::East | Direction::Northeast | Direction::Southeast => true,
                        };
                        self.draw_tile(sprite, pos, graphics::WHITE, flip);
                    } else {
                        let terrain = self.world.level[pos].terrain;
                        self.draw_tile(Sprite::from(terrain), pos, color_from_tile(terrain), false);
                    }
                }
                TileView::Remembered(terrain) => self.draw_tile(
                    Sprite::from(terrain),
                    pos,
                    darken(color_from_tile(terrain)),
                    false,
                ),
                TileView::None => {}
            };
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
        let action = match keycode {
            Keycode::W => Some(Action::Walk(Direction::Northwest)),
            Keycode::E => Some(Action::Walk(Direction::Northeast)),
            Keycode::A => Some(Action::Walk(Direction::West)),
            Keycode::D => Some(Action::Walk(Direction::East)),
            Keycode::Z => Some(Action::Walk(Direction::Southwest)),
            Keycode::X => Some(Action::Walk(Direction::Southeast)),
            Keycode::S => Some(Action::Rest),
            Keycode::Up => {
                let (action, pressed_arrow) = match self.pressed_arrow {
                    Arrow::None | Arrow::Up => (None, Arrow::Up),
                    Arrow::Down => (None, Arrow::None),
                    Arrow::Left { .. } => (
                        Some(Action::Walk(Direction::Northwest)),
                        Arrow::Left { diagonal: true },
                    ),
                    Arrow::Right { .. } => (
                        Some(Action::Walk(Direction::Northeast)),
                        Arrow::Right { diagonal: true },
                    ),
                };
                self.pressed_arrow = pressed_arrow;
                action
            }
            Keycode::Down => {
                let (action, pressed_arrow) = match self.pressed_arrow {
                    Arrow::None | Arrow::Down => (None, Arrow::Down),
                    Arrow::Up => (None, Arrow::None),
                    Arrow::Left { .. } => (
                        Some(Action::Walk(Direction::Southwest)),
                        Arrow::Left { diagonal: true },
                    ),
                    Arrow::Right { .. } => (
                        Some(Action::Walk(Direction::Southeast)),
                        Arrow::Right { diagonal: true },
                    ),
                };
                self.pressed_arrow = pressed_arrow;
                action
            }
            Keycode::Left => {
                let (action, pressed_arrow) = match self.pressed_arrow {
                    Arrow::None => (None, Arrow::Left { diagonal: false }),
                    Arrow::Left { diagonal } => (None, Arrow::Left { diagonal }),
                    Arrow::Right { .. } => (None, Arrow::None),
                    Arrow::Up => (Some(Action::Walk(Direction::Northwest)), Arrow::Up),
                    Arrow::Down => (Some(Action::Walk(Direction::Southwest)), Arrow::Down),
                };
                self.pressed_arrow = pressed_arrow;
                action
            }
            Keycode::Right => {
                let (action, pressed_arrow) = match self.pressed_arrow {
                    Arrow::None => (None, Arrow::Right { diagonal: false }),
                    Arrow::Right { diagonal } => (None, Arrow::Right { diagonal }),
                    Arrow::Left { .. } => (None, Arrow::None),
                    Arrow::Up => (Some(Action::Walk(Direction::Northeast)), Arrow::Up),
                    Arrow::Down => (Some(Action::Walk(Direction::Southeast)), Arrow::Down),
                };
                self.pressed_arrow = pressed_arrow;
                action
            }
            _ => None,
        };
        if let Some(action) = action {
            save_world(&self.world);
            let success = match action {
                Action::Rest => action::rest(PLAYER_ID, &mut self.world),
                Action::Walk(direction) => action::walk(PLAYER_ID, direction, &mut self.world),
            };
            if success.is_ok() {
                self.world.tick();
            }
            self.redraw = true;
        }
    }

    fn key_up_event(&mut self, _ctx: &mut Context, keycode: Keycode, _keymod: Mod, _repeat: bool) {
        let action = match keycode {
            Keycode::Up => {
                self.pressed_arrow = match self.pressed_arrow {
                    Arrow::None | Arrow::Up | Arrow::Down => Arrow::None,
                    Arrow::Left { diagonal } => Arrow::Left { diagonal },
                    Arrow::Right { diagonal } => Arrow::Right { diagonal },
                };
                None
            }
            Keycode::Down => {
                self.pressed_arrow = match self.pressed_arrow {
                    Arrow::None | Arrow::Down | Arrow::Up => Arrow::None,
                    Arrow::Left { diagonal } => Arrow::Left { diagonal },
                    Arrow::Right { diagonal } => Arrow::Right { diagonal },
                };
                None
            }
            Keycode::Left => {
                let (action, pressed_arrow) = match self.pressed_arrow {
                    Arrow::Left { diagonal: false } => {
                        (Some(Action::Walk(Direction::West)), Arrow::None)
                    }
                    Arrow::Up => (None, Arrow::Up),
                    Arrow::Down => (None, Arrow::Down),
                    _ => (None, Arrow::None),
                };
                self.pressed_arrow = pressed_arrow;
                action
            }
            Keycode::Right => {
                let (action, pressed_arrow) = match self.pressed_arrow {
                    Arrow::Right { diagonal: false } => {
                        (Some(Action::Walk(Direction::East)), Arrow::None)
                    }
                    Arrow::Up => (None, Arrow::Up),
                    Arrow::Down => (None, Arrow::Down),
                    _ => (None, Arrow::None),
                };
                self.pressed_arrow = pressed_arrow;
                action
            }
            _ => None,
        };
        if let Some(action) = action {
            let success = match action {
                Action::Rest => action::rest(PLAYER_ID, &mut self.world),
                Action::Walk(direction) => action::walk(PLAYER_ID, direction, &mut self.world),
            };
            if success.is_ok() {
                self.world.tick();
            }
            self.redraw = true;
        }
    }
}
enum Action {
    Rest,
    Walk(Direction),
    // MeleeAttack(Direction),
}

fn main() {
    let mut ctx = Context::load_from_conf("hex-adventure", "as-f", conf())
        .expect("Failed to load context from configuration.");
    graphics::set_default_filter(&mut ctx, graphics::FilterMode::Nearest);
    graphics::set_background_color(&mut ctx, graphics::BLACK);
    let mut state = MainState::new(&mut ctx);
    event::run(&mut ctx, &mut state).unwrap();
    save_world(&state.world).unwrap();
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
