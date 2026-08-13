const form = document.getElementById("tf");
form.addEventListener("submit", async (e)=>{
  e.preventDefault();

  const text = document.getElementById("text").value;
  const target = document.getElementById("target").value;

  try{
    const resp = await fetch("http://127.0.0.1:5000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: target,
        format: "text"
      })
    });

    if (!resp.ok) {
      throw new Error(`サーバーエラー:${resp.status}`);
    }

    const data = await resp.json();
    document.getElementById("result").innerText = data.translatedText;

  } catch (err) {
    document.getElementById("result").innerText = "エラー: " + err;
  }
})