use ggez::graphics::{Color, DrawMode, DrawParam, Drawable, Mesh, Point2};
use ggez::{Context, GameResult};

use grid;

pub const WIDTH: u32 = 24;

pub struct Sidebar {}

impl Sidebar {
    pub fn new() -> Self {
        Sidebar {}
    }

    pub fn draw(&self, ctx: &mut Context, dest: Point2) -> GameResult<()> {
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
        Ok(())
    }
}
