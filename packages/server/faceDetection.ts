import * as tf from '@tensorflow/tfjs-core'
import * as faceapi from 'face-api.js'
import * as fs from 'node:fs'
const minConfidence = 0.5

const faceDetectionOption = new faceapi.SsdMobilenetv1Options({ minConfidence })
const faceDetectionNet = faceapi.nets.ssdMobilenetv1

export async function run() {
  await faceDetectionNet.load('./weights')

  // const img = await 
  const reader = fs.createReadStream('./imgs/4.jpg')
  const res = fs.readFileSync('./imgs/4.jpg')

  const detections = await faceapi.detectAllFaces(typedArray)
}

function loadImage(url: string) {
  return new Promise(resolve => {
    const img = new Image()
  })
}