class Scene {
    canvas;
    ctx;
    objs = [];
    constructor() {
        this.canvas = document.querySelector('#canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    run() {
        this.renderer();
        window.requestAnimationFrame(() => this.run());
    }
    renderer() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.objs.forEach(obj => {
            this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
            // obj.render(this.ctx.drawImage)
        });
    }
}
class Body {
    x;
    y;
    width;
    height;
    img;
    constructor() {
    }
    async load(url) {
        this.img = await loadImage(url);
        return;
    }
    render(draw) {
        draw(this.img, this.x, this.y, this.width, this.height);
    }
}
async function init() {
    const scene = new Scene();
    const bg = new Body();
    bg.width = 300 * 0.66;
    bg.height = 300;
    bg.x = 0;
    bg.y = 0;
    await bg.load('/assets/5.jpg');
    const glass = new Body();
    await glass.load('/assets/glass.png');
    glass.x = 0;
    glass.y = 0;
    glass.width = 60;
    glass.height = 23.5;
    scene.objs.push(bg, glass);
    scene.run();
    const canvas = scene.canvas;
    let dragging;
    canvas.addEventListener('mousedown', () => {
        dragging = true;
        canvas.addEventListener('mousemove', (e) => {
            if (dragging) {
                glass.x = e.clientX;
                glass.y = e.clientY;
            }
        });
        canvas.addEventListener('mouseup', () => {
            dragging = false;
        });
    });
}
// async function init() {
//   let dragging = false
//   const glass = await loadImage('/assets/glass.png')
//   const img = await loadImage('/assets/5.jpg')
// }
function loadImage(url) {
    return new Promise(resolve => {
        const img = document.createElement('img');
        img.src = url;
        img.onload = (e) => {
            const node = e.target;
            resolve(node);
        };
    });
}
init();
