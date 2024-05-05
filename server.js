const express = require("express")
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")) //public 폴더 등록 하겠다 

//user가 작성한 값 받아오기
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { MongoClient, ObjectId } = require('mongodb');

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

app.get("/write", (req, res) => {
    res.render("write.ejs");
});

app.post("/add", async(req, res) => {
    //console.log(req.body);
    //실행할 코드
    if (req.body.title == "") {
        res.send("제목이 비어있습니다");
      } else {
        await db
          .collection("post")
          .insertOne({ title: req.body.title, content: req.body.content });
        res.redirect("/listejs");//원하는 페이지로 돌아가기 
      }
}); 

// :id = 아무거나 입력이라는 뜻 
app.get('/detail/:id', async(req, res) => {
    let result = await db
        .collection("post")
        .findOne({_id : new ObjectId(req.params.id)});
    res.render('detail.ejs', { result: result });
});

app.get('/edit/:id', async(req, res) => {
    let result = await db
        .collection("post")
        .findOne({_id : new ObjectId(req.params.id)});
    res.render('edit.ejs', { result: result });
});

app.post("/edit", async (req, res) => {
    await db
      .collection("post")
      .updateOne(
        { _id: new ObjectId(req.body.id) },
        { $set: { title: req.body.title, content: req.body.content } }
      );
    res.redirect("/listejs");
});
