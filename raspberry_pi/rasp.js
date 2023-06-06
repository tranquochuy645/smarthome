
//initialise socket.io
const socketio = require('socket.io-client');
const server_url = 'https://huytran.tech';
const socket = socketio(server_url);
const databaseId = '642135fad6d53079497933c3';
//initialise socket.io


//sound setup
const { exec } = require('child_process');

// Path to the audio file
const doorbell = 'audio/doorbell.wav';
const fire = 'audio/fire.wav';

// Play the audio file using VLC
const playAudio = (filePath) => {
    const command = `aplay -D hw:CARD=Headphones,DEV=0 ${filePath}`;

    exec(command);
};
//sound setup

//initialize 
let date = new Date();
socket.emit('toMyDatabase', {
    databaseId: databaseId,
    method: 'set',
    data: { "rasp_online": date },
    timestamp: false
});
//hanshake
var listeners = [];
function removeElementFromArray(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}
socket.on('handShake', (app_socketId) => {
	
    if (!listeners.includes(app_socketId)) {
        listeners.push(app_socketId);
        console.log("app is online " + app_socketId);




        socket.on('offline', e => {
            if (e == app_socketId) {
                removeElementFromArray(listeners, app_socketId);

                console.log("app is offline");
            }
        });

    }
})
//handshake

//camera controller
const Webcam = require('node-webcam');
 var opts = {
     width: 848,
     height: 480,
     frames: 1,
     quality: 100,

     // callbackReturn: "base64",
     callbackReturn: "buffer", // Set the callbackReturn option to "buffer"
     output: "jpeg" // Set the output option to "jpeg"
     // delay: 0
 };

function snapShot() {
    // console.log(listeners);
    Webcam.capture('image', opts, (err, data) => {
        if (err) {
            console.log(err);
           console.log('err');
            return;
        }
  
            socket.emit('toSocketId',
                {
                    socketId: listeners[0],
                    message: {
                        header: "image",
                        body: data
                    }
                });

       
    });
};

//camera controller



// lighting controler and other listeners
var Gpio = require('pigpio').Gpio;
motion = new Gpio(26, { mode: Gpio.INPUT }); //motion detect
ledRed = new Gpio(27, { mode: Gpio.OUTPUT }); //use GPIO pin 17 as output for RED
ledGreen = new Gpio(17, { mode: Gpio.OUTPUT }); //use GPIO pin 27 as output for GREEN
ledBlue = new Gpio(22, { mode: Gpio.OUTPUT }); //use GPIO pin 22 as output for BLUE
//RESET RGB LED
ledRed.digitalWrite(1); // Turn RED LED off
ledGreen.digitalWrite(1); // Turn GREEN LED off
ledBlue.digitalWrite(1); // Turn BLUE LED off
process.on('SIGINT', function () { //on ctrl+c
    motion.mode(Gpio.INPUT);
    ledRed.digitalWrite(1); // Turn RED LED off
    ledGreen.digitalWrite(1); // Turn GREEN LED off
    ledBlue.digitalWrite(1); // Turn BLUE LED off
    process.exit(); //exit completely
});
var brightness = 100;
var RGB_received = {
    red: 0,
    green: 0,
    blue: 0,
}
var RGB = {
    red: 0,
    green: 0,
    blue: 0,
};
var R;
var G;
var B;
var lastBr;
function handleBrightChange(message) {
    brightness = message.body;
    console.log(message.body);
    if (brightness > 0) {
        RGB.red = RGB.red * (brightness / lastBr);
        RGB.green = RGB.green * (brightness / lastBr);
        RGB.blue = RGB.blue * (brightness / lastBr);
        R = parseInt(255 - RGB.red);
        G = parseInt(255 - RGB.green);
        B = parseInt(255 - RGB.blue);
        lastBr = brightness;
        ledRed.pwmWrite(R); //set RED LED to specified value
        ledGreen.pwmWrite(G); //set GREEN LED to specified value
        ledBlue.pwmWrite(B); //set BLUE LED to specified value
    } else {
        ledRed.pwmWrite(255); //set RED LED to specified value
        ledGreen.pwmWrite(255); //set GREEN LED to specified value
        ledBlue.pwmWrite(255); //set BLUE LED to specified value
    }
}
function handleColorChange(message) {
    RGB_received = message.body;
    RGB = message.body;
    if (brightness > 0) {
        RGB.red = RGB.red * (brightness / 100);
        RGB.green = RGB.green * (brightness / 100);
        RGB.blue = RGB.blue * (brightness / 100);

        R = parseInt(255 - RGB.red);
        G = parseInt(255 - RGB.green);
        B = parseInt(255 - RGB.blue);
        lastBr = brightness;

        console.log(message.body);
        ledRed.pwmWrite(R); //set RED LED to specified value
        ledGreen.pwmWrite(G); //set GREEN LED to specified value
        ledBlue.pwmWrite(B); //set BLUE LED to specified value
    }
}
//lighting controller 

