require("dotenv").config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, 
  legacyHeaders: false, 
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/service-requests", require("./routes/ServiceRequest.routes"));
app.use("/api/workers", require("./routes/worker.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/messages", require("./routes/message.routes"));

module.exports = app;
