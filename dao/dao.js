const bcrypt = require("bcrypt")

const User = require("../models/User")
const Task = require("../models/Task")
const Schedule = require("../models/Schedule")
const Mail = require("../models/mail")
const Oauth_token = require("../models/oauth_token")

const db = require("../db/db")

class dao{

  //--ユーザー関連------------------------
  static async getUserByEmail(email){
    const sql = `
      SELECT * FROM users WHERE email_address = ?
    `
    return await get(sql, [ email ])
  }
  static async getUserById(id){
    const sql = `
      SELECT * FROM users WHERE id = ?
    `
    return await get(sql, [ id ])
  }
  ////////////////////////////////////////////

  //--タスク関連--------------------------------
  static async getTasksByUserId(user_id){
    const sql = `
      SELECT * FROM tasks WHERE user_id = ?
    `
    const result =  await all(sql, [ user_id ])
    // SQliteの場合、真偽値は整数で返るので、真偽値になおす
    result.is_completed = !!result.is_completed
    return result
  }
  
  static async addTaskByUserId(user_id, task){

    // 型が不正なら型エラー
    if (!(task instanceof Task)){
      throw new TypeError("引数はTask型である必要があります。")
    }

    const sql = `
      INSERT INTO tasks
      (user_id, title, content, deadline, is_completed)
      VALUES(?, ?, ?, ?, ?)
    `
    return await run(sql, [ user_id, task.title, task.content, task.deadline, task.is_completed ])
  }

  static async updateTask(task){
    if (!(task instanceof Task)){
      throw new TypeError("引数はTask型である必要があります。")
    }
    else if(!task.id){
      throw new Error("更新にはtask.idが必要です")
    }

    const fields = [];
    const values = [];

    if(task.title){
      fields.push("title = ?");
      values.push(task.title);
    }
    if(task.content){
      fields.push("content = ?");
      values.push(task.content);
    }
    if(task.deadline){
      fields.push("deadline = ?");
      values.push(task.deadline);
    }
    if(task.is_completed){
      fields.push("is_completed = ?");
      values.push(task.is_completed);
    }

    const sql = `
      UPDATE tasks
      SET
        ${fields.join(", ")}
      WHERE
        id = ?
    `
    values.push(task.id);

    return await run(sql, values)
  }

  static async deleteTaskById(id){
    const sql = `
      DELETE FROM tasks WHERE id = ?
    `
    return await run(sql, [ id ])
  }
  /////////////////////////////////////////////////////

  //--スケジュール関連-------------------------
  static async getSchedulesByUserId(user_id) {
    const sql = `
      SELECT * FROM schedules WHERE user_id = ?
    `
    return await all(sql, [ user_id ])
  }

  static async getScheduleById(id){
    const sql = `
      SELECT * FROM schedules WHERE id = ?
    `
    return await get(sql, [ id ]);
  }

  static async addScheduleByUserId(user_id, schedule) {
    if(!(schedule instanceof Schedule)){
      throw new TypeError("引数はSchedule型である必要があります。")
    }

    const sql = `
      INSERT INTO schedules
      (user_id, title, content, start_datetime, end_datetime)
      VALUES(?, ?, ?, ?, ?)
    `
    return await run(sql, [user_id, schedule.title, schedule.content, schedule.start_datetime, schedule.end_datetime ])
  }
  static async updateSchedule(schedule){
    if (!(schedule instanceof Schedule)){
      throw new TypeError("引数はSchedule型である必要があります。")
    }
    else if(!schedule.id){
      throw new Error("更新にはschedule.idが必要です")
    }

    const fields = [];
    const values = [];

    if(schedule.title){
      fields.push("title = ?")
      values.push(schedule.title)
    }
    if(schedule.content){
      fields.push("content = ?")
      values.push(schedule.content)
    }
    if(schedule.start_datetime){
      fields.push("start_datetime = ?")
      values.push(schedule.start_datetime)
    }
    if(schedule.end_datetime){
      fields.push("end_datetime = ?")
      values.push(schedule.end_datetime)
    }
    

    const sql = `
      UPDATE schedules
      SET
        ${fields.join(", ")}
      WHERE
        id = ?
    `
    values.push(schedule.id)

    return await run(sql, values)
  }

  static async deleteSchedule(id){
    const sql = `
      DELETE FROM schedules WHERE id = ?
    `
    return await run(sql, [ id ])
  }
  //////////////////////////////////////////////////////////////////

