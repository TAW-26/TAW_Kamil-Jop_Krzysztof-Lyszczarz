const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
    res.json({ message: "API działa!" });
});

app.listen(3000, () => {
    console.log("Server działa na porcie 3000");
});