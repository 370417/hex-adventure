use grid::DIRECTIONS;
use prelude::*;
use rand::{thread_rng, Rng};
use world::action;

pub fn act(mob_id: MobId, world: &mut World) -> Result<(), ()> {
    let mob_pos = world[mob_id].pos;
    if world.fov[mob_pos].is_visible() {
        chase(mob_id, world.player.pos, world)
    } else {
        action::rest(mob_id, world)
    }
}

pub fn chase(mob_id: MobId, target: Pos, world: &mut World) -> Result<(), ()> {
    let mut rng = thread_rng();
    let flip = rng.gen();
    let mob_pos = world[mob_id].pos;
    for &direction in &DIRECTIONS {
        let direction = if flip { direction.rotate(3) } else { direction };
        let pos = mob_pos + direction;
        if pos.distance(target) < mob_pos.distance(target) {
            if let Ok(x) = action::walk(mob_id, direction, world) {
                return Ok(x);
            }
        }
    }
    action::rest(mob_id, world)
}
