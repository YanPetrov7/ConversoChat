module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      contacts: {
        type: DataTypes.TEXT, // Изменили тип данных на TEXT
        allowNull: false,
        defaultValue: "[]", // Установили значение по умолчанию в виде пустого JSON-массива
        get() {
          // Парсим хранящийся JSON-массив при чтении значения из базы данных
          const contacts = this.getDataValue("contacts");
          return JSON.parse(contacts);
        },
        set(contacts) {
          // Сериализуем и сохраняем JSON-массив при установке значения в базу данных
          this.setDataValue("contacts", JSON.stringify(contacts));
        },
        validate: {
          notEmpty: true
        }
      }
    });
  return User;
}