dotenv.config();
const app = express();

app.use(express.json());

const allowedOrigins = [process.env.FRONTEND_URL];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.options("*", cors());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/submission', leaderBlog);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/upi', upiRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/environment-news", environmentRoutes);
app.use("/api/email", emailRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error"
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server started`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  });