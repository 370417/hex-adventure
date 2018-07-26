use prelude::*;
use rand::{thread_rng, Rng};
use world::action;
use world::mob::Species;
use astar;

pub enum Behavior {
    
}

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
        if mob_pos.distance(target) == 1 {
            return action::walk(mob_id, (target - mob_pos).direction(), world);
        }
        let path = astar::jps(
            mob_pos,
            |pos| pos == target,
            |pos| pos == target || world.level[pos].mob_id.is_none() && world.level[pos].terrain.can_move(&world[mob_id]),
            |pos| pos.distance(target),
            flip,
        );
        if let Some(path) = path {
            return action::walk(mob_id, (path[path.len() - 2] - mob_pos).direction(), world);
        }
        let path = astar::jps(
            mob_pos,
            |pos| pos == target,
            |pos| world.level[pos].terrain.can_move(&world[mob_id]),
            |pos| pos.distance(target),
            flip,
        );
        if let Some(path) = path {
            return action::walk(mob_id, (path[path.len() - 2] - mob_pos).direction(), world).or_else(|()| {
                action::rest(mob_id, world)
            });
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
