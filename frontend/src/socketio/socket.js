import {io}  from 'socket.io-client'

const host = window.location.hostname;
const socket = io(`http://${host}:3000`,{
    transports:["websocket"],
    withCredentials:true,
}) // backend port

export default socket;