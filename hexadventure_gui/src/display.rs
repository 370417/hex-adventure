use hexadventure::game;
use hexadventure::util::Pos;
use hexadventure::level::tile::Tile;

pub trait Display {
    fn tile(&self, pos: Pos) -> Option<Tile>;
}

impl Display for Game {

}
