const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcrypt")
const dao = require("../dao/dao")
const passport = require("passport")
const oauthService = require("../utils/oauthService")
const gmailService = require("../utils/gmailService")
const axios = require("axios")

router.get("/login", (req, res) => {
  res.redirect("/test/login.html")
})
router.post("/login", passport.authenticate("local", {
  successRedirect: "/test/mypage",
  failureRedirect: "/test/login.html"
}));

router.get("/mypage", (req,res) => {
  if(!req.isAuthenticated()) return res.redirect("/test/login");
  let tasks = dao.getTasksByUserId(req.user.id)
  let tasks_contents = tasks.map(t => t.content)
  res.send(`
    こんにちは ${req.user.name}さん。
    あなたのタスクは「${tasks_contents}」となっています。
    `)
});

router.get("/logout", (req,res) => {
  req.logout(err => {
    if(err) return next(err);
    res.redirect("/test/login");
  });
});


router.get("/test", async (req,res) => {
  const data = await gmailService.getGmailMessagesByUserId(req.user.id)
  res.render("test/test", {data})
})

router.get("/summarize", async (req, res) => {
  res.render("test/summarize")
})

router.post("/summarize", async (req, res) => {
  const { text } = req.body;
  const response = await axios.post("http://localhost:8000/summarize", { text });
  
  res.json({
    status: "success",
    aiResult: response.data
  });
})

router.get("/daoTask", async (req, res) => {
  res.render("test/daoTask");
})

router.get("/translate", async (req, res)=>{
  res.render("test/translate")
})
router.post("/translate", async (req, res) =>{
  const { text, target } = req.body;
  console.log(text, target)
  const response = await axios.post("http://0.0.0.0:8000/translate", {text, target});

  res.json({
    status: "success",
    result: response.data
  })
})

router.get("/originTranslate", async (req, res)=>{
  res.render("test/originTranslate")
})

router.get("/aitest", async (req, res) => {
  res.render("test/aitest");
})

module.exports = router;