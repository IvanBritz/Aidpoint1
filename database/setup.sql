-- Financial Aid App Database Setup
-- Run this script to create the MySQL database

CREATE DATABASE IF NOT EXISTS financial_aid_app;
USE financial_aid_app;

-- Verify database creation
SELECT DATABASE() as current_database;

-- Show current date and time
SELECT NOW() as setup_time;
