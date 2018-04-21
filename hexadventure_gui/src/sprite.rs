use ggez::Context;
use ggez::graphics::spritebatch::SpriteBatch;
use ggez::graphics::{Image, Rect};

use image;
use image::GenericImage;
use image::ImageFormat;

pub enum Sprite {
    Wall,
    Floor,
    Player,
    ShortGrass,
    Stairs,
}

pub fn load_spritebatch(ctx: &mut Context) -> SpriteBatch {
    let bytes = include_bytes!("../res/sprites.png");
    let dynamic_image = image::load_from_memory_with_format(bytes, ImageFormat::PNG)
        .expect("Failed to load sprites.");
    let (width, height) = dynamic_image.dimensions();
    let ggez_image = Image::from_rgba8(
        ctx,
        width as u16,
        height as u16,
        &dynamic_image.raw_pixels(),
    ).expect("Failed to parse image.");
    SpriteBatch::new(ggez_image)
}

pub fn sprite_src(sprite: Sprite) -> Rect {
    let width = 256.0;
    let height = 256.0;
    let (x, y) = match sprite {
        Sprite::Wall => (0, 0),
        Sprite::Floor => (1, 0),
        Sprite::ShortGrass => (3, 0),
        Sprite::Stairs => (5, 0),
        Sprite::Player => (0, 1),
    };
    let w = 18;
    let h = 24;
    let x = x * w;
    let y = 64 + y * h;
    Rect {
        x: x as f32 / width,
        y: y as f32 / height,
        w: w as f32 / width,
        h: h as f32 / height,
    }
}
