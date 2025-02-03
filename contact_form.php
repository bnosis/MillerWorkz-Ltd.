<?php
require 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

// Initialize error array
$errors = [];

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST['name']);
    $handle = "MillerWorkz Ltd.";
    $email = trim($_POST['email']);
    $phone =  trim($_POST['phone']);
    $service = trim($_POST['service_type']);
    $message = trim($_POST['message']);

    // Validate name
    if (empty($name)) {
        $errors['name'] = 'Name is required.';
    } elseif (!preg_match('/^[A-Za-z\s]+$/', $name)) {
        $errors['name'] = 'Name must only contain letters and spaces.';
    }

    // Validate email
    if (empty($email)) {
        $errors['email'] = 'Email is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Invalid email format.';
    }

    //Validate phone
    if (!empty($phone)) {
        if (!preg_match('/^\(\d{3}\) \d{3}-\d{4}$/', $phone)) {
            $errors['phone'] = 'Phone number must be in the format (xxx) xxx-xxxx.';
        }
    }

    // Validate message
    if (empty($message)) {
        $errors['message'] = 'Message is required.';
    } elseif (strlen($message) < 10 || strlen($message) > 500) {
        $errors['message'] = 'Message must be between 10 and 500 characters.';
    }

    // Validate and handle photo file upload
    if (isset($_FILES['photos']) && $_FILES['photos']['error'][0] == UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxFiles = 9;
        $uploadedFiles = count($_FILES['photos']['tmp_name']);

        if ($uploadedFiles > $maxFiles) {
            $errors['photo'] = "You can only upload up to $maxFiles files.";
        }

        // Validate file types
        foreach ($_FILES['photos']['tmp_name'] as $index => $tmpName) {
            $fileType = mime_content_type($tmpName);
            if (!in_array($fileType, $allowedTypes)) {
                $errors['photo'] = 'Invalid photo file format. Only JPG, PNG, or GIF are allowed.';
            }
        }
    } elseif (isset($_FILES['photos']) && $_FILES['photos']['error'][0] != UPLOAD_ERR_NO_FILE) {
        $errors['photo'] = 'Error uploading photos.';
    }

    // If there are no errors, proceed to send the email
    if (empty($errors)) {
        // Email configuration
        $to = 'millerworkzltd@outlook.com';
        $subject = "Message from $name";

        // PHPMailer instance
        $mail = new PHPMailer();

        // SMTP settings
        $mail->isSMTP();
        $mail->Host = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['EMAIL_USER'];
        $mail->Password = $_ENV['EMAIL_PASSWORD'];
        $mail->SMTPSecure = $_ENV['SMTP_SECURE'];
        $mail->Port = $_ENV['SMTP_PORT'];

        // Email setup
        $mail->setFrom($email, $handle);
        $mail->addAddress($to); // Add recipient
        $mail->addReplyTo($email);

        // Embed the logo (updated path)
        $mail->addEmbeddedImage(__DIR__ . '/local/logo_black_transparent.png', 'logo_cid', 'logo_black_transparent.png');

        // Add and embed photos
        $photoCids = []; // Array to store CIDs of the uploaded images
        if (isset($_FILES['photos']) && $_FILES['photos']['error'][0] == UPLOAD_ERR_OK) {
            foreach ($_FILES['photos']['tmp_name'] as $index => $tmpName) {
                $fileName = $_FILES['photos']['name'][$index];
                $cid = 'photo_cid_' . $index;
                $mail->addEmbeddedImage($tmpName, $cid, $fileName);
                $photoCids[] = $cid;
            }
        }

        // Email content with embedded images
        $mail->isHTML(true); // Enable HTML content
        $mail->Subject = $subject;
        $mail->Body = "
            <div style=\"font-family: Arial, sans-serif; color: #333; line-height: 1.6;\">
                <h2 style=\"color:#d83d1f;\">$handle</h2>
                <p><strong>Name:</strong> $name</p>
                <p><strong>Email:</strong> $email</p>
                <p><strong>Phone:<strong> $phone</p>
                <p><strong>Service Type:</strong> $service</p>
                <p><strong>Message:</strong> $message</p>";

        // Embed images in the body of the email
        $mail->Body .= '<table style="width: 100%; border-spacing: 5px; margin: 5px; text-align: left;">';

        $counter = 0;
        foreach ($photoCids as $cid) {
            if ($counter % 3 == 0) {
                if ($counter > 0) {
                    $mail->Body .= '</tr>';
                }
                $mail->Body .= '<tr>';
            }
        
            $mail->Body .= "<td style=\"width: 25%; padding: 5px;\">
                                <img src=\"cid:$cid\" alt=\"Uploaded Photo\" style=\"width: 200px; height: auto;\" />
                            </td>";
        
            $counter++;
        }
        
        if ($counter > 0) {
            $mail->Body .= '</tr>';
        }
        
        $mail->Body .= '</table>';

        $mail->Body .= "
            <hr style=\"border: none; border-top: 1px solid #ddd; margin: 20px 0;\" />
            <p style=\"text-align: center; color: #777; font-size: 12px;\">This message was sent via MillerWorkz Ltd.</p>
            <div style=\"text-align: center; margin: 5px;\">
                <img src=\"cid:logo_cid\" alt=\"MillerWorkz Ltd Logo\" style=\"width: 200px; height: auto;\" />
            </div>
        </div>";

        // Send the email
        if (!$mail->send()) {
            echo 'Mailer Error: ' . $mail->ErrorInfo;
        } else {
            echo 'Message has been sent';
        }
    } else {
        // Show form errors
        foreach ($errors as $field => $error) {
            echo htmlspecialchars($error);
        }
    }
} else {
    echo 'Invalid Request';
}
?>