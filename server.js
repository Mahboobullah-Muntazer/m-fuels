const express = require('express');
const connectDB = require('./config/db');
const app = express();
const cors = require('cors');
const path = require('path');

//connect Database
connectDB();

app.use(express.json());
app.use(cors());

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, 'front')));

// Serve the index.html file for all other routes

app.use('/api/actions', require('./routes/api/actions'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);
