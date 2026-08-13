const form = document.getElementById("form");
form.addEventListener("submit", async (e)=>{
  e.preventDefault();

  const text = document.getElementById("text").value;

  try{
    const resp = await fetch("http://127.0.0.1:8000/aitest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text
      })
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(errorData.detail || "失敗しました");
    }

    const data = await resp.json();

    //document.getElementById("result").innerText = data;
    console.log(data)

  } catch (err) {
    console.error("解析エラー:", err);
    alert("エラーが発生しました: " + err.message);
    summaryView.innerText = "解析失敗";
  }
})