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
const studioBookingCollection = db.collection("studioBooking")

// Home Route
app.get("/", (req, res) => {
  res.send("StudioSpace Server is Running!");
});

// Add New Studio
app.post("/dashboard/add-studio", async (req, res) => {
  const data = req.body;

  const result = await studioCollection.insertOne(data);
 console.log(result);
  res.send(result);
});

    // get all studio
app.get("/studios", async(req, res)=>{
  const result = await studioCollection.find().toArray()
     res.send(result)
    })
    
    // Get single studio
    app.get("/studios/:id", async (req, res) => {
    const { id } = req.params;
     
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid studio ID",
      });
    }
    
    // Find studio data
    const result = await studioCollection.findOne({
      _id: new ObjectId(id),
    });
    res.send(result);
   });

  // create bookings
app.post("/dashboard/my-bookings", async(req, res)=>{
  const data = req.body;
  const result = await studioBookingCollection.insertOne(data)
  res.send(result) 
})

// Get Bookings
app.get("/dashboard/my-bookings", async (req, res) => {
  const result = await studioBookingCollection.find().toArray();
  res.send(result);
});

// Get My Listings
app.get("/dashboard/my-listings", async (req, res) => {
  const result = await studioCollection.find().toArray();
  res.send(result);
});


//http://localhost:8000/studios/id
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});