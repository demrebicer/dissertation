<?php

require './application/controller/FormController.php';
require './application/controller/AdminController.php';

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: HEAD, GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method,Access-Control-Request-Headers, Authorization");

$databasePath = 'sqlite:/its/home/db596/public_html/backend/database.sqlite';
// $databasePath = 'sqlite:' . __DIR__ . '/database.sqlite';

try {
    $pdo = new PDO($databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create Objects Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS objects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Create Contact Us Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
} catch (PDOException $e) {
    die("Database Connection Error: " . $e->getMessage());
}

$controller = new FormController($pdo);
$adminController = new AdminController($pdo); 
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($requestUri) {
    case '/~db596/backend/add-object':
        $adminController->addObject();
        break;
    case '/~db596/backend/delete-object':
        $adminController->deleteObject();
        break;
    case '/~db596/backend/add-contact-submission':
        $controller->addContactSubmission();
        break;
    case '/~db596/backend/delete-contact-submission':
        $adminController->deleteContactSubmission();
        break;
    case '/~db596/backend/admin':
        $adminController->displayAdminPage();
        break;
    default:
        $controller->listObjects();
        break;
}
