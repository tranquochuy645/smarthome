const socketio = require('socket.io-client');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const NodeWebcam = require('node-webcam');

const server_url = 'https://huytran.tech';
const socket = socketio(server_url);
const databaseId = '642135fad6d53079497933c3';

const captureImagePath = path.join(__dirname, 'image.jpeg');

function snapShot(listeners) {
  const webcamOptions = {
    width: 160,
    height: 120,
    quality: 85,
    output: 'jpeg',
    saveShots: false,
    callbackReturn: 'buffer'
  };

  NodeWebcam.capture('', webcamOptions, (err, imageData) => {
    if (err) {
      console.error('Error capturing image:', err);
      return;
    }

    const imageBase64 = imageData.toString('base64');
    socket.emit('toSocketId', {
      socketId: listeners,
      message: {
        header: 'image',
        body: imageBase64
      }
    });

     // Exit the script
     process.exit();
  });
}

// Retrieve command-line arguments
const args = process.argv.slice(2);
const listeners = args[0].split(',');

snapShot(listeners);
