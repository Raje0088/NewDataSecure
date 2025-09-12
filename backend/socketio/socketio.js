const socketIO = require("socket.io")
let io;

function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: "*", // Your frontend port
            methods: ["GET", "POST"],
            credentials:true
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        //executive joins their personal room
        socket.on("joinRoom", (userId) => {
            socket.join(userId);
            console.log(`${userId} joined their room`)
        })

        socket.on("remainder", (data) => {
            io.emit("remainder are", data)
        })

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        })
    })

    return io;
}

module.exports = { initializeSocket, getIO: () => io };