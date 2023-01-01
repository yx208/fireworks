const soundConfig = {
    baseURL: location.origin + '/resource/',
    lift1: 'lift1.mp3',
    lift2: 'lift2.mp3',
    lift3: 'lift2.mp3',
    burst1: 'burst1.mp3',
}

const SoundManager = {
    lift: null,
    burst: null
}

// new Sound(soundConfig.baseURL + soundConfig.lift1)
