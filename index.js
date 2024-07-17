const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb Server
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.43teffq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db("Mobile-Finance-System").collection("users");

    // post created user
      app.post("/users",async(req,res)=>{
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.pin, salt, async function(err, hash) {
        const user = {
          name:req.body.name,
          email:req.body.email,
          pin:hash,
          phone:req.body.phone,
          bonus:req.body.bonus,
          role:req.body.role
        };
        const result =await userCollection.insertOne(user);
        res.send(result);
        });
      
      });
      
      
      
    })
    
    // get all users for login system
    app.get("/users", async(req,res)=>{
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.patch('/users/update/:email',async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email };
      const updateDoc = {
        $set: { ...user, timestamp: Date.now() },
      }
      const result = await userCollection.updateOne(query, updateDoc)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  catch(error){
      res.status(500).json(error.message);
    }
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req,res)=>{
  res.send("MFS server is Running");
})

// route not found error
app.use((req,res,next)=>{
  res.status(404).json({
    message:"Route Not Found",
  });
})
// Handling server error
app.use((err,req,res,next)=>{
  res.status(500).json({
    message:"Something Broke",
  });
})

app.listen(port,()=>{
  console.log(`MFS is running at port ${port}`);
})
