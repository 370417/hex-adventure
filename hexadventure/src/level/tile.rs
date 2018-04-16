#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum Tile {
    Wall,
    Floor,
}

pub struct TileMemory {
    pub tile: Tile,
    pub turn: u32,
}

impl Tile {
    pub fn passable(&self) -> bool {
        match *self {
            Tile::Wall => false,
            Tile::Floor => true,
        }
    }

    pub fn transparent(&self) -> bool {
        match *self {
            Tile::Wall => false,
            Tile::Floor => true,
        }
    }
}

impl TileMemory {
    pub fn new(tile: Tile, turn: u32) -> Self {
        TileMemory { tile, turn }
    }
}
