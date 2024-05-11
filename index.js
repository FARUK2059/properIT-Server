const express = require("express");
const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// Midleware
app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true
}));
app.use(express.json());
// app.use(cookieParser());


// MOngoDeB Conection

const uri = `mongodb+srv://${process.env.ENV_QUERY}:${process.env.ENV_QUERYPASS}@cluster0.6e55rfm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// creat a new middlewares 
// const logger = (req, res, next) => {
//     console.log('log: info', req.method, req.url);
//     next();
// }

// JWT verify function
// const verifyToken = (req, res, next) => {
//     const token = req?.cookies?.token;
//     // console.log('token in the middleware', token);

//     if (!token) {
//         return res.status(401).send({ message: 'unauthorized access' })
//     }
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({ message: 'unauthorized access' })
//         }
//         req.user = decoded;
//         next();
//     })
// }


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // MongoDB DataBaase Name Creat 
        const querieCollection = client.db('queriesDB').collection('queriesData');


        // auth Protection API
        // app.post('/jwt', logger, async (req, res) => {
        //     const user = req.body;
        //     console.log('user for token', user);
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        //     // res.send({token});

        //     res.cookie('token', token, {
        //         httpOnly: true,
        //         secure: true,
        //         sameSite: 'none'
        //     })
        //         .send({ success: true });
        // })

        //  JWT Api LogOut function
        // app.post('/logout', async (req, res) => {
        //     const user = req.body;
        //     console.log('logging out', user);
        //     res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        // })



        // ********** Query Colection *******/////

        // BongoDB teke Data pawar function
        app.get('/queries', async (req, res) => {
            const cursor = querieCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        //  Client side request send and cliend side to MongoDB Data send
        app.post('/queries', async (req, res) => {
            const newQuerie = req.body;
            console.log(newQuerie);
            const result = await querieCollection.insertOne(newQuerie);
            res.send(result);
        })

        // Query data delate Mathod
        app.delete('/queries/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await querieCollection.deleteOne(query);
            res.send(result);
        })

        // get query data for ID base from mongoDB to server
        app.get('/queries/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await querieCollection.findOne(filter);
            res.send(result);
        })


        // Update request send server to client and  receved in mongodb
        app.put('/queries/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const option = { upsert: true };
            const updatedQuery = req.body;
            const queryUpdate = {
                $set: {
                    productName: updatedQuery.productName,
                    productBrand: updatedQuery.productBrand,
                    productimageURL: updatedQuery.productimageURL,
                    querytitle: updatedQuery.querytitle,
                    boycotdescription: updatedQuery.boycotdescription,
                    datetime: updatedQuery.datetime
                }
            }
            const result = await querieCollection.updateOne(filter, queryUpdate, option);
            res.send(result);
        })

        //  User Queries Data Show and request send email related data
        // app.get('/queries', logger, verifyToken, async (req, res) => {
        //     console.log(req.query.email);
        //     console.log('token info', req.user);
        //     if (req.user.email !== req.query.email) {
        //         return res.status(403).send({ message: 'forbidden access' })
        //     }
        //     let query = {};
        //     if (req.query?.email) {
        //         query = { email: req.query.email }
        //     }
        //     const result = await querieCollection.find(query).toArray();
        //     res.send(result);
        // })














        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// Main Server Function
app.get('/', (req, res) => {
    res.send('The ProperIT Server is start')
})

app.listen(port, () => {
    console.log(`ProperIT Server Port : ${port}`);
})