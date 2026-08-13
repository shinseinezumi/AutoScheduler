const express = require("express");
const router = express.Router();
const dao = require("../dao/dao")
const passport = require("passport")

router.get("", async (req, res) => {
  const user = await dao.getUserById(req.user.id)
  res.render('mainmenu/mainMenu', {user})
})

module.exports = router;