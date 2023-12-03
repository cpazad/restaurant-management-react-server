//Importing the required modules
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

//Creating an Express application and defining a port
const app = express();
const port = process.env.PORT || 5000;

//Middleware

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://restaurant-management-651bc.web.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yiwkd5s.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Database collections
    const foodsCollection = client.db("restaurantManager").collection("foods");
    const userCollection = client.db("restaurantManager").collection("users");
    const cartCollection = client.db("restaurantManager").collection("carts");

    // Foods Collections
    // 1. getting the all foods data from database
    app.get("/menu", async (req, res) => {
      const cursor = foodsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // 1.1  fetching single product by id
    app.get("/menu/:id([0-9a-fA-F]{24})", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });
    //2. Sending new menu item to the database
    app.post("/menu", async (req, res) => {
      const item = req.body;
      const result = await foodsCollection.insertOne(item);
      res.send(result);
    });
    //3.  Update menu items to database
    app.patch("/menu/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          strMeal: item.strMeal,
          strMealThumb: item.strMealThumb,
          strCategory: item.strCategory,
          price: item.price,
          details: item.details,
          made: item.made,
          strArea: item.strArea,
          orders: item.orders,
        },
      };

      const result = await foodsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //4. Delete Menu Items,
    app.delete("/menu/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.deleteOne(query);
      res.send(result);
    });

    // User Collection

    //1. getting the user data from the database (add verifyAdmin, verifyToken, )
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    //2. sending user data to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists, insertedId:null" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //Cart --------------------------------------------------------------

    // Cart Collection - getting the cart my user(email)
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });
    // cart - sending add to cart
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });
    // Cart - deleting item from myCart userwise
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//Create a simple server route
app.get("/", (req, res) => {
  res.send("Restaurant is Open Now");
});

//Starting the Express server:
app.listen(port, () => {
  console.log(`Restaurant Manager Server is running on port${port}`);
});
