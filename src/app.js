import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const server = http.createServer(app)
const io = new Server(server)


const users = {}
io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado')


  let username

  socket.on('createUser', (name) => {
    if (users[name]) {
      socket.emit('userError', 'El nombre de usuario ya existe.')
    } else {
      username = name
      users[name] = socket.id
      socket.emit('userCreated', `Usuario ${username} creado con éxito.`)
      console.log(`Usuario creado: ${username}`)
    }
  })

  socket.on('chat', (msg) => {

    io.emit('chat', { user: username, message: msg })
    console.log(`Usuario:${username} - Mensaje: ${msg}`)
  })

  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado');
  })
})

app.get('/', (req, res) => {
  res.sendFile(path.resolve('client/index.html'))
})

server.listen(2500, () => {
  console.log('Servidor corriendo en http://localhost:2500')
})
