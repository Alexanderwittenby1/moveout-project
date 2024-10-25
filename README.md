# Moveout Project

## Overview
The Moveout Project is a web application designed to assist users in organizing and labeling their cartons when moving houses. It allows users to create labels, record the contents of each box in various formats (text, audio, photo), and generate QR codes to access this information. The system ensures secure data storage and allows for effective data management.

## Prerequisites
Before you can run the project, ensure that you have the following software installed:
- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [MySQL](https://www.mysql.com/) (or any other SQL database)
- [Vscode](https://code.visualstudio.com/download)

## Step 1: Clone the Repository
Clone the repository to your local machine using the following command:
```sh
git clone https://github.com/Alexanderwittenby1/moveout-project.git
```

## Step 2: Install Dependencies
Navigate to the project directory and install the required dependencies:

- cd moveout-project
- npm install


## Step 3: Configure & setting up the Database
First you will need the change the config file located /config/db/moveout.json so that it matches your Mariadb/mysql.


- cd moveout-project/SQL
- Start mariadb/mysql

Now with mariaDB/Mysql running, Run the following commands:

- SOURCE setup.sql
- SOURCE ddl.sql


## Step 4: Start the application

- Move to the rootfolder /moveout-application
- npm run devStart
- The application will be available at http://localhost:8080.




## MIT LICENSE

MIT License

Copyright (c) [2024] [Alexander Wittenby]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

