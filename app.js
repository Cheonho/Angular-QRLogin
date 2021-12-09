// express로 만든 웹 서버
const express = require("express");
const path = require("path");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");

const users = require("./routes/users");

// DB 불러오기
const config = require("./config/database");
// Connect to Database
mongoose.connect(config.database);
// on Connection
mongoose.connection.on("connected", () => {
  console.log("Connected to Database" + config.database);
});
// on Error
mongoose.connection.on("error", (err) => {
  console.log("Database error:" + err);
});

const app = express();

// port number
// const port = 3000;
const port = process.env.PORT || 3000;

// use는 클라이언트의 요청 전에 선언
// 클라이언트의 요청사항을 수행하기 전에 먼저 실행
// app.use(function (req,res, next) {
//     console.log('Time : ', Date.now());
//     next()
// });

// CORS 미들웨어
app.use(cors());

// JSON 활용을 위한 미들웨어
app.use(express.json());

// URL 인코딩된 데이터의 활용을 위한 미들웨어
app.use(express.urlencoded({ extended: true }));

// 라우터 설정
// http://localhost:3000/users 이런식으로 들어갈 수 있는 페이지를 설정
app.use("/users", users);

// Set Static Folder를 사용하도록 설정하는 미들웨어
// static folder 지정
// 처음 page가 시작하는 경로를 public폴더로 설정
app.use(express.static(path.join(__dirname, "public")));

// Passport 미들웨어
app.use(passport.initialize());
app.use(passport.session());
// (passport)는 입력 parameter
require("./config/passport")(passport);

// start server
app.listen(port, function () {
  console.log("1 : Server started on port " + port);
  console.log(`2 : Server started on port ${port}`);
});

// 위에 있는 거랑 같음 방식만 다름
//app.listen(port, () => {
//    console.log("Server started on port"+port);
//});

// req => request, res => response
// localhost:3000 웹으로 연결
app.get("/", (req, res) => {
  res.send("<h1>서비스 준비중입니다...</h1>");
});
