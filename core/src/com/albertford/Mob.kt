package com.albertford

interface Mob {
    var pos: Pos
}

interface Test {
    var b: Int
}

enum class MobType {
    PLAYER
}

class Player(override var pos: Pos) : Mob
