// import faceMock from './faceMock.js'
import glassMock from './glassMock.js';
import { init as initFace } from './face.js';
// window.onPlay = faceStream
let loading = false;
const MAGIC_HEIGHT = 0.12;
class Scene {
    canvas;
    ctx;
    objs = [];
    constructor() {
        const dpi = window.devicePixelRatio;
        this.canvas = document.querySelector('#canvas');
        this.ctx = this.canvas.getContext('2d');
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpi;
        this.canvas.height = rect.height * dpi;
        // this.ctx.scale(1 / dpi, 1 / dpi)
    }
    /** 推测是重新获取眼镜数据的，暂时当作返回false */
    static t() {
        console.log('not visible');
        return false;
    }
    run() {
        this.renderer();
        // window.requestAnimationFrame(() => this.run())
    }
    register(obj) {
        obj.ctx = this.ctx;
        this.objs.push(obj);
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.objs.length = 0;
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
    centerX;
    centerY;
    rotate;
    constructor(width, cx, cy, rotate) {
        super();
        this.width = width;
        this.centerX = cx;
        this.centerY = cy;
        this.rotate = rotate;
    }
    update(faceData) {
        this.width = faceData.faceWidth;
        this.centerX = faceData.faceCenterX;
        this.centerY = faceData.faceCenterY;
        this.rotate = faceData.rotate;
    }
    triggerBox(touch) {
        console.log(touch);
        const x = touch.pageX;
        let y = touch.pageY;
        if (Scene.t()) {
            return false;
        }
        const glassLength = this.width;
        const l = 0.12 * glassLength;
        const pos = objOffset.g;
        const d = this.img.height * glassLength / this.img.width || glassLength / 2;
        const f = this.centerX + pos.x - glassLength / 2;
        const h = this.centerX + pos.x + glassLength / 2;
        const p = this.centerY + pos.y - l;
        const g = this.centerY + pos.y - l + d;
        /** header-height */
        // y -= 45
        /** 某个offset */
        const offset = 20;
        return (x > f - offset) && (x < h + offset) && (y > p - offset) && (y < g + offset);
    }
    render() {
        const dpi = window.devicePixelRatio;
        const glassLength = this.width;
        const offset = objOffset.g;
        const centerX = glassLength / 2;
        const centerY = MAGIC_HEIGHT * glassLength;
        const faceCenterX = this.centerX;
        const faceCenterY = this.centerY;
        const faceRotate = this.rotate;
        const scale = glassLength / this.img.width;
        const glassHeight = this.img.height * scale;
        this.ctx.save();
        this.ctx.translate((faceCenterX + offset.x) * dpi, (faceCenterY + offset.y) * dpi);
        this.ctx.rotate(faceRotate);
        this.ctx.drawImage(this.img, -centerX * dpi, -centerY * dpi, glassLength * dpi, glassHeight * dpi);
        this.ctx.restore();
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
    faceData;
    constructor(data) {
        super();
        this.faceData = data;
    }
    update(faceData) {
        this.faceData = faceData;
    }
    render() {
        const dpi = window.devicePixelRatio;
        const glassLength = this.faceData.faceWidth;
        const glassCenterY = MAGIC_HEIGHT * glassLength;
        const offset = objOffset.g;
        // 计算镜框上插槽的实际高度
        const scale = glassLength / this.img.width;
        const realGlassLowerLeftY = scale * glassMock.lower_left_y;
        const realGlassUpperLeftY = scale * glassMock.upper_left_y;
        const realGlassSlotHeight = realGlassLowerLeftY - realGlassUpperLeftY;
        // 计算镜腿的高度
        const legY1 = glassMock.leg_y1;
        const legY2 = glassMock.leg_y2;
        let legHeight = legY2 - legY1;
        // 优先使用镜腿的高度
        if (legHeight === 0) {
            legHeight = realGlassSlotHeight;
        }
        /** TODO */
        // 镜腿图片的实际高度
        const imgHeight = realGlassSlotHeight * this.img.height / legHeight;
        // 
        const H = realGlassUpperLeftY + imgHeight / 2 - legY1 / legHeight * realGlassSlotHeight;
        const glassCenterX = glassLength / 2;
        const Q = glassCenterY - H;
        /** someone rotate */
        const I = Math.atan(Q / glassCenterX);
        const $ = Math.sqrt(glassCenterX * glassCenterX + Q * Q);
        /** left leg */
        // 所以这里应该是用来计算补偿距离的
        const W = $ * Math.cos(I + this.faceData.rotate);
        const R = $ * Math.sin(I + this.faceData.rotate);
        const N = -W + this.faceData.faceCenterX + offset.x;
        const E = -R + this.faceData.faceCenterY + offset.y;
        // 减的这个N E应该是镜腿末端对于移动距离的补偿
        // 以此来达到末端不动的效果
        // console.log(this.faceData.faceLefX, N)
        // console.log(this.faceData.faceLeftY, E)
        const O = this.faceData.faceLeftX - N;
        const A = this.faceData.faceLeftY - E;
        const K = Math.sqrt(O * O + A * A);
        let U = Math.atan(A / O);
        if (O < 0) {
            U += Math.PI;
        }
        this.ctx.save();
        this.ctx.translate(N * dpi, E * dpi);
        this.ctx.rotate(U);
        this.n(-this.faceData.rotate + U);
        if (O < 0) {
            this.ctx.scale(1, -1);
        }
        const j = imgHeight * Math.cos(-this.faceData.rotate + U);
        this.ctx.drawImage(this.img, 0, -j / 2 * dpi, K * dpi, j * dpi);
        this.ctx.restore();
        /** right leg */
        const z = $ * Math.cos(-I + this.faceData.rotate);
        const q = $ * Math.sin(-I + this.faceData.rotate);
        const V = z + this.faceData.faceCenterX + offset.x;
        const ee = q + this.faceData.faceCenterY + offset.y;
        const te = this.faceData.faceRightX - V;
        const ie = this.faceData.faceRightY - ee;
        const ne = Math.sqrt(te * te + ie * ie);
        let re = Math.atan(ie / te);
        if (te < 0) {
            re += Math.PI;
        }
        this.ctx.save();
        this.ctx.translate(V * dpi, ee * dpi);
        this.ctx.rotate(re);
        this.n(-this.faceData.rotate + re);
        if (te < 0) {
            this.ctx.scale(1, -1);
        }
        const oe = imgHeight * Math.cos(-this.faceData.rotate + re);
        this.ctx.drawImage(this.img, 0, -oe / 2 * dpi, ne * dpi, oe * dpi);
        this.ctx.restore();
    }
    n(rotate) {
        this.ctx.transform(1, 0, Math.tan(rotate), 1, 0, 0);
    }
}
let scene = null;
let glass = null;
let leftLeg = null;
const objOffset = {
    g: { x: 0, y: 0 },
    l: { x: 0, y: 0 },
    r: { x: 0, y: 0 },
};
window.onload = () => {
    scene = new Scene();
    const canvas = scene.canvas;
    let target = null;
    let currentPos = { x: 0, y: 0 };
    let currentOffset = objOffset;
    canvas.addEventListener('touchstart', (evt) => {
        target = null;
        const touch = evt.changedTouches[0];
        if (!Scene.t() && glass.triggerBox(touch)) {
            target = 'g';
            /** 操作leg的判断 */
            // if (Scene.t()) {
            //   target = 
            // }
            console.log('selected: ', target);
            if (target) {
                evt.preventDefault();
                evt.stopPropagation();
                currentPos = {
                    x: touch.pageX,
                    y: touch.pageY
                };
                currentOffset = { ...objOffset };
            }
            else {
            }
        }
        canvas.addEventListener('touchmove', (evt) => {
            if (currentPos.x !== 0 || currentPos.y !== 0) {
                evt.preventDefault();
                evt.stopPropagation();
                const touch = evt.changedTouches[0];
                const offsetPos = {
                    x: touch.pageX - currentPos.x,
                    y: touch.pageY - currentPos.y
                };
                const limit = target === 'g' ? 80 : 10;
                const x = ensureRange(currentOffset[target].x + offsetPos.x, -limit, limit);
                const y = ensureRange(currentOffset[target].y + offsetPos.y, -limit, limit);
                objOffset[target] = { x, y };
                scene.run();
            }
        });
    });
    canvas.addEventListener('mousedown', (evt) => {
        target = null;
        const touch = evt;
        if (!Scene.t() && glass.triggerBox(touch)) {
            target = 'g';
            /** 操作leg的判断 */
            // if (Scene.t()) {
            //   target = 
            // }
            console.log('selected: ', target);
            if (target) {
                evt.preventDefault();
                evt.stopPropagation();
                currentPos = {
                    x: touch.pageX,
                    y: touch.pageY
                };
                currentOffset = { ...objOffset };
            }
            else {
            }
        }
        canvas.addEventListener('mousemove', handleMove);
        function handleMove(evt) {
            if (currentPos.x !== 0 || currentPos.y !== 0) {
                evt.preventDefault();
                evt.stopPropagation();
                const touch = evt;
                const offsetPos = {
                    x: touch.pageX - currentPos.x,
                    y: touch.pageY - currentPos.y
                };
                const limit = target === 'g' ? 80 : 10;
                const x = ensureRange(currentOffset[target].x + offsetPos.x, -limit, limit);
                const y = ensureRange(currentOffset[target].y + offsetPos.y, -limit, limit);
                objOffset[target] = { x, y };
                scene.run();
            }
        }
        canvas.addEventListener('mouseup', () => {
            canvas.removeEventListener('mousemove', handleMove);
        });
    });
    document.querySelector('button').click();
};
export function renderer(face) {
    glass.update(face);
    leftLeg.update(face);
    scene.run();
}
export async function init(img, face) {
    let faceData = face;
    if (img) {
        faceData = await initFace(`/assets/${img}`);
        const bg = new RigidBody();
        bg.x = 0;
        bg.y = 0;
        await bg.load(`/assets/${img}`);
        bg.width = 375;
        bg.height = bg.width * bg.img.height / bg.img.width;
        scene.register(bg);
    }
    glass = new Glass(faceData.faceWidth, faceData.faceCenterX, faceData.faceCenterY, faceData.rotate);
    await glass.load('/assets/glass.png');
    // glass.x = 0
    // glass.y = 0
    // glass.width = 60
    // glass.height = 23.5
    scene.register(glass);
    leftLeg = new Leg(faceData);
    // const rightLeg = new Leg()
    // glass.bindLeft(leftLeg)
    // glass.bindRight(rightLeg)
    await leftLeg.load('/assets/leg.png');
    // await rightLeg.load('/assets/leg.png')
    scene.register(leftLeg);
    // scene.register(rightLeg)
    scene.run();
}
export function loadImage(url) {
    return new Promise(resolve => {
        const img = document.createElement('img');
        img.src = url;
        img.onload = (e) => {
            const node = e.target;
            resolve(node);
        };
    });
}
function ensureRange(val, min, max) {
    return Math.max(Math.min(val, max), min);
}
async function handleSelect(evt) {
    document.querySelector('#loading').innerHTML = '识别中';
    scene.clear();
    const { img } = evt.target.dataset;
    if (img === 'video') {
        scene.register(glass);
        scene.register(leftLeg);
        initStream();
        document.querySelector('#loading').innerHTML = '';
    }
    else {
        await init(img);
        document.querySelector('#loading').innerHTML = '';
    }
}
async function initStream() {
    const node = document.querySelector('video');
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 375, height: 580 } });
    node.srcObject = stream;
}
Array.from(document.querySelectorAll('button')).map(node => {
    node.addEventListener('click', handleSelect);
});
