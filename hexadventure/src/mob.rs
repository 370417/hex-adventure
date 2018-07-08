use grid::{Direction, Grid, Pos};
use level::tile::{Terrain, Tile};
use std::mem::replace;
use store::{Id, Store};

#[derive(Serialize, Deserialize)]
pub struct Mob {
    pub pos: Pos,
    pub facing: Direction,
    pub kind: Type,
}

#[derive(Serialize, Deserialize)]
pub enum Type {
    Hero,
    Skeleton,
}

impl Store<Mob> {
    pub fn move_by(&mut self, mob: Id<Mob>, direction: Direction) {
        if let Some(mob) = self.get_mut(mob) {
            mob.pos += direction;
            mob.facing = direction;
        }
    }

    pub fn import_level(&mut self, mut level: Grid<(Terrain, Option<Mob>)>) -> Grid<Tile> {
        level
            .iter_mut()
            .map(|tile| Tile {
                terrain: tile.0,
                mob_id: tile.1.take().map(|mob| self.insert(mob)),
            })
            .collect()
    }
}
