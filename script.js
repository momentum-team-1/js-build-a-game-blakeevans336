// grabs canvas element from DOM
const canvas = getID('game')

// gets the drawing context
const screen = canvas.getContext('2d')

// notes the dimension of the game screen
const gameSize = {x: canvas.width, y: canvas.height}

// notes the colors for all elements in the game
const colors = {
  player: '#EAF2E3',
  obstacles: '#857E7B',
  screen: '#DB7F67',
  coin: '#D6BA73',
  wall: '#59344F'

}

// notes the size of the player's bounding box
const wallMin = 152
const wallMax = 318

// creates and instance of the game
class Game {
  constructor () {
    this.player = new Player()
    this.coin = new Coin()
    this.obstacles = []
    this.tick()
  }
  // animates the game
  tick () {
    this.update()
    this.draw()
    window.requestAnimationFrame(() => this.tick())
  }
  // draws the game
  draw () {
    screen.clearRect(0, 0, gameSize.x, gameSize.y)
    this.Wall()
    this.player.draw()
    this.coin.draw()
    for (let obstacle of this.obstacles) {
      obstacle.draw()
    }
  }
  // updates the game state
  update () {
    this.obstacles = this.obstacles.filter(function (obstacle) {
      return obstacle.center.x >= 0 && obstacle.center.x <= gameSize.x &&
      obstacle.center.y >= 0 && obstacle.center.y <= gameSize.y
    })
    while (this.obstacles.length < 3) {
      this.moveObstacles()
    }
    this.coin.update()
    this.player.update()
    for (let obstacle of this.obstacles) {
      obstacle.update()
    }
    if (collide(this.coin, this.player)) {
      console.log('hit')
      this.coin.center.x = Math.floor(Math.random() * 166) + wallMin
      this.coin.center.y = Math.floor(Math.random() * 166) + wallMin
    }
  }
  // draws a wall in middle of screen
  Wall () {
    screen.fillStyle = colors.screen
    screen.fillRect(0, 0, gameSize.x, gameSize.y)
    screen.strokeRect(150, 150, 200, 200)
  }
  moveObstacles () {
    let entrySide = Math.floor(Math.random() * 4) + 1
    let x, y, vx, vy

    if (entrySide === 1) {
      x = Math.floor(Math.random() * 4) * 60 + 210
      y = 0
      vx = 0
      vy = 2
    } else if (entrySide === 2) {
      x = 0
      y = Math.floor(Math.random() * 4) * 60 + 210
      vx = 2
      vy = 0
    } else if (entrySide === 3) {
      x = 500
      y = Math.floor(Math.random() * 4) * 60 + 210
      vx = -2
      vy = 0
    } else if (entrySide === 4) {
      x = Math.floor(Math.random() * 4) * 60 + 210
      y = 500
      vx = 0
      vy = -2
    }
    console.log(x, y, vx, vy)
    this.obstacles.push(new Obstacle(this, {x: x, y: y}, {x: vx, y: vy}))
  }
}

// creates the player sprite and dictates how it acts
class Player {
  constructor (game) {
    this.size = {
      x: 30,
      y: 30
    }
    this.center = {
      x: gameSize.x / 2 - 15,
      y: gameSize.y / 2 - 15
    }
    this.keyboarder = new Keyboarder()
    this.game = game
  }
  // draws the player sprite
  draw () {
    screen.fillStyle = colors.player
    screen.fillRect(this.center.x, this.center.y, this.size.x, this.size.y)
  }
  // updates the position of the player according the keyboard input
  update () {
    if (this.keyboarder.isDown(Keyboarder.KEYS.LEFT)) {
      this.center.x -= 2
      if (this.center.x <= wallMin) this.center.x = wallMin
    }
    if (this.keyboarder.isDown(Keyboarder.KEYS.RIGHT)) {
      this.center.x += 2
      if (this.center.x >= wallMax) this.center.x = wallMax
    }
    if (this.keyboarder.isDown(Keyboarder.KEYS.DOWN)) {
      this.center.y += 2
      if (this.center.y >= wallMax) this.center.y = wallMax
    }
    if (this.keyboarder.isDown(Keyboarder.KEYS.UP)) {
      this.center.y -= 2
      if (this.center.y <= wallMin) this.center.y = wallMin
    }
  }
}

// creates the coin sprite and dictacts how it acts
class Coin {
  constructor (game) {
    this.game = game
    this.size = {
      x: 25,
      y: 25
    }
    // randomly places coin on canvas within the box in the middle of the canvas
    this.center = {
      x: Math.floor(Math.random() * 166) + wallMin,
      y: Math.floor(Math.random() * 166) + wallMin
    }
  }
  // draws the coin
  draw () {
    screen.fillStyle = colors.coin
    screen.fillRect(this.center.x, this.center.y, this.size.x, this.size.y)
  }
  update () {
  }
}

// creates the obstacle sprites and dictates how they act
class Obstacle {
  constructor (game, pos, vel) {
    this.game = game
    this.velocity = vel
    this.length = 166
    this.center = pos
    console.log(this)
  }
  draw () {
    screen.fillStyle = colors.obstacles
    screen.fillRect(this.center.x, this.center.y, 30, 30)
  }
  update () {
    this.center.x += this.velocity.x
    this.center.y += this.velocity.y
    // console.log(this.center)
  }
}

// collision detection function
let collide = function (sprite1, sprite2) {
  return !(
    sprite1 === sprite2 ||
     sprite1.center.x + sprite1.size.x / 2 < sprite2.center.x - sprite2.size.x / 2 ||
     sprite1.center.y + sprite1.size.y / 2 < sprite2.center.y - sprite2.size.y / 2 ||
     sprite1.center.x - sprite1.size.x / 2 > sprite2.center.x + sprite2.size.x / 2 ||
     sprite1.center.y - sprite1.size.y / 2 > sprite2.center.y + sprite2.size.y / 2
  )
}

// function to grab element from DOM
function getID (id) {
  return document.getElementById(id)
}

// keyboard class that puts event listeners on key states
class Keyboarder {
  constructor () {
    this.keyState = {}

    window.addEventListener('keydown', function (e) {
      this.keyState[e.keyCode] = true
    }.bind(this))

    window.addEventListener('keyup', function (e) {
      this.keyState[e.keyCode] = false
    }.bind(this))
  }

  isDown (keyCode) {
    return this.keyState[keyCode] === true
  }

  on (keyCode, callback) {
    window.addEventListener('keydown', function (e) {
      if (e.keyCode === keyCode) {
        callback()
      }
    })
  }
}

// keyboard input codes
Keyboarder.KEYS = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,
  S: 83
}

// starts game
new Game()
