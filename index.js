const express = require('express')
const cors = require('cors')
const port = 2000
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))

app.get('/', async (req, res) => {
    res.send({ message: 'Hello World' })
})

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.vhkuyua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const ipHouse = client.db("ipHouse").collection('ipAddress')


        app.get('/ips', async (req, res) => {
            const result = await ipHouse.find().toArray()
            res.send(result)
        })

        app.get('/ips/:data', async (req, res) => {
            const data = req.params.data
            const query = { $or: [{ ip: { $regex: data, $options: 'i' } }, { ptr: { $regex: data, $options: 'i' } }] }

            const result = await ipHouse.find(query).toArray()
            res.send(result)



        })

        app.post('/ips', async (req, res) => {
            const data = req.body
            console.log(data);
            const result = await ipHouse.insertOne(data)
            res.send(result)

        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})