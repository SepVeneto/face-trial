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
    window.requestAnimationFrame(() => this.run())
  }
  renderer() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.objs.forEach(obj => {
      this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height)
      // obj.render(this.ctx.drawImage)
    })
  }
}

class Body{
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
  render(draw) {
    draw(this.img, this.x, this.y, this.width, this.height)
  }
}
async function init() {
  const scene = new Scene()
  const bg = new Body()
  bg.width = 300 * 0.66
  bg.height = 300
  bg.x = 0
  bg.y = 0
  await bg.load('/assets/5.jpg')
  const glass = new Body()
  await glass.load('/assets/glass.png')
  glass.x = 0
  glass.y = 0
  glass.width = 60
  glass.height = 23.5
  scene.objs.push(bg, glass)

  scene.run()

  const canvas = scene.canvas
  let dragging
  canvas.addEventListener('mousedown', () => {
    dragging = true
    canvas.addEventListener('mousemove', (e) => {
      if (dragging) {
        glass.x = e.clientX
        glass.y = e.clientY
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