require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// MongoDB
const uri = process.env.MONGO_URI;

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
    // Connection
    await client.connect();

    // Collections
    const employees = client.db("asifIncDB").collection("employees");

    // create employee
    app.post("/create-employee", async (req, res) => {
      const mail = req.query.email;
      let count = await employees.find().toArray();
      const body = await req.body;
      body.key = count[count.length - 1].key + 1;

      if (mail === "asifinc@gmail.com") {
        const found = await employees.findOne({ email: body.email });
        if (!found) {
          const result = await employees.insertOne(body);
          res.send(result);
        } else {
          res.send({ message: "Employee already exist!" });
        }
      } else {
        res.send({ message: "You are not allowed to do this!" });
      }
    });

    // Fetch all employees
    app.get("/employees", async (req, res) => {
      const result = await employees.find().toArray();
      res.send(result);
    });

    // Get employee by id
    app.get("/employees/:id", async (req, res) => {
      const id = req.params.id;
      const result = await employees.findOne({ _id: new ObjectId(id) });

      res.send(result);
    });

    // Update employee
    app.patch("/employees/:id", async (req, res) => {
      const id = req.params.id;
      const { firstname, lastname, phone } = await req.body;

      const result = await employees.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            firstname,
            lastname,
            phone,
          },
        }
      );

      res.send(result);
    });

    // Block Employee
    app.patch("/block/:id", async (req, res) => {
      const id = req.params.id;

      const employee = await employees.findOne({ _id: new ObjectId(id) });

      if (employee) {
        const result = await employees.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              blocked: !employee.blocked,
            },
          }
        );
        res.send({ result, employee });
      } else {
        res.send({ message: "Employee Not Found!" });
      }
    });

    // Delete employee
    app.delete("/delete/:id", async (req, res) => {
      const result = await employees.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });
  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to asif inc backend!");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
