extern crate ggez;
use ggez::conf::Conf;
use ggez::event;
use ggez::event::EventHandler;
use ggez::graphics;
use ggez::graphics::Image;
use ggez::{Context, GameResult};
use std::fs::File;

extern crate hexadventure;
use hexadventure::level::basic::{self, Tile};
use hexadventure::util::grid::{Grid, Location};

const CONFIG_PATH: &str = "resources/conf.toml";

struct MainState {
    grid: Grid<Tile>,
    wall: Image,
    floor: Image,
}

impl MainState {
    fn new(ctx: &mut Context) -> Self {
        MainState {
            grid: basic::generate(40, 30, [0, 0, 0, 1]),
            wall: Image::new(ctx, "/oryx/wall.png").unwrap(),
            floor: Image::new(ctx, "/oryx/floor.png").unwrap(),
        }
    }
}

impl EventHandler for MainState {
    fn update(&mut self, _ctx: &mut Context) -> GameResult<()> {
        Ok(())
    }

    fn draw(&mut self, ctx: &mut Context) -> GameResult<()> {
        graphics::clear(ctx);
        for pos in self.grid.positions() {
            let Location { x, y } = self.grid.pos_to_location(pos);
            let dest = graphics::Point2::new(9.0 * x as f32, 16.0 * y as f32);
            let img = match self.grid[pos] {
                Tile::Floor => &self.floor,
                Tile::Wall => &self.wall,
            };
            graphics::draw(ctx, img, dest, 0f32)?;
        }
        graphics::present(ctx);
        Ok(())
    }
}

fn main() {
    let config = load_config();
    let mut ctx = Context::load_from_conf("hex-adventure", "as-f", config)
        .expect("Failed to load context from configuration.");
    graphics::set_default_filter(&mut ctx, graphics::FilterMode::Nearest);
    let mut state = MainState::new(&mut ctx);
    match event::run(&mut ctx, &mut state) {
        Err(e) => println!("Error encountered: {}", e),
        _ => println!("Game exited cleanly"),
    }
}

fn load_config() -> Conf {
    match File::open(CONFIG_PATH).map(|mut file| Conf::from_toml_file(&mut file)) {
        Ok(Ok(conf)) => conf,
        _ => Conf::new(),
    }
}
