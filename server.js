const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

const db = new sqlite3.Database(path.join(__dirname, "database.db"))

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT UNIQUE,
      pass TEXT,
      points INTEGER DEFAULT 0
    )
  `)
})

function sendTop() {
  db.all(
    "SELECT user, points FROM users ORDER BY points DESC, id ASC LIMIT 5",
    [],
    (err, rows) => {
      if (err) {
        console.log("Error TOP:", err.message)
        return
      }
      io.emit("top", rows || [])
    }
  )
}

app.post("/create-user", (req, res) => {
  const user = (req.body.user || "").trim()
  const pass = (req.body.pass || "").trim()

  if (!user || !pass) {
    return res.json({ ok: false, error: "Faltan datos" })
  }

  db.run(
    "INSERT INTO users (user, pass, points) VALUES (?, ?, 0)",
    [user, pass],
    function (err) {
      if (err) {
        return res.json({ ok: false, error: err.message })
      }

      sendTop()
      res.json({ ok: true })
    }
  )
})

app.post("/login", (req, res) => {
  const user = (req.body.user || "").trim()
  const pass = (req.body.pass || "").trim()

  if (!user || !pass) {
    return res.json({ ok: false, error: "Faltan datos" })
  }

  db.get(
    "SELECT * FROM users WHERE user = ? AND pass = ?",
    [user, pass],
    (err, row) => {
      if (err) {
        return res.json({ ok: false, error: err.message })
      }

      if (!row) {
        return res.json({ ok: false, error: "Usuario o contraseña incorrectos" })
      }

      res.json({
        ok: true,
        points: row.points || 0
      })
    }
  )
})

io.on("connection", (socket) => {
  sendTop()

  socket.on("score", (data) => {
    const user = (data.user || "").trim()
    const points = Number(data.points) || 0

    if (!user) return

    db.run(
      "UPDATE users SET points = ? WHERE user = ?",
      [points, user],
      function (err) {
        if (err) {
          console.log("Error actualizando puntos:", err.message)
          return
        }
        sendTop()
      }
    )
  })
})

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT)
})