//dht11 controler + bmp180 controller
const sensor = require('node-dht-sensor');
const bmp180 = require('bmp180-sensor');
let dht;
let bmpPressure;
let bmpTemperature;
let fire_test = false;
async function readBmp180() {

    const sensor = await bmp180({
        address: 0x77,
        mode: 1,
    });

    const data = await sensor.read();
    bmpPressure = data.pressure;
    if (fire_test) {
        bmpTemperature = 200;
        fire_test = false;
    } else {
        bmpTemperature = data.temperature;
    }
    // console.log(bmpPressure);
    // console.log(bmpTemperature);

    await sensor.close();

}
async function readAndSendDHT11Data() {
    dht = sensor.read(11, 4);
    // console.log(dht);
    await readBmp180();


    if (!isNaN(dht.temperature) && !isNaN(dht.humidity) && !isNaN(bmpPressure) && !isNaN(bmpTemperature)) {
        if (dht.temperature * dht.humidity * bmpPressure * bmpTemperature !== 0) {
            dht.temperature = (dht.temperature + bmpTemperature) / 2;
            if (dht.temperature < 50) {
                const data = {
                    sensor: {
                        temp: dht.temperature,
                        humi: dht.humidity,
                        press: bmpPressure
                    }
                };
                console.log(data);
                socket.emit('toMyDatabase', {
                    databaseId: databaseId,
                    method: 'push',
                    data: data,
                    timestamp: true
                });
            } else {
                console.log('firefirefirefire');
                playAudio(fire);
                socket.emit(
                    'toSocketId',
                    {
                        socketId: listeners,
                        header: 'fireAlert',
                        temperature: dht.temperature
                    }
                );
                snapShot();


                socket.emit('toMyDatabase',
                    {
                        databaseId: databaseId,
                        method: 'set',
                        data: { FireAlert: dht.temperature },
                        timestamp: true
                    }
                );
               // ledRed.pwmWrite(255); // Turn RED LED off
               // ledGreen.pwmWrite(255); // Turn GREEN LED off
               // ledBlue.pwmWrite(255); // Turn BLUE LED off
                    ledRed.pwmWrite(0);

                    setTimeout(() => {
                        ledRed.pwmWrite(255);
                    }, 1000);
                    setTimeout(() => {
                        ledRed.pwmWrite(0);
                    }, 2000);
                    setTimeout(() => {
                        ledRed.pwmWrite(255);
                    }, 3000);
                    setTimeout(() => {
                        ledRed.pwmWrite(0);
                    }, 4000);
                    setTimeout(() => {
                        ledRed.pwmWrite(255);
                    }, 5000);


            }
        } else {
            console.error("Sensor error");
        }
    }
}
//dht11 controller  + bmp180 controller






//event listeners
socket.on('remote', message => {
    console.log(message);
    try {
        if (message.header == "BRIGHTNESS") {

            handleBrightChange(message);
        } else if (message.header == "RGB") {
            handleColorChange(message);
        } else if (message.header == "snapshot") {
            snapShot();
        } else if (message.header == "firetest") {
            fire_test = true;
        }
    } catch (err) {
        console.log(err);
    }
})
//event listeners




//update data
let ring=false;
setInterval(() => {
   if(motion.digitalRead && !ring){
   ring=true;
   playAudio(doorbell);
   snapShot();
   setTimeout(()=>{ ring=false;},5000);
   console.log("ring ring");
 }
},500);
setInterval(() => {

    socket.emit('toMyDatabase', {
        databaseId: databaseId,
        method: 'set',
        data: {
            "lighting.RGB": {
                red: RGB_received.red,
                green: RGB_received.green,
                blue: RGB_received.blue
            },
            "lighting.brightness": brightness
        },
        timestamp: false
    });
    //snapShot();
    readAndSendDHT11Data();

}, 5000);//send 1 per 5s
// update data
