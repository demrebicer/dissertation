<?php

class ContactSubmissionModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function addContactSubmission($name, $surname, $email, $phone, $message) {
        $stmt = $this->pdo->prepare("INSERT INTO contact_submissions (name, surname, email, phone, message) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $surname, $email, $phone, $message]);
        return $this->pdo->lastInsertId();
    }

    public function getContactSubmissions() {
        $stmt = $this->pdo->query("SELECT id, name, surname, email, phone, message, submitted_at FROM contact_submissions");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function deleteContactSubmission($id) {
        $stmt = $this->pdo->prepare("DELETE FROM contact_submissions WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
