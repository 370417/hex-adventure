pub enum Actor {}

impl Actor {
    pub fn act(game: &Game) -> Action;
}

pub enum Action {
    Walk(&Mob, Direction),
    Fly(&Mob, Direction),
}

struct QueuedActor {
    actor: Actor,
    cooldown: u32,
}

struct Actors {
    actors: Vec<QueuedActor>,
    animated_actors: Vec<u32>,
}

impl Actors {
    fn foo(&self) {
        
    }
}
