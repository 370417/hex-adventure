use prelude::*;
use rand::{thread_rng, Rng};
use world::action;
use world::mob::Species;

pub fn act(mob_id: MobId, world: &mut World) -> Result<(), ()> {
    let mob_pos = world[mob_id].pos;
    if world.fov[mob_pos].is_visible() {
        world[mob_id].target = Some(world.player.pos);
        if let Species::Rat = world[mob_id].species {
            return tactical_retreat(mob_id, world.player.pos, world);
        }
    }
    chase(mob_id, world)
}

fn chase(mob_id: MobId, world: &mut World) -> Result<(), ()> {
    let mut rng = thread_rng();
    let flip = rng.gen();
    let mob_pos = world[mob_id].pos;
    if let Some(target) = world[mob_id].target {
        if target == mob_pos {
            world[mob_id].target = None;
            return action::rest(mob_id, world);
        }
        let root_direction = (mob_pos - target).direction();
        for i in 0..6 {
            let direction = if flip { root_direction.rotate(i) } else { root_direction.rotate(-i) };
            let pos = mob_pos + direction;
            if pos.distance(target) < mob_pos.distance(target) {
                if let Ok(x) = action::walk(mob_id, direction, world) {
                    return Ok(x);
                }
            }
        }
    }
    action::rest(mob_id, world)
}

fn tactical_retreat(mob_id: MobId, target: Pos, world: &mut World) -> Result<(), ()> {
    let mob_pos = world[mob_id].pos;
    let facing = world[mob_id].facing;
    match mob_pos.distance(target) {
        1 => {
            if world[mob_id].guard_recovery > 0 {
                action::walk(mob_id, facing.rotate(3), world).or_else(|()| {
                    action::walk(mob_id, (target - mob_pos).direction(), world)
                })
            } else {
                chase(mob_id, world)
            }
        }
        2 => {
            if world[mob_id].guard > 0 {
                action::rest(mob_id, world)
            } else {
                chase(mob_id, world)
            }
        }
        _ => chase(mob_id, world),
    }
}
