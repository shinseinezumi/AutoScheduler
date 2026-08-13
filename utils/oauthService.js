const axios = require("axios")
const dao = require("../dao/dao")
const {google} = require("googleapis")
const oauth_token = require("../models/oauth_token")

class oauthService{
  
  // トークンをもとにアカウント情報を取得
  static async getInfoByUserId(user_id){

    const access_token = await oauthService.getValideAccessTokenByUserId(user_id)
    
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
      headers:{
        Authorization: `Bearer ${access_token}`,
      },
    });

    return response.data
  }

  // トークン情報をもとに再取得
  static async refreshAccessToken(tokenInfo){
    const refresh_token = tokenInfo.refresh_token
    const tokenEndpoint = "https://oauth2.googleapis.com/token";

    let response;
    try {
      // アクセストークン再取得
      response = await axios.post(tokenEndpoint, {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refresh_token,
        grant_type: "refresh_token"
      });
    } catch(err) {
      console.error("リフレッシュトークンが無効になりました。再ログインが必要です。:" + err)
      return false
    }

    // データ抽出
    const newAccessToken = response.data.access_token;
    const expireAt = new Date(Date.now() + response.data.expires_in * 1000);

    // トークン情報を書き換え
    await dao.refreshToken({
      id:tokenInfo.id,
      token:newAccessToken,
      deadline: expireAt
    })

    tokenInfo.token = newAccessToken;
    tokenInfo.deadline = expireAt;

    return true
  }

  // 有効なアクセストークンを取得する(有効期限が切れている場合に自動的に更新して返す)
  static async getValideAccessTokenByUserId(user_id){

    const tokenInfo = await dao.getTokenInfoByUserId(user_id)

    if(!tokenInfo){
      throw new Error("指定されたユーザーIDのトークン情報が存在しません");
    }

    // 有効期限を確認
    const isValide = Date.now() < tokenInfo.deadline

    // 有効期限切れならトークンを再取得
    if(!isValide){
      const result = await oauthService.refreshAccessToken(tokenInfo)

      if(!result){
        await dao.deleteOAuthTokenByUserId(user_id);
        throw new Error("NEED_REAUTH");
      }
    }

    return tokenInfo.token
  }

  static async getOAuthClientByUserId(user_id){
    // トークン取得
    const tokenInfo = await dao.getTokenInfoByUserId(user_id)

    // トークンの有効期限をチェック
    tokenInfo.token = await oauthService.getValideAccessTokenByUserId(user_id)

    // OAuth2クライアントを作成
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    // 保存しているアクセストークンをセット
    oauth2Client.setCredentials({
      access_token: tokenInfo.token,
      refresh_token: tokenInfo.refresh_token,
    });

    return oauth2Client
  }
}

module.exports = oauthService