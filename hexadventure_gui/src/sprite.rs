use ggez::graphics::spritebatch::SpriteBatch;
use ggez::graphics::{self, Color, Image, Rect};
use ggez::Context;

use image;
use image::GenericImage;
use image::ImageFormat;

use hexadventure::level::tile::Terrain;
use hexadventure::mob::{self, Mob};

pub enum Sprite {
    Wall,
    Floor,
    Player,
    Archer,
    ShortGrass,
    Stairs,
    Water,
}

impl From<Terrain> for Sprite {
    fn from(terrain: Terrain) -> Self {
        match terrain {
            Terrain::Wall => Sprite::Wall,
            Terrain::Floor => Sprite::Floor,
            Terrain::ShortGrass => Sprite::ShortGrass,
            Terrain::Exit => Sprite::Stairs,
            Terrain::Entrance => Sprite::Stairs,
            Terrain::Water => Sprite::Water,
        }
    }
}

pub fn sprite_from_mob(mob: &Mob) -> Sprite {
    match mob {
        Mob { kind: mob::Type::Hero, .. } => Sprite::Player,
        Mob { kind: mob::Type::Archer, .. } => Sprite::Archer,
    }
}

pub fn color_from_tile(terrain: Terrain) -> Color {
    match terrain {
        Terrain::Wall => graphics::WHITE,
        Terrain::Floor => Color::new(0.75, 0.75, 0.75, 1.0),
        Terrain::ShortGrass => graphics::WHITE,
        Terrain::Exit => graphics::WHITE,
        Terrain::Entrance => graphics::WHITE,
        Terrain::Water => Color::new(0.0, 0.5, 1.0, 1.0),
    }
}

pub fn darken(color: Color) -> Color {
    Color {
        r: color.r / 2.0,
        g: color.g / 2.0,
        b: color.b / 2.0,
        a: color.a,
    }
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
        Sprite::Water => (4, 0),
        Sprite::Player => (0, 1),
        Sprite::Archer => (1, 1),
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
