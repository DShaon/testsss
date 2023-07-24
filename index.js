const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config()

const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.brxvswk.mongodb.net/?retryWrites=true&w=majority`;

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
        const usersCollection = client.db('summerCamp').collection('users');
        const CollegeCollection = client.db('Colleges').collection('allCollege');
        const SelectedCollege = client.db('Colleges').collection('SelectedCollege');



        //All Colleges
        app.get('/colleges', async (req, res) => {
            const result = await CollegeCollection.find().toArray()
            res.send(result)
        })


        // selected colleges
        app.post("/selectedCollege", async (req, res) => {
            const formData = req.body;

            if (!formData || !formData.CandidateName || !formData.CandidateEmail) {
                return res.status(400).send({ error: "Invalid request body" });
            }

            try {
                // Check if the college already exists for the user
                const existingItem = await SelectedCollege.findOne({
                    "college.collegeName": formData.college.collegeName,
                    "CandidateEmail": formData.CandidateEmail,
                });

                console.log('existing item check', existingItem, formData.college.collegeName);

                if (existingItem) {
                    return res.status(400).send({ error: "College already exists" });
                }

                // Save the class item to the database
                const result = await SelectedCollege.insertOne(formData);
                res.send({ insertedId: result.insertedId });
            } catch (error) {
                console.error("Error adding college item:", error);
                res.status(500).send({ error: "Error adding college item" });
            }
        });


        // get college for each user

        app.get("/myCollege", async (req, res) => {
            const userEmail = req.query.userEmail;
          
            try {
              const selectedColleges = await SelectedCollege.find({ CandidateEmail: userEmail }).toArray();
              if (!selectedColleges || selectedColleges.length === 0) {
                return res.status(404).send({ error: "Selected colleges not found for the user" });
              }
              res.send(selectedColleges);
            } catch (error) {
              console.error("Error fetching selected colleges data:", error);
              res.status(500).send({ error: "Error fetching selected colleges data" });
            }
          });
          

    

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('EduHive is on')
})

app.listen(port, () => {
    console.log(`EduHive is  on port ${port}`);
})




