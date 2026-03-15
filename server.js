const express = require("express")
const http = require("http")
const path = require("path")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)

const io = new Server(server)

const PORT = process.env.PORT || 10000

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(express.static(path.join(__dirname,"public")))

let users = {}

let ranking = []

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"))
})

app.get("/panel",(req,res)=>{
res.sendFile(path.join(__dirname,"public","panel.html"))
})

app.post("/login",(req,res)=>{

const {user,pass} = req.body

if(!users[user]){
return res.json({ok:false,error:"usuario no existe"})
}

if(users[user].pass !== pass){
return res.json({ok:false,error:"contraseña incorrecta"})
}

res.json({
ok:true,
points:users[user].points
})

})

app.post("/create-user",(req,res)=>{

const {user,pass} = req.body

if(!user || !pass){
return res.json({ok:false,error:"datos incompletos"})
}

if(users[user]){
return res.json({ok:false,error:"usuario ya existe"})
}

users[user] = {
pass:pass,
points:0
}

res.json({ok:true})

})

io.on("connection",(socket)=>{

socket.on("score",(data)=>{

if(!users[data.user]) return

users[data.user].points = data.points

ranking = Object.keys(users).map(u=>{
return {
user:u,
points:users[u].points
}
})

ranking.sort((a,b)=>b.points-a.points)

ranking = ranking.slice(0,5)

io.emit("top",ranking)

})

})

server.listen(PORT,"0.0.0.0",()=>{
console.log("Servidor iniciado en puerto "+PORT)
})
