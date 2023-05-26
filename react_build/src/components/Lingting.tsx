import React, { useEffect, useState } from 'react';
import './Lighting.css';
import GetSocket from "./GetSocket";


interface LightingProps {
  RaspSocketId: Array<any>;
  lighting_data:any;
};
const Lighting: React.FC<LightingProps> = ({ RaspSocketId,lighting_data }) => {
  
  //initial state
  const [brightness, setBrightness] = useState<number>(50);
  const [colorR, setColorR] = useState<number>(255);
  const [colorG, setColorG] = useState<number>(255);
  const [colorB, setColorB] = useState<number>(255);
  const [colorRGB, setColorRGB] = useState<string>("rgb(255, 255, 255)");
  //initial state
  useEffect(()=>{
    if(lighting_data!==undefined){
      setBrightness(lighting_data.brightness);
      setColorR(lighting_data.RGB.red);
      setColorG(lighting_data.RGB.green);
      setColorB(lighting_data.RGB.blue);
      setColorRGB(`rgb(${colorR},${colorG},${colorB})`);
    };
  },[lighting_data]);
  
  const socket = GetSocket();
  const handleBrightnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    setBrightness(Number(event.target.value));
    socket.emit("toSocketId",
      {
        socketId: RaspSocketId,
        message: {
          header: "BRIGHTNESS",
          body: Number(event.target.value)
        }
      })
  };

  const handleColorRChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    
    setColorR(Number(event.target.value));
    setColorRGB(String(`rgb(${Number(event.target.value)},${colorG},${colorB})`));
    socket.emit("toSocketId",
      {
        socketId: RaspSocketId,
        message: {
          header: "RGB",
          body: {
            red: Number(event.target.value),
            green: colorG,
            blue: colorB
          }
        }
      });
  };

  const handleColorGChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorG(Number(event.target.value));
    setColorRGB(String(`rgb(${colorR},${Number(event.target.value)},${colorB})`));
    socket.emit("toSocketId",
      {
        socketId: RaspSocketId,
        message: {
          header: "RGB",
          body: {
            red: colorR,
            green: Number(event.target.value),
            blue: colorB
          }
        }
      });
  };

  const handleColorBChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorB(Number(event.target.value));
    setColorRGB(String(`rgb(${colorR},${colorG},${Number(event.target.value)})`));
    socket.emit("toSocketId",
      {
        socketId: RaspSocketId,
        message: {
          header: "RGB",
          body: {
            red: colorR,
            green: colorG,
            blue: Number(event.target.value)
          }
        }
      });
  };

  const rgbValue = `rgb(${colorR}, ${colorG}, ${colorB})`;

  return (
    <div id="lighting">
      <h1>Lighting</h1>
      <div className="flex-container">
        <div className="color-range-container">
          <p className="large-text">Brightness</p>

          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            className="slider"
            id="brn"
            onChange={handleBrightnessChange}
          />
        </div>
        <div className="color-output-container">
          <output id="brn_value" className="large-text">
            {brightness}
          </output>
          <span className="large-text">%</span>
        </div>
      </div>

      <div>

        <div className="flex-container">

          <div className="color-range-container">
            <p className="large-text">Color RGB</p>
            <input
              type="range"
              min="0"
              max="255"
              value={colorR}
              className="slider"
              id="color_R"
              onChange={handleColorRChange}
            />
            <input
              type="range"
              min="0"
              max="255"
              value={colorG}
              className="slider"
              id="color_G"
              onChange={handleColorGChange}
            />
            <input
              type="range"
              min="0"
              max="255"
              value={colorB}
              className="slider"
              id="color_B"
              onChange={handleColorBChange}
            />
          </div>

          <div className="color-output-container">
            
            <output id="RGB_value" className="color-output">
              {rgbValue}
            </output>
            <div id="RGB" className="color-output" style={{backgroundColor:colorRGB}} ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lighting;
