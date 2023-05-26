import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useEffect, useState } from "react";
import GetSocket from './components/GetSocket';

function App() {
  const socket=GetSocket();
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('loggedIn')=='true'||false);
  const [token,settoken]=useState("");

  const handleLoginSuccess = (token:string) => {

    socket.connect();
    sessionStorage.setItem("token",token);
    settoken(token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem("token");
    
    socket.disconnect();
    setIsLoggedIn(false);
  };


  return (

    <div >
      {isLoggedIn? (
        <Dashboard onLogout={handleLogout} token={token}/>
      ) : (

        <Login onLoginSuccess={handleLoginSuccess} />

      )}
    </div>
  );
};


export default App;