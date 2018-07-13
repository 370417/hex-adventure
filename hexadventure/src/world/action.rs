use level::place_mob;
use level::tile::{Terrain, TileView};
use prelude::*;
use rand::{thread_rng, Rng};
use world::mob::{PLAYER_ID, mob_guard, Species};

pub fn rest(mob_id: MobId, world: &mut World) -> Result<(), ()> {
    fn enemy_visible(pos: Pos, world: &mut World) -> bool {
        if world.fov[pos].is_visible() {
            if let Some(mob_id) = world.level[pos].mob_id {
                !mob_id.is_player()
            } else {
                false
            }
        } else {
            false
        }
    }

    if mob_id.is_player() {
        if !grid::positions().any(|pos| enemy_visible(pos, world)) {
            world.player.guard = mob_guard(world.player.species);
        }
    }
    Ok(())
}

pub fn walk(mob_id: MobId, direction: Direction, world: &mut World) -> Result<(), ()> {
    let target_pos = world[mob_id].pos + direction;
    if world.level[target_pos].mob_id.is_some() {
        attack_melee(mob_id, direction, world)
    } else if world.level[target_pos].terrain.can_move(&world[mob_id]) {
        if world[mob_id].guard_recovery > 0 && world[mob_id].facing == direction.rotate(3) {
            retreat_unchecked(mob_id, direction, world)
        } else {
            world.level[target_pos - direction].mob_id = None;
            world.level[target_pos].mob_id = Some(mob_id);
            world[mob_id].pos = target_pos;
            world[mob_id].facing = direction;
            Ok(())
        }
    } else if world.level[target_pos].terrain == Terrain::Exit {
        if mob_id.is_player() {
            world[mob_id].pos = target_pos;
            descend_unchecked(world);
            Err(())
        } else {
            Err(())
        }
    } else {
        Err(())
    }
}

fn attack_melee(mob_id: MobId, direction: Direction, world: &mut World) -> Result<(), ()> {
    let target_pos = world[mob_id].pos + direction;
    if let Some(target) = world.level[target_pos].mob_id {
        if mob_id.is_player() || target.is_player() {
            let damage = thread_rng().gen_range(1, 7) + thread_rng().gen_range(1, 7);
            let guard = world[target].guard;
            if damage < guard {
                world[target].guard -= damage;
                if world[target].facing == direction.rotate(3) {
                    world[target].guard_recovery = damage / 2;
                }
            } else {
                let damage = damage - world[target].guard;
                world[target].guard = 0;
                if damage < world[target].health {
                    world[target].health -= damage;
                } else {
                    world[target].health = 0;
                    target.die(world);
                }
            }
            world[mob_id].facing = direction;
            Ok(())
        } else {
            Err(())
        }
    } else {
        Err(())
    }
}

fn retreat_unchecked(mob_id: MobId, direction: Direction, world: &mut World) -> Result<(), ()> {
    let target_pos = world[mob_id].pos + direction;
    world.level[target_pos - direction].mob_id = None;
    world.level[target_pos].mob_id = Some(mob_id);
    world[mob_id].pos = target_pos;
    world[mob_id].guard += world[mob_id].guard_recovery;
    Ok(())
}

fn descend_unchecked(world: &mut World) {
    let (level, npcs) = world.architect.generate();
    world.level = level;
    world.npcs = npcs;
    let player_pos = place_mob(
        &mut world.level,
        world.player.pos,
        PLAYER_ID,
        &mut thread_rng(),
    );
    world.player.facing = (player_pos - world.player.pos).direction();
    world.player.pos = player_pos;
    world.fov = Grid::new(|_| TileView::None);
    world.update_fov();
}
