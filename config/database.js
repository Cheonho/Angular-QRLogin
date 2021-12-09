// 27017은 mongoDB의 기본 포트 번호
module.exports = {
  // database: 'mongodb://localhost:27017/meanauth',
  database:
    "mongodb+srv://sg02146:b9zwvFzvEhUi34mk@cluster0.iis0v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  secret: "yoursupersecret",
  rounds: 10,
};
