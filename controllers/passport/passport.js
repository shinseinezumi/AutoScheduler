const express = require("express");
const dao = require("../../dao/dao")
const Oauth_token = require("../../models/oauth_token")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const {Strategy: GoogleStrategy} = require("passport-google-oauth20");
const bcrypt = require("bcrypt");

const dotenv = require("dotenv")

dotenv.config()

// セッションにユーザー情報を保存・復元
passport.serializeUser((user, done) => {
  done(null, user.id);
})
passport.deserializeUser(async (id, done) => {
  const user = await dao.getUserById(id);
  done(null,user);
})

// ローカル認証戦略の定義
passport.use(new LocalStrategy({
  usernameField: "email", // HTMLフォームのname属性に合わせる必要がある
  passwordField: "password"
}, async (email, password, done) => {
  
  if(!email || !password) return done(null, false, {message: "メールアドレスとパスワードを入力してください"});

  // メールアドレスからユーザー情報取得
  const user = await dao.getUserByEmail(email);
  // メールアドレスからユーザー情報を取得できなかった場合
  if (!user) return done(null, false, {message: "入力されたメールアドレスは登録されていません"});
  // パスワードが違った場合
  if (!bcrypt.compareSync(password, user.password_hash)) return done(null, false, {message: "パスワードが違います" });

  // 認証
  return done(null, user);
}))

// Google認証戦略の定義
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true,
  scope: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.readonly"
  ]
},async (req, accessToken, refreshToken, params, profile, done) => {
  
  // 有効期限取得
  const expiresIn = params.expires_in;
  const expireAt = new Date(Date.now() + expiresIn * 1000)  // Dateはミリ秒単位なので、それに合わせるために*1000
  
  let o = new Oauth_token({
    user_id: req.user.id,
    token: accessToken,
    refresh_token: refreshToken,
    mail_address: profile.emails[0].value,
    deadline: expireAt,
    provider: "google"
  })
  await dao.setOAuth_token(o)
  
  const localUser = req.user
  return done(null, localUser)
}));

module.exports = passport