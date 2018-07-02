//! Turn system

use store::Id;
use mob::Mob;

struct Scheduler {
    turn: u32,
    subturn: u32,
    queue: Vec<Id<Mob>>,
    animated: Vec<Id<()>>,
}
