//! Turn system

use mob::Mob;
use store::Id;

struct Scheduler {
    turn: u32,
    subturn: u32,
    queue: Vec<Id<Mob>>,
    animated: Vec<Id<()>>,
}
