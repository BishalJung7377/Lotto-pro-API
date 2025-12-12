CREATE DATABASE IF NOT EXISTS railway;

USE railway;



-- Lottery Pro Database Schema

-- Super Admin Table
CREATE TABLE SUPER_ADMIN (
    super_admin_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lottery Master Table
CREATE TABLE LOTTERY_MASTER (
    lottery_id INT PRIMARY KEY AUTO_INCREMENT,
    lottery_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    start_number INT NOT NULL,
    end_number INT NOT NULL,
    status ENUM('active','inactive') DEFAULT 'inactive',
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE LOTTERY_MASTER
  ADD COLUMN lottery_number CHAR(3) NOT NULL AFTER lottery_name,
  ADD COLUMN launch_date DATE NULL AFTER price,
  ADD COLUMN state VARCHAR(50) NULL AFTER launch_date;



select * from LOTTERY_MASTER;
-- Many-to-many between Super Admin and Lottery Master
CREATE TABLE SUPER_ADMIN_LOTTERY (
    super_admin_id INT,
    lottery_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(super_admin_id, lottery_id),
    FOREIGN KEY(super_admin_id) REFERENCES SUPER_ADMIN(super_admin_id),
    FOREIGN KEY(lottery_id) REFERENCES LOTTERY_MASTER(lottery_id)
);

-- Store Owner Table
CREATE TABLE STORE_OWNER (
    owner_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store Table

Create TABLE STORES (
    store_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,                 -- FK to STORE_OWNER
    store_name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zipcode VARCHAR(20),  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lottery_ac_no VARCHAR(255) NOT NULL,
    lottery_pw VARCHAR(255) NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES STORE_OWNER(owner_id)
);

select * from STORES;


select * from LOTTERY_MASTER;
DROP TABLE IF EXISTS store_lottery_inventory;

CREATE TABLE STORE_LOTTERY_INVENTORY (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id INT NOT NULL,
  lottery_id INT NOT NULL,                 -- 👈 FK to PRIMARY KEY in LOTTERY_MASTER
  serial_number VARCHAR(32) NOT NULL,
  total_count INT NOT NULL DEFAULT 0,
  current_count INT NOT NULL DEFAULT 0,
  status ENUM('inactive','active','finished') DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (store_id) REFERENCES STORES(store_id),
  FOREIGN KEY (lottery_id) REFERENCES LOTTERY_MASTER(lottery_id)
);


ALTER TABLE STORE_LOTTERY_INVENTORY
ADD COLUMN direction ENUM('unknown','asc','desc') 
        NOT NULL DEFAULT 'unknown'
        AFTER current_count;


-- Ticket Scan Log Table

CREATE TABLE SCANNED_TICKETS (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id INT NOT NULL,
  lottery_type_id INT NOT NULL,
  barcode_data VARCHAR(64) NOT NULL,
  ticket_number INT NULL,          -- pack number (ZZZ) if provided
  scanned_by INT NULL,             -- user/store-owner id who scanned
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES STORES(store_id),
  FOREIGN KEY (lottery_type_id) REFERENCES LOTTERY_MASTER(lottery_id),
  FOREIGN KEY (scanned_by) REFERENCES STORE_OWNER(owner_id)   -- or STORE_OWNER(owner_id) if that’s your auth table
);

-- Ticket Scan Log Table
-- CREATE TABLE TICKET_SCAN_LOG (
--     scan_id INT PRIMARY KEY AUTO_INCREMENT,
--     book_id INT NOT NULL,
--     store_id INT NOT NULL,
--     lottery_id INT NOT NULL,
--     ticket_number INT NOT NULL,
--     scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY(book_id) REFERENCES STORE_LOTTERY_INVENTORY(id),
--     FOREIGN KEY(store_id) REFERENCES STORES(store_id),
--     FOREIGN KEY(lottery_id) REFERENCES LOTTERY_MASTER(lottery_id)
-- );


-- Daily Report Table
CREATE TABLE DAILY_REPORT (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    lottery_id INT NOT NULL,
    book_id INT NOT NULL,
    scan_id INT NOT NULL,
    report_date DATE NOT NULL,
    tickets_sold INT NOT NULL DEFAULT 0,
    total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_daily_report (store_id, lottery_id, book_id, report_date),
    FOREIGN KEY(store_id) REFERENCES STORES(store_id),
    FOREIGN KEY(lottery_id) REFERENCES LOTTERY_MASTER(lottery_id),
    FOREIGN KEY(book_id) REFERENCES STORE_LOTTERY_INVENTORY(id),
    FOREIGN KEY(scan_id) REFERENCES SCANNED_TICKETS(id)
);


-- Owner Report View
CREATE VIEW OWNER_REPORT AS
SELECT
    so.owner_id,
    so.name AS owner_name,
    s.store_name,
    l.lottery_name,
    SUM(dr.tickets_sold) AS total_tickets_sold,
    SUM(dr.total_sales) AS total_sales,
    MIN(dr.report_date) AS start_date,
    MAX(dr.report_date) AS end_date
FROM DAILY_REPORT dr
JOIN STORES s ON dr.store_id = s.store_id
JOIN STORE_OWNER so ON s.owner_id = so.owner_id
JOIN LOTTERY_MASTER l ON dr.lottery_id = l.lottery_id
GROUP BY
    so.owner_id,
    so.name,
    s.store_name,
    l.lottery_name;


-- CREATE TABLE TICKET_SCAN_LOG (
--     scan_id INT PRIMARY KEY AUTO_INCREMENT,
--     serial_number VARCHAR(32) NOT NULL,   -- FIXED to match parent table
--     ticket_number INT NOT NULL,
--     scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     clerk_name VARCHAR(100),
--     remarks VARCHAR(255),
--     FOREIGN KEY(serial_number) REFERENCES store_lottery_inventory(serial_number)
-- );

-- Daily Report Table
-- CREATE TABLE DAILY_REPORT (
--     report_id INT PRIMARY KEY AUTO_INCREMENT,
--     store_id INT NOT NULL,
--     owner_id INT NOT NULL,
--     lottery_id INT NOT NULL,
--     book_id INT NOT NULL,
--     date DATE NOT NULL,
--     tickets_sold INT NOT NULL,
--     remaining_tickets INT NOT NULL,
--     start_ticket_number INT NOT NULL,
--     closing_ticket_number INT NOT NULL,
--     total_sales DECIMAL(10,2) NOT NULL,
--     generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY(store_id) REFERENCES STORES(store_id),
--     FOREIGN KEY(owner_id) REFERENCES STORE_OWNER(owner_id),
--     FOREIGN KEY(lottery_id) REFERENCES LOTTERY_MASTER(lottery_id),
--     FOREIGN KEY(book_id) REFERENCES store_lottery_inventory(book_id)
-- );

-- Owner Report View
-- CREATE VIEW OWNER_REPORT AS
-- SELECT
--     dr.owner_id,
--     s.store_name,
--     l.lottery_name,
--     SUM(dr.tickets_sold) AS total_tickets_sold,
--     SUM(dr.total_sales) AS total_sales,
--     MIN(dr.start_ticket_number) AS start_ticket,
--     MAX(dr.closing_ticket_number) AS end_ticket,
--     MIN(dr.date) AS start_date,
--     MAX(dr.date) AS end_date
-- FROM DAILY_REPORT dr
-- JOIN STORES s ON dr.store_id = s.store_id
-- JOIN LOTTERY_MASTER l ON dr.lottery_id = l.lottery_id
-- GROUP BY dr.owner_id, s.store_name, l.lottery_name;
