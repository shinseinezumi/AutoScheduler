const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const dao = require("../dao/dao");
const path = require("path");

// GET /signup を表示
router.get("/", (req, res) => {
    res.render("signup/signup", { messages: req.flash("error") }); // signup.ejs を表示
});

// POST signup処理
router.post("/", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({ message: "全ての項目を入力してください" });
        }

        // パスワードハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);

        // DAOでユーザー作成
        await dao.createUser(name, email, hashedPassword);

        res.status(200).json({ message: "登録完了" });
    } catch(err) {
        console.error("登録エラー:", err);
        res.status(500).json({ message: "登録に失敗しました" });
    }
});


module.exports = router
