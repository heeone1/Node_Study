const express = require("express")
const app = express();
app.use(express.static(__dirname + "/public")) //public 폴더 등록 하겠다 

app.listen(8080, () => {
    console.log("http://localhost:8080에서 서버 실행중")
});

// app.get("/", (req, res) => {
//     res.send("안녕하세요");
// });

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/weather", (req, res) => {
    res.send("날씨: 맑음");
});

app.get("/baseball", (req, res) => {
    res.sendFile(__dirname + "/baseball.html");
});

