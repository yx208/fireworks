class Sound {

    /** @type { AudioBuffer } */
    audioBuffer = null;

    constructor(url) {
        this.audioContext = new AudioContext();
        this.preload(url);
    }

    preload(url) {
        fetch(url)
            .then(res => {
                if (res.status >= 200 && res.status < 300) {
                    return res;
                } else {
                    throw new Error(res.statusText);
                }
            })
            .then(res => res.arrayBuffer())
            .then(data => this.audioContext.decodeAudioData(data))
            .then(buffer => this.audioBuffer = buffer);
    }

    async play() {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBuffer;
        source.connect(this.audioContext.destination);
        source.start(0, 0);
    }
}

class Controller {

    static stop = '<svg fill="white" width="24" height="24"><use href="#icon-sound-off"></use></svg>';
    static playing = '<svg fill="white" width="24" height="24"><use href="#icon-sound-on"></use></svg>';

    constructor() {
        this.isPlay = false;
        this.ele = document.querySelector('.sound-btn');
        this.listen();
    }

    listen() {
        this.ele.onclick = () => {
            this.ele.innerHTML = this.isPlay ? Controller.stop : Controller.playing;
            this.isPlay = !this.isPlay;

            SoundManager.lift = new Sound(soundConfig.baseURL + soundConfig.lift1);
            SoundManager.burst = new Sound(soundConfig.baseURL + soundConfig.burst1);
        }
    }
}

new Controller();
