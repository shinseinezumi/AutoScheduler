const express = require("express");
const router = express.Router();

router.get("", (req, res) => {
  req.logout((err)=>{
    if(err) return next(err);

    // セッション破棄
    req.session.destroy(()=>{
      res.redirect("/login");
    })
  })
})

module.exports = router;