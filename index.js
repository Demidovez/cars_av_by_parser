const CONFIG = require("./config/config");
const express = require("express");
const bodyParser = require("body-parser");
const Parser = require("./parser/parser");

// Инициализируем сервер запросов
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Инициализируем парсер
const parser = new Parser();
parser.init();

// Принимаем команду на изменение настроек парсера
app.post("/edit_cars_av_by_parser", (req, res) => {
  const options = req.body;

  parser.setOptions(options);

  // Обратно серверу отвечаем, что все ОК
  res.sendStatus(200);
});

app.listen(CONFIG.PORT, () =>
  console.log(`Парсер запущен на порту ${CONFIG.PORT}`)
);
