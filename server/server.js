const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const axios = require('axios')
const http = require('http')
const WebSocket = require('ws')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000

const userModel = require('./model/user')
const campaignModel = require('./model/campaign')
const patientModel = require('./model/patient')

app.use(cors(
   {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["POST", "GET"],
    credentials: true
   } 
));
app.use(express.json())
app.get('/', (req, res)=>{
    res.send("Server is working well!")
})

const MONGO_URL = process.env.MONGO_URL
mongoose.connect(MONGO_URL)
.then(()=>console.log("Database Connected."))
.catch((error)=>console.log("Error detected", error))

app.post('/user', (req, res)=>{
    userModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.json(err))
})

app.post('/login', (req, res)=>{
    const {email, password} = req.body;
    userModel.findOne({email:email})
    .then(user=>{
        if(user)
        {
            if(user.password === password){
                res.json("Success")
            }
            else{
                res.json("The password is incorrect!")
            }
            
        }
        else
        {
            res.json("No record existed!")
        }
    })
})

app.post('/data', (req, res)=>{
    campaignModel.create(req.body)
    .then((data)=> res.json(data))
    .catch((err)=> res.json(err))
})

app.post('/patient', (req, res)=>{
    patientModel.create(req.body)
    .then((data)=> res.json(data))
    .catch((err)=> res.json(err))
})

app.get('/patient', (req, res) => {
    patientModel.find()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});


// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Function to broadcast appointment updates to all connected clients
const broadcastAppointmentUpdate = () => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'appointment_update' }));
        }
    });
};

// Modify appointment routes to broadcast updates
app.post('/patient', (req, res)=>{
    patientModel.create(req.body)
    .then((data)=> {
        res.json(data);
        broadcastAppointmentUpdate(); // Broadcast update after successful creation
    })
    .catch((err)=> res.json(err))
});

app.get('/patient', (req, res) => {
    patientModel.find()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is connected to http://localhost:${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

