import subprocess
import time
import uvicorn
import sys  # 使ってないかも
import requests
import shutil
import os

#libretranslteのコマンドのフルパスを取得
lt_cmd = shutil.which("libretranslate")
#見つからない場合、仮想環境の中を探す
if lt_cmd is None:
  possible_path = os.path.join(os.path.dirname(sys.executable), "libretranslate")
  if os.path.exists(possible_path):
    lt_cmd = possible_path

if lt_cmd is None:
  #デバッグ用:どこを探したか表示
  print(f"DEBUG: sys.executable is {sys.executable}")
  raise RuntimeError("libretranslate コマンドが見つかりません。pip install libretranslate-cli を確認してください")

lt_process = subprocess.Popen(
  [
    lt_cmd, "--port", "5000",
    "--update-models",
    "--load-only", "ja,en,fr,de,es,it,pt,ru,zh"
  ],
  stdout=subprocess.DEVNULL,
  stderr=None,
)


print("LibreTranslate 起動中...")
#libretranslateの起動を待つ
while True:
  if lt_process.poll() is not None:
    stderr = lt_process.stderr.read()
    print(stderr)
    raise RuntimeError("Libretranslateが起動に失敗しました。")
  try:
    resp = requests.get("http://localhost:5000/languages", timeout=1)
    if resp.status_code == 200:
      print("LibreTranslate起動完了")
      break
  except requests.exceptions.RequestException:
    pass
  time.sleep(1)

print("FastAPI 起動します")
uvicorn.run("server:app", host="0.0.0.0", port=8000)