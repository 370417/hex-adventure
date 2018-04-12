extern crate ggez;
use ggez::conf::{Conf, WindowMode, WindowSetup};
use ggez::event;
use ggez::event::EventHandler;
use ggez::graphics;
use ggez::graphics::{DrawParam, Point2};
use ggez::graphics::spritebatch::SpriteBatch;
use ggez::{Context, GameResult};

extern crate image;

extern crate hexadventure;
use hexadventure::level::basic::{self, Tile};
use hexadventure::util::grid::{Grid, Location, Pos};

mod sprite;

struct MainState {
    grid: Grid<Tile>,
    spritebatch: SpriteBatch,
}

fn pos_to_point2<T>(pos: Pos, grid: &Grid<T>) -> Point2 {
    let Location { x, y } = grid.pos_to_location(pos);
    Point2::new((x * 9) as f32, (y * 16) as f32)
}

impl MainState {
    fn new(ctx: &mut Context) -> Self {
        let width = 40;
        let height = 30;
        MainState {
            grid: basic::generate(width, height, [0, 0, 0, 1]),
            spritebatch: sprite::load_spritebatch(ctx),
        }
    }
}

impl EventHandler for MainState {
    fn update(&mut self, _ctx: &mut Context) -> GameResult<()> {
        Ok(())
    }

    fn draw(&mut self, ctx: &mut Context) -> GameResult<()> {
        graphics::clear(ctx);
        self.spritebatch.clear();
        for pos in self.grid.positions() {
            self.spritebatch.add(DrawParam {
                src: sprite::sprite_src(match self.grid[pos] {
                    Tile::Wall => sprite::Sprite::Wall,
                    Tile::Floor => sprite::Sprite::Floor,
                }),
                dest: pos_to_point2(pos, &self.grid),
                ..Default::default()
            });
        }
        graphics::draw(ctx, &self.spritebatch, Point2::new(0.0, 0.0), 0.0)?;
        graphics::present(ctx);
        Ok(())
    }
}

fn main() {
    let config = generate_config();
    let mut ctx = Context::load_from_conf("hex-adventure", "as-f", config)
        .expect("Failed to load context from configuration.");
    graphics::set_default_filter(&mut ctx, graphics::FilterMode::Nearest);
    let mut state = MainState::new(&mut ctx);
    match event::run(&mut ctx, &mut state) {
        Err(e) => println!("Error encountered: {}", e),
        _ => println!("Game exited cleanly"),
    }
}

fn generate_config() -> Conf {
    Conf {
        window_mode: WindowMode {
            width: 1000,
            height: 600,
            ..Default::default()
        },
        window_setup: WindowSetup {
            title: "Hex Adventure".to_owned(),
            ..Default::default()
        },
        ..Default::default()
    }
}
