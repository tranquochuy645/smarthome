import socketio from "socket.io-client";
const socket_url = window.location.protocol + "//"+window.location.host;

let socket: typeof socketio.prototype|null;
const GetSocket=()=>{
    if(!socket){
        socket = socketio(socket_url);
    };
    return socket;
}
export default GetSocket;
