from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
#from transformers import pipeline
import httpx#, asyncio, json
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

import traceback

import os

app = FastAPI()

origins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]
app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Phi-2-mini を pipeline で読み込み
#model = pipeline(
#    "text-generation",
#    model="rinna/japanese-gpt2-medium"
#)
  
class MailRequest(BaseModel):
  text: str
class TranslateRequest(BaseModel):
  text: str
  target: str
  
OLLAMA_URL = os.getenv("API_OLLAMA_URL")

@app.post("/aitest")
async def aitest(request: MailRequest):
  payload = {
    "model": "phi3:mini",
    "prompt": "Hello",
    "stream": False
  }
  
  try:
    async with httpx.AsyncClient(timeout=30.0) as client:
      resp = await client.post(OLLAMA_URL, json=payload)
      print(f"Ollaam Status Code: {resp.status_code}")
      resp.raise_for_status()
  except Exception as e:
    import traceback
    traceback.print_exc()
    raise HTTPException(status_code=500, detail=str(e))
  
@app.post("/summarize")
async def summarize(request: MailRequest):
  
  # AIに日時などを教える必要があるため、取得する
  now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
  weekday_str = datetime.now().strftime('%A')
  
  prompt = f"""
    あなたは優秀な秘書AIです。
    現在日時は {now_str} ({weekday_str}) です。
    
    以下のメールを解析し、ユーザーのために要約と、必要であればタスクやスケジュールの抽出を{"日本語で"}行ってください。
    
    【判断ルール】
    1. ただの報告や挨拶、雑談の場合 -> categoryは "NONE"
    2. 期限付きの作業や依頼の場合 -> categoryは "TASK"
    3. 会議、面談、イベントなど、特定の時間の拘束がある場合 -> categoryは "SCHEDULE"
    
    【出力フォーマット】
    以下のJSON形式のみを出力してください。余計な解説は不要です。該当しない項目は null にしてください。
    
    {{
      "category": "NONE" または "TASK" または "SCHEDULE",
      "deadline": "YYYY-MM-DDTHH:MM" (タスクの場合の期限。不明ならnull),
      "start_datetime": "YYYY-MM-DDTHH:MM" (予定の開始日時),
      "end_datetime": "YYYY-MM-DDTHH:MM" (予定の終了日時。記載なければ開始から1時間後と仮定),
      "summary": "メール全体の要約",
      "title": "タスクや予定が一目でわかる20文字程度の見出し",
      "detail": "その詳細内容"
    }}

    【メール内容】
    {request.text}
  """
  
  payload = {
    "model": "richardyoung/qwen3-8b-abliterated:Q4_K_M",
    "prompt": prompt,
    "stream": False,  # 逐次表示ではなく一括で受け取る
    "format": "json",  # JSON形式を強制する
    "options":{
      "temperature": 0.1  # 創造性を下げて、ロジックを正確にする
    }
  }
  
  try:
    async with httpx.AsyncClient(timeout=None) as client:
      resp = await client.post(OLLAMA_URL, json=payload)
      resp.raise_for_status()
      ai_response = resp.json()
      
      # AIが返した文字列としてのJSONをPythonオブジェクトに変換する
      import json
      return json.loads(ai_response["response"])
    
  except Exception as e:
    import traceback
    traceback.print_exc()
    raise HTTPException(status_code=500, detail="AI解析に失敗しました")
  
  #result = await asyncio.to_thread(model, prompt, max_new_tokens=100, pad_token_id=50256)
  #text = result[0]["generated_text"]
  
  #デバッグ用
  #print("AI出力:\n", text)
  
  #try:
    #json_start = text.find("{")
    #parsed = json.loads(text[json_start:])
    #parsed = text.split("summary:")[-1].split("\n")[0].strip()
  #except Exception:
    #parsed = None
  
  #return parsed
  
# 翻訳API

# LibreTranslate 対応言語（主要言語）

LANGUAGES = {
  "ja": "日本語",
  "en": "English",
  "fr": "Français",
  "de": "Deutsch",
  "es": "Español",
  "it": "Italiano",
  "pt": "Português",
  "ru": "Русский",
  "zh": "中文",
  #"ne": "नेपाली" ネパール語は公式の安定版にてサポートされていない
}

@app.get("/languages")
async def get_languages():
  return LANGUAGES

LIBRE_URL = "http://127.0.0.1:5000/translate"

@app.post("/translate")
async def translate(request: TranslateRequest):
  payload = {
    "q": request.text,
    "source": "auto",
    "target": request.target,
    "format": "text"
  }
  #print(payload)
  
  try:
    limits = httpx.Limits(max_connections=1, max_keepalive_connections=0)
    async with httpx.AsyncClient(limits=limits, timeout=30.0) as client:
      resp = await client.post(LIBRE_URL, json=payload)
      resp.raise_for_status()
      data = resp.json()
      return {"translatedText": data["translatedText"]}
      
  except Exception as e:
    print("Translate API Error")
    traceback.print_exc()
    return {"error": repr(e)}