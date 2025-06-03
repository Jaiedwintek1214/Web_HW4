const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'sqlite.db');

// 確保 db 目錄存在
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// 檢查資料庫檔案是否存在
const dbExists = fs.existsSync(dbPath);

// 開啟資料庫
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('無法開啟資料庫:', err.message);
    } else {
        console.log('成功開啟資料庫');
        if (!dbExists) {
            console.log('資料庫不存在，已新建資料庫');
        }
    }
});

module.exports = db;

