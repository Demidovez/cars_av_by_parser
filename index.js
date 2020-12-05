const CONFIG = require("./config/config");
const express = require("express");
const bodyParser = require("body-parser");
const Parser = require("./parser/parser");

// Инициализируем сервер запросов
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Инициализируем парсер и пробуем запуститься
const parser = new Parser();
parser.tryStart();

// Принимаем команду на изменение настроек парсер
app.post("/edit_cars_av_by_parser", (req, res) => {
  const options = req.body;

  parser.setOptions(options);

  res.send("OK");
});

app.listen(CONFIG.PORT, () =>
  console.log(`Парсер запущен на порту ${CONFIG.PORT}`)
);
