import Koa from 'koa'
import Router from 'koa-router'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { run } from './faceDetection'

const app = new Koa()
const router = new Router()

app.use(logger())
app.use(koaBody({ multipart: true }))

router.post('/face/detection', async (ctx, next) => {
  const { file } = ctx.request.files
  if (!file) {
    /** TODO */
    return await next()
  }
  const _file = Array.isArray(file) ? file[0] : file
  const reader = fs.createReadStream(_file.filepath)
  const stream = fs.createWriteStream(path.resolve(__dirname, 'imgs', _file.originalFilename))
  reader.pipe(stream)
  await run()
  console.log('uploading %s -> %s', _file.originalFilename, stream.path)

  ctx.response.body = 'success'
})

app.use(router.routes())

app.use(async (ctx, next) => {
  const res = ctx.response.body
  ctx.response.body = {
    code: 0,
    msg: null,
    data: res
  }
  await next()
})

app.listen(9000)
console.log('listen 9000...')