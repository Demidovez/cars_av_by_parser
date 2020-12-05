const CONST = require("./constants");

class Helper {
  // Достаем модель
  static getModel(breadcrumb) {
    if (breadcrumb) {
      return breadcrumb.length == 4 ? breadcrumb[1].rawText : "";
    }

    return "";
  }

  // Достаем серию
  static getSeries(breadcrumb) {
    if (breadcrumb) {
      return breadcrumb.length == 4 ? breadcrumb[2].rawText : "";
    }

    return "";
  }

  // Достаем поколение
  static getGeneration(title, series) {
    if (title && series) {
      return title.substring(
        title.indexOf(series) + series.length + 1,
        title.indexOf(",")
      );
    }

    return "";
  }

  // Достаем год
  static getYear(title) {
    if (title) {
      return parseInt(
        title.substring(title.indexOf(",") + 2, title.indexOf(",") + 6)
      );
    }

    return -1;
  }

  // Достаем дату создания объявления
  // TODO: А точно 3 пункта может быть? видел 4, с добавлением "поднято 9 часов назад"
  static getDateRelease(stats) {
    if (stats) {
      return stats.length == 3 ? stats[1].rawText : "";
    }

    return "";
  }

  // Достаем внутренний ID (артикул)
  static getIdInner(stats) {
    if (stats) {
      return stats.length == 3 ? parseInt(stats[2].rawText.split(" ")[1]) : -1;
    }

    return -1;
  }

  // Достаем цену в рублях
  static getPrice(price) {
    if (price) {
      return parseFloat(price.replace("р.", "").replace(/[^.,\d]/g, ""));
    }

    return -1;
  }

  // Достаем цену в доллах
  static getPriceUsd(price) {
    if (price) {
      return parseFloat(price.replace(/[^.,\d]/g, ""));
    }

    return -1;
  }

  // Достаем коробку передач
  static getTransmission(params) {
    if (params) {
      return params.split(", ")[1];
    }

    return "";
  }

  // Достаем объем двигателя
  static getVolumeEngine(params) {
    if (params) {
      return parseFloat(params.split(", ")[2].replace(/[^.,\d]/g, ""));
    }

    return -1;
  }

  // Достаем вид топливо
  static getFuel(params) {
    if (params) {
      return params.split(", ")[3];
    }

    return "";
  }

  // Достаем пробег
  static getMileage(mileage) {
    if (mileage) {
      return parseFloat(mileage.replace(/[^.,\d]/g, ""));
    }

    return -1;
  }

  // Достаем кузов
  static getCarcase(description) {
    if (description) {
      // TODO: А точно 3 пункта может быть (кузов, привод, цвет)?
      return description.split(", ").length == 3
        ? description.split(", ")[0]
        : this._getCommonElement(description.split(", "), CONST.CARCASE);
    }

    return "";
  }

  // Достаем привод
  static getGearing(description) {
    if (description) {
      return description.split(", ").length == 3
        ? description.split(", ")[1]
        : this._getCommonElement(description.split(", "), CONST.GEARING);
    }

    return "";
  }

  // Достаем цвет
  static getColor(description) {
    if (description) {
      return description.split(", ").length == 3
        ? description.split(", ")[2]
        : this._getCommonElement(description.split(", "), CONST.COLOR);
    }

    return "";
  }

  // Достаем город
  static getCity(location) {
    if (location) {
      return location.indexOf(",") > 0
        ? location.substring(0, location.indexOf(","))
        : location;
    }

    return "";
  }

  // Достаем фото, если нет то сохраняем ссылку на заглушку
  static getImage(listPhoto) {
    if (listPhoto) {
      return listPhoto.length > 0
        ? listPhoto[0].rawAttrs.match(/data-src="(.*?)"/)[1]
        : "https://static1.cargurus.com/gfx/reskin/no-image-available.jpg";
    }

    return "";
  }

  // Достаем описание
  static getDescription(description) {
    if (description) {
      return description;
    }

    return "";
  }

  // Достаем возможность обмена
  static getPossOfExchange(exchange) {
    if (exchange) {
      return exchange;
    }

    return "";
  }

  // Достаем опцию - Системы безопасности
  static getSecuritySystems(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Системы безопасности, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[0]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  // Достаем опцию - Подушки
  static getCushions(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Подушки, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[1]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  // Достаем опцию - Системы помощи
  static getHelpSystems(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Системы помощи, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[2]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  // Достаем опцию - Экстерьер
  static getExterior(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Экстерьер, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[3]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  // Достаем опцию - Интерьер
  static getInterior(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Интерьер, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[4]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  // Достаем опцию - Фары
  static getHeadlights(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Фары, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[5]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  // Достаем опцию - Климат
  static getClimate(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Климат, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[6]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  // Достаем опцию - Обогрев
  static getHeating(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Обогрев, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[7]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  // Достаем опцию - Мультимедиа
  static getMultimedia(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Мультимедиа, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[8]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  // Достаем опцию - Комфорт
  static getComfort(options) {
    if (options) {
      for (let indx in options) {
        // Если опция - Комфорт, то пункты сводим в одну строку и разделяем символом "|"
        if (options[indx].childNodes[0].innerText == CONST.OPTIONS[9]) {
          return options[indx].childNodes[1].childNodes
            .map((item) => item.innerText)
            .join("|");
        }
      }
    }

    return "";
  }

  /*
   *
   * Вспомогательные функции
   *
   * */
  // Поиск первого общего елемента в двух массивах
  static _getCommonElement(arr1, arr2) {
    for (let indx in arr1) {
      if (arr2.includes(arr1[indx])) return arr1[indx];
    }

    return "";
  }
}

module.exports = Helper;
