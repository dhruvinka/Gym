const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const publicRoutes = require("./routes/publicRoutes");
const photoRoutes = require("./routes/photoRoutes");




const { authMiddleware } = require("./middleware/authMiddleware");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//  Public routes
app.use("/api/auth", authRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/public", publicRoutes);

//  Protected routes
app.use("/api/admin", authMiddleware, adminRoutes);
app.use("/api/member", authMiddleware, memberRoutes);
app.use("/api/trainer", authMiddleware, trainerRoutes);
app.use("/api/payment", authMiddleware, paymentRoutes);
app.use("/api/photo", authMiddleware, photoRoutes);


// Global error handler (always last)
app.use(errorHandler);

module.exports = app;