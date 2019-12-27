use prelude::*;
use rand::{thread_rng, Rng};
use world::action;
use world::mob::Species;
use astar;

#[derive(Serialize, Deserialize)]
pub enum AIState {
    Asleep(u32),
    Wandering,
    Hunting,
    Player,
}

#[derive(Serialize, Deserialize)]
pub enum Goal {
    Sleep,
    Wander,
}

pub fn act(mob_id: MobId, world: &mut World) -> Result<(), ()> {
    let mob_pos = world[mob_id].pos;
    if world.fov[mob_pos].is_visible() {
        world[mob_id].path = path_to_target(mob_id, world.player.pos, world).or_else(||
            path_to_target_through_mobs(mob_id, world.player.pos, world)
        );
        if let Species::Rat = world[mob_id].species {
            return tactical_retreat(mob_id, world.player.pos, world);
        }
    }
    // if world[mob_id].path.is_some() {
        // follow_path(mob_id, world)
    // } else {
        // world[mob_id].path = wander(mob_pos, world[mob_id].facing, |pos| world.level[pos].terrain.passable());
        follow_path(mob_id, world)
    // }
}

fn path_to_target(mob_id: MobId, target: Pos, world: &World) -> Option<Vec<Pos>> {
    astar::jps(
        world[mob_id].pos,
        |pos| pos == target,
        |pos| pos == target || world.level[pos].mob_id.is_none() && world.level[pos].terrain.can_move(&world[mob_id]),
        |pos| pos.distance(target),
        thread_rng().gen(),
    )
}

fn path_to_target_through_mobs(mob_id: MobId, target: Pos, world: &World) -> Option<Vec<Pos>> {
    astar::jps(
        world[mob_id].pos,
        |pos| pos == target,
        |pos| pos == target || world.level[pos].terrain.can_move(&world[mob_id]),
        |pos| pos.distance(target),
        thread_rng().gen(),
    )
}

fn follow_path(mob_id: MobId, world: &mut World) -> Result<(), ()> {
    let mob_pos = world[mob_id].pos;
    let next_pos = match &world[mob_id].path {
        Some(path) => path.last().copied(),
        None => None,
    };
    if let Some(next_pos) = next_pos {
        let result = action::walk(mob_id, (next_pos - mob_pos).direction(), world);
        if result.is_ok() {
            if let Some(path) = &mut world[mob_id].path {
                path.pop();
            }
        }
        return result;
    } else {
        world[mob_id].path = None;
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
                follow_path(mob_id, world)
            }
        }
        2 => {
            if world[mob_id].guard > 0 {
                action::rest(mob_id, world)
            } else {
                follow_path(mob_id, world)
            }
        }
        _ => follow_path(mob_id, world),
    }
}
