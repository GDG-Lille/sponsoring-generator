const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/generate", (req, res) => {
  require("./lib/generator")(req.body).then(paths =>
    res.send({
      created: true,
      paths
    })
  );
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
