// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCh3xiwgrpHZjsacSe6GqVuttr7iaP47VM",
    authDomain: "sskv3-5c200.firebaseapp.com",
    databaseURL: "https://sskv3-5c200-default-rtdb.firebaseio.com",
    projectId: "sskv3-5c200",
    storageBucket: "sskv3-5c200.firebasestorage.app",
    messagingSenderId: "172669224576",
    appId: "1:172669224576:web:6723dc50bc2a9559194865",
    measurementId: "G-J5V2WQVZZD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Sliding panels
const loginPanel = document.getElementById('login-panel');
const signupPanel = document.getElementById('signup-panel');
const linkFormContainer = document.getElementById('link-form-container');
const authButtons = document.getElementById('auth-buttons');
const welcomeMessage = document.getElementById('welcome-message');

document.getElementById('show-login').onclick = () => loginPanel.classList.add('active');
document.getElementById('show-signup').onclick = () => signupPanel.classList.add('active');
document.getElementById('close-login').onclick = () => loginPanel.classList.remove('active');
document.getElementById('close-signup').onclick = () => signupPanel.classList.remove('active');

// Close the panel after login
auth.onAuthStateChanged(user => {
    if (user) {
        welcomeMessage.innerHTML = `Logged in as <span>${user.displayName}</span>`;
        authButtons.style.display = 'none';
        linkFormContainer.style.display = 'block';
        // Close the slide-out panels
        loginPanel.classList.remove('active');
        signupPanel.classList.remove('active');
    } else {
        authButtons.style.display = 'block';
        linkFormContainer.style.display = 'none';
    }
});

// Login
document.getElementById('login-form').onsubmit = event => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
};

// Signup
document.getElementById('signup-form').onsubmit = event => {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => userCredential.user.updateProfile({ displayName: name }))
        .catch(error => alert(error.message));
};

// Submit Link Form
document.getElementById('entry-form').onsubmit = event => {
    event.preventDefault();
    const sceneSelect = document.getElementById('scene-select');
    const selectedScene = sceneSelect.value;
    const link = document.getElementById('link-input').value;
    const currentUser = auth.currentUser;

    if (currentUser) {
        const newEntry = {
            link: link,
            name: currentUser.displayName,
            scene: selectedScene
        };
        const dbRef = database.ref('entries/' + Date.now());
        dbRef.set(newEntry, error => {
            if (error) {
                showNotification('Error saving entry!', 'error');
            } else {
                showNotification('Entry saved successfully!', 'success');
                // Reset the form except for the dropdown
                document.getElementById('link-input').value = ''; // Clear only the input field
            }
        });
    } else {
        showNotification('You must be logged in to submit an entry.', 'error');
    }
};

// Function to show notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Logout
document.getElementById('logout-button').onclick = () => auth.signOut();
