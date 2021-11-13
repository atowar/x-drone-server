const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbo7u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);
async function run() {
    try {
        //database connection
        await client.connect();
        const database = client.db('xdrone');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('order');
        const contactCollection = database.collection('contactinfo');
        const userCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');



        //get products API

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        });
        //get ordered products API

        app.get('/ordered-products', async (req, res) => {
            const cursor = orderCollection.find({});
            const orderedProducts = await cursor.toArray();
            res.send(orderedProducts)
        });
        //get contacts info API
        app.get('/contact-details', async (req, res) => {
            const cursor = contactCollection.find({});
            const contactInfo = await cursor.toArray();
            res.send(contactInfo)
        });
        //get single product API
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productCollection.findOne(query)
            res.json(product)
        });

        //add order API

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        });
        //add contact info API

        app.post('/contacts-info', async (req, res) => {
            const contactsInfo = req.body;
            const result = await contactCollection.insertOne(contactsInfo);
            res.json(result)
        });
        //add review

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        });
        
        //add new product

        app.post('/products', async (req, res) => {
            const addedProducts = req.body;
            const result = await productCollection.insertOne(addedProducts);
            res.json(result)
        });
       

        // check admin or not 

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role==='admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })

        // insert new user to database 

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result)
        })


        //insert or update google user in to database
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        //DELETE Order
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query)
            console.log('deleting products by id', result);
            res.json(result)
        }),
            //Update Order
            app.patch('/products/:id', async (req, res) => {
                const id = req.params.id;
                const data = req.body;
                const result = await orderCollection.updateOne(
                    { "_id": ObjectId(id) },
                    { $set: data }
                )

                res.json(result)
            })
    }
    finally {
        // await client.close()
    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('X-Drone server running')
})

app.listen(port, () => {
    console.log('PORT: ', port);
})

