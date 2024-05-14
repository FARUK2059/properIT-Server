const express = require("express");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// Midleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://proper-it-55963.web.app',
        'https://proper-it-55963.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


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
const logger = (req, res, next) => {
    console.log('log: info', req.method, req.url);
    next();
}

// JWT verify function
// const verifyToken = (req, res, next) => {
//     const token = req?.cookies?.token;

//     if(!token) {
//         return res.status(401).send({message: 'unauthorized access'})
//     }
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if(err){
//             return res.status(401).send({message: 'unauthorized Access'})
//         }
//         req.user = decoded;
//         next();
//     })
// }


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        // MongoDB DataBaase Name Creat 
        const querieCollection = client.db('queriesDB').collection('queriesData');
        const recommendCollection = client.db('queriesDB').collection('recommendBD');


        // auth Protection API
        //creating Token
        // app.post("/jwt", logger, async (req, res) => {
        //     const user = req.body;
        //     console.log("user for token", user);
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' } );

        //     res.cookie("token", token, cookieOptions).send({ success: true });
        // });

        // //clearing Token
        // app.post("/logout", async (req, res) => {
        //     const user = req.body;
        //     console.log("logging out", user);
        //     res
        //         .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        //         .send({ success: true });
        // });




        app.post('/jwt', logger, async (req, res) => {
            const user = req.body;
            console.log('user for token', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

            // res.send({ token });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            })
                .send({ success: true });
        })

        //  JWT Api LogOut function or token clear
        app.post('/logout', logger, async (req, res) => {
            const user = req.body;
            console.log('logging out', user);
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 0,
            }).send({ success: true })
        })



        // ********** Query Colection *******/////

        // BongoDB teke Data pawar function
        app.get('/queries', async (req, res) => {
            const cursor = querieCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // BongoDB letest Data pawar function
        app.get('/letest-queries', async (req, res) => {
            const latestQuery = await querieCollection.find().sort({ recommenddatetime: -1 }).limit(8).toArray();
            // res.json(latestQuery);
            res.send(latestQuery);
        })

        // BongoDB letest My-Query Data pawar function
        app.get('/my-queries', async (req, res) => {
            const latestQuery = await querieCollection.find().sort({ datetime: -1 }).toArray();
            // res.json(latestQuery);
            res.send(latestQuery);
        })

        // BongoDB letest Allquery Data pawar function
        app.get('/all-queries', async (req, res) => {
            const latestQuery = await querieCollection.find().sort({ datetime: -1 }).toArray();
            // res.json(latestQuery);
            res.send(latestQuery);
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

        // get serch funtionality creat
        app.get('all-query', async (req, res) => {
            // const search = req.query.search
            const search = req.query.productName

            const result = await querieCollection.find({ productName: { $regex: new RegExp(search, 'i') } }).toArray();

            res.send(result)
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


        // ***********  Recommend Section ************ ////

        //  Client side request send and cliend side to MongoDB Data send
        app.post('/recommends', async (req, res) => {
            const newRecommend = req.body;
            console.log(newRecommend);

            newRecommend.recommendationCount = +newRecommend.recommendationCount;

            const result = await recommendCollection.insertOne(newRecommend);

            // update recommand count in query collection
            const updateDoc = {
                $inc: {
                    recommendationCount: 1
                },
            }
            const recommentQuery = { _id: new ObjectId(newRecommend.queryId) }
            const updateRecommentCount = await querieCollection.updateOne(recommentQuery, updateDoc)
            console.log(updateRecommentCount)

            res.send(result);
        })

        // BongoDB teke Data pawar function
        app.get('/recommends', async (req, res) => {
            const cursor = recommendCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // get query data for productID base from mongoDB to server
        app.get('/recommends/:queryId', async (req, res) => {
            const queryId = req.params.queryId;
            const recommendations = await recommendCollection.find({ queryId }).toArray();
            res.send(recommendations);
        })

        // Query data delate Mathod
        app.delete('/recommends/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const recommendation = await recommendCollection.findOne(query);

            // Delete the recommendation
            const result = await recommendCollection.deleteOne(query);

            // descress the RecommendationCount
            const queryId = recommendation.queryId;
            const updateDoc = {
                $inc: { recommendationCount: -1 }
            };

            await querieCollection.updateOne({ _id: new ObjectId(queryId) }, updateDoc);


            res.send(result);
        })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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