  //--OAuth認証関連-----------
  
  // トークン保存
  static async setOAuth_token(token){
    if (!(token instanceof Oauth_token)){
      throw new TypeError("引数はOauth_token型である必要があります。");
    }
    const sql = `
        INSERT INTO oauth_tokens
        (user_id, token, refresh_token, deadline, mail_address, provider)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    return await run(sql, [
      token.user_id,
      token.token,
      token.refresh_token,
      token.deadline,
      token.mail_address,
      token.provider
    ]);
  }

  // トークン削除
  static async deleteOAuthTokenByUserId(user_id){
    const sql = "DELETE FROM oauth_tokens WHERE user_id = ?";
    return await run(sql, [user_id]);
  }

  // トークン登録されてるかどうか
  static async isOAuthAuthenticatedByUserId(user_id){
    const sql = "SELECT id FROM oauth_tokens WHERE user_id = ?"
    if (await get(sql, [user_id])) return true;
    else return false;
  }

  // トークン情報取得
  static async getTokenInfoByUserId(user_id){
    const sql = "SELECT * FROM oauth_tokens WHERE user_id = ?";
    const row = await get(sql, [user_id]);

    const token = new Oauth_token({
      id: row.id,
      user_id: row.user_id,
      refresh_token: row.refresh_token,
      deadline: row.deadline,
      mail_address: row.mail_address,
      provider: row.provider
    })

    return token
  }

  // リフレッシュされたトークン情報を保存
  static async refreshToken({id, token, deadline}){
    const sql = `UPDATE oauth_tokens SET token = ?, deadline = ? WHERE id = ?`;
    return await run(sql, [token, deadline, id]);
  }
  ////////////////////////////////////////////////////////

  //--メール関連---------------------

  // メール情報を追加
  static async addMail(user_id, mail){
    if(mail instanceof Mail) throw new TypeError("引数はMail型である必要があります。");

    const sql = `
      INSERT INTO mails
      (user_id, email_id)
      VALUES(?, ?)
    `;

    return await run(sql, [
      user_id,
      mail.email_id
    ]);
  }

  // メールを複数件追加
  static async addMails(user_id, mails){
    const fields = [];
    const values = [];

    mails.forEach((mail)=>{
      if(!(mail instanceof Mail)) throw new TypeError("引数はMail型である必要があります。");
      
      fields.push("(?,?)");
      values.push(user_id, mail.email_id)
    })

    const sql = `
      INSERT OR IGNORE INTO mails
      (user_id, email_id)
      VALUES
        ${fields.join(",")}
    `;

    return await run(sql, values);
  }
  
  static async updateMailSummary(user_id, mail){
    if(mail instanceof Mail) return new TypeError("引数はMail型である必要があります。");
    if(!(mail.summary)) return new Error("mailにはsummaryが必要です。");

    const sql = `
      UPDATE mails
      SET
        summary = ?
      WHERE
        user_id = ?
        and mail_id = ?
    `;

    return await run(sql, [
      mail.summary,
      user_id,
      mail.mail_id
    ]);
  }

  /////////////////////////////////////////////////////////

  //--アカウント関連----------------------------------------

  //新規登録
  static async createUser(name, email, hashedPassword) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (name,email_address, password_hash) VALUES (?, ?, ?)`;
      db.run(sql, [name, email, hashedPassword], function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  }

  //パスワードを変更
  static async updatePassword(userId, hashedPassword) {
    const sql = `UPDATE users SET password_hash = ? WHERE id = ?`;
    return await run(sql, [hashedPassword, userId]);
  }


  //email addressを変更
  static async updateEmail(userId, newEmail) {
  const sql = `UPDATE users SET email_address = ? WHERE id = ?`;
  try {
    const result = await run(sql, [newEmail, userId]);

    // SQLite
    if (result && typeof result.changes !== "undefined") {
      return result.changes > 0; // true ->成功
    }

    return false;
  } catch (err) {
    console.error("updateEmail Error:", err);
    return false;
  }
}

  /////////////////////////////////////////////////////////
}


// Promiseラップ関数--------------------

function run(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err){
      if(err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params=[]){
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if(err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if(err) reject(err);
      else resolve(rows);
    });
  });
}

////////////////////////////////////////////

module.exports = dao