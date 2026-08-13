class oauth_token{
    constructor({id=null, user_id, token, refresh_token, deadline=null, mail_address, provider}){
        this.id = id
        this.user_id = user_id
        this.token = token
        this.refresh_token = refresh_token
        this.deadline = deadline
        this.mail_address = mail_address
        this.provider = provider
    }
}

module.exports = oauth_token