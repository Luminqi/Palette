import { Graph } from './color'
import { getPalette } from './getPalette'

export const Palette = (function () {
  let imagePromise = null
  const from = function (image) {
    imagePromise = new Graph().load(image)
    return this
  }
  const getColor = async function () {
    const img = await imagePromise
    const data = img.imgData.data
    if (window.Worker) {
      const worker = new Worker('worker.js')
      worker.postMessage(data)
      return new Promise((resolve) => {
        worker.onmessage = function (e) {
          resolve(e.data)
        }
      })
    } else {
      return getPalette(data)
    }
  }
  return {
    from,
    getPalette: getColor
  }
}())
