const express = require("express");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


// Midleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        // 'https://car-doctor-2059.web.app',
        // 'https://car-doctor-2059.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());












// Main Server Function
app.get('/', (req, res) => {
    res.send('The ProperIT Server is start')
})

app.listen(port, () => {
    console.log(`ProperIT Server Port : ${port}`);
})