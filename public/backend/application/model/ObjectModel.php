<?php

class ObjectModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function addObject($name, $description) {
        $stmt = $this->pdo->prepare("INSERT INTO objects (name, description) VALUES (?, ?)");
        $stmt->execute([$name, $description]);
        return $this->pdo->lastInsertId();
    }

    public function getObjects() {
        $stmt = $this->pdo->query("SELECT id, name, description, created_at FROM objects");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function deleteObject($id) {
        $stmt = $this->pdo->prepare("DELETE FROM objects WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
