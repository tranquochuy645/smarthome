import React, { useState } from "react";
import "./Login.css";

interface LoginProps {
  onLoginSuccess: (tk: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Perform login logic here
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'username': username,
        'password': password
      })
    });

    if (response.ok) {
      response.json().then(data => {
        // Store login status and token
        sessionStorage.setItem('loggedIn', "true");
        onLoginSuccess(data.token);
      });

      // Redirect to home page or perform other actions
    } else {
      response.text().then(message => {
        console.log(message);
      });
    }
  };

  return (
    <div id="Login">
      <form>
        <h2>Login</h2>
        <label>
          Username:
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <label>
          Password:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <div id='button-box'>
          <button type="button" onClick={handleLogin}>
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
