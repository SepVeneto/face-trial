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
    register(obj) {
        obj.ctx = this.ctx;
        this.objs.push(obj);
    }
    renderer() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.objs.forEach(obj => {
            // this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height)
            obj.render();
        });
    }
}
class RigidBody {
    ctx;
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
    render() {
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}
class Glass extends RigidBody {
    linkTopY = 58;
    linkBottomY = 72;
    endTopY = 14;
    endBottomY = 34;
    leftSlot;
    rightSlot;
    constructor() {
        super();
    }
    bindLeft(leg) {
        this.leftSlot = leg;
        this.leftSlot.x1 = this.x;
        this.leftSlot.y1 = this.y + this.linkTopY;
        this.leftSlot.x2 = this.x;
        this.leftSlot.y2 = this.y + this.linkBottomY;
        this.leftSlot.x3 = this.x - this.leftSlot.width;
        this.leftSlot.y3 = this.y + this.endTopY;
        this.leftSlot.x4 = this.x - this.leftSlot.width;
        this.leftSlot.y4 = this.y + this.endBottomY;
    }
    bindRight(leg) {
        this.rightSlot = leg;
        this.rightSlot.x1 = this.x;
        this.rightSlot.y1 = this.y + this.linkTopY;
        this.rightSlot.x2 = this.x;
        this.rightSlot.y2 = this.y + this.linkBottomY;
        this.rightSlot.x3 = this.x + this.rightSlot.width;
        this.rightSlot.y3 = this.y + this.endTopY;
        this.rightSlot.x4 = this.x + this.rightSlot.width;
        this.rightSlot.y4 = this.y + this.endBottomY;
    }
    update(offsetX, offsetY) {
        this.x += offsetX;
        this.y += offsetY;
        this.leftSlot.update(offsetX, offsetY);
        this.rightSlot.update(offsetX, offsetY);
    }
}
class Leg extends RigidBody {
    x1;
    y1;
    x2;
    y2;
    x3;
    y3;
    x4;
    y4;
    constructor() {
        super();
    }
    update(offsetX, offsetY) {
        this.x1 += offsetX;
        this.y1 += offsetY;
        this.x2 += offsetX;
        this.y2 += offsetY;
    }
    render() {
        this.ctx.fillStyle = this.ctx.createPattern(this.img, 'no-repeat');
        this.ctx.beginPath();
        this.ctx.moveTo(this.x1, this.y1);
        this.ctx.lineTo(this.x2, this.y2);
        this.ctx.lineTo(this.x3, this.y3);
        this.ctx.lineTo(this.x4, this.y4);
        this.ctx.closePath();
        this.ctx.fill();
    }
}
async function init() {
    const scene = new Scene();
    const bg = new RigidBody();
    bg.width = 300 * 0.66;
    bg.height = 300;
    bg.x = 0;
    bg.y = 0;
    await bg.load('/assets/5.jpg');
    scene.register(bg);
    const glass = new Glass();
    await glass.load('/assets/glass.png');
    glass.x = 0;
    glass.y = 0;
    glass.width = 60;
    glass.height = 23.5;
    scene.register(glass);
    const leftLeg = new Leg();
    const rightLeg = new Leg();
    glass.bindLeft(leftLeg);
    glass.bindRight(rightLeg);
    await leftLeg.load('/assets/leg.png');
    await rightLeg.load('/assets/leg.png');
    scene.register(leftLeg);
    scene.register(rightLeg);
    scene.run();
    const canvas = scene.canvas;
    let dragging;
    canvas.addEventListener('mousedown', (event) => {
        dragging = true;
        canvas.addEventListener('mousemove', (e) => {
            if (dragging) {
                glass.update(e.clientX - event.clientX, e.clientY - event.clientY);
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
