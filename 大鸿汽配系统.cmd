@echo ====================�������ϵͳ�������У�����С�˴��ڣ���Ҫ�رա�====================
git pull
mysqldump -u root -psa dahongcar >.\backup\%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%%time:~0,2%%time:~3,2%%time:~6,2%.sql
start http://localhost:18080
node app.js