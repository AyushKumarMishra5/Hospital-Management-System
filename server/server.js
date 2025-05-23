const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const axios = require('axios')
const http = require('http')
const WebSocket = require('ws')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

const userModel = require('./model/user')
const campaignModel = require('./model/campaign')
const patientModel = require('./model/patient')

const corsOptions = {
  origin: [
    "https://xenohealth.netlify.app",
    "https://xenohealthpanel.netlify.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

app.get('/', (req, res) => {
  res.send("Server is working well!")
})

const MONGO_URL = process.env.MONGO_URL
mongoose.connect(MONGO_URL)
  .then(() => console.log("Database Connected."))
  .catch(error => console.log("Error detected", error))

app.post('/user', (req, res) => {
  userModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.json(err))
})

app.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." })
  }

  userModel.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "No record existed!" })
      }

      if (user.password === password) {
        return res.status(200).json({ message: "Success", user })
      } else {
        return res.status(401).json({ message: "The password is incorrect!" })
      }
    })
    .catch(err => {
      console.error("Login error:", err)
      return res.status(500).json({ message: "Internal server error" })
    })
})

app.post('/data', (req, res) => {
  campaignModel.create(req.body)
    .then(data => res.json(data))
    .catch(err => res.json(err))
})

const broadcastAppointmentUpdate = () => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'appointment_update' }))
    }
  })
}

app.post('/patient', (req, res) => {
  patientModel.create(req.body)
    .then((data) => {
      res.json(data)
      broadcastAppointmentUpdate()
    })
    .catch((err) => res.json(err))
})

app.get('/patient', (req, res) => {
  patientModel.find()
    .then((data) => res.json(data))
    .catch((err) => res.json(err))
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected')

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

server.listen(PORT, () => {
  console.log(`Server is connected to http://localhost:${PORT}`)
  console.log(`WebSocket server is running on ws://localhost:${PORT}`)
})
