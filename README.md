# Palette

Find the dominant colors in an image.

# How to use

Palette.from can accept &lt;img&gt; element or path

```javascript
Palette.from('/path/to/image').getPalette().then(colors => {
  // your code
})
```

```javascript
const img = document.getElementById('img')
Palette.from(img).getPalette().then(colors => {
  // your code
})
```

# What's the idea

* It will firstly start undersampling to reduce the image pixels.
* Compute the hue of each pixel and sort the pixels by their hue.
* Group the pixels with similar hue.
* Merge the groups if there are few pixels in them or their average colors are too close.

The time-consuming computation process is run in WebWorker.