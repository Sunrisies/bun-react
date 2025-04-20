importScripts('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');

const GIF = self.GIF;
let gif = null;

self.onmessage = function (e) {
    console.log(self, '--------')
    console.log(e.data); // log the message to the console for debugging purposes
    switch (e.data.type) {
        case 'start':
            gif = new GIF({
                workers: 2,
                quality: 10,
                width: e.data.width,
                height: e.data.height,
                workerScript: 'gif.worker.js'
            });
            break;

        case 'addFrame':
            gif.addFrame(e.data.data, { delay: e.data.delay });
            break;

        case 'render':
            gif.on('finished', function (blob) {
                self.postMessage({ url: URL.createObjectURL(blob) });
                gif = null;
            });
            gif.render();
            break;
    }
};