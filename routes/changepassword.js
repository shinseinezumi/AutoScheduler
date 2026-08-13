const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const dao = require("../dao/dao");
const path = require("path");

// GET /changepassword を表示
router.get("/", (req, res) => {
    res.render("changepassword/changepassword", { messages: req.flash("error") }); // changepassword.ejs を表示
});


function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.status(401).json({ ok: false, message: "ログインしてください" });
}

// POST /changepassword
router.post("/changepassword", ensureAuth, async (req, res) => {
  try {
    const { current, newpw } = req.body;
    const userId = req.user.id;

    // 1. ユーザ情報を取得
    const user = await dao.getUserById(userId);
    if (!user) return res.status(404).json({ ok: false, message: "ユーザーが存在しません" });

    // 2. パスワードを照合
    if (!bcrypt.compareSync(current, user.password_hash)) {
      return res.json({ ok: false, message: "現在のパスワードが正しくありません。" });
    }

    // 3. 新しパスワード hash
    const hashed = await bcrypt.hash(newpw, 10);

    // 4. データベースのパスワードを更新
    await dao.updatePassword(userId, hashed);

    // 成功 → mypage にリダイレクトさせる
    res.json({ ok: true, redirect: "/mypage" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "サーバーエラー" });
  }
});


module.exports = router