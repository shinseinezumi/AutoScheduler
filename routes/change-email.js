const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const dao = require("../dao/dao");
const path = require("path");


// GET /change-email を表示
router.get("/", (req, res) => {
    if (!req.user) {
        return res.redirect("/login");
    }

    res.render("change-email/change-email", { 
        currentEmail: req.user.email_address, 
        messages: req.flash("error") 
    });
});


// POST /change-email（メールアドレス変更API）
router.post("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "ログインが必要です。" });
    }

    const userId = req.user.id;
    const newEmail = req.body.newEmail?.trim();

    // 入力を検証
    if (!newEmail) {
      return res.status(400).json({ success: false, message: "メールアドレスを入力してください。" });
    }

    // メールアドレスの形式を検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ success: false, message: "正しいメールアドレスを入力してください。" });
    }

    // 更新
    const updated = await dao.updateEmail(userId, newEmail);

    if (!updated) {
      return res.status(500).json({ success: false, message: "メールアドレスの更新に失敗しました。" });
    }

    // 成功
    return res.json({ success: true, message: "メールアドレスを変更しました。" });

  } catch (error) {
    console.error("メール変更エラー:", error);
    return res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
  }
});




module.exports = router