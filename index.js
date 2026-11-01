import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import "dotenv/config";
import { ObjectId } from "mongodb";
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// Connect MongoDB
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
    throw err;
  }
}

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("studio-space");
const studioCollection = db.collection("studio");

// Add New Studio
app.post("/add-studio", async (req, res) => {
  const data = req.body;

  const result = await studioCollection.insertOne(data);
 console.log(result);
  res.send(result);
});

  //http://localhost:8000/studios/id
app.get("/studios", async(req, res)=>{
    const result = await studioCollection.find().toArray()
     res.send(result)
})
app.get("/studios/:id", async(req, res)=>{
    const {id}= req.params
    const result = await studioCollection.findOne({_id: new ObjectId(id)})
    res.send(result)
})
// Home Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});