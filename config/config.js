/* eslint-disable */

module.export = {
  "development": {
    "username": "root",
    "password": process.env.DB_PASSWORD,
    "database": "converso_chat",
    "host": "mysql_db",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": process.env.TEST_DB_PASSWORD,
    "database": "converso_chat_test",
    "host": "mysql_db_test",
    "dialect": "mysql"
  }
};
