import React, { useEffect, useState } from "react";
import GetSocket from "./GetSocket";
import './Camera.css';

interface CameraProps {
  onImage: () => void;
  RaspSocketId: Array<any>;
}

const Camera: React.FC<CameraProps> = ({ onImage, RaspSocketId }) => {
  const [imgBase64, setImageBase64] = useState("");
  const [img_time, setImage_time] = useState("");
  const socket = GetSocket();

  const onSnapshot = () => {
    socket.emit('toSocketId', {
      socketId: RaspSocketId,
      message: {
        header: "snapshot"
      }
    });
  };

  const onFireTest = () => {
    socket.emit('toSocketId', {
      socketId: RaspSocketId,
      message: {
        header: "firetest"
      }
    });
  }

  useEffect(() => {
    socket.on("remote", (message: any) => {
      if (message.header === "image") {
        const time= new Date();
        onImage(); // Switch to camera section
        console.log("image");
        setImageBase64(message.body);
        setImage_time(time.toLocaleString());
      } else if (message.header === "fireAlert") {
        alert("Fire alert !! " + message.temperature);
      }
    });
  }, []);

  return (
    <div id="Camera">
      {img_time!==""?(<p>{img_time}</p>):(null)}
      <img src={imgBase64} alt="img" width="848px" height="480px" />
      <div>
        <button onClick={onSnapshot}>SnapShot</button>
        <button onClick={onFireTest}>Fire Test</button>
      </div>
    </div>
  );
};

export default Camera;
