const express = require("express")
const session = require("express-session")
const path = require("path");
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const fs  = require("fs")
const flash = require("connect-flash")

const passport = require("./controllers/passport/passport")
const dao = require("./dao/dao")

const app = express();
const port = 3000;

dotenv.config();

// テンプレートエンジンの設定
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// -- セッション設定・パスポート設定 ------------------------

// セッション初期設定
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// フラッシュを使用
app.use(flash())

// passport初期化
app.use(passport.initialize());
app.use(passport.session());

///////////////////////////////////////////////////////

// req.bodyのため
// JSONボディを自動で解析するらしい
app.use(express.json());
// URLエンコードされたフォームの解析（らしい）
app.use(express.urlencoded({ extended: true }));

// テスト中の場合は実行しない
// if(!(process.env.TEST == "true")){
// 試験的に強制する
if(true){
  // ログイン済みかどうか検証
  app.use((req,res,next) => {

    const publicPaths = ["/login", "/test/login", "/signup"]
    // 一部パスは除外
    if (publicPaths.includes(req.path)) return next();
    // ログインしていれば次へ
    if(req.isAuthenticated()) return next();
    // ログインしていなければログインページへ
    res.redirect("/login");
  })
}

// 自動でログインする(AUTO_LOGINがtrueのときのみ)
if(process.env.AUTO_LOGIN == "true"){
  app.use(async (req, res, next) => {
    if(!req.isAuthenticated()){
      const user = await dao.getUserById("1");
      req.login(user, (err) => {
        if(err)return next(err)
        next()
      })
    } else {
      next()
    }
  })
}

app.get("/", (req, res) => {
  res.redirect("/login");
});

// フォルダを静的フォルダとして登録
app.use("/public", express.static(path.join(__dirname, 'public')));


// routesフォルダ内を自動読み込み
const routesPath = path.join(__dirname, "routes");

fs.readdirSync(routesPath).forEach(file => {
  // .jsファイル以外はスキップ
  if(!file.endsWith(".js")) return;

  // ファイルをrequireする
  const route = require(path.join(routesPath, file));

  // ファイル名から拡張子 .js を除いた部分をルート名として使用する
  let routeName = "/" + file.replace(".js", "");

  // もしファイル名が "index.js" なら、ルートパスを"/"にする
  if (routeName === "/index") routeName = "/";

  // ルートを登録
  app.use(routeName, route);
});

// テスト用
if (process.env.TEST == "true"){
  app.use("/test", express.static(path.join(__dirname, "test")));
  const testRoutes = require("./routes/test");
  app.use("/test", testRoutes)
}

app.listen(port, () => {
  console.log(`Server runnning at http://localhost:${port}`);
});
