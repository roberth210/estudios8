const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/panel", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "panel.html"));
});

app.get("/panel.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "panel.html"));
});

io.on("connection", (socket) => {
  console.log("Panel conectado:", socket.id);

  socket.on("crear-usuario", (data) => {
    console.log("Usuario recibido:", data);

    socket.emit("usuario-creado", {
      ok: true,
      mensaje: "Usuario creado correctamente",
      usuario: data
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});