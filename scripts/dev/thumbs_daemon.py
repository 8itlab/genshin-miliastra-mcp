"""在登录的桌面会话里常驻：轮询临时目录（MILIASTRA_SCRATCH，没设就用系统临时目录下的 miliastra-dev）里 thumbs\\queue 的 .py，逐个执行，输出写到同名 .log。
这样后续任务可以从 SSH 投递，不用每次都在桌面上按 Win+R。放一个 stop 文件就退出。"""
import subprocess, sys, tempfile, time, os
from pathlib import Path
Q = Path(os.environ.get("MILIASTRA_SCRATCH") or Path(tempfile.gettempdir()) / "miliastra-dev") / "thumbs" / "queue"; Q.mkdir(parents=True, exist_ok=True)
(Q / "daemon.alive").write_text(str(os.getpid()))
while not (Q / "stop").exists():
    jobs = sorted(Q.glob("*.py"))
    if not jobs:
        (Q / "daemon.alive").write_text(str(time.time())); time.sleep(1); continue
    job = jobs[0]; running = job.with_suffix(".running")
    try:
        os.replace(job, running)
    except OSError:  # 文件还在上传
        time.sleep(1); continue
    with open(job.with_suffix(".log"), "w", encoding="utf-8") as log:
        code = subprocess.call([sys.executable, "-u", str(running)], stdout=log, stderr=subprocess.STDOUT, cwd=str(Path(__file__).resolve().parent))
        log.write(f"\n[exit {code}]\n")
    os.replace(running, job.with_suffix(".done"))
(Q / "stop").unlink()
