class Pic {
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
    console.log(this.imgData)
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

function countingSort (a, k) {
  let l = a.length,
    b = [], 
    c = [];
  for (let i = 0; i <= k; i ++) {
    c[i] = 0;
  }
  for (let i = 0; i <= l - 1; i ++) {
    c[a[i]] = c[a[i]] + 1;
  }
  for (let i = 1; i <= k; i ++) {
    c[i] = c[i] + c[i - 1];
  }
  for (let i = l - 1; i >= 0; i --) {
    b[c[a[i]] - 1] = a[i];
    c[a[i]] = c[a[i]] - 1;  
  }
  return b;
}

class Channel {
  constructor (value) {
    this.pixelValue = value
    this.total = value.length
    this.binArr = []
  }
  getDominant () {
    const sorted = countingSort(this.pixelValue, 255)
    this.pixelValue = sorted
    this.channelizedBinning(sorted)
    this.mergeBins()
    return this.binArr.map(bin => {
      const percent = bin.data.length / this.total
      return {
        value: bin.average,
        percent
      }
    }).sort(
      ({percent: p1}, {percent: p2}) => {
        if (p1 > p2) {
          return -1
        } else if (p1 < p2) {
          return 1
        } else {
          return 0
        }
      }
    )
  }
  channelizedBinning (pixels) {
    let length = pixels.length
    let start = pixels[0]
    let end = pixels[length - 1]
    let mid = Math.floor((end + start) / 2)
    let bin1 = new Bin(mid, this.total)
    let bin2 = new Bin(end, this.total)
    for (let i = 0; i <= length - 1; i ++) {
      if (pixels[i] <= mid) {
        bin1.push(pixels[i])        
      } else {
        bin2.push(pixels[i])
      }
    }
    if (bin1.shouldComplete()) {
      this.binArr.push(bin1)
    } else {
      this.channelizedBinning(bin1.data)
    }
    if (bin2.shouldComplete()) {
      this.binArr.push(bin2)
    } else {
      this.channelizedBinning(bin2.data)
    }
  }

  mergeBins () {
    const binArr = this.binArr
    let length = binArr.length
    if (!length) {
      throw new error('faild to extract colors')
    }
    let i = 0
    do {
      if (length === 1) {
        return
      }
      if (binArr[i].trivial || binArr[i + 1].average - binArr[i].average <= 10) {
        binArr[i + 1].merge(binArr[i])
        binArr.splice(i, 1)
        length = length - 1
        continue
      }
     i = i + 1
    } while (i < length - 1)
    if (binArr[i].trivial) {
      binArr[i].merge(binArr[i - 1])
      binArr.splice(i - 1, 1)
    }
  }
}

class Palette {
  constructor () {
    this.redChannel = null
    this.greenChannel = null
    this.blueChannel = null
    this.palette = null
  }
  async from (image) {
    const img = await new Pic().load(image)
    const data = img.imgData.data
    const length = data.length
    const ratio = length <= 10000 ? 1 : Math.round(length / 10000)
    const redValue = []
    const greenValue = []
    const blueValue = []
    for (let i = 0; i <= data.length - 1; i = i + 4 * ratio) {
      redValue.push(data[i])
      greenValue.push(data[i + 1])
      blueValue.push(data[i + 2])
    }
    this.redChannel = new Channel(redValue)
    this.greenChannel = new Channel(greenValue)
    this.blueChannel = new Channel(blueValue)
    return this
  }
  getPalette () {
    const redDominant = this.redChannel.getDominant()
    const greenDominant = this.greenChannel.getDominant()
    const blueDominant = this.blueChannel.getDominant()
    const redLength = redDominant.length
    const greenLength = greenDominant.length
    const blueLength = blueDominant.length
    const minLength = Math.min(redLength, greenLength, blueLength)
    const palette = []
    for (let i = 0; i <= minLength - 1; i ++) {
      const {value: r, percent: p1} = redDominant[i]
      const {value: g, percent: p2} = greenDominant[i]
      const {value: b, percent: p3} = blueDominant[i]
      const color = {r, g, b, p: ((p1 + p2 + p3) / 3).toFixed(2)}
      palette.push(color)
    }
    this.palette = palette
    return palette
  }
}

class Bin {
  constructor (end, total) {
    this.end = end
    this.total = total
    this.data = []
    this.average = null
    this.trivial = false
  }
  push (value) {
    this.data.push(value)
  }
  merge (bin) {
    const newData = bin.data
    this.data = [...newData, ...this.data]
    this.complete()
  }
  shouldComplete () {
    const length = this.data.length
    const start = this.data[0]
    const end = this.data[length - 1]
    if (length <= 1 || end - start <= 2.55) {
      this.end = end
      this.complete()
      return true
    }
    return false
  }
  complete () {
    this.average = this.getAvarage()
    this.trivial = this.isTrivial()
  }
  isTrivial () {
    return this.data.length <= Math.ceil(this.total / 20)
  }
  getAvarage () {
    let sum = 0
    const length = this.data.length
    for (let i = 0; i <= length - 1; i ++) {
      sum = sum + this.data[i]
    }
    return Math.round(sum / length)
  }
}


const container = document.getElementById('container')
const p = new Palette().from('./img5.jpg').then(plt => {
  const color = plt.getPalette()
  console.log(plt)
  console.log(color)
  for (let i = 0; i < color.length; i ++) {
    const box = document.createElement('div')
    const {r, g, b} = color[i]
    box.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
    box.style.width = '50px'
    box.style.height = '50px'
    container.appendChild(box)
  }
})
console.log(p)




