package com.albertford

interface Mob {
    var axial: Axial
}

interface Test {
    var b: Int
}

enum class MobType {
    PLAYER
}

class Player(override var axial: Axial) : Mob
