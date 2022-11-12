require('@tensorflow/tfjs-node');
const faceapi = require('@vladmandic/face-api');
const minConfidence = 0.5;
const faceDetectionOption = new faceapi.SsdMobilenetv1Options({ minConfidence });
const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
export async function run(file) {
    // const canvas = getCanvas()
    await faceDetectionNet.loadFromDisk('./weights');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./weights');
    // const img = await canvas.loadImage(file)
    const decodeT = faceapi.tf.node.decodeImage(file, 3);
    const expandT = faceapi.tf.expandDims(decodeT, 0);
    // const results = await faceapi.detectAllFaces(file, faceDetectionOption).withFaceLandmarks()
    const results = await faceapi.detectAllFaces(expandT, faceDetectionOption).withFaceLandmarks();
    faceapi.tf.dispose([decodeT, expandT]);
    console.log(parseFace(results[0]));
    return parseFace(results[0]);
}
function getCanvas() {
    const canvas = require('canvas');
    const { Canvas, Image, ImageData } = canvas;
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
    return canvas;
}
const VIEWPORT_WIDTH = 375;
function parseFace(data) {
    const scale = VIEWPORT_WIDTH / data.detection.imageWidth;
    const points = data.landmarks.getJawOutline();
    const standardLeft = points[0];
    const standardRight = points.slice(-1)[0];
    const offsetX = standardRight.x - standardLeft.x;
    const offsetY = standardRight.y - standardLeft.y;
    const _hypotenuse = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    const rotate = Math.asin(offsetY / _hypotenuse);
    const faceWidth = _hypotenuse;
    const { x, y } = data.landmarks.getNose()[0];
    return {
        rotate,
        faceWidth: faceWidth * scale,
        faceCenterX: x * scale,
        faceCenterY: y * scale,
        faceLeftX: standardLeft.x * scale,
        faceLeftY: standardLeft.y * scale,
        faceRightX: standardRight.x * scale,
        faceRightY: standardRight.y * scale,
    };
}
