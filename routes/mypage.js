const express = require("express");
const router = express.Router();
const dao = require("../dao/dao")
const passport = require("passport")

router.get("/", async (req, res) => {
  try {
    const user = await dao.getUserById(req.user.id);
    const isAuth = await dao.isOAuthAuthenticatedByUserId(req.user.id)

    res.render("mypage/mypage", { user, isAuth });
  } catch (err) {
    console.error(err);
    res.status(500).send("ユーザー情報の取得に失敗しました。");
  }
});

module.exports = router