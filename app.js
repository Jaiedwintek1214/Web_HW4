var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// 新增：引入 sqlite3 並開啟 db/sqlite.db
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'sqlite.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}
const dbExists = fs.existsSync(dbPath);
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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// /api/guava 路由，回傳 guava 資料表的所有資料
app.get('/api/guava', (req, res) => {
    db.all('SELECT * FROM guava_prices_fixed_format', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

// 新增 post /api 路由
app.post('/api', (req, res) => {
    // 這裡僅回傳收到的資料，可根據需求修改
    res.json({ received: req.body });
});

module.exports = app;
