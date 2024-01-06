<?php

require_once 'vendor/phpmailer/phpmailer/src/Exception.php';
require_once 'vendor/phpmailer/phpmailer/src/PHPMailer.php';
require_once 'vendor/phpmailer/phpmailer/src/SMTP.php';

// Vérification du formulaire soumis
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $data = array();
    $response = array();

    // Get every fields values
    foreach ($_POST as $name => $value) {
        $data[$name] = $value;
    }

    // Honeypot verification
    $honeypot = $data["send"];

    if (empty($honeypot)) {        
        // Add custom HTML template for mail and replace "{ field key }" with the form values
        $body = file_get_contents('assets/static/mail-tpl.html');
    
        if(isset($data)){
            foreach($data as $key => $value){
                $value = !empty($value) ? $value : "<i>Aucun(e)</i>";
                $body = str_replace('['.$key.']', $value, $body);
            }
        } 
    
        $mail = new PHPMailer\PHPMailer\PHPMailer();
    
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPSecure = 'ssl'; 
        $mail->Port = 465;
        $mail->SMTPAuth = true;
        $mail->Username = 'julien.growonline@gmail.com';
        $mail->Password = 'dbiqnrvmmsqcrira';
        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
    
        $mail->setFrom($data['email'], $data['name']);
        $mail->addAddress('julien.growonline@gmail.com', 'GO : Grow online');
    
        // Mail content
        $mail->Subject = "Formulaire de contact";
        $mail->Body = $body;
    
        if ($mail->send()) {
            $response['success'] = true;
        } else {
            $response['error'] =  $mail->ErrorInfo;
        }
    }else{
        $response['error'] = "Le mail n'a pas été envoyé. Spam-bot détecté.";
    }

    header('Content-Type: application/json');
    echo json_encode($response);
}

?>