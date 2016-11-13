@echo ==========大鸿汽配系统正在运行，请缩小此窗口，不要关闭。==========

mysqldump -u root -psa dahongcar >.\backup\%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%.sql
start http://localhost:18080
node app.js