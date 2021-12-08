const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const config = require("../config/database");

const forge = require("node-forge");
const fs = require("fs");

const pki = forge.pki;

// CA의 인증서와 개인키를 파일에서 pem 객체로 읽어옴
const caCertPem = fs.readFileSync("config/caCert.pem", "utf8");
const caPrivateKeyPem = fs.readFileSync("config/caPrivateKey.pem", "utf8");

// pem객체로부터 인증서, 개인키 파싱
const caCert = pki.certificateFromPem(caCertPem);
const caPrivateKey = pki.privateKeyFromPem(caPrivateKeyPem);

// Users root
router.get("/", (req, res, next) => {
  res.send("<h1>Users ROOT</h1>");
});

// Register
router.get("/register", (req, res, next) => {
  res.send("<h1>사용자 등록</h1>");
});

// Login
router.get("/login", (req, res, next) => {
  res.send("<h1>로그인</h1>");
});

// Profile
router.get("/profiletest", (req, res, next) => {
  res.send("<h1>프로필</h1>");
});

// Register
// 1. 사용자 등록
router.post("/register", (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  });

  // user.js에 보면 getUserByUsername는 username을 검색하는 메서드
  User.getUserByUsername(newUser.username, (err, user) => {
    if (err) throw err;
    if (user) {
      return res.json({
        success: false,
        msg: "같은 아이디가 존재합니다, 다른 아이디를 입력해주세요",
      });
    } else {
      // user.js를 보면 addUser는 password를 hash화하는 메서드
      User.addUser(newUser, (err, user) => {
        if (err) {
          res.json({ success: false, msg: "사용자 등록 실패" });
        } else {
          res.json({ success: true, msg: "사용자 등록 성공" });
        }
      });
    }
  });
});

// 2. 사용자 인증 및 JWT 토큰 발급
router.post("/authenticate", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  // db에 등록되어 있는지 확인
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({ success: false, msg: "등록된 사용자가 없습니다." });
    }
    // 가져온 user의 password와 사용자가 입력한 password 비교  - isMatch라는 T,F로 결과가 나옴
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        let tokenUser = {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
        };
        const token = jwt.sign({ data: tokenUser }, config.secret, {
          expiresIn: 604800, // 1 week -> 유효기간 설정
        });
        res.json({
          success: true,
          token: token,
          userNoPW: tokenUser,
        });
      } else {
        return res.json({ success: false, msg: "패스워드가 맞지 않습니다." });
      }
    });
  });
});

// 3. Profile 요청, JWT 이용 필요
// profile API 접근을 토큰을 이용해서만 하도록 설정
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({
      user: {
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
      },
    });
  }
);

// 3-1. product 요청, JWT 이용 필요
router.get(
  "/product",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({
      user: {
        product: "Notebook",
        price: "1,000,000",
      },
    });
  }
);

// 4. 사용자 리스트 응답
router.get("/list", (req, res, next) => {
  User.getAll((err, users) => {
    if (err) throw err;
    res.json(users);
  });
});

// 5. 인증서 발급
router.post("/cert", (req, res, next) => {
  let cert = pki.createCertificate();
  cert.publicKey = pki.publicKeyFromPem(req.body.publicKey);
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  var userAttrs = [
    {
      shortName: "CN",
      value: req.body.common,
    },
    {
      shortName: "C",
      value: req.body.country,
    },
    {
      shortName: "ST",
      value: req.body.state,
    },
    {
      shortName: "L",
      value: req.body.locality,
    },
    {
      shortName: "O",
      value: req.body.organization,
    },
    {
      shortName: "OU",
      value: req.body.orgUnit,
    },
  ];
  cert.setSubject(userAttrs);

  var caAttrs = [
    {
      shortName: "CN",
      value: caCert.subject.getField("CN").value,
    },
    {
      shortName: "C",
      value: caCert.subject.getField("C").value,
    },
    {
      shortName: "ST",
      value: caCert.subject.getField("ST").value,
    },
    {
      shortName: "L",
      value: caCert.subject.getField("L").value,
    },
    {
      shortName: "O",
      value: caCert.subject.getField("O").value,
    },
    {
      shortName: "OU",
      value: caCert.subject.getField("OU").value,
    },
  ];
  cert.setIssuer(caAttrs);
  cert.setExtensions([
    {
      name: "basicConstraints",
      cA: true,
    },
    {
      name: "keyUsage",
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: "extKeyUsage",
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true,
    },
    {
      name: "nsCertType",
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true,
    },
    {
      name: "subjectAltName",
      altNames: [
        {
          type: 6, // URI
          value: "http://example.org/",
        },
        {
          type: 7, // IP
          ip: "127.0.0.1",
        },
      ],
    },
    {
      name: "subjectKeyIdentifier",
    },
  ]);
  cert.sign(caPrivateKey);
  let certPem = pki.certificateToPem(cert);
  User.saveCert(req.body.common, certPem, (err, cert) => {
    if (err) throw err;
    if (cert) {
      return res.json({
        success: true,
        cert: certPem,
        caCert: caCertPem,
      });
    } else {
      return res.json({
        success: false,
        msg: "Certificate issuing failed...",
      });
    }
  });
});

// 6. 전자서명 로그인
router.post("/authenticateSig", (req, res, next) => {
  const username = req.body.username;
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({ success: false, msg: "User not found!" });
    } else {
      // 유저의 인증서 검증
      const currentTime = req.body.currentTime; // client 현재 시간
      const signatureHex = req.body.signatureHex;
      const certPem = user.cert;
      const cert = pki.certificateFromPem(certPem);
      const publicKey = cert.publicKey;
      const signature = forge.util.hexToBytes(signatureHex);
      const common = cert.subject.getField("CN").value;
      const currentTime1 = new Date().getTime(); // Server 현재 시간
      const diffTime = currentTime1 - currentTime; // time difference
      let md = forge.md.sha1.create();
      md.update(username + currentTime, "utf8");
      if (!publicKey.verify(md.digest().bytes(), signature)) {
        return res.json({
          success: false,
          msg: "Login not successful. Digital signature not valid... ",
        });
      }

      // 전자 서명 확인
      let verified1 = publicKey.verify(md.digest().bytes(), signature);

      // 인증서 확인
      let verified2 = caCert.verify(cert);

      // 시간 확인
      let verified3 = false;
      if (diffTime < 3600000) verified3 = true;

      // username 확인
      let verified4 = false;
      if (username == common) verified4 = true;

      if (
        verified1 == true &&
        verified2 == true &&
        verified3 == true &&
        verified4 == true
      ) {
        let tokenUser = {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
        };
        const token = jwt.sign({ data: tokenUser }, config.secret, {
          expiresIn: 604800, // 1 week = 7*24*60*60
        });
        res.json({
          success: true,
          token: token,
          userNoPW: tokenUser,
          msg: "One-click signature login successful",
        });
      } else {
        return res.json({
          success: false,
          msg: "Login not successful. Something wrong... ",
        });
      }
    }
  });
});

// router 객체를 모듈화
module.exports = router;
