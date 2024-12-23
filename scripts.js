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

// Sliding panels
const loginPanel = document.getElementById('login-panel');
const signupPanel = document.getElementById('signup-panel');
const linkFormContainer = document.getElementById('link-form-container');
const authButtons = document.getElementById('auth-buttons');
const welcomeMessage = document.getElementById('welcome-message');
const galleryPanel = document.getElementById('gallery-panel');
const galleryContainer = document.getElementById('gallery-container');

document.getElementById('show-login').onclick = () => loginPanel.classList.add('active');
document.getElementById('show-signup').onclick = () => signupPanel.classList.add('active');
document.getElementById('close-login').onclick = () => loginPanel.classList.remove('active');
document.getElementById('close-signup').onclick = () => signupPanel.classList.remove('active');
document.getElementById('show-gallery').onclick = () => {
    galleryPanel.classList.add('active');
    loadGallery();
};
document.getElementById('close-gallery').onclick = () => galleryPanel.classList.remove('active');

// Handle authentication state changes
auth.onAuthStateChanged(user => {
    console.log("Auth state changed:", user);
    if (user) {
        console.log("User logged in:", user.displayName);
        welcomeMessage.innerHTML = `Logged in as <span>${user.displayName}</span>`;
        authButtons.style.display = 'none';
        linkFormContainer.style.display = 'block';
        loginPanel.classList.remove('active');
        signupPanel.classList.remove('active');
    } else {
        console.log("No user logged in");
        authButtons.style.display = 'block';
        linkFormContainer.style.display = 'none';
    }
});

// Login handler
document.getElementById('login-form').onsubmit = event => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log("Attempting login with:", email, password);

    auth.signInWithEmailAndPassword(email, password)
        .then(() => console.log("Login successful"))
        .catch(error => {
            console.error("Login failed:", error.message);
            alert(error.message);
        });
};

// Signup handler
document.getElementById('signup-form').onsubmit = event => {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    console.log("Attempting signup with:", email, name);

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("Signup successful");
            return userCredential.user.updateProfile({ displayName: name });
        })
        .catch(error => {
            console.error("Signup failed:", error.message);
            alert(error.message);
        });
};

// Submit link form
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
                document.getElementById('link-input').value = ''; // Clear only the input field
            }
        });
    } else {
        showNotification('You must be logged in to submit an entry.', 'error');
    }
};

// Show notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Logout handler
document.getElementById('logout-button').onclick = () => {
    console.log("Logging out...");
    auth.signOut()
        .then(() => console.log("User logged out"))
        .catch(error => console.error("Logout failed:", error));
};

// Load gallery images
function loadGallery() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        showNotification('You must be logged in to view the gallery.', 'error');
        return;
    }

    const username = currentUser.displayName;
    galleryContainer.innerHTML = '<p>Loading images...</p>';

    storage.ref('uploads').listAll()
        .then(result => {
            galleryContainer.innerHTML = ''; // Clear loading message
            result.items.forEach(itemRef => {
                if (itemRef.name.includes(`_${username}`)) {
                    itemRef.getDownloadURL()
                        .then(url => {
                            const img = document.createElement('img');
                            img.src = url;
                            img.alt = itemRef.name;
                            img.style.maxWidth = '100%';
                            img.style.marginBottom = '10px';
                            galleryContainer.appendChild(img);
                        })
                        .catch(err => console.error('Error loading image URL:', err));
                }
            });
        })
        .catch(err => {
            galleryContainer.innerHTML = '<p>Error loading gallery.</p>';
            console.error('Error fetching gallery:', err);
        });
}
