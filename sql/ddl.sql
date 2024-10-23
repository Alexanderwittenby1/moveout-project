DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS boxes;
DROP TABLE IF EXISTS box_contents;
DROP TABLE IF EXISTS user_actions;

-- Skapa tabellen Users
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    verification_code VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATE DEFAULT CURRENT_DATE,
    profile_picture VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    google_id VARCHAR(255),
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Skapa tabellen Boxes
CREATE TABLE Boxes (
    box_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    box_name VARCHAR(50) NOT NULL,
    audio_file_url VARCHAR(255),
    picture_file_url VARCHAR(255),
    label_design VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    background VARCHAR(50),
    visibility VARCHAR(50) DEFAULT 'public',
    pin VARCHAR(6),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Skapa tabellen Labels
CREATE TABLE Labels (
    label_id INT PRIMARY KEY AUTO_INCREMENT,
    box_id INT NOT NULL,
    label_name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (box_id) REFERENCES Boxes(box_id)
);

-- Skapa tabellen BoxContents
CREATE TABLE BoxContents (
    content_id INT PRIMARY KEY AUTO_INCREMENT,
    box_id INT NOT NULL,
    content_type ENUM('text', 'audio', 'image') NOT NULL,
    content_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (box_id) REFERENCES Boxes(box_id)
);



CREATE TABLE BoxShares (
    share_id INT PRIMARY KEY AUTO_INCREMENT,
    box_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (box_id) REFERENCES Boxes(box_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);


DROP PROCEDURE IF EXISTS create_user;

DELIMITER //

CREATE PROCEDURE create_user(
    IN email VARCHAR(255),
    IN password_hash VARCHAR(255),
    IN first_name VARCHAR(100),
    IN last_name VARCHAR(100),
    IN is_verified BOOLEAN
)
BEGIN
    IF EXISTS (SELECT 1 FROM Users WHERE email = email) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User already exists';
    ELSE
        INSERT INTO Users (email, password_hash, first_name, last_name, is_verified)
        VALUES (email, password_hash, first_name, last_name, is_verified);
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE list_users()
BEGIN
    SELECT user_id, email, first_name, last_name, is_admin, created_at
    FROM Users;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE update_user(
    IN p_user_id INT,
    IN p_email VARCHAR(255),
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_is_admin BOOLEAN
)
BEGIN
    UPDATE Users
    SET email = p_email,
        first_name = p_first_name,
        last_name = p_last_name,
        is_admin = p_is_admin
    WHERE user_id = p_user_id;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE delete_user(
    IN p_user_id INT
)
BEGIN
    DELETE FROM Users
    WHERE user_id = p_user_id;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE deactivate_user(
    IN p_user_id INT
)
BEGIN
    UPDATE Users
    SET is_active = FALSE
    WHERE user_id = p_user_id;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE deactivate_inactive_users()
BEGIN
    SELECT * FROM Users WHERE last_active < NOW() - INTERVAL 30 DAY AND is_active = TRUE;
    UPDATE Users
    SET is_active = FALSE
    WHERE last_active < NOW() - INTERVAL 30 DAY AND is_active = TRUE;
END //

DELIMITER ;

CREATE EVENT deactivate_users_event
ON SCHEDULE EVERY 1 MINUTE
DO
CALL deactivate_inactive_users();

-- Trigger för att uppdatera last_active
DELIMITER //

CREATE TRIGGER update_last_active
BEFORE UPDATE ON Users
FOR EACH ROW
BEGIN
    IF NEW.is_active = TRUE THEN
        SET NEW.last_active = NOW();
    END IF;
END //

DELIMITER ;
