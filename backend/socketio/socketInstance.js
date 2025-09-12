let io;
module.exports = {
    setIO: (ioInstance) => {
        io = ioInstance;
    },
    getIO: () => {
        if (!io) throw new Error("Socket.io is not initialized")
        return io;
    }
}

//  Why 2 Files?
// socketio.js	-> Sets up the initial socket server (on app.listen)
// socketInstance.js ->	Allows any controller or route to send socket events using getIO()