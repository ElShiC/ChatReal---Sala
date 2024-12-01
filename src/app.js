import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from 'fs';
import path from "path";

const app = express();
const server = http.createServer(app)
const io = new Server(server)


const users = {}

const UPLOAD_DIR = path.join(process.cwd(), 'src', 'upload')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}


io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado')


  let username

  var buffer;

  socket.on('createUser', (room ,name, fileName, imageData) => {


    const filePath = path.join(UPLOAD_DIR, fileName);

    buffer = Buffer.from(imageData, 'base64');
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error('Error al guardar la imagen:', err);
        socket.emit('upload-status', { success: false, message: 'Error al guardar la imagen' });
        return;
      }
      console.log('Imagen guardada en:', filePath);
      socket.emit('upload-status', { success: true, message: 'Imagen subida exitosamente' });
    })

    if (users[name]) {
      socket.emit('userError', 'El nombre de usuario ya existe.')
    } else {
      username = name
      users[name] = socket.id
      socket.emit('userCreated', `Usuario ${username} creado con éxito.`)
      console.log(`Usuario creado: ${username}`)
    }

    socket.join(room)
    socket.room = room
  })


  socket.on('chat', (msg) => {

    const bufferIMG = buffer.toString('base64')

    io.to(socket.room).emit('chat', { user: username, message: msg, dataImg: bufferIMG })
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
