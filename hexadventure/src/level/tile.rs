use prelude::*;

#[derive(Copy, Clone, Serialize, Deserialize)]
pub struct Tile {
    pub terrain: Terrain,
    pub mob_id: Option<MobId>,
}

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

// pub enum FullTileView<'a> {
//     Seen {
//         terrain: Terrain,
//         mob: Option<&'a Mob>,
//     },
//     Remembered(Terrain),
//     None,
// }

impl Terrain {
    pub fn passable(self) -> bool {
        use self::Terrain::*;
        match self {
            Wall | Entrance | Exit | Water => false,
            _ => true,
        }
    }

    pub fn transparent(self) -> bool {
        use self::Terrain::*;
        match self {
            Wall | TallGrass => false,
            _ => true,
        }
    }

    pub fn flyable(self) -> bool {
        use self::Terrain::*;
        match self {
            Wall | Entrance | Exit => false,
            _ => true,
        }
    }

    pub fn can_move(self, mob: &Mob) -> bool {
        if mob.can_fly() {
            self.flyable()
        } else {
            self.passable()
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
