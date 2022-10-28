import faceMock from './faceMock.json'
import glassMock from './glassMock.json'
class Scene {
  public canvas: HTMLCanvasElement
  public ctx: CanvasRenderingContext2D
  public objs = []
  constructor() {
    this.canvas = document.querySelector('#canvas') as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')
  }
  run() {
    this.renderer()
    // window.requestAnimationFrame(() => this.run())
  }
  register(obj: RigidBody) {
    obj.ctx = this.ctx
    this.objs.push(obj)
  }
  renderer() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.objs.forEach(obj => {
      // this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height)
      obj.render()
    })
  }
}

class RigidBody {
  public ctx: CanvasRenderingContext2D
  public x: number
  public y: number
  public width: number
  public height: number
  public img: HTMLImageElement
  constructor() {

  }
  async load(url: string) {
    this.img = await loadImage(url)
    return;
  }
  render() {
    this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
  }
}

class Glass extends RigidBody {
  public linkTopY = 58
  public linkBottomY = 72
  public endTopY = 14
  public endBottomY = 34
  private leftSlot: Leg
  private rightSlot: Leg
  constructor() {
    super()
  }
  bindLeft(leg: Leg) {
    this.leftSlot = leg
    this.leftSlot.x1 = this.x
    this.leftSlot.y1 = this.y + this.linkTopY
    this.leftSlot.x2 = this.x
    this.leftSlot.y2 = this.y + this.linkBottomY
    this.leftSlot.x3 = this.x - this.leftSlot.width
    this.leftSlot.y3 = this.y + this.endTopY
    this.leftSlot.x4 = this.x - this.leftSlot.width
    this.leftSlot.y4 = this.y + this.endBottomY
  }
  bindRight(leg: Leg) {
    this.rightSlot = leg
    this.rightSlot.x1 = this.x
    this.rightSlot.y1 = this.y + this.linkTopY
    this.rightSlot.x2 = this.x
    this.rightSlot.y2 = this.y + this.linkBottomY
    this.rightSlot.x3 = this.x + this.rightSlot.width
    this.rightSlot.y3 = this.y + this.endTopY
    this.rightSlot.x4 = this.x + this.rightSlot.width
    this.rightSlot.y4 = this.y + this.endBottomY
  }
  update(offsetX: number, offsetY: number) {
    this.x += offsetX
    this.y += offsetY
    this.leftSlot.update(offsetX, offsetY)
    this.rightSlot.update(offsetX, offsetY)
  }
}
class Leg extends RigidBody {
  public x1: number
  public y1: number
  public x2: number
  public y2: number
  public x3: number
  public y3: number
  public x4: number
  public y4: number
  constructor() {
    super()
  }
  update(offsetX: number, offsetY: number) {
    this.x1 += offsetX
    this.y1 += offsetY
    this.x2 += offsetX
    this.y2 += offsetY
  }
  render() {
    const glassLength = faceMock.glass_length
    /** TODO */
    const C = 0.12 * glassLength
    /** TODO */
    const Z = {x: 0, y: 0}

    const scale = glassLength / this.img.width
    /** TODO */
    const M = scale * glassMock.lower_left_y
    /** TODO */
    const k = scale * glassMock.upper_left_y
    const offsetY = M - k
    const legY1 = glassMock.leg_y1
    const legY2 = glassMock.leg_y2
    let offsetLegY = legY2 - legY1

    if (offsetLegY === 0) {
      offsetLegY = offsetY
    }

    /** TODO */
    const F = offsetY * this.img.height / offsetLegY
    const H = k + F / 2 - legY1 / offsetLegY * offsetY

    const j = -8.502996764613137
    const d = 2
    const K = 11.187222723131262
    const N = 130.6225
    const E = 206.05291666666668
    const U = 2.8885020806637596
    this.ctx.save()
    this.ctx.translate(N * d, E * d)
    this.ctx.rotate(U)
    this.ctx.drawImage(this.img, 0, -j / 2 * d, K * d, j * d)
    this.ctx.restore()

    // this.ctx.fillStyle = this.ctx.createPattern(this.img, 'no-repeat') 
    // this.ctx.beginPath()
    // this.ctx.moveTo(this.x1, this.y1)
    // this.ctx.lineTo(this.x2, this.y2)
    // this.ctx.lineTo(this.x3, this.y3)
    // this.ctx.lineTo(this.x4, this.y4)
    // this.ctx.closePath()
    // this.ctx.fill()
  }
}
async function init() {
  const scene = new Scene()
  const bg = new RigidBody()
  bg.width = 300 * 0.66
  bg.height = 300
  bg.x = 0
  bg.y = 0
  await bg.load('/assets/5.jpg')
  // scene.register(bg)
  const glass = new Glass()
  await glass.load('/assets/glass.png')
  glass.x = 0
  glass.y = 0
  glass.width = 60
  glass.height = 23.5
  // scene.register(glass)

  const leftLeg = new Leg()
  const rightLeg = new Leg()

  glass.bindLeft(leftLeg)
  // glass.bindRight(rightLeg)

  await leftLeg.load('/assets/leg.png')
  await rightLeg.load('/assets/leg.png')

  scene.register(leftLeg)
  scene.register(rightLeg)

  scene.run()

  const canvas = scene.canvas
  let dragging
  canvas.addEventListener('mousedown', (event) => {
    dragging = true
    canvas.addEventListener('mousemove', (e) => {
      if (dragging) {
        glass.update(e.clientX - event.clientX, e.clientY - event.clientY)
      }
    })
    canvas.addEventListener('mouseup', () => {
      dragging = false;
    })
  })

}
// async function init() {
//   let dragging = false
//   const glass = await loadImage('/assets/glass.png')




//   const img = await loadImage('/assets/5.jpg')

// }

function loadImage(url: string) {
  return new Promise<HTMLImageElement>(resolve => {
    const img = document.createElement('img')
    img.src = url
    img.onload = (e) => {
      const node = e.target as HTMLImageElement
      resolve(node)
    }
  })
}

init()