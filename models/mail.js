class Mail {
  constructor({id, user_id, email_id, summary=null}){
    this.id = id
    this.user_id = user_id
    this.email_id = email_id
    this.summary = summary
  }
}

module.exports = Mail;