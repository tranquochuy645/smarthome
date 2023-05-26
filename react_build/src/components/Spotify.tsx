import React, { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import "./Spotify.css";

interface SpotifyProps {
  onLogOutSpotify: () => void;
  accessToken: any;
}

const Spotify: React.FC<SpotifyProps> = ({ onLogOutSpotify,accessToken }) => {
  // Retrieve access token from session storage
  if(accessToken==""){
    accessToken = sessionStorage.getItem("access_token")||"";
  };
  
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  const [devices, setDevices] = useState<SpotifyApi.UserDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedSong, setSelectedSong] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyApi.TrackObjectFull[]>([]);
  const [volumePercentage, setVolumePercentage] = useState(100);
  const itv_1 = setInterval(() => {
    if (accessToken!="") {
      spotifyApi.getMyDevices().then((data) => {
        setDevices(data.devices);
      });
    }
  }, 3000);
  useEffect(() => {
    // Fetch devices when access token changes
    if (accessToken!="") {

      spotifyApi.getMyDevices().then((data) => {
        setDevices(data.devices);
      });
    }
  }, [accessToken]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);

    if (event.target.value) {
      // Search for tracks based on the query
      spotifyApi.searchTracks(event.target.value).then((data) => {
        setSearchResults(data.tracks.items);
        setSelectedSong(data.tracks.items[0]?.id?.toString() || "");
        // Select the first track ID, or set it to an empty string if no results
      });
    } else {
      setSearchResults([]);
      setSelectedSong("");
      // Clear the selected song if the search query is empty
    }
  };

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDevice(event.target.value);
  };

  const handleSongChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSong(event.target.value);
  };

  const handlePlay = () => {
    const device_id: string = selectedDevice;
    const track_id: string = selectedSong;

    if (device_id && track_id) {
      spotifyApi.play({ uris: [`spotify:track:${track_id}`], device_id });
    } else {
      alert("Select a device & song to play!");
    }
  };

  const handlePause = () => {
    const device_id: string = selectedDevice;

    if (device_id) {
      spotifyApi.pause({ device_id });
    } else {
      alert("Select a device to pause!");
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolumePercentage(parseInt(event.target.value));
  };

  useEffect(() => {
    const device_id: string = selectedDevice;
    const vol: number = volumePercentage;

    if (device_id && vol >= 0 && vol <= 100) {
      spotifyApi.setVolume(vol, { device_id });
    }
  }, [volumePercentage]);

  return (
    <div id="Spotify_content">
      <h2>Select a Device</h2>
      <select value={selectedDevice} onChange={handleDeviceChange}>
        <option value="">Choose a device</option>
        {devices.map((device) => (
          <option key={device.id} value={device.id?.toString()}>
            {device.name} ({device.type})
          </option>
        ))}
      </select>
      <h2>Search for a Song</h2>
      <input type="text" value={searchQuery} onChange={handleSearch} />
      <div className="flex-row">
        <select value={selectedSong} onChange={handleSongChange}>
          {searchResults.map((track) => (
            <option value={track.id?.toString()} key={track.id?.toString()}>
              {track.name} by {track.artists[0].name}
            </option>
          ))}
        </select>
        <button onClick={handlePlay}>Play</button>
      </div>
      <div className="flex-row">
        <input
          type="range"
          min="0"
          max="100"
          value={volumePercentage}
          onChange={handleVolumeChange}
        />
        <button onClick={handlePause}>Pause</button>
      </div>

      <button onClick={onLogOutSpotify}>Logout Spotify</button>
    </div>
  );
};

export default Spotify;
