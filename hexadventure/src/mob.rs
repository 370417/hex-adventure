use grid::{Direction, Grid, Pos};
use level::tile::{Terrain, Tile, TileView};
use store::{Id, Store};
use game::{Game, Action};

#[derive(Serialize, Deserialize)]
pub struct Mob {
    pub pos: Pos,
    pub facing: Direction,
    pub kind: Type,
    pub guard: u32,
    pub guard_recovery: Vec<(Direction, u32)>,
}

#[derive(Serialize, Deserialize)]
pub enum Type {
    Hero,
    Skeleton,
}

impl Store<Mob> {
    pub fn import_level(&mut self, mut level: Grid<(Terrain, Option<Mob>)>, actors: &mut Vec<Id<Mob>>) -> Grid<Tile> {
        level
            .iter_mut()
            .map(|tile| {
                let mob_id = tile.1.take().map(|mob| self.insert(mob));
                if let Some(mob) = mob_id {
                    actors.push(mob);
                }
                Tile {
                    terrain: tile.0,
                    mob_id,
                }
            })
            .collect()
    }
}

impl Id<Mob> {
    pub fn act(&self, game: &Game) -> Action {
        let pos = game.mobs[*self].pos;
        if game.level_memory[pos] == TileView::Seen {
            let player_pos = game.mobs[game.player].pos;
            Action::Walk((player_pos - pos).direction())
        } else {
            Action::Rest
        }
    }
}
