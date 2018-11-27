export function getPalette (buffer) {
  const data = new Uint8ClampedArray(buffer)
  const { sortedData, total } = processData(data)
  const binArr = binning(sortedData, total)
  const result = mergeBins(binArr)
  return result.map(bin => {
    const percent = (bin.data.length / ( 3 * total)).toFixed(3)
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

function processData (data) {
  const processedData = []
  const length = data.length
  const ratio = length <= 5000 ? 1 : Math.round(length / 5000)
  for (let i = 0; i <= length - 4; i = i + 4 * ratio) {
    const hue = getHue(data[i], data[i + 1], data[i + 2])
    processedData.push(data[i], data[i + 1], data[i + 2], hue)
  }
  return { sortedData: sortByHue(processedData), total: processedData.length / 4 }
}

function getHue (r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let hue = null
  switch (max) {
    case min: {
      return 0
    }
    case r: {
      hue = (g - b) / (max - min)
      break
    }
    case g: {
      hue = 2 + (b - r) / (max - min)
      break
    }
    case b: {
      hue = 4 + (r - g) / (max - min)
    }
  }
  hue = hue * 60
  if (hue > 360) hue = hue - 360
  if (hue < 0) hue = hue + 360
  return Math.round(hue)
}

function sortByHue (a) {
  let l = a.length
  let b = []
  let c = []
  let j = 0
  for (let i = 0; i <= 360; i ++) {
    c[i] = []
  }
  for (let i = 0; i <= l - 4; i = i + 4) {
    c[a[i + 3]].push(a[i], a[i + 1], a[i + 2])
  }
  for (let i = 0; i <= 360; i ++) {
    if (c[i].length) {
      b[j] = [i]
      b[j].push(c[i])
      j = j + 1
    }
  }
  return b
}

function binning (sortedData, total) {
  const binArr = []
  const rec = function (data) {
    const length = data.length
    const start = data[0][0]
    const end = data[length - 1][0]
    const mid = Math.floor((end + start) / 2)
    const data1 = []
    const data2 = []
    for (let i = 0; i <= length - 1; i ++) {
      if (data[i][0] <= mid) {
        data1.push(data[i])        
      } else {
        data2.push(data[i])
      }
    }
    if (shouldComplete(data1)) {
      const bin1 = new Bin(data1, total)
      binArr.push(bin1)
    } else {
      rec(data1)
    }
    if (shouldComplete(data2)) {
      const bin2 = new Bin(data2, total)
      binArr.push(bin2)
    } else {
      rec(data2)
    }
  }
  rec(sortedData)
  return binArr
}

function shouldComplete (data) {
  const length = data.length
  const start = data[0][0]
  const end = data[length - 1][0]
  let total = 0
  for (let i = 0; i <= length - 1; i ++) {
    total = total + data[i][1].length
  }
  return total <= 3 || (end - start) <= 36  
} 

function mergeBins (binArr) {
  let length = binArr.length
  if (!length) {
    throw new error('faild to extract colors')
  }
  let i = 0
  do {
    if (length === 1) {
      return
    }
    if (binArr[i].trivial || getDistance(binArr[i + 1].average, binArr[i].average) <= 36) {
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
  return binArr
}

function getDistance ([r1, g1, b1], [r2, g2, b2]) {
  return Math.pow((r1 - r2), 2) + Math.pow((g1 - g2), 2) + Math.pow((b1 - b2), 2)
}

class Bin {
  constructor (data, total) {
    this.data = this.ignoreHue(data)
    this.total = total
    this.trivial = this.isTrivial()
    this.average = this.getAvarage()
  }
  ignoreHue (data) {
    return data.reduce((prev, curr) => {
      prev.push(...curr[1])
      return prev
    }, [])
  }
  merge (bin) {
    const newData = bin.data
    this.data = [...newData, ...this.data]
    this.trivial = this.isTrivial()
    this.average = this.getAvarage()
  }
  isTrivial () {
    return this.data.length / 3 <= Math.ceil(this.total / 50)
  }
  getAvarage () {
    let r = 0
    let g = 0
    let b = 0
    const data = this.data
    const length = data.length
    for (let i = 0; i <= length - 3; i = i + 3) {
      r = r + data[i]
      g = g + data[i + 1]
      b = b + data[i + 2]
    }
    return [r, g, b].map(v => Math.round(3 * v / length))
  }
}