const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

io.on("connection", (socket) => {
 console.log("User connected:", socket.id);
 
 socket.on("location-share", (data) => {
 console.log("Location received:", data);
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

app.get('/dashboard', (req, res) => {
 res.sendFile(__dirname + '/public/dashboard.html');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
