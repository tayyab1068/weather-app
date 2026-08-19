const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
 connectionString: process.env.DATABASE_URL
});

pool.query(`CREATE TABLE IF NOT EXISTS user_locations (id SERIAL PRIMARY KEY, latitude DECIMAL(10, 8), longitude DECIMAL(11, 8), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, ip_address VARCHAR(45));`).catch(err => console.error("Table creation error:", err));

io.on("connection", (socket) => {
 console.log("User connected:", socket.id);
 
 socket.on("location-share", async (data) => {
 console.log("Location received:", data);
 try {
 const ip = socket.handshake.address;
 await pool.query('INSERT INTO user_locations (latitude, longitude, ip_address) VALUES ($1, $2, $3)', [data.latitude, data.longitude, ip]);
 io.emit("location-update", {id: socket.id, latitude: data.latitude, longitude: data.longitude, timestamp: new Date().toLocaleString()});
 } catch (err) {
 console.error("Database error:", err);
 socket.emit("error", { message: "Failed to save location" });
 }
 });
 
 socket.on("disconnect", () => {
 console.log("User disconnected:", socket.id);
 });
});

app.post('/api/save-location', async (req, res) => {
 const { latitude, longitude } = req.body;
 const ip = req.ip;
 try {
 await pool.query('INSERT INTO user_locations (latitude, longitude, ip_address) VALUES ($1, $2, $3)', [latitude, longitude, ip]);
 res.json({ success: true, message: 'Location saved' });
 } catch (err) {
 console.error('Database error:', err);
 res.status(500).json({ error: 'Failed to save location' });
 }
});

app.get('/api/locations', async (req, res) => {
 try {
 const result = await pool.query('SELECT * FROM user_locations ORDER BY timestamp DESC');
 res.json(result.rows);
 } catch (err) {
 console.error('Database error:', err);
 res.status(500).json({ error: 'Failed to fetch locations' });
 }
});

app.get('/dashboard', (req, res) => {
 res.sendFile(__dirname + '/public/dashboard.html');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
