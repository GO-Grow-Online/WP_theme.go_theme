<?php

require_once 'assets/PHPMailer-master/src/Exception.php';
require_once 'assets/PHPMailer-master/src/PHPMailer.php';
require_once 'assets/PHPMailer-master/src/SMTP.php';

// Vérification du formulaire soumis
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Get form data
    $errors = array();
    $data = array();

    $response = array();

    // Get every fields values
    foreach ($_POST as $name => $value) {
        $data[$name] = $value;

        if($value === "") {
            $errors[] .= $name;
        }
    }
    
    // SPECIFIC PHP FIELD VERIFICATION
    // Verify is the email is valid
    if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] .= 'email';
    }

    // If there are field errors, display them
    if (!empty($errors)) {
        $response['empty_fields'] = $errors;
        
        header('Content-Type: application/json');
        echo json_encode($response);

    // If fields are valid, try to send the mail
    } else {

        /*
        // Add custom HTML template for mail and replace "{ field key }" with the form values
        $body = file_get_contents('assets/mail-tpl.html');

        if(isset($data)){
            foreach($data as $key => $value){
                $body = str_replace('{'.strtoupper($key).'}', $value, $body);
            }
        }

        $mail = new PHPMailer\PHPMailer\PHPMailer();

        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->Port = 587;
        $mail->SMTPAuth = true;
        $mail->Username = 'julien.growonline@gmail.com';
        $mail->Password = 'tsp332M5';
        $mail->SMTPSecure = 'tls';

        // Sender & receiver
        $mail->setFrom('julien.growonline@gmail.com', 'GO : Grow Online');
        $mail->addAddress($data['email'], $data['name']);

        // Mail content
        $mail->Subject = $data['subject'];
        $mail->Body = $data['message'];

        if ($mail->send()) {
            $response['success'] = true;
        } else {
            $response['success'] =  $mail->ErrorInfo;
        }*/

        $response['success'] = true;
        $response['empty_fields'] = $errors;
        
        header('Content-Type: application/json');
        echo json_encode($response);
    }    
}

?>