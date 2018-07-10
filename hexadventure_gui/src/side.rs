use ggez::graphics::spritebatch::SpriteBatch;
use ggez::graphics::{Color, DrawMode, DrawParam, Drawable, Mesh, Point2, Rect};
use ggez::{Context, GameResult};
use grid;
use hexadventure::prelude::*;

pub const WIDTH: u32 = 24;

pub struct Sidebar {}

impl Sidebar {
    pub fn new() -> Self {
        Sidebar {}
    }

    pub fn draw(
        &self,
        ctx: &mut Context,
        dest: Point2,
        world: &World,
        spritebatch: &mut SpriteBatch,
    ) -> GameResult<()> {
        let width = WIDTH as f32 * 9.0;
        let height = grid::HEIGHT as f32 * 16.0;
        let background = [
            Point2::new(0.0, 0.0),
            Point2::new(width, 0.0),
            Point2::new(width, height),
            Point2::new(0.0, height),
        ];
        let background = Mesh::new_polygon(ctx, DrawMode::Fill, &background)?;
        background.draw_ex(
            ctx,
            DrawParam {
                dest,
                color: Some(Color::from_rgb(45, 45, 45)),
                ..Default::default()
            },
        )?;
        // draw_str(&format!("Guard: {}", game.mobs.player.guard), spritebatch, Point2::new(dest.x + 18.0, dest.y + 16.0))?;
        // for (index, mob) in game.mobs.npcs.iter().enumerate() {
        //     draw_str(&format!("Guard: {}", mob.guard), spritebatch, Point2::new(dest.x + 18.0, dest.y + 32.0 + 16.0 * index as f32))?;
        // }
        Ok(())
    }
}

fn draw_str(string: &str, spritebatch: &mut SpriteBatch, dest: Point2) -> GameResult<()> {
    for (index, character) in string.bytes().enumerate() {
        spritebatch.add(DrawParam {
            src: char_src(character),
            dest: Point2::new(dest.x + index as f32 * 9.0, dest.y),
            color: None,
            ..Default::default()
        });
    }
    Ok(())
}

fn char_src(character: u8) -> Rect {
    let (x, y) = match character {
        x @ 32...63 => (x - 32, 0),
        x @ 64...95 => (x - 64, 1),
        x @ 96...127 => (x - 96, 2),
        _ => return Rect::new(0.0, 0.0, 0.0, 0.0),
    };
    let width = 288.0;
    let height = 288.0;
    Rect::new(
        x as f32 * 9.0 / width,
        y as f32 * 16.0 / height,
        9.0 / width,
        16.0 / height,
    )
}
