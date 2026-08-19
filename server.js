const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Public folder se static files serve kar raha hai
app.use(express.static("public"));

// Socket connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("location-share", (data) => {
        console.log("Location received:", data);

        // Dashboard ko updates bhej raha hai
        io.emit("location-update", {
            id: socket.id,
            latitude: data.latitude,
            longitude: data.longitude
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Dynamic Port setup for hosting (Railway/Render)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
