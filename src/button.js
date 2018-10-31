import VanillaTilt from 'vanilla-tilt'

const btnWrapper = document.getElementById('button-wrapper')
const svgContainer = document.getElementById('svg-container')
const btn = document.getElementById('button')
const input = document.getElementById('input')

function remove (e) {
  const event = e || window.event
  const target = event.target || event.srcElement
  svgContainer.removeChild(target)
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

VanillaTilt.init(btn, {
  scale: 1.1, speed: 1000
})

function explode () {
  
  const symbolArray = [
    '#donut',
    '#circle',
    '#tri_hollow',
    '#triangle',
    '#square',
    '#squ_hollow'
  ];
  
  const particles = 10
  let children = ''

  for (let i = 0; i < particles; i++) {
    const randomSymbol = rand(0, symbolArray.length - 1)
    // positioning x,y of the particles
    const x = (btnWrapper.offsetWidth / 2) + rand(120, 200) * Math.cos(Math.PI * Math.random())
    const y = (btnWrapper.offsetHeight / 2) + rand(80, 150) * Math.cos(Math.PI * Math.random())
    const deg = rand(0, 360) + 'deg'
    const scale = rand(0.5, 1.1)
    // particle element creation
    children = children +  `
      <svg
        class="symbol"
        style="top: ${y}px; left: ${x}px; transform: scale(${scale}) rotate(${deg});"
      >
      <use xlink:href="${symbolArray[randomSymbol]}" />
      </svg>
    `
  }

  svgContainer.innerHTML = children
  const elements = [...document.getElementsByClassName('symbol')]
  elements.forEach(elm => {
    elm.addEventListener('webkitAnimationEnd', remove)
    elm.addEventListener('animationend', remove)
  })
}

function handleClick () {
  explode()
  input.click()
}

btn.addEventListener('click', handleClick)
