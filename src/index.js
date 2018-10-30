import { Graph } from './color'
import { getPalette } from './getPalette'

const Palette = (function () {
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


const container = document.getElementById('container')
const imgContainer = document.getElementById('imgContainer')
const input = document.getElementById('input')
input.addEventListener('change', displayPalette)
function displayPalette () {
  const image = input.files[0]
  const src =  window.URL.createObjectURL(image)
  imgContainer.innerHTML = `<img src=${src} />`
  Palette.from(src).getPalette().then(colors => {
    console.log(colors)
    const children = colors.reduce((prev, color) => {
      const [r, g, b] = color.value
      return `${prev}<div style='width: 50px; height: 50px; background-color: rgb(${r}, ${g}, ${b})'></div>`
    }, '')
    container.innerHTML = children
  })
}


