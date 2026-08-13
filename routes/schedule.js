const express = require('express');
const router = express.Router();
const dao = require('../dao/dao');
const Schedule = require('../models/Schedule');

// --- カレンダー ---
// 実際のURL: /schedule/calendar
// 対応するビュー: views/schedule/calendar.ejs
router.get('/calendar', async (req, res) => {
  const userId = req.user.id;
  const events = await dao.getSchedulesByUserId(userId);
  res.render('schedule/calendar', { events });
});

// --- 新規予定フォーム（予定追加ボタンからの遷移） ---
// 実際のURL: /schedule/form
// 対応するビュー: views/schedule/form.ejs
router.get('/form', (req, res) => {
  res.render('schedule/form', { date: null });
});


// --- 新規予定フォーム（日付セルのクリックからの遷移） ---
// 実際のURL: /schedule/form/:id
router.get('/form/:date', (req, res) => {
  const date = req.params.date || null;
  
  res.render('schedule/form',{ date: date });
});

// --- 新規予定登録 ---
// 実際のURL: /schedule/form
router.post('/form', async (req, res) => {
  try{
    const { title, start_datetime, end_datetime, memo } = req.body;
    const userId = req.user.id;

    await dao.addScheduleByUserId(
      userId,
      new Schedule({
        title: title,
        content: memo,
        start_datetime: start_datetime,
        end_datetime: end_datetime
      })
    );

    // リクエストがJSONを求めている場合は、画面遷移せずにJSONだけ返す
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(200).json({ status: 'success', message: '登録しました' });
    }

    res.redirect('/schedule/calendar');
  } catch (err) {
    console.error(err);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ status: 'error', message: '登録に失敗しました' });
    }
    res.redirect('/');
  }
})

// --- 編集更新 ---
router.post('/detail/:id', async (req, res) => {
  const { title, start_datetime, end_datetime, memo } = req.body;

  await dao.updateSchedule(
    new Schedule({
      id: req.params.id,
      title,
      start_datetime,
      end_datetime,
      content: memo
    })
  );

  // 
  res.redirect(`/schedule/dailyList/${start_datetime.substring(0,10)}`);
});

// --- 詳細ページ ---
// 実際のURL: /schedule/detail/:date
// 対応するビュー: views/schedule/detail.ejs
router.get('/detail/:id', async (req, res) => {

  const scheduleId = req.params.id;
  const userId = req.user.id;

  const schedule = await dao.getScheduleById(scheduleId);

  // 存在チェック & 所有者チェック
  if(!schedule || schedule.user_id !== userId) {
    return res.status(403).send("アクセス権限がありません");
  }

  // 詳細画面レンダリング
  res.render('schedule/detail', { schedule });
});

// 予定一覧画面
router.get("/dailyList/:date", async (req, res) => {
  const date = req.params.date;
  const userId = req.user.id;

  const dayEvents = (await dao.getSchedulesByUserId(userId))
    .filter(e => e.start_datetime.startsWith(date));

  res.render("schedule/dailyList", { date, dayEvents })
})

// 予定削除
router.post("/delete/:id", async (req, res) => {
  const scheduleId = req.params.id;
  const userId = req.user.id;
  
  const schedule = await dao.getScheduleById(scheduleId);

  if(!schedule) return res.redirect("/schedule/calendar");
  if(schedule.user_id !== userId) return res.status(403).send("権限がありません");

  await dao.deleteSchedule(scheduleId)
  res.redirect(`/schedule/dailyList/${schedule.start_datetime.split("T")[0]}`)
})

module.exports = router;
