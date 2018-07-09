use grid::{Direction, Pos};
use level::tile::TileView;
use game::{Game, MobId};
use rand::{thread_rng, Rng};

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

impl MobId {
    pub fn act(self, game: &mut Game) {
        if game.level_memory[game.mobs[self].pos] == TileView::Seen {
            let player_pos = game.mobs.player.pos;
            self.walk((player_pos - game.mobs[self].pos).direction(), game);
        } else {
            self.rest(game);
        }
    }

    pub(crate) fn rest(self, _game: &mut Game) -> Result<(), ()> {
        Ok(())
    }

    pub(crate) fn walk(self, direction: Direction, game: &mut Game) -> Result<(), ()> {
        let target_pos = game.mobs[self].pos + direction;
        if game.level[target_pos].mob_id.is_some() {
            self.melee_attack(direction, game)
        } else if game.level[target_pos].terrain.passable() {
            game.level[target_pos - direction].mob_id = None;
            game.mobs[self].pos = target_pos;
            game.mobs[self].facing = direction;
            game.level[target_pos].mob_id = Some(self);
            Ok(())
        } else {
            Err(())
        }
    }

    fn melee_attack(self, direction: Direction, game: &mut Game) -> Result<(), ()> {
        let target_pos = game.mobs[self].pos + direction;
        if let Some(target) = game.level[target_pos].mob_id {
            let damage = thread_rng().gen_range(6, 10);
            let guard = game.mobs[target].guard;
            if damage <= guard {
                game.mobs[target].guard -= damage;
            } else {
                game.mobs[target].guard = 0;
            }
            game.mobs[target].facing = direction;
            Ok(())
        } else {
            Err(())
        }
    }
}
