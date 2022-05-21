const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://doctors_portal:YkahjtKrR9hubhXN@cluster0.jy8sm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded = decoded;
      next();
    });
  }

async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db("doctors").collection("service");
        const bookingCollection = client.db("doctors").collection("booking");
        
        app.get('/service' , async (req ,res) =>{
            const query ={};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.post('/booking' , async(req ,res) =>{
            const booking = req.body;
            const query ={ 
                treatment:booking.treatment,
                date:booking.date,
                patient:booking.patient
            }
            const exists = await bookingCollection.findOne(query)
            if(exists){
                return res.send({success:false , booking:exists})
            }
            const result = await bookingCollection.insertOne(booking);
           return res.send({success:true , result})
        })
    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World! Im comming')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})