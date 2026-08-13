class User {
  constructor({id, name, email_address, password_hash}) {
    this.id = id
    this.name = name
    this.email_address = email_address
    this.password_hash = password_hash
  }
}

module.exports = User;