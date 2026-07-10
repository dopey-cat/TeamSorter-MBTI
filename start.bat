@echo off
cd /d e:\issue3\test3\test1_0119\test1
start "MBTI系统" cmd /k npm run dev
timeout /t 3
start http://localhost:8080
