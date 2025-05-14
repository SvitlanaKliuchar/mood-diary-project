import GIF from 'gif.js'
import { saveAs } from 'file-saver'; 
export function recordCanvasAsGif(canvas, duration = 5000, fps = 24, onComplete = () => {}) {
    console.log('GIF recording started');
  
    const gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: '/gif.worker.js',
    });
  
    const interval = 1000 / fps;
    let elapsed = 0;
  
    const captureInterval = setInterval(() => {
      gif.addFrame(canvas, { copy: true, delay: interval });
      elapsed += interval;
      if (elapsed >= duration) {
        clearInterval(captureInterval);
        gif.on('finished', blob => {
          saveAs(blob, 'generated_art.gif');
          onComplete(); 
        });
        gif.render();
      }
    }, interval);
  }
  