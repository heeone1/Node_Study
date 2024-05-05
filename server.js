const express = require("express")
const app = express();
const { MongoClient } = require('mongodb');
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")) //public 폴더 등록 하겠다 
let db;
const url = 
    "mongodb+srv://admin:qwer1234@cluster0.fretgqc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
new MongoClient(url).connect().then((client) => {
    console.log("db연결 성공");
    db = client.db("forum");
}).catch((err) => {
    console.log(err);
});

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


//db에 있는 데이터 꺼내기
//await db.collection('컬렉션명').find().toArray()
app.get("/list", async(req, res) => {
    let result = await db.collection("post").find().toArray()
    res.send(result[0].title)
});


app.get("/listejs", async(req, res) => {
    let result = await db.collection("post").find().toArray()
    res.render("list.ejs", {posts: result});
});