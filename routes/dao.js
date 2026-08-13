const express = require("express");
const router = express.Router();
const dao = require("../dao/dao")
const passport = require("passport")
const Mail = require("../models/mail")
const Schedule = require("../models/Schedule")
const Task = require("../models/Task")


const asyncHttpHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if(err.statusCode) res.status(err.statusCode).json({ success: false, error: err.message});
    else{
      console.error(err);
      res.status(500).json({ success: false, error: "サーバー内部エラー"});
    }
  });
};


//--タスク関連-------------------------------------------------
// 取得
router.get("/tasks", asyncHttpHandler(async (req, res) => {
    const tasks = await dao.getTasksByUserId(req.user.id);
    return res.json({success: true, tasks: tasks})
}));

// 追加
router.post("/tasks", asyncHttpHandler(async (req, res) => {
    const data = req.body;
    const task = new Task({
      title: data.title,
      content: data.content,
      deadline: data.deadline
    })

    const result = await dao.addTaskByUserId(req.user.id, task)
    task.id = result.lastID;

    res.status(201).json({ success:true, data: task });
}));

// 更新
router.put("/tasks", asyncHttpHandler(async (req, res) => {
  const data = req.body;
  const task = new Task({
    id: data.id,
    title: data.title,
    content: data.content,
    deadline: data.deadline,
    is_completed: data.is_completed || false
  })
  const result = await dao.updateTask(task)
  res.json({success: true, changes: result.changes})
}))

// 削除
router.delete("/tasks", asyncHttpHandler(async (req, res) => {
  const data = req.body;
  const result = await dao.deleteTaskById(data.id);

  if (result.changes === 0) throw new Error(`タスク(id=${data.id})が存在しません`);

  res.json({ success: true, changes: result.changes });
}))

//////////////////////////////////////////////////////

//--スケジュール関連------------------------------------------

// 取得
router.get("/schedules", asyncHttpHandler(async (req, res) => {
  const schedules = await dao.getSchedulesByUserId(req.user.id);
  return res.json({ success: true, schedules: schedules });
}))

// 追加
router.post("/schedules", asyncHttpHandler(async (req, res) => {
  const data = req.body;
  const schedule = new Schedule({
    title: data.title,
    content: data.content,
    start_datetime: data.start_datetime,
    end_datetime: data.end_datetime
  });
  const result = await dao.addScheduleByUserId(req.user.id, schedule);
  schedule.id = result.lastID;

  res.status(201).json({ success: true, data: schedule });
}))

// 更新
router.put("/schedules", asyncHttpHandler(async (req, res) => {
  const data = req.body;
  const schedule = new Schedule({
    id: data.id,
    title: data.title,
    content: data.content,
    start_datetime: data.start_datetime,
    end_datetime: data.end_datetime
  });
  const result = await dao.updateSchedule(schedule);
  res.json({ result: true, changes: result.changes});
}));

// 削除
router.delete("/schedules", asyncHttpHandler(async (req, res) => {
  const data = req.body;
  const id = data.id;
  const result = await dao.deleteSchedule(id);

  if (result.changes === 0) throw new Error(`スケジュール(id=${data.id})が存在しません`);

  res.json({ result: true, changes: result.changes });
}));

///////////////////////////////////////////////////////////





module.exports =router;