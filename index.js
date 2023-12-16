const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
const jwt = require("jsonwebtoken")


//zc3at1xE1t035seQ
//1pV5WDR78Dm1AM0X
const cookiesParser = require('cookie-parser')
app.use(cookiesParser())
app.use(express.json())
app.use(cors({
    origin: ["https://rotella-hottel-clint.vercel.app"],
    credentials: true
}))

const number = "c4b8d7463ae54b3720fdec7840466df1d9c3235c5ab428c39e6ebcdbd3ecbd8c337615c3bad72b9adefa1317ef0bc66e6a3bb2d734afec7b6dea69b7ad83d63f"


const uri = "mongodb+srv://Royella-admin:1pV5WDR78Dm1AM0X@cluster0.gzp9cln.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const verify = (req, res, next) => {
    const cookie = req.cookies.token
    if (!cookie) {
        return res.status(401).send({ messege: "unauthoright" })
    }
    jwt.verify(cookie, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ messege: "unauthoright-2" })
        }
        req.user = decoded
        console.log("decorded", decoded)
        next()
    })

}



async function run() {
    try {
        // await client.connect();
        const RoomCardData = client.db("Royella_HotelDB").collection("RoomCardData")
        const RoomBooking = client.db("Royella_HotelDB").collection("RoomBooking")

        app.get("/api/v1/Room-Card-Data", async (req, res) => {
            const result = await RoomCardData.find().toArray()
            res.send(result)

        })

        // Room Booking 
        app.post("/api/v1/RoomBooking", async (req, res) => {
            const data = req.body
            const result = await RoomBooking.insertOne(data)
            res.send(result)
        })

        app.get("/api/v1/myBooking", async (req, res) => {
            console.log(req.query?.email)
            let filter = req.query.email
            if (req.query?.email) {
                filter = { userEmail: req.query.email }
            }
            const result = await RoomBooking.find(filter).toArray()
            res.send(result)
        })

        app.delete("/api/v1/delete/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await RoomBooking.deleteOne(query)
            res.send(result)
        })
        app.put("/api/v1/update/:id", async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            const filter = { _id: new ObjectId(id) }
            const opction = { upset: true }
            const update = {
                $set: {
                    userName: updateInfo.userName,
                    userEmail: updateInfo.userEmail,
                    userAddress: updateInfo.userAddress,
                    nid: updateInfo.nid,
                    price: updateInfo.price,
                    CheckIn: updateInfo.CheckIn,
                    CheckOut: updateInfo.CheckOut
                }
            }
            const result = await RoomBooking.updateOne(filter, update, opction)
            res.send(result)
        })
        // jwt
        app.post("/api/v1/jwt", async (req, res) => {
            const email = req.body
            const token = jwt.sign(email, number, { expiresIn: "1h" })
            res.cookie("token", token, {
                httpOnly: true,
                secure: false
            }).send({ status: true })
        })
        app.post("/api/v1/userLogout", async (req, res) => {
            const email = req.body;
            res.clearCookie("token", { maxAge: 0 }).send({ status: false })
        })
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);



app.get("/", async (req, res) => {
    res.send("my server in ruinig")
})
app.listen(port, () => {
    console.log(`my server in runing on : ${port}`)
})