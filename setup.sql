CREATE DATABASE game;
CREATE USER 'gameuser'@'localhost' IDENTIFIED BY 'gamepass';
GRANT ALL PRIVILEGES ON game.* TO 'gameuser'@'localhost';
FLUSH PRIVILEGES;

USE game;
SOURCE E:/zi/game/game.sql;
