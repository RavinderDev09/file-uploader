const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve upload.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});
console.log('add');


app.listen(PORT, () => {
  console.log(`Frontend form running at http://localhost:${PORT}`);
});
console.log("7778");


// server.js (ya app.js
