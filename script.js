// toggle mobile menu
const hamburgerMenu = document.getElementById("hamburger_menu");
const headerRight = document.getElementById("header_right");
const servicesToggle = document.getElementById("services_toggle");
const dropdownContent = document.querySelector(".dropdown_content");

hamburgerMenu.addEventListener("click", () => {
    headerRight.classList.toggle("active");
});

servicesToggle.addEventListener("click", (event) => {
    event.preventDefault();  
    dropdownContent.classList.toggle("open");  
    servicesToggle.classList.toggle("active");
});

document.addEventListener("click", (event) => {
    if (!headerRight.contains(event.target) && !hamburgerMenu.contains(event.target)) {
        headerRight.classList.remove("active");
        dropdownContent.classList.remove("open");
    }
});

// Dynamically load the social_links.html content
fetch('social_links.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('social_links_container').innerHTML = data;
    })
    .catch(error => console.error('Error loading social links:', error));

//contact form logic
document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector('.contact_form');
    const loadingSpinner = document.getElementById('loading_spinner');
    const submitButton = document.getElementById('submit_button');
    const feedbackMessage = document.getElementById('feedback_message');
    const fileInput = document.getElementById('photos');
    const fileNamesDiv = document.getElementById('file_names');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const phoneInput = document.getElementById('phone');

    // Store selected files in a custom array
    let selectedFiles = [];

    // File upload and delete logic
    fileInput.addEventListener('change', function () {
        fileNamesDiv.innerHTML = '';
        selectedFiles= [];

        const files = fileInput.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name;

            selectedFiles.push(file);

            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = fileName;
            link.textContent = fileName;

            const removeIcon = document.createElement('span');
            removeIcon.textContent = '❌';
            removeIcon.style.cursor = 'pointer';
            removeIcon.style.marginLeft = '10px';
            removeIcon.style.color = 'red';

            const listItem = document.createElement('p');
            listItem.appendChild(link);
            listItem.appendChild(removeIcon);

            fileNamesDiv.appendChild(listItem);

            removeIcon.addEventListener('click', () => {
                selectedFiles = selectedFiles.filter(f => f !== file);

                updateFileInput();

                fileNamesDiv.removeChild(listItem);
            });
        }
    });

    // Function to update the file input with the current list of selected files
    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        selectedFiles.forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
    }

    // Name capitalization logic
    nameInput.addEventListener('input', function() {
        let value = nameInput.value;
        value = value.split(' ').map(function(word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
        nameInput.value = value;
    });

    // Number validation
    phoneInput.addEventListener('input', function() {
        let input = phoneInput.value.replace(/\D/g, '');  // Remove all non-numeric characters
    
        // Limit input to 10 digits (or less)
        if (input.length > 10) {
            input = input.slice(0, 10);
        }
    
        let formattedInput = '';
    
        // Format the phone number as (xxx) xxx-xxxx
        if (input.length > 0) {
            formattedInput = `(${input.slice(0, 3)}`;
        }
        if (input.length > 3) {
            formattedInput += `) ${input.slice(3, 6)}`;
        }
        if (input.length > 6) {
            formattedInput += `-${input.slice(6, 10)}`;
        }
    
        phoneInput.value = formattedInput;
    });

    // Capitalize the first word in the message input
    messageInput.addEventListener('input', function() {
        let value = messageInput.value;
        if (value.length > 0) {
            value = value.charAt(0).toUpperCase() + value.slice(1);
            messageInput.value = value;
        }
    });

    // Form submit logic
    form.addEventListener('submit', function(event) {
        event.preventDefault();  

        feedbackMessage.textContent = '';

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        const nameRegex = /^[A-Za-z\s]+$/;
        if (!name || !nameRegex.test(name)) {
            feedbackMessage.textContent = 'Please enter a valid name (only letters and spaces).';
            feedbackMessage.style.color = 'red';
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            feedbackMessage.textContent = 'Please enter a valid email address.';
            feedbackMessage.style.color = 'red';
            return;
        }

        if (!message || message.length < 10 || message.length > 500) {
            feedbackMessage.textContent = 'Please enter a message between 10 and 500 characters.';
            feedbackMessage.style.color = 'red';
            return;
        }

        if (fileInput.files.length > 0) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

            // Check if all files are of the allowed types and if the number of files exceeds 9
            if (fileInput.files.length > 9) {
                feedbackMessage.textContent = 'You can only upload up to 9 files.';
                feedbackMessage.style.color = 'red';
                fileNamesDiv.innerHTML = ''; 
                fileInput.value = ''; 
                return;
            }

            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                if (!allowedTypes.includes(file.type)) {
                    feedbackMessage.textContent = 'Only JPG, PNG, and GIF images are allowed.';
                    feedbackMessage.style.color = 'red';
                    fileNamesDiv.innerHTML = ''; 
                    fileInput.value = ''; 
                    return;
                }
            }
        }

        // Show the loading spinner while submitting
        loadingSpinner.style.display = 'block';
        submitButton.style.display= 'none';

        // Create FormData to send the form data
        const formData = new FormData(form);

        // Make AJAX request to submit the form
        fetch('contact_form.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(result => {
            loadingSpinner.style.display = 'none';
            submitButton.style.display = 'block';

            if (result === 'Message has been sent') {
                feedbackMessage.textContent = 'Your message was sent successfully!';
                feedbackMessage.style.color = 'green';
                form.reset();
                fileNamesDiv.innerHTML = '';
                selectedFiles = [];
            } else {
                feedbackMessage.textContent = `Error: ${result}`;
                feedbackMessage.style.color = 'red';
            }
        })
        .catch(error => {
            loadingSpinner.style.display = 'none';
            feedbackMessage.textContent = `Error: ${error.message}`;
            feedbackMessage.style.color = 'red';
        });
    });
});