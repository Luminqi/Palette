import { getPalette } from './getPalette'

onmessage = function (e) {
  const palette = getPalette(e.data)
  postMessage(palette)
}