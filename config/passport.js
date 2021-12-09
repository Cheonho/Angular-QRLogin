// JWT 인증을 사용하기 위한 패스포트 정책 정의
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");
const config = require("./database");

// Passport strategy 정의
module.exports = function (passport) {
  let opts = {};
  // jwt토큰을 헤더에 붙여서 요청할 수 있게 해줌
  // opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.secret;
  // jwt_payload에 user id가 있음
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      // user id가 있으면 user를 출력 없으면 err 출력
      User.getUserById(jwt_payload.data._id, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
};
