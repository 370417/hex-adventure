use crate::prelude::*;

#[derive(Copy, Clone, Serialize, Deserialize)]
pub struct Tile {
    pub terrain: Terrain,
    pub mob_id: Option<MobId>,
}

#[derive(Copy, Clone, Serialize, Deserialize)]
pub struct MobId {} // TODO: replace with the real thing

#[derive(PartialEq, Eq, Debug, Copy, Clone, Serialize, Deserialize)]
pub enum Terrain {
    Wall,
    Floor,
    ShortGrass,
    TallGrass,
    Brownberry,
    Exit,
    Entrance,
    Water,
}

#[derive(Serialize, Deserialize, PartialEq, Eq)]
pub enum TileView {
    Visible,
    Remembered(Terrain),
    None,
}

impl Terrain {
    pub fn passable(&self) -> bool {
        use self::Terrain::*;
        match *self {
            Wall | Entrance | Exit | Water => false,
            _ => true,
        }
    }

    pub fn transparent(&self) -> bool {
        use self::Terrain::*;
        match *self {
            Wall | TallGrass => false,
            _ => true,
        }
    }
}

impl TileView {
    pub fn is_visible(&self) -> bool {
        match self {
            TileView::Visible => true,
            _ => false,
        }
    }
}
