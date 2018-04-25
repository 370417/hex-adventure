#[derive(PartialEq, Eq, Debug, Copy, Clone, Serialize, Deserialize)]
pub enum Tile {
    Wall,
    Floor,
    ShortGrass,
    Exit,
    Entrance,
}

#[derive(Serialize, Deserialize)]
pub enum TileView {
    Seen(Tile),
    Remembered(Tile),
    None,
}

impl Tile {
    pub fn passable(&self) -> bool {
        match *self {
            Tile::Wall => false,
            Tile::Floor => true,
            Tile::ShortGrass => true,
            Tile::Exit => false,
            Tile::Entrance => false,
        }
    }

    pub fn transparent(&self) -> bool {
        match *self {
            Tile::Wall => false,
            Tile::Floor => true,
            Tile::ShortGrass => true,
            Tile::Exit => true,
            Tile::Entrance => true,
        }
    }
}
