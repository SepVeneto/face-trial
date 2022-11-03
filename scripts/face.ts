// import * as faceapi from '../node_modules/face-api.js/build/es6/index.js'
// import * as faceapi from 'face-api.js'
import { loadImage } from './main.js'
const VIEWPORT_WIDTH = 375

type FaceLandmarks = faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>

export async function init(faceUrl: string) {
  await faceapi.nets.tinyFaceDetector.load('/')
  await faceapi.loadFaceLandmarkModel('/')
  const img = await loadImage(faceUrl)

  const inputSize = 512
  const scoreThreshold = 0.5
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })

  const result = await faceapi.detectAllFaces(img, options).withFaceLandmarks()
  return parseFace(result[0])
}

function parseFace(data: FaceLandmarks) {
  const scale = VIEWPORT_WIDTH / data.detection.imageWidth
  const points =  data.landmarks.getJawOutline()
  const standardLeft = points[0]
  const standardRight = points.slice(-1)[0]
  const offsetX = standardRight.x - standardLeft.x
  const offsetY = standardRight.y - standardLeft.y
  const _hypotenuse = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
  const rotate = Math.asin(offsetY / _hypotenuse)
  const faceWidth = _hypotenuse
  const { x, y } = data.landmarks.getNose()[0]
  return {
    rotate,
    faceWidth: faceWidth * scale,
    faceCenterX: x * scale,
    faceCenterY: y * scale,
    faceLeftX: standardLeft.x * scale,
    faceLeftY: standardLeft.y * scale,
    faceRightX: standardRight.x * scale,
    faceRightY: standardRight.y * scale,
  }
}
