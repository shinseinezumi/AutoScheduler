const { spawn } = require("child_process");
const path = require("path");
const os = require("os");


// 仮想環境のpythonを指定
// OSに応じてPythonの実行パスを切り替える
const pythonPath = os.platform() === "win32"
  ? path.join(
    __dirname,
    //"..",
    //"..",
    //"servers",
    //"api-server",
    "api",
    "venv",
    "Scripts",
    "python.exe"
  )
  : path.join(
    __dirname,
    "api",
    "venv",
    "bin",
    "python"
  );

const venvScripts = os.platform() === "win32"
  ? path.join(
    __dirname,
    //"..",
    //"..",
    //"servers",
    //"api-server",
    "api",
    "venv",
    "Scripts"
  )
  : path.join(
    __dirname,
    "api",
    "venv",
    "bin"
  )

// FastAPI + LibreTranslateを起動
console.log("FastAPIサーバーを起動します...");

const fastapi = spawn(
  pythonPath,
  ["main.py"],
  {
    //cwd: path.join(__dirname, "..", "..", "servers", "api-server"),
    cwd: path.join(__dirname, "api"),
    stdio: "inherit",
    env:{
      ...process.env,
      PATH: `${venvScripts};${process.env.PATH}`,
    },
  }
  //[path.join(__dirname, "..", "..", "他サーバー", "api-server", "main.py")], {
);

// Node.js サーバーを起動
console.log("Node.js サーバーを起動します...");

const nodeServer = spawn("node", [path.join(__dirname, "app.js")], {
  stdio: "inherit",
});

// 処理終了
process.on("SIGINT", () => {
  fastapi.kill("SIGINT");
  nodeServer.kill("SIGINT");
  process.exit();
});