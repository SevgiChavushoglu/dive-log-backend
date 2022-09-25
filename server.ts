import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/users", async (req, res) => {
  try{
    const users = await client.query('select * from users');
    res.json(users.rows);
  }
  catch(error){
    res.send("Upps error!");
    console.log(error)
  }
});
app.get("/dives", async (req,res)=>{
  try{
    const dives= await client.query('select * from divelog');
    res.json(dives.rows);
  }
  catch(error){
    res.send("Upps error!");
    console.log(error)
  }
})
app.post("/new/dive", async(req, res)=>{
  try{
  const {user_id, location, max_depth, duration, difficulty, summary, buddy_name, visibility, air_used, water_type, is_training_dive}= req.body;
  const addNewDive= await client.query('insert into divelog (user_id, location, max_depth, duration, difficulty, summary, buddy_name, visibility, air_used, water_type, is_training_dive) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', 
  [user_id, location, max_depth, duration, difficulty, summary, buddy_name, visibility, air_used, water_type, is_training_dive]);
  res.send('new dive has been added')
  }
  catch(error){
    res.send("Upps error");
    console.log(error)
  }
})


//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
