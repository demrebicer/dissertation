<?php

// FormController.php
require_once __DIR__ . '/../model/ContactSubmissionModel.php';
require_once __DIR__ . '/../model/ObjectModel.php';

class FormController
{
    private $contactModel;
    private $objectModel;

    public function __construct($pdo)
    {
        $this->contactModel = new ContactSubmissionModel($pdo);
        $this->objectModel = new ObjectModel($pdo);
    }

    public function addContactSubmission()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!empty($data['name']) && !empty($data['surname']) && !empty($data['email']) && !empty($data['phone']) && !empty($data['message'])) {
            $this->contactModel->addContactSubmission($data['name'], $data['surname'], $data['email'], $data['phone'], $data['message']);

            echo json_encode(['status' => 'success', 'message' => 'Form data received']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Name, Surname, Email, Phone and Message fields are required']);
        }
    }


    public function listObjects()
    {
        $objects = $this->objectModel->getObjects();
        $formattedObjects = array_reduce($objects, function ($result, $item) {
            $result[$item['name']] = $item['description'];
            return $result;
        }, []);
        echo json_encode($formattedObjects);
    }
}
