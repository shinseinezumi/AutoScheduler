class Schedule{
  constructor({id, user_id, title, content, start_datetime, end_datetime}){
    this.id = id
    this.user_id = user_id
    this.title = title
    this.content = content
    this.start_datetime = start_datetime
    this.end_datetime = end_datetime
  }
}

module.exports = Schedule