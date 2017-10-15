package com.albertford

import com.badlogic.gdx.ApplicationAdapter
import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.Sprite
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.graphics.g2d.TextureAtlas

class Game : ApplicationAdapter() {
    lateinit internal var batch: SpriteBatch

    private lateinit var atlas: TextureAtlas

    private lateinit var wall: Sprite

    override fun create() {
        batch = SpriteBatch()
        atlas = TextureAtlas("atlas/oryx.atlas")
        wall = atlas.createSprite("wall")
    }

    override fun render() {
        Gdx.gl.glClearColor(0f, 0f, 0f, 1f)
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT)
        batch.begin()
        batch.draw(wall, 0f, 0f)
        batch.end()
    }

    override fun dispose() {
        batch.dispose()
        atlas.dispose()
    }
}
