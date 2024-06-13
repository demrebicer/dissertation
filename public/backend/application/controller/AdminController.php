<?php

require_once __DIR__ . '/../model/ContactSubmissionModel.php';
require_once __DIR__ . '/../model/ObjectModel.php';

class AdminController
{
    private $objectsModel;
    private $contactSubmissionsModel;

    public function __construct($pdo)
    {
        $this->objectsModel = new ObjectModel($pdo);
        $this->contactSubmissionsModel = new ContactSubmissionModel($pdo);
    }

    public function addObject()
    {
        $name = $_POST['name'];
        $description = isset($_POST['description']) ? $_POST['description'] : '';

        $this->objectsModel->addObject($name, $description);

        header('Location: https://users.sussex.ac.uk/~db596/backend/admin');
        exit;
    }

    public function deleteObject()
    {
        $id = $_POST['id'];
        $this->objectsModel->deleteObject($id);

        header('Location: https://users.sussex.ac.uk/~db596/backend/admin');
        exit;
    }

    public function deleteContactSubmission()
    {
        $id = $_POST['id'];
        $this->contactSubmissionsModel->deleteContactSubmission($id);

        header('Location: https://users.sussex.ac.uk/~db596/backend/admin');
        exit;
    }

    public function displayAdminPage()
    {
        $objects = $this->objectsModel->getObjects();
        $contactSubmissions = $this->contactSubmissionsModel->getContactSubmissions();
        include('/its/home/db596/public_html/backend/application/view/AdminView.php');
    }
}
