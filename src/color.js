export class Graph {
  constructor () {
    this.img = null
    this.imgData = null
  }

  getImgData () {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = this.img.width
    canvas.height = this.img.height
    context.drawImage(this.img, 0, 0)
    this.imgData = context.getImageData(0, 0, canvas.width, canvas.height)
  }

  load (image) {
    if (typeof image === 'string') {
      this.img = document.createElement('img')
      this.img.src = image
    } else if (image instanceof HTMLImageElement) {
      this.img = image
    } else {
      throw new Error('invalid image source')
    }
    return new Promise((resolve, reject) => {
      const onImgLoad = () => {
        this.getImgData()
        resolve(this)
      }
      if (this.img.complete) {
        onImgLoad()
      } else {
        this.img.onload = onImgLoad
        this.img.onerror = (e) => {
          reject(e)
        }
      }
    })
  }
}




