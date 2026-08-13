class Task {
  constructor({id, user_id, title, content, deadline, is_completed=false}){
    this.id = id
    this.user_id = user_id
    this.title = title
    this.content = content
    this.deadline = deadline
    this.is_completed = is_completed
  }
}

module.exports = Task;