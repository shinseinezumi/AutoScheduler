const express = require("express");
const router = express.Router();
const dao = require("../dao/dao")
const passport = require("passport")

router.get("", (req, res) => {
  // ログイン済みならメインメニューへ
  if(req.isAuthenticated()){
    res.redirect("mainMenu")
    return
  }

  // ログインページを表示する
  res.render("login/login", {
    messages: req.flash("error")  // Passportの失敗メッセージ(Passportからの失敗メッセージは"error"に入る)
  })
})



router.post("", passport.authenticate("local", {
  successRedirect: "./mainMenu",
  failureRedirect: "./login",
  failureFlash: true  // flashメッセージ有効化
}));
module.exports = router;