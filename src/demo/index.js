import { Palette } from '../palette'
import img from '../images/img10.png'

const container = document.getElementById('container')
const imgContainer = document.getElementById('imgContainer')
const input = document.getElementById('input')
input.addEventListener('change', displayPalette)
function displayPalette () {
  const image = input.files[0]
  const src =  window.URL.createObjectURL(image)
  imgContainer.innerHTML = `<img class='img' src=${src} />`
  Palette.from(src).getPalette().then(colors => {
    const children = colors.reduce((prev, color) => {
      const [r, g, b] = color.value
      return `${prev}<div class='color' style='background-color: rgb(${r}, ${g}, ${b})'></div>`
    }, '')
    container.innerHTML = children
  })
}

window.addEventListener('load', () => {
  Palette.from(img).getPalette().then(colors => {
    const children = colors.reduce((prev, color) => {
      const [r, g, b] = color.value
      return `${prev}<div class='color' style='background-color: rgb(${r}, ${g}, ${b})'></div>`
    }, '')
    container.innerHTML = children
  })
})
