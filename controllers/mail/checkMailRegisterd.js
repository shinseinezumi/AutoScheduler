const dao = require("../../dao/dao")


async function checkMailRegisterd(req, res, next){
  if(!await dao.isOAuthAuthenticatedByUserId(req.user.id)){
    res.redirect("/auth/connect-gmail")
    return
  }
  else{
    next()
  }

}

module.exports = checkMailRegisterd