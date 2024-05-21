const express = require('express');
const cors = require('cors');
const { applianceRouter } = require('./routes/appliances');

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

app.use('/api/v1/', applianceRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
