const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectID, ObjectId } = require('mongodb');


// middleWare
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wgiytmf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("productDb").collection("product")

        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)

            const query = {}
            const cursor = productCollection.find(query)
            let product;
            if (page || size) {

                // 0 --> skip : 0 get : 0-10(10)
                // 1 --> skip : 1*10 get : 11-20(10)
                // 2 --> skip : 2*10 get : 21-30(10)
                // 3 --> skip : 3*10 get : 31-40(10)
                product = await cursor.skip(page*size).limit(size).toArray()
            }

            else {
                product = await cursor.toArray()
            }
            // limit diya data slice kora jay
            // .limit(10)
            res.send(product)
        })

        // data length count form database
        app.get('/pageCount', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count });
        })

        // post to database a id 
        app.post('/productByKeys', async (req,res) => {
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id))
            const query = {_id : {$in : ids}}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

    }
    finally {

    }

}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Runing Ema-john')
})

app.listen(port, () => {
    console.log(port);
})