extern crate ggez;
use ggez::conf::{Conf, WindowMode, WindowSetup};
use ggez::event;
use ggez::event::EventHandler;
use ggez::graphics;
use ggez::graphics::Image;
use ggez::{Context, GameResult};

extern crate image;
use image::GenericImage;

extern crate hexadventure;
use hexadventure::level::basic::{self, Tile};
use hexadventure::util::grid::{Grid, Location};

static WALL: &[u8] = include_bytes!("../resources/oryx/wall.png");
static FLOOR: &[u8] = include_bytes!("../resources/oryx/floor.png");

struct MainState {
    grid: Grid<Tile>,
    wall: Image,
    floor: Image,
}

fn image_from_memory(ctx: &mut Context, bytes: &[u8]) -> Image {
    let dynamic_image = image::load_from_memory_with_format(bytes, image::ImageFormat::PNG)
        .expect("Failed to load image.");
    let (width, height) = dynamic_image.dimensions();
    Image::from_rgba8(
        ctx,
        width as u16,
        height as u16,
        &dynamic_image.raw_pixels(),
    ).expect("Failed to convert image from raw pixels.")
}

impl MainState {
    fn new(ctx: &mut Context) -> Self {
        MainState {
            grid: basic::generate(40, 30, [0, 0, 0, 1]),
            wall: image_from_memory(ctx, &WALL),
            floor: image_from_memory(ctx, &FLOOR),
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
