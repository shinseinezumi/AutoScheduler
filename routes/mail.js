const express = require("express");
const router = express.Router();
const dao = require("../dao/dao")
const passport = require("passport");
const checkMailRegisterd = require("../controllers/mail/checkMailRegisterd");
const gmailService = require("../utils/gmailService")
const path = require("path")

router.use("",checkMailRegisterd)

router.get("", (req, res) => {
  const defaultPage = "1";
  res.redirect(path.join("mail", defaultPage))
})

router.get("/:page", async (req, res) => {
  const page = req.params.page
  try {
    const mails = await gmailService.getGmailMessagesByUserId(req.user.id, page)
    const mailCount =  await gmailService.getTotalMailCountByUserId(req.user.id)
    res.render("mail/index",{mails, mailCount, page})
  } catch (err) {
    if(err.message === "NEED_REAUTH") {
      console.warn("トークンが失効しています。再ログインしてください。");
      return res.redirect("/auth/google")
    }
    throw err;
  }
})

router.get("/detail/:mail_id", async (req, res) => {
  const mail_id = req.params.mail_id
  const mail = await gmailService.getMailDetail(req.user.id, mail_id)
  
  res.render("mail/detail",{mail})
})

module.exports = router;