
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import { createRemoteJWKSet, jwtVerify } from "jose";

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
const studioBookingCollection = db.collection("studioBooking");

// Create JWKS instance
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

// Verify user token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ msg: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWKS);

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).send({ msg: "Invalid Token" });
  }
};


// Home Route
app.get("/", (req, res) => {
  res.send("StudioSpace Server is Running!");
});

// Add New Studio
app.post("/dashboard/add-studio", verifyToken, async (req, res) => {
const data = req.body;
data.userEmail = req.user.email;

const result = await studioCollection.insertOne(data);
  res.send(result);
});

// Get All Studios
app.get("/studios", async (req, res) => {
  const result = await studioCollection.find().toArray();
  res.send(result);
});

// Get Single Studio
app.get("/studios/:id", verifyToken, async (req, res) => {
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

// Create Bookings
app.post("/dashboard/my-bookings", verifyToken, async (req, res) => {
  const data = req.body;
  data.userEmail = req.user.email;
  data.status = "Pending";

  const result = await studioBookingCollection.insertOne(data);
  res.send(result);
});

// Get Bookings
app.get("/dashboard/my-bookings", verifyToken, async (req, res) => {
  const email =req.user.email 
  const result = await studioBookingCollection
    .find({ userEmail: email})
    .toArray();

  res.send(result);
});

// Get My Listings
app.get("/dashboard/my-listings", verifyToken, async (req, res) => {
  const email = req.user.email;
const result = await studioCollection.find({ userEmail: email }).toArray();
  res.send(result);
});
// Update or Edit Studio
app.put("/studios/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const result = await studioCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data }
  );

  res.send(result);
});

// Delete Studio
app.delete("/studios/:id", verifyToken, async (req, res) => {
  const id = req.params.id;

  const result = await studioCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

// Cancel Booking
app.patch("/dashboard/my-bookings/:id/cancel", verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await studioBookingCollection.updateOne(
    { _id: new ObjectId(id), status: "Pending" },
    { $set: { status: "Cancelled" } }
  );

  res.send(result);
});

// Start Server Locally
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export default app;