const express = require("express");
const router = express.Router();
const dao = require("../dao/dao")
const passport = require("passport")

// Google認証ルート
router.get("/google", 
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/gmail.readonly"
    ],
    accessType: "offline",
    prompt: "consent"
  })
);
// Googleコールバック
router.get("/google/callback",
  passport.authenticate("google", {failureRedirect:"/login"}),
  (req,res) => {
    res.redirect("/mypage")
  }
)
// トークン削除
router.post("/delete", (req,res)=>{
  result = dao.deleteOAuthTokenByUserId(req.user.id)
  res.redirect("/mypage")
})

// メールアドレス登録要求ページ
router.get("/connect-gmail", (req, res)=>{
  res.render("oauth/required")
})

module.exports = router;