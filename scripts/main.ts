import faceMock from './faceMock.js'
import glassMock from './glassMock.js'
const MAGIC_HEIGHT = 0.12
class Scene {
  public canvas: HTMLCanvasElement
  public ctx: CanvasRenderingContext2D
  public objs = []
  constructor() {
    const dpi = window.devicePixelRatio
    this.canvas = document.querySelector('#canvas') as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * dpi
    this.canvas.height = rect.height * dpi
    // this.ctx.scale(1 / dpi, 1 / dpi)

  }
  /** 推测是重新获取眼镜数据的，暂时当作返回false */
  static t() {
    console.log('not visible')
    return false;
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
  triggerBox(touch: Touch) {
    const x = touch.pageX
    let y = touch.pageY
    if (Scene.t()) {
      return false;
    }
    const glassLength = faceMock.glass_length
    const l = 0.12 * glassLength
    const pos = objOffset.g
    const d = this.img.height * glassLength / this.img.width || glassLength / 2
    const f = faceMock.x_center + pos.x - glassLength / 2
    const h = faceMock.x_center + pos.x + glassLength / 2
    const p = faceMock.y_center + pos.y - l
    const g = faceMock.y_center + pos.y - l + d;
    /** header-height */
    // y -= 45
    /** 某个offset */
    const offset = 20
    return (x > f - offset) && (x < h + offset) && (y > p - offset) && (y < g + offset)
  }
  render(): void {
    const dpi = window.devicePixelRatio
    const glassLength = faceMock.glass_length
    const offset = objOffset.g

    const centerX = glassLength / 2
    const centerY = MAGIC_HEIGHT * glassLength

    const faceCenterX = faceMock.x_center
    const faceCenterY = faceMock.y_center
    const faceRotate = faceMock.rotate
    const scale = glassLength / this.img.width
    const glassHeight = this.img.height * scale
    this.ctx.save()
    this.ctx.translate((faceCenterX + offset.x) * dpi, (faceCenterY + offset.y) * dpi)
    this.ctx.rotate(faceRotate)
    this.ctx.drawImage(this.img, -centerX * dpi, -centerY * dpi, glassLength * dpi, glassHeight * dpi) 
    this.ctx.restore()
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
    const dpi = window.devicePixelRatio
    const glassLength = faceMock.glass_length
    const glassCenterY = MAGIC_HEIGHT * glassLength
    const offset = objOffset.g

    // 镜框与镜腿的原始图片的尺寸需要1：1对应
    const scale = glassLength / this.img.width
    const realGlassLowerLeftY = scale * glassMock.lower_left_y
    const realGlassUpperLeftY = scale * glassMock.upper_left_y
    // 实际镜框插槽高度
    const realGlassSlotHeight = realGlassLowerLeftY  - realGlassUpperLeftY 
    /** ? */
    const legY1 = glassMock.leg_y1
    const legY2 = glassMock.leg_y2
    let offsetLegY = legY2 - legY1

    if (offsetLegY === 0) {
      offsetLegY = realGlassSlotHeight
    }

    /** TODO */
    const F = realGlassSlotHeight * this.img.height / offsetLegY
    const H = realGlassUpperLeftY  + F / 2 - legY1 / offsetLegY * realGlassSlotHeight
    const glassCenterX = glassLength / 2
    const Q = glassCenterY - H
    /** someone rotate */
    const I = Math.atan(Q / glassCenterX)
    const $ = Math.sqrt(glassCenterX * glassCenterX + Q * Q)
    /** left leg */
    // 所以这里应该是用来计算补偿距离的
    const W = $ * Math.cos(I + faceMock.rotate)
    const R = $ * Math.sin(I + faceMock.rotate)
    const N = -W + faceMock.x_center + offset.x
    const E = -R + faceMock.y_center + offset.y
    // 减的这个N E应该是镜腿末端对于移动距离的补偿
    // 以此来达到末端不动的效果
    const O = faceMock.x_face_left - N
    const A = faceMock.y_face_left - E
    const K = Math.sqrt(O * O + A * A)
    let U = Math.atan(A / O)

    if (O < 0) {
      U += Math.PI
    }
    this.ctx.save()
    this.ctx.translate(N * dpi, E * dpi)
    this.ctx.rotate(U)
    this.n(-faceMock.rotate + U)
    if (O < 0) {
      this.ctx.scale(1, -1)
    }

    const j = F * Math.cos(-faceMock.rotate + U)
    this.ctx.drawImage(this.img, 0, -j / 2 * dpi, K * dpi, j * dpi)

    this.ctx.restore()

    /** right leg */
    const z = $ * Math.cos(-I + faceMock.rotate)
    const q = $ * Math.sin(-I + faceMock.rotate)
    const V = z + faceMock.x_center + offset.x
    const ee = q + faceMock.y_center + offset.y
    const te = faceMock.x_face_right - V
    const ie = faceMock.y_face_right - ee
    const ne = Math.sqrt(te * te + ie * ie)
    let re = Math.atan(ie / te)
    if (te < 0) {
      re += Math.PI
    }
    this.ctx.save()
    this.ctx.translate(V * dpi, ee * dpi)
    this.ctx.rotate(re)
    this.n(-faceMock.rotate + re)
    if (te < 0) {
      this.ctx.scale(1, -1)
    }
    const oe = F * Math.cos(-faceMock.rotate + re)
    this.ctx.drawImage(this.img, 0, -oe / 2 * dpi, ne * dpi, oe * dpi)
    this.ctx.restore()
  }
  n(rotate) {
    this.ctx.transform(1, 0, Math.tan(rotate), 1, 0, 0)
  }

}
async function init() {
  const scene = new Scene()
  const bg = new RigidBody()
  bg.width = scene.canvas.width
  bg.height = scene.canvas.height
  bg.x = 0
  bg.y = 0
  // await bg.load('/assets/5.jpg')
  // scene.register(bg)
  const glass = new Glass()
  await glass.load('/assets/glass.png')
  // glass.x = 0
  // glass.y = 0
  // glass.width = 60
  // glass.height = 23.5
  scene.register(glass)

  const leftLeg = new Leg()
  // const rightLeg = new Leg()

  // glass.bindLeft(leftLeg)
  // glass.bindRight(rightLeg)

  await leftLeg.load('/assets/leg.png')
  // await rightLeg.load('/assets/leg.png')

  scene.register(leftLeg)
  // scene.register(rightLeg)

  scene.run()

  const canvas = scene.canvas

  let target = null
  let currentPos = {x: 0, y: 0}
  let currentOffset = objOffset
  canvas.addEventListener('touchstart', (evt: TouchEvent) => {
    target = null
    const touch = evt.changedTouches[0]
    if (!Scene.t() && glass.triggerBox(touch)) {
      target = 'g'
      /** 操作leg的判断 */
      // if (Scene.t()) {
      //   target = 
      // }
      console.log('selected: ', target)
      if (target) {
        evt.preventDefault()
        evt.stopPropagation()

        currentPos = {
          x: touch.pageX,
          y: touch.pageY
        }
        currentOffset = { ...objOffset }
      } else {

      }
    }

    canvas.addEventListener('touchmove', (evt: TouchEvent) => {
      if (currentPos.x !== 0 || currentPos.y !== 0) {
        evt.preventDefault()
        evt.stopPropagation()
        const touch = evt.changedTouches[0]
        const offsetPos = {
          x: touch.pageX - currentPos.x,
          y: touch.pageY - currentPos.y
        }
        const limit = target === 'g' ? 80 : 10
        const x = ensureRange(currentOffset[target].x + offsetPos.x, -limit, limit)
        const y = ensureRange(currentOffset[target].y + offsetPos.y, -limit, limit)
        objOffset[target] = { x, y }
        scene.run()
      }
    })
  })

}

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

function ensureRange(val: number, min: number, max: number) {
  return Math.max(Math.min(val, max), min)
}
const objOffset = {
  g: { x: 0, y: 0 },
  l: { x: 0, y: 0 },
  r: { x: 0, y: 0 },
}

init()