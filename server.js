var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://user:user@cluster0.iwzvk6j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

var Message = mongoose.model('Message',{
    name : String,
    message : String
})


app.get('/messages', (req, res) =>{
    Message.find({},(err, messages) =>{
        res.send(messages)
    })
})

app.post('/messages', async (req, res) => {
    try {
        var message = new Message(req.body);
        await message.save();
        io.emit('message', req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});


io.on('connection', (socket) => {
   console.log('New User Connected!')
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})