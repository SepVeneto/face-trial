import * as faceapi from 'face-api.js'
const minConfidence = 0.5

const faceDetectionOption = new faceapi.SsdMobilenetv1Options({ minConfidence })
const faceDetectionNet = faceapi.nets.ssdMobilenetv1

export async function run() {
  const canvas = getCanvas()
  await faceDetectionNet.loadFromDisk('./weights')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./weights')

  const img = await canvas.loadImage('./imgs/4.jpg')
  const results = await faceapi.detectAllFaces(img, faceDetectionOption).withFaceLandmarks()

  console.log(results)
  return results
}

function getCanvas() {
  const canvas = require('canvas')
  const { Canvas, Image, ImageData } = canvas
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
  return canvas
}