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
    getDoc, updateDoc, setDoc, getDocs
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore() 

const storage = getStorage(app);

function fetchDepartments() {
    const OfficecolRef = collection(db, 'Office Information');
    const que = query(OfficecolRef, orderBy('createdAt'));

    onSnapshot(que, (snapshot) => {
        const groupsContainer = document.querySelector('.groups');

        // Clear existing content
        groupsContainer.innerHTML = '';

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            const officeName = data.OfficeName;
            const officeLogo = data.logoURL;
            const officeId = data.officeDocumentID; // Assuming you have an officeDocumentID in your data

            // Create HTML elements dynamically
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="card">
                    <div class="image-session">
                        <span class="image" style="background-image: url('${officeLogo}');"></span>
                    </div>
                    <div class="meta-sission">
                        <div class="body">
                            <h2 class="title" id="officeName">${officeName}</h2>
                        </div>
                        <div class="footer">
                            <a href="admin_employee_registry_list.html?officeID=${encodeURIComponent(officeId)}?&officeName=${encodeURIComponent(officeName)}" class="button">Open →</a>
                        </div>
                    </div>
                </div>
            `;

            // Append the created elements to the container
            groupsContainer.appendChild(listItem);
        });
    });
}

// Call the fetchDepartments function to initiate the dynamic display
window.addEventListener('load', fetchDepartments);
