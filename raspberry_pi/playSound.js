const { exec } = require('child_process');

// Path to the audio file
const doorbell = 'audio/doorbell.wav';
const fire = 'audio/fire.wav';

// Play the audio file using VLC
const playAudio = (filePath) => {
    const command = `aplay -D hw:CARD=Headphones,DEV=0 ${filePath}`;

    exec(command)
};
//sound setup
playAudio(doorbell);
