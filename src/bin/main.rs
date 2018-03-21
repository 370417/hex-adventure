extern crate ggez;
use ggez::{Context, GameResult};
use ggez::conf::Conf;
use ggez::event;
use ggez::event::EventHandler;
use std::fs::File;

extern crate hexadventure;
use hexadventure::grid;

const CONFIG_PATH: &str = "resources/conf.toml";

struct MainState {

}

impl EventHandler for MainState {
    fn update(&mut self, _ctx: &mut Context) -> GameResult<()> {
        Ok(())
    }

    fn draw(&mut self, ctx: &mut Context) -> GameResult<()> {
        Ok(())
    }
}

fn main() {
    let config = load_config();
    let mut ctx = Context::load_from_conf("hex-adventure", "as-f", config)
        .expect("Failed to load context from configuration.");
    match event::run(&mut ctx, &mut MainState {}) {
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
