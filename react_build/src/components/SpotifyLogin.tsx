import './SpotifyLogin.css'
interface SpotifyProps {
 
    onLogInSpotify:()=>void;
}

const SpotifyLogin: React.FC<SpotifyProps> = ({ onLogInSpotify }) => {
    
    

 
   
        return (
            <div id="SpotifyLogin">
                <button onClick={onLogInSpotify}>
                    Login Spotify
                </button>
                
            </div>
        );
    }


export default SpotifyLogin;
