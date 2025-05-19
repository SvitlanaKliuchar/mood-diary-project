import GIF from 'gif.js';

export function recordCanvasAsGif(canvas, { duration = 2000, fps = 24 } = {}) {
  return new Promise(resolve => {
    // get the canvas dimensions to maintain aspect ratio
    const width = canvas.width;
    const height = canvas.height;

    // pass width and height to the GIF constructor
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: width, 
      height: height,
      workerScript: '/gif.worker.js'
    });

    const delay = 1000 / fps;
    let t = 0;
    const id = setInterval(() => {
      gif.addFrame(canvas, { copy: true, delay });
      t += delay;
      if (t >= duration) {
        clearInterval(id);
        gif.on('finished', blob => resolve(blob));
        gif.render();
      }
    }, delay);
  });
}