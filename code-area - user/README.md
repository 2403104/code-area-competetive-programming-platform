# ⚡ CodeArena — Online Judge Platform

> Submit. Judge. Compete.

CodeArena is a fully self-hosted online judge platform where users can solve programming problems, get real-time verdict feedback, and track their submission history — just like Codeforces or LeetCode, but yours.

---

## ✨ Features

- 🖊️ **Rich Code Editor** — Write code with syntax highlighting, auto-formatting, and minimap support
- 🌐 **Multi-Language Support** — C++, Python, Java, and JavaScript out of the box
- ⚙️ **Real-Time Judging** — Watch your code being judged testcase by testcase, live
- ✅ **Custom Checker** — Problems use testlib.h based checkers for flexible output validation
- 🛡️ **Sandboxed Execution** — All code runs inside isolated Docker containers
- ⏱️ **Time Limit Enforcement** — Per-problem time limits with accurate runtime measurement
- 📋 **Pre-Test Run** — Test your code against sample cases before the final submission
- 📊 **Submission History** — Every submission is saved with verdict, runtime, and source code
- 🔐 **Auth Protected** — Only logged-in users can submit or run code

---

## 🚀 Verdicts

| Verdict | Meaning |
|---|---|
| ✅ Accepted | All testcases passed |
| ❌ Wrong Answer | Output didn't match expected |
| ⏰ Time Limit Exceeded | Code ran too slow |
| 💥 Runtime Error | Code crashed during execution |
| 🔴 Compilation Error | Code failed to compile |

---

## 📸 How It Works

```
Write Code → Submit → Docker Container Spins Up
                            ↓
              Compile → Run Each Testcase → Check Output
                            ↓
              Live Progress: "Running on testcase 3..."
                            ↓
                     Final Verdict ⚡
```

---

## 🗂️ Project Structure

```
CodeArena/
├── frontend/          # React app — editor, verdict, submissions
├── auth-server/       # User auth & submission history  (port 3001)
└── judge-server/      # Code execution & judging        (port 3002)
```
---

## 📌 Roadmap

- [ ] Leaderboard & rankings
- [ ] Problem difficulty ratings
- [ ] Contest mode
- [ ] Admin panel for problem creation
- [ ] Support for more languages

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

<div align="center">
  Built with ❤️ for the competitive programming community
</div>