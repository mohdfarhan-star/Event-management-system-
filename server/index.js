const express = require('express')
const app = express()
const database = require('./config/database');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const userRoutes = require("./routes/userRoutes")
const eventRoutes = require("./routes/eventRoutes")

// setting port
const PORT = process.env.PORT || 4000;

// loading env variables from .env
dotenv.config();

// db connection
database.connect();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: ["https://portfolio-pvx3.vercel.app", "http://localhost:5173", "http://localhost:3000"],
		credentials: true,
	})
);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/events", eventRoutes);

app.get('/', (req, res) => {
  return res.json({
    success:true,
    message:"Your servers is up and running"
  });
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
