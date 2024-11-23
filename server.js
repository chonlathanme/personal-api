const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb"}));

readdirSync("./routes").map((path) => app.use("/", require(`./routes/${path}`)));

app.listen(8000, () => console.log("server is running on port 8000"))