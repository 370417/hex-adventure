use mob::Mob;
use store::Id;

#[derive(PartialEq, Eq, Debug, Copy, Clone, Serialize, Deserialize)]
pub struct Tile {
    pub terrain: Terrain,
    pub mob: Option<Id>,
}

#[derive(PartialEq, Eq, Debug, Copy, Clone, Serialize, Deserialize)]
pub enum Terrain {
    Wall,
    Floor,
    ShortGrass,
    Exit,
    Entrance,
}

#[derive(Serialize, Deserialize, PartialEq, Eq)]
pub enum TileView {
    Seen,
    Remembered(Terrain),
    None,
}

pub enum FullTileView<'a> {
    Seen {
        terrain: Terrain,
        mob: Option<&'a Mob>,
    },
    Remembered(Terrain),
    None,
}

impl Terrain {
    pub fn passable(&self) -> bool {
        match *self {
            Terrain::Wall => false,
            Terrain::Floor => true,
            Terrain::ShortGrass => true,
            Terrain::Exit => false,
            Terrain::Entrance => false,
        }
    }

    pub fn transparent(&self) -> bool {
        match *self {
            Terrain::Wall => false,
            Terrain::Floor => true,
            Terrain::ShortGrass => true,
            Terrain::Exit => true,
            Terrain::Entrance => true,
        }
    }
}
