import Swal from 'sweetalert2';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
    createUserWithEmailAndPassword, updateProfile
} from "firebase/auth";

import {
    getFirestore, collection, onSnapshot,
    addDoc, deleteDoc, doc,
    query, where,
    orderBy, serverTimestamp,
    getDoc, updateDoc, setDoc
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { UserLoginChecker } from './page_restriction.js';


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'User Account')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);

function GetAccountTable() {
    try {
        // Assuming you have Firestore data in the 'employees' array
        const employeeTable = document.getElementById('accountTable');
        const tbody = employeeTable.querySelector('tbody');

        let idNum = 1;

        onSnapshot(q, (snapshot) => {
            // Clear the existing rows in the table body
            tbody.innerHTML = '';

            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const id = doc.id;
                const row = document.createElement('tr');

                const idCell = document.createElement('td');
                idCell.textContent = idNum;

                const nameCell = document.createElement('td');
                nameCell.textContent = data.Email;

                const jobPositionCell = document.createElement('td');
                jobPositionCell.textContent = data.UserLevel;

                const accountStatusCell = document.createElement('td');
                accountStatusCell.textContent = data.AccountStatus;

                // Create a single cell for both buttons
                const buttonsCell = document.createElement('td');

                // Create activation and deactivation buttons with classes
                const activateButton = createButton('Activate', 'activateAccount');
                const deactivateButton = createButton('Deactivate', 'deactivateAccount');

                // Add click event listeners to the buttons
                activateButton.addEventListener('click', () => {
                    // Implement activation logic here 
                    alert(`Activate clicked for ID: ${data.Email}`);
                    AccountStatusActivation('Activate', id)
                    idNum = 1;
                });

                deactivateButton.addEventListener('click', () => {
                    // Implement deactivation logic here
                    alert(`Deactivate clicked for ID: ${data.Email}`);
                    AccountStatusActivation('Deactivated', id)
                    idNum = 1;
                });

                // Append buttons to the cell
                buttonsCell.appendChild(activateButton);
                buttonsCell.appendChild(deactivateButton);

                // Add cells to the row
                row.appendChild(idCell);
                row.appendChild(nameCell);
                row.appendChild(jobPositionCell);
                row.appendChild(accountStatusCell);
                row.appendChild(buttonsCell); // Append the cell with buttons

                // Append the row to the table body
                tbody.appendChild(row);

                idNum++;
            });
        });
    } catch (error) {
        console.log('Error:', error.message);
    }
}

// Helper function to create a button with text and class
function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(className);
    button.style.color = '#fff';
    button.style.width = '60px';
    button.style.fontSize = '12px'
    return button;
}

window.addEventListener('load', GetAccountTable);

function AccountStatusActivation(accountStatus, customID){
    const UsercolRef = collection(db, 'User Account');
    return setDoc(doc(UsercolRef, customID), { AccountStatus: accountStatus }, { merge: true });
}
