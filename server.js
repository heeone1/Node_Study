const express = require("express")
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")) //public 폴더 등록 하겠다 

//user가 작성한 값 받아오기
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { MongoClient, ObjectId } = require('mongodb');

// //로그인
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");

//해싱
const bcrypt = require("bcrypt");

//DB에 로그인정보 저장
const MongoStore = require('connect-mongo');

app.use(passport.initialize())
app.use(session({
	secret : "1234", //암호화에 쓸 비밀번호 
	resave : false, //유저가 로그인 안해도 세션을 저장해둘지 여부
	saveUninitialized : false // 유저가 요청할 때 마다 session데이터를 다시 갱신할지
}))
app.use(passport.session())

//DB에 로그인정보 저장
app.use(session({
    resave : false,
    saveUninitialized : false,
    secret: "1234", //세션 암호화 비밀번호
    cookie : {maxAge : 1000 * 60},
    store: MongoStore.create({
      mongoUrl : "mongodb+srv://admin:qwer1234@cluster0.fretgqc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      dbName: "forum",
    })
  })) 
  

passport.use(new LocalStrategy(async (id,pw,cb) => {
	let result = await db.collection("user").findOne({username : id})
	if (!result) {
		return cb(null, false, {message : "ID가 DB에 없습니다"})
	}
	if (await bcrypt.compare(pw, result.password)) {
		return cb(null, result)
	} else {
		return cb(null, false, {message : "PW가 일치하지 않습니다"});
	}
}))

passport.serializeUser((user, done) => {
	process.nextTick(() => {
		done(null, {id : user._id, username : user.username})
	})
})
passport.deserializeUser(async (user,done) => {
	let result = await db
        .collection("user")
        .findOne({_id : new ObjectId(user.id)});
	delete result.password;
	process.nextTick(() => {
		return done(null, result)
	})
})

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
// app.get("/list", async(req, res) => {
//     let result = await db.collection("post").find().toArray()
//     res.send(result[0].title)
// });


app.get("/list", async(req, res) => {
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

app.delete("/delete", async (req, res) => {
    try {
      let result = await db
        .collection("post")
        .deleteOne({ _id: new ObjectId(req.query.docid) });
      if (result.deletedCount === 1) {
        res.send("삭제완료");
      } else {
        res.send("삭제 실패: 해당 문서를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("삭제 중 오류 발생");
    }
  });


app.get("/list/:id", async (req, res)=>{
	let result = await db.collection("post").find()
		.skip((req.params.id-1)*5).limit(5).toArray();
	res.render("list.ejs", {posts : result})
})


//로그인
app.get('/login', (req, res)=>{
	res.render("login.ejs")
})

app.post("/login", async (req,res,next) => {
	passport.authenticate("local", (error, user, info)=>{
		if (error) return res.status(500).json(error)
		if (!user) return res.status(401).json(info.message)
		req.logIn(user, (err) => {
			if (err) return next(err)
			res.redirect("/list")
		})
	}) (req,res,next)
})

//회원가입
app.get("/register", (req,res)=>{
	res.render("register.ejs");
})
app.post("/register", async (req,res) => {
	let hash = await bcrypt.hash(req.body.password, 10)
	await db.collection("user").insertOne({
		username : req.body.username,
		password : hash
	});
	res.redirect("/login");
})