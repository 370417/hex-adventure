pub enum Actor {}

pub trait Actor {
    fn act(game: &Game) -> Action;
}

pub enum Action {
    Walk(&Mob, Direction),
    Fly(&Mob, Direction),
}
