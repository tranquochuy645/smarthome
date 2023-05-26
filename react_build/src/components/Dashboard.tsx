import React, { useEffect } from "react";
import { useState } from "react";
import "./Dashboard.css";

// Components
import Spotify from "./Spotify";
import SpotifyLogin from "./SpotifyLogin";
import Camera from "./Camera";
import Lighting from "./Lingting";
import GetSocket from "./GetSocket";
import Sensors from "./Sensors";

interface DashboardProps {
  onLogout: () => void;
  token: string;
}

enum Section {
  Spotify = "spotify",
  Camera = "camera",
  Lighting = "lighting",
  Sensors = "Sensors",
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, token }) => {
  // Check if token is available in sessionStorage and assign it if not provided as prop
  if (token == null || token == "") {
    token = sessionStorage.getItem('token') || "";
  };

  // State variables
  const [RaspSocketId, setRaspSocketId] = useState([]);
  const [lighting_data, setLightingData] = useState(undefined);
  const [Sensors_data, setSensors] = useState(undefined);
  const [currentSection, setCurrentSection] = useState(sessionStorage.getItem("currentSection") || Section.Lighting);
  const [spotify_accessTK,setSpotifyAccessTK] = useState("");
  // Fetch Raspberry Pi socket ID
  function GetDevice(token: string) {
    fetch("/api/get_devices", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((rasp_socketId) => {
          setRaspSocketId(rasp_socketId);
          
          socket.emit("handShake", rasp_socketId);
          
        });
      } else {
        console.error(response.status);
      }
    });
  }

  // Perform initial handshake and data retrieval
  function handShake() {
    if (token != "" && token != null) {
      GetData(token);
      GetDevice(token);
    } else {
      alert("Please login again");
    }
  }

  // Fetch data from server
  function GetData(token: string) {
    fetch('/api/get_data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(d => {
      setLightingData(d.lighting);
      setSensors(d.sensor);
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      alert("Invalid token, please login again");
      pre_onLogout();
    });
  }

  // Get code from URL parameter for Spotify login flow
  function getCode() {
    let code = null;
    var queryString = window.location.search;
    if (queryString.length > 0) {
      var urlParams = new URLSearchParams(queryString);
      code = urlParams.get('code');
      window.history.pushState("", "", window.location.protocol + "//" + window.location.host);
    }
    return code;
  }

  // Define constants for Spotify login flow
  const client_id = "84d53fd1231f4dc29b0ead913a741764";
  const redirect_uri = window.location.protocol + "//" + window.location.host;
  const scopes = ["user-read-playback-state", "user-modify-playback-state", "user-read-private", "streaming"];
  var code: string | null = getCode();

  // If a code parameter is present in the URL, use it to fetch an access token from the server
  if (code !== null) {
    fetch('/api/fetch_access_token', {
      headers: {
        code: code,
        redirect_uri: redirect_uri
      }
    }).then((response) => {
      response.json().then((data) => {
        const access_token = data.access_token;
        const refresh_token = data.refresh_token;
        sessionStorage.setItem("access_token", access_token);
        setSpotifyAccessTK(access_token);
        sessionStorage.setItem("refresh_token", refresh_token);
        sessionStorage.setItem('isLoggedInSpotify', "true");
      });
    });
  }

  // Create a socket instance and fetch the Raspberry Pi's socket ID
  const socket = GetSocket();

  useEffect(() => {
    handShake();
  }, [token]);

  // Event handlers
  // Handle the Spotify login flow
  const handleLogInSpotify = () => {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scopes.join("%20")}`;
  };

  // Handle the Spotify logout flow
  const handleLogOutSpotify = () => {
    sessionStorage.setItem("isLoggedInSpotify", "false");
    sessionStorage.setItem("access_token", "");
    setSpotifyAccessTK("");
  };

  // Switch section
  const handleNavButtonClick = (section: Section) => {
    sessionStorage.setItem("currentSection", section);
    setCurrentSection(section);
  };

  const handleOnImage = () => {
    handleNavButtonClick(Section.Camera);
  }

  const pre_onLogout = () => {
    sessionStorage.setItem("isLoggedInSpotify", "false");
    sessionStorage.setItem("access_token", "");
    onLogout();
  };

  return (
    <div id="Dashboard">
      <nav>
        <button
          className={currentSection === Section.Lighting ? "active" : ""}
          onClick={() => handleNavButtonClick(Section.Lighting)}
        >
          Lighting
        </button>
        <button
          className={currentSection === Section.Camera ? "active" : ""}
          onClick={() => handleNavButtonClick(Section.Camera)}
        >
          Camera
        </button>
        <button
          className={currentSection === Section.Sensors ? "active" : ""}
          onClick={() => handleNavButtonClick(Section.Sensors)}
        >
          Sensors
        </button>
        <button
          className={currentSection === Section.Spotify ? "active" : ""}
          onClick={() => handleNavButtonClick(Section.Spotify)}
        >
          Spotify
        </button>
      </nav>
      <div className="flexbox">
        {currentSection === Section.Spotify ? (
          <section>
            <Spotify onLogOutSpotify={handleLogOutSpotify} accessToken={spotify_accessTK} />
            <SpotifyLogin onLogInSpotify={handleLogInSpotify} />
          </section>
        ) : null}
        {currentSection === Section.Camera ? (
          <section>
            <Camera RaspSocketId={RaspSocketId} onImage={handleOnImage} />
          </section>
        ) : null}
        {currentSection === Section.Lighting ? (
          <section>
            <Lighting RaspSocketId={RaspSocketId} lighting_data={lighting_data} />
          </section>
        ) : null}
        {currentSection === Section.Sensors ? (
          <section>
            <Sensors Sensors_data={Sensors_data} />
          </section>
        ) : null}
        <aside>
          {RaspSocketId.length==0 ? (
            <p className="offline">RaspberryPi is offline</p>
          ) : (
            <p className="online">RaspberryPi is online</p>
          )}
          <div>
            <div className="refresh-button" onClick={handShake}>
              <svg width="30px" height="30px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
                <path fill="#000000" fillRule="evenodd" d="M7.997 16.99a1 1 0 10.292-1.98C5.89 14.657 4 12.508 4 9.86c0-2.294 1.416-4.21 3.358-4.914L6.367 7.25a1 1 0 101.837.79L9.92 4.053a1 1 0 00-.256-1.143l-3-2.658a1 1 0 10-1.326 1.496L6.78 3.027C3.988 3.986 2 6.702 2 9.86c0 3.603 2.581 6.624 5.997 7.13zm4.006-13.98a1 1 0 00-.292 1.98C14.11 5.343 16 7.492 16 10.14c0 2.294-1.416 4.21-3.358 4.913l.991-2.303a1 1 0 00-1.837-.79l-1.715 3.987a1 1 0 00.256 1.143l3 2.659a1 1 0 001.326-1.497l-1.443-1.279c2.792-.958 4.78-3.675 4.78-6.833 0-3.603-2.581-6.624-5.997-7.13z" />
              </svg>
            </div>
            <div className="logout-button" onClick={pre_onLogout}>
              <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12L13 12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 15L20.913 12.087V12.087C20.961 12.039 20.961 11.961 20.913 11.913V11.913L18 9" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 5V4.5V4.5C16 3.67157 15.3284 3 14.5 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H14.5C15.3284 21 16 20.3284 16 19.5V19.5V19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;

