const {google} = require("googleapis")
const oauth = require("./oauthService")
const oauthService = require("./oauthService")
const dao = require("../dao/dao")
const Mail = require("../models/mail")


class gmail{

  static async getGmailMessagesByUserId(user_id, page=1){
    
    // OAuthクライアント取得
    const auth = await oauthService.getOAuthClientByUserId(user_id)

    // Gmail APIクライアント作成
    const gmail = google.gmail({ version: "v1", auth: auth});


    let pageToken = null;
    const maxResults = 20;

    // ページ番号に応じて pageToken を進める
    for (let i = 1; i < page; i++) {
      // メール一覧を取得
      const res = await gmail.users.messages.list({
        userId: "me",
        maxResults,
        pageToken,
      });
      pageToken = res.data.nextPageToken;
      if (!pageToken) {
        // 次のページが存在しない場合
        return [];
      }
    }

    // 対象ページのメッセージ一覧を取得
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      pageToken,
    })

    const messages = listRes.data.messages;
    if (!messages || messages.length == 0){
      console.log("メッセージが見つかりません")
      return [];
    }

    // 並列で各メールの詳細情報を取得
    const detailPromises = messages.map(msg => 
      gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      })
    );
    const detailResponses = await Promise.all(detailPromises)

    // 結果を整形
    const result = detailResponses.map(res => {
      const payload = res.data.payload;
      const headers = payload.headers;
      return {
        id: res.data.id,
        subject: headers.find(h => h.name === "Subject")?.value || "(件名なし)",
        from: headers.find(h => h.name === "From")?.value || "(不明)",
        date: headers.find(h => h.name === "Date")?.value || "(日付不明)",
        snippet: res.data.snippet || "",
      };
    })

    // 結果をDB用に整形
    const resultForDB = result.map(m => {
      return new Mail({
        email_id: m.id
      })
    })

    dao.addMails(user_id,resultForDB)
    return result;
  }

  // メール総数を返す
  static async getTotalMailCountByUserId(user_id){
    const auth = await oauthService.getOAuthClientByUserId(user_id)
    const gmail = google.gmail({version: "v1", auth })

    const res = await gmail.users.getProfile({
      userId: "me",
    });

    return res.data.messagesTotal;
  }

  // メール詳細情報を返す
  static async getMailDetail(user_id, mail_id){
    // OAuthクライアント取得
    const auth = await oauthService.getOAuthClientByUserId(user_id)

    // Gmail APIクライアント作成
    const gmail = google.gmail({ version: "v1", auth: auth});

    // メール情報を取得
    const res = await gmail.users.messages.get({
      userId: "me",
      id: mail_id,
      format: "full",
    });

    const data = res.data
    const headers  = data.payload.headers

    const subject = headers.find(h => h.name == "Subject")?.value || "";
    const from = headers.find(h => h.name === "From")?.value || "";
    const date = headers.find(h => h.name === "Date")?.value || "";

    // 本文取得（Base64でコード）
    let body = "";
    if (data.payload.body?.data) {
      body = Buffer.from(data.payload.body.data, "base64").toString("utf-8");
    } else if (data.payload.parts) {
      const part = data.payload.parts.find(p => p.mimeType === "text/plain");
      if (part?.body?.data) {
        body = Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }

    const mail = {
      subject,
      from,
      date,
      body,
    }

    return mail
  }
}


module.exports = gmail