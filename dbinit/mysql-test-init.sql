CREATE DATABASE IF NOT EXISTS converso_chat_test;

USE converso_chat_test;

CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  contacts TEXT NOT NULL,
  notificationSoundStatus BOOLEAN DEFAULT false,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
