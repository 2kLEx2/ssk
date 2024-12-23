// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCh3xiwgrpHZjsacSe6GqVuttr7iaP47VM",
    authDomain: "sskv3-5c200.firebaseapp.com",
    databaseURL: "https://sskv3-5c200-default-rtdb.firebaseio.com",
    projectId: "sskv3-5c200",
    storageBucket: "sskv3-5c200.appspot.com",
    messagingSenderId: "172669224576",
    appId: "1:172669224576:web:6723dc50bc2a9559194865",
    measurementId: "G-J5V2WQVZZD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// UI Element Selectors
const loginPanel = document.getElementById('login-panel');
const signupPanel = document.getElementById('signup-panel');
const linkFormContainer = document.getElementById('link-form-container');
const authButtons = document.getElementById('auth-buttons');
const welcomeMessage = document.getElementById('welcome-message');
const galleryPanel = document.getElementById('gallery-panel');
const galleryContainer = document.getElementById('gallery-container');

// Event Listeners for UI Panels
document.getElementById('show-login').addEventListener('click', () => loginPanel.classList.add('active'));
document.getElementById('show-signup').addEventListener('click', () => signupPanel.classList.add('active'));
document.getElementById('close-login').addEventListener('click', () => loginPanel.classList.remove('active'));
document.getElementById('close-signup').addEventListener('click', () => signupPanel.classList.remove('active'));
document.getElementById('close-gallery').addEventListener('click', () => galleryPanel.classList.remove('active'));
document.getElementById('show-gallery')?.addEventListener('click', () => {
    galleryPanel.classList.add('active');
    loadGallery();
});

// Authentication State Change Handler
auth.onAuthStateChanged(user => {
    if (user) {
        console.log(`Logged in as: ${user.displayName}`);
        authButtons.style.display = 'none';
        linkFormContainer.style.display = 'block';
        welcomeMessage.innerHTML = `Logged in as <span>${user.displayName}</span>`;
    } else {
        console.log("No user logged in");
        authButtons.style.display = 'block';
        linkFormContainer.style.display = 'none';
        welcomeMessage.innerHTML = "Click below to log in or sign up.";
    }
});

// Login Form Submission
document.getElementById('login-form').addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => console.log("Login successful"))
        .catch(error => {
            console.error("Login failed:", error.message);
            alert(error.message);
        });
});

// Signup Form Submission
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

// Link Form Submission
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

// Logout Handler
document.getElementById('logout-button').addEventListener('click', () => {
    auth.signOut()
        .then(() => console.log("User logged out"))
        .catch(error => console.error("Logout failed:", error));
});

function loadGallery() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        showNotification('You must be logged in to view the gallery.', 'error');
        return;
    }

    galleryContainer.innerHTML = '<p>Loading images...</p>';
    storage.ref('uploads').listAll()
        .then(result => {
            galleryContainer.innerHTML = ''; // Clear loading message
            result.items.forEach(item => {
                if (item.name.includes(`_${currentUser.displayName}`)) {
                    item.getDownloadURL()
                        .then(url => {
                            const img = document.createElement('img');
                            img.src = url;
                            img.alt = item.name;
                            galleryContainer.appendChild(img);
                        })
                        .catch(err => {
                            console.error('Error loading image URL:', err);
                        });
                }
            });
        })
        .catch(err => {
            galleryContainer.innerHTML = '<p>Error loading gallery.</p>';
            console.error('Error fetching gallery:', err);
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
