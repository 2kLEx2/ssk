// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCh3xiwgrpHZjsacSe6GqVuttr7iaP47VM",
    authDomain: "sskv3-5c200.firebaseapp.com",
    databaseURL: "https://sskv3-5c200-default-rtdb.firebaseio.com",
    projectId: "sskv3-5c200",
    storageBucket: "sskv3-5c200",
    messagingSenderId: "172669224576",
    appId: "1:172669224576:web:6723dc50bc2a9559194865",
    measurementId: "G-J5V2WQVZZD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', () => {
    // UI Element Selectors
    const loginPanel = document.getElementById('login-panel');
    const signupPanel = document.getElementById('signup-panel');
    const utilityPanel = document.getElementById('utility-panel');
    const linkFormContainer = document.getElementById('link-form-container');
    const authButtons = document.getElementById('auth-buttons');
    const welcomeMessage = document.getElementById('welcome-message');
    const openPanelButton = document.getElementById('open-panel');
    const logoutButton = document.getElementById('logout-button');
    const galleryContainer = document.getElementById('gallery-container');

    // Panels
    const allPanels = document.querySelectorAll('.slide-panel');

    // Helper Functions
    function closeAllPanels() {
        allPanels.forEach(panel => panel.classList.remove('active'));
        // Only show the top-right button if a user is logged in
        if (openPanelButton && auth.currentUser) {
            openPanelButton.style.display = 'block';
        } else if (openPanelButton) {
            openPanelButton.style.display = 'none';
        }
    }

    function openPanel(panel) {
        closeAllPanels();
        panel.classList.add('active');
        if (openPanelButton) {
            openPanelButton.style.display = 'none'; // Hide top-right button
        }
    }

    // Add Event Listeners for Panel Toggles
    document.querySelectorAll('[data-target]').forEach(button => {
        button.addEventListener('click', event => {
            event.stopPropagation();
            const targetPanel = document.querySelector(event.target.getAttribute('data-target'));
            if (targetPanel) {
                openPanel(targetPanel);
            }
        });
    });

    // Close Panels When Clicking Outside
    document.addEventListener('click', event => {
        if (!event.target.closest('.slide-panel') && !event.target.closest('[data-target]')) {
            closeAllPanels();
        }
    });

    // Authentication State Change Handler
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log(`Logged in as: ${user.displayName}`);
            showNotification('Logged in successfully!', 'success');
            // Hide Login/Signup Panels
            if (loginPanel) loginPanel.classList.remove('active');
            if (signupPanel) signupPanel.classList.remove('active');

            // Update UI
            if (authButtons) authButtons.style.display = 'none';
            if (linkFormContainer) linkFormContainer.style.display = 'block';

            if (welcomeMessage) {
                welcomeMessage.innerHTML = `Logged in as <span>${user.displayName}</span>`;
            }
            if (openPanelButton) {
                openPanelButton.style.display = 'block'; // Ensure top-right button is visible
            }

            // Load user-specific images into gallery
            if (galleryContainer) {
                const storageRef = storage.ref();
                const userFolderRef = storageRef.child(`uploads/${user.displayName}`);

                // Clear previous images
                galleryContainer.innerHTML = '';

                // List all images in the folder
                userFolderRef.listAll()
                    .then(result => {
                        result.items.forEach(imageRef => {
                            imageRef.getDownloadURL().then(url => {
                                const img = document.createElement('img');
                                img.src = url;
                                img.alt = `Image from ${user.displayName}'s library`;
                                galleryContainer.appendChild(img);
                            }).catch(err => {
                                console.error('Error fetching image URL:', err);
                            });
                        });
                    })
                    .catch(err => {
                        console.error('Error listing files in folder:', err);
                    });
            }
        } else {
            console.log("No user logged in");
            if (authButtons) authButtons.style.display = 'block';
            if (linkFormContainer) linkFormContainer.style.display = 'none';

            if (welcomeMessage) {
                welcomeMessage.innerHTML = "Click below to log in or sign up.";
            }
            if (openPanelButton) {
                openPanelButton.style.display = 'none'; // Hide top-right button if not logged in
            }

            // Clear gallery if no user is logged in
            if (galleryContainer) {
                galleryContainer.innerHTML = '<p>Please log in to view your library.</p>';
            }
        }
    });

    // Login Form Submission
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', event => {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    console.log("Login successful");
                })
                .catch(error => {
                    console.error("Login failed:", error.message);
                    showNotification('Wrong email or password!', 'error');
                });
        });
    }

    // Signup Form Submission
    if (document.getElementById('signup-form')) {
        document.getElementById('signup-form').addEventListener('submit', event => {
            event.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    return userCredential.user.updateProfile({ displayName: name });
                })
                .then(() => console.log("Signup successful"))
                .catch(error => {
                    console.error("Signup failed:", error.message);
                    alert(error.message);
                });
        });
    }

    // Link Form Submission
    if (document.getElementById('entry-form')) {
        document.getElementById('entry-form').addEventListener('submit', event => {
            event.preventDefault();
            const sceneSelect = document.getElementById('scene-select').value;
            const link = document.getElementById('link-input').value;
            const currentUser = auth.currentUser;

            if (currentUser) {
                const entry = {
                    link,
                    name: currentUser.displayName,
                    scene: sceneSelect
                };
                database.ref(`entries/${Date.now()}`).set(entry)
                    .then(() => {
                        showNotification('Entry saved successfully!', 'success');
                        document.getElementById('link-input').value = '';
                    })
                    .catch(() => showNotification('Error saving entry!', 'error'));
            } else {
                showNotification('You must be logged in to submit an entry.', 'error');
            }
        });
    }

    // Logout Button
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut()
                .then(() => {
                    console.log('User logged out successfully.');
                    showNotification('Logged out successfully!', 'success');
                    closeAllPanels(); // Close the slide-out panel
                })
                .catch(error => {
                    console.error('Logout failed:', error.message);
                    showNotification('Error logging out. Try again!', 'error');
                });
        });
    }

    // Notification Display Function
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Footer Scroll Functionality
    document.addEventListener('scroll', () => {
        const scrollFooter = document.getElementById('scroll-footer');
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const documentHeight = document.body.scrollHeight;

        // Check if user has scrolled near the bottom of the page
        if (scrollPosition + windowHeight >= documentHeight - 50) {
            scrollFooter.style.transform = 'translateY(0)'; // Show footer
        } else {
            scrollFooter.style.transform = 'translateY(100%)'; // Hide footer
        }
    });
});
