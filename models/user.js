const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../config/database");

// User Scheme 생성
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true, // 사용자가 반드시 입력을 해야 하게 만듬
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cert: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("User", UserSchema);

// id로 검색해서 값을 반환
// findById는 mongoose model의 메서드
User.getUserById = function (id, callback) {
  User.findById(id, callback);
};

// username으로 검색해서 값을 반환
User.getUserByUsername = function (username, callback) {
  const query = { username: username };
  User.findOne(query, callback);
};

// 새로운 User 추가 ( 비번을 salt값을 추가해 hash화 )
User.addUser = function (newUser, callback) {
  bcrypt.genSalt(config.rounds, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

// 사용자가 입력한 password와 db 비교
// candidatePassword => 현재 입력하는 password
User.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};

User.getAll = function (callback) {
  User.find(callback);
};

// 인증서 저장
User.saveCert = function (username, cert, callback) {
  const query = { username: username };
  const update = { cert: cert };
  User.findOneAndUpdate(
    query,
    update,
    { new: true, useFindAndModify: false },
    callback
  );
};
module.exports = User;
