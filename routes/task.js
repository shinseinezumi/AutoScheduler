const express = require("express");
const router = express.Router();
const dao = require("../dao/dao")
const passport = require("passport")

router.get("", (req, res) => {
  const tasks = dao.getTasksByUserId(req.user.id)
  res.render("task/index", {tasks})
})

module.exports = router;