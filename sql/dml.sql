-- Skapa några användare
INSERT INTO Users (email, password_hash, first_name, last_name, is_verified) VALUES
('john.doe@example.com', 'hashed_password_123', 'John', 'Doe', False),
('jane.smith@example.com', 'hashed_password_456', 'Jane', 'Smith', False),
('alice.johnson@example.com', 'hashed_password_789', 'Alice', 'Johnson', FALSE);

-- Lägga till några lådor för användarna
INSERT INTO Boxes (user_id, content, qr_code_url, label_design) VALUES
(1, 'Kitchen Utensils', 'QR001', 'fragile'),
(1, 'Bedroom Items', 'QR002', 'heavy'),
(2, 'Office Supplies', 'QR003', 'fragile'),
(3, 'Books and Magazines', 'QR004', 'clothes');



-- Lägga till innehåll i lådorna
INSERT INTO BoxContents (box_id, content_type, content_data) VALUES
(1, 'text', 'Forks, knives, spoons, spatulas, pans'),
(1, 'audio', '/audio/kitchen_items.mp3'),
(2, 'text', 'Pillows, blankets, bedside lamp'),
(2, 'image', '/images/bedroom_items.jpg'),
(3, 'text', 'Notebooks, pens, paper clips, stapler'),
(4, 'text', 'Novels, magazines, travel guides'),
(4, 'image', '/images/books_magazines.jpg');


-- Lägga till några användaraktiviteter
INSERT INTO UserActions (user_id, action_type, action_details) VALUES
(1, 'create', 'Created a new box: Kitchen Utensils'),
(1, 'update', 'Added contents to box: Kitchen Utensils'),
(2, 'create', 'Created a new box: Office Supplies'),
(3, 'create', 'Created a new box: Books and Magazines'),
(3, 'update', 'Added image to box: Books and Magazines');
