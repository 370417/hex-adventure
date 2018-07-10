use grid::{Direction, Pos, DIRECTIONS};
use level::tile::{TileView, Terrain};
use game::{Game, MobId};
use rand::{thread_rng, Rng};

#[derive(Serialize, Deserialize)]
pub struct Mob {
    pub pos: Pos,
    pub facing: Direction,
    pub kind: Type,
    pub guard: u32,
    pub guard_recovery: u32,
}

#[derive(Serialize, Deserialize)]
pub enum Type {
    Hero,
    Skeleton,
    Skeleton2,
}

impl MobId {
    pub fn post_act(self, game: &mut Game) {
        game.mobs[self].guard_recovery = 0;
    }

    pub fn act(self, game: &mut Game) -> Result<(), ()> {
        if game.level_memory[game.mobs[self].pos] == TileView::Seen {
            match game.mobs[self].kind {
                Type::Hero => Err(()),
                Type::Skeleton => self.chase(game),
                Type::Skeleton2 => {
                    if game.mobs[self].guard < 50 {
                        self.controlled_retreat(game)
                    } else {
                        self.chase(game)
                    }
                },
            }
        } else {
            self.rest(game)
        }
    }

    fn chase(self, game: &mut Game) -> Result<(), ()> {
        let player_pos = game.mobs.player.pos;
        let self_pos = game.mobs[self].pos;
        let distance = |pos: Pos| pos.distance(player_pos);
        let mut rng = thread_rng();
        let mut directions = DIRECTIONS.clone();
        rng.shuffle(&mut directions);
        for &direction in &directions {
            if distance(self_pos + direction) < distance(self_pos) {
                let result = self.walk(direction, game);
                if result.is_ok() {
                    return result;
                }
            }
        }
        Err(())
    }

    fn controlled_retreat(self, game: &mut Game) -> Result<(), ()> {
        let player_pos = game.mobs.player.pos;
        let self_pos = game.mobs[self].pos;
        let distance = |pos: Pos| pos.distance(player_pos);
        if distance(self_pos) > 2 {
            self.chase(game)
        } else if distance(self_pos) == 2 {
            self.rest(game)
        } else if game.mobs[self].guard_recovery == 0 {
            self.chase(game)
        } else {
            self.walk(game.mobs[self].facing.rotate(3), game).or_else(|_| {
                self.walk(game.mobs[self].facing, game)
            })
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
            if game.mobs[self].guard_recovery > 0 && game.mobs[self].facing == direction.rotate(3) {
                self.retreat(direction, game)
            } else {
                game.level[target_pos - direction].mob_id = None;
                game.mobs[self].pos = target_pos;
                game.mobs[self].facing = direction;
                game.level[target_pos].mob_id = Some(self);
                Ok(())
            }
        } else if game.level[target_pos].terrain == Terrain::Exit && self == MobId::Player {
            game.descend(direction);
            Err(())
        } else {
            Err(())
        }
    }

    fn retreat(self, direction: Direction, game: &mut Game) -> Result<(), ()> {
        let target_pos = game.mobs[self].pos + direction;
        game.level[target_pos - direction].mob_id = None;
        game.mobs[self].pos = target_pos;
        game.mobs[self].facing = direction.rotate(3);
        game.level[target_pos].mob_id = Some(self);
        game.mobs[self].guard += game.mobs[self].guard_recovery;
        Ok(())
    }

    fn melee_attack(self, direction: Direction, game: &mut Game) -> Result<(), ()> {
        let target_pos = game.mobs[self].pos + direction;
        if let Some(target) = game.level[target_pos].mob_id {
            if self != MobId::Player && target != MobId::Player {
                return Err(());
            }
            let mut damage = thread_rng().gen_range(1, 7) + thread_rng().gen_range(1, 7);
            let guard = game.mobs[target].guard;
            if damage > guard {
                damage = guard;
            }
            game.mobs[target].guard -= damage;
            if game.mobs[target].facing == direction.rotate(3) {
                game.mobs[target].guard_recovery += damage / 2;
            }
            game.mobs[self].facing = direction;
            Ok(())
        } else {
            Err(())
        }
    }
}
