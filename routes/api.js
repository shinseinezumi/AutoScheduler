const express = require("express");
const { APIS } = require("googleapis/build/src/apis");
const router = express.Router();

const apiBaseUrl = process.env.API_BASE_URL;

const handler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((e) =>{
    console.error("APIエラー:", e);
    res.status(500).json({ success: false, error: "API接続に失敗しました。" });
  });
};

// 翻訳対応言語を取得
router.get("/languages", handler(async (req, res)=>{
  const response = await fetch(`${apiBaseUrl}/languages`);

  if(!response.ok) {
    throw new Error(`APIサーバーがエラーを返しました: ${response.status}`);
  }

  const data = await response.json();

  return res.json(data);
}));

// 翻訳を実行する
router.post("/translate", handler(async (req,res) => {
  const response = await fetch(`${apiBaseUrl}/translate`,{
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  return res.json(data);
}));

// AI要約
router.post("/summarize", handler(async (req, res) => {
  const response = await fetch(`${apiBaseUrl}/summarize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();
  return res.json(data);
}));

module.exports = router;