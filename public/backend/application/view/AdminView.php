<?php

$customSessionPath = "/its/home/db596/tmp";

if (!file_exists($customSessionPath)) {
    mkdir($customSessionPath, 0700, true);
}

ini_set('session.save_path', $customSessionPath);

session_start();

if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) || 
    $_SERVER['PHP_AUTH_USER'] != 'admin' || $_SERVER['PHP_AUTH_PW'] != 'admin') {
    
    header('WWW-Authenticate: Basic realm="Özel Alan"');
    header('HTTP/1.0 401 Unauthorized');
    
    echo 'You do not have permission to view this page.';
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Panel</title>
    <style>
        table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
        }
        th, td {
            padding: 10px;
        }
    </style>
</head>
<body>

<h1>Add New Object</h1>
<form method="post" action="/~db596/backend/add-object">
    <label for="name">Name:</label><br>
    <input type="text" id="name" name="name"><br>
    <label for="description">Description:</label><br>
    <textarea id="description" name="description"></textarea><br><br>
    <input type="submit" value="Add">
</form>

<h2>Existing Objects</h2>
<table>
    <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Creation Date</th>
        <th>Actions</th>
    </tr>
    <?php foreach ($objects as $object): ?>
    <tr>
        <td><?= htmlspecialchars($object['name']) ?></td>
        <td><?= htmlspecialchars($object['description']) ?></td>
        <td><?= $object['created_at'] ?></td>
        <td>
        <form method="post" action="/~db596/backend/delete-object">
                <input type="hidden" name="id" value="<?= $object['id'] ?>">
                <input type="submit" value="Delete">
            </form>
        </td>
    </tr>
    <?php endforeach; ?>
</table>

<h2>Contact Form Submissions</h2>
<table>
    <tr>
        <th>Name</th>
        <th>Surname</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Message</th>
        <th>Submission Date</th>
        <th>Actions</th>
    </tr>
    <?php foreach ($contactSubmissions as $submission): ?>
    <tr>
        <td><?= htmlspecialchars($submission['name']) ?></td>
        <td><?= htmlspecialchars($submission['surname']) ?></td>
        <td><?= htmlspecialchars($submission['email']) ?></td>
        <td><?= htmlspecialchars($submission['phone']) ?></td>
        <td><?= htmlspecialchars($submission['message']) ?></td>
        <td><?= $submission['submitted_at'] ?></td>
        <td>
        <form method="post" action="/~db596/backend/delete-contact-submission">
                <input type="hidden" name="id" value="<?= $submission['id'] ?>">
                <input type="submit" value="Delete">
            </form>
        </td>
    </tr>
    <?php endforeach; ?>
</table>

</body>
</html>