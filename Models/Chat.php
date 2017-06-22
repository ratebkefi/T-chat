<?php

class Chat {

    private $mMysqli;

    function __construct() {
        $this->mMysqli = new mysqli("localhost", "root", "root", "chatsimple");
    }

    public function __destruct() {
        $this->mMysqli->close();
    }


    public function deleteMessages() {
        $query = 'TRUNCATE TABLE chat';
        $result = $this->mMysqli->query($query);
    }

    public function postMessage($name, $message) {
        $name = $this->mMysqli->real_escape_string($name);
        $message = $this->mMysqli->real_escape_string($message);
        $query = 'INSERT INTO chat(posted_on, user_name, message) ' .
            'VALUES (NOW(), "' . $name . '" , "' . $message . '")';
        $result = $this->mMysqli->query($query);
    }

    public function retrieveNewMessages($id = 0) {

        $id = $this->mMysqli->real_escape_string($id);

        if ($id > 0) {
            $query = 'SELECT chat_id, user_name, message,' .
                ' DATE_FORMAT(posted_on, "%Y-%m-%d %H:%i:%s") ' .
                ' AS posted_on ' .
                ' FROM chat WHERE chat_id > ' . $id .
                ' ORDER BY chat_id ASC';
        } else {
            $query = 'SELECT chat_id, user_name, message,posted_on FROM  (SELECT chat_id, user_name, message,DATE_FORMAT(posted_on,"%Y-%m-%d %H:%i:%s") AS posted_on  FROM chat ORDER BY chat_id DESC LIMIT 50) AS Last50 ORDER BY chat_id ASC';
        }
        $result = $this->mMysqli->query($query) or die($query . " " . mysqli_error($this->mMysqli));
        $response = '<?xml version="1.0" encoding="UTF-8" ?>';
        $response .= '<response>';
        $response .= $this->isDatabaseCleared($id);
        if ($result->num_rows) {
            while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                $id = $row['chat_id'];
                $userName = $row['user_name'];
                $time = $row['posted_on'];
                $message = $row['message'];
                $response .= '<id>' . $id . '</id>' . '<time>' . $time . '</time>' . '<name>' . $userName . '</name>' . '<message>' . $message . '</message>';
            }
            $result->close();
        }
        $response = $response . '</response>';
        return $response;
    }

    private function isDatabaseCleared($id) {
        if ($id > 0) {
            $check_clear = 'SELECT count(*) old FROM chat where chat_id<=' . $id;
            $result = $this->mMysqli->query($check_clear);
            $row = $result->fetch_array(MYSQLI_ASSOC);
            if ($row['old'] == 0)
                return '<clear>true</clear>';
        }
        return '<clear>false</clear>';
    }

}

?>