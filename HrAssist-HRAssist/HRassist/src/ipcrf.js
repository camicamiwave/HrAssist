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
import { fetchEmployeeInfo } from './fetch_employee_info.js';
import { FetchCurrentUser } from './employee_leave_form.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);


function SearchEmployee() {

    const searchEmployeeBtn = document.getElementById('searchEmployeeBtn');
    const DTR_Section = document.getElementById('DTR_Section');
    const EmployeecolRef = collection(db, 'Employee Information');

    searchEmployeeBtn.addEventListener('click', (e) => {

        const searchEmployeeFname = document.getElementById('searchEmployeeFname').value;
        const searchEmployeeMname = document.getElementById('searchEmployeeMname').value;
        const searchEmployeeLname = document.getElementById('searchEmployeeLname').value;
        const searchEmployeeExName = document.getElementById('searchEmployeeExName').value;

        try {

            const conditions = [
                where("Personal_Information.FirstName", "==", searchEmployeeFname.trim()),
                where("Personal_Information.MiddleName", "==", searchEmployeeMname.trim()),
                where("Personal_Information.SurName", "==", searchEmployeeLname.trim())
            ];

            if (searchEmployeeExName !== "") {
                conditions.push(where("Personal_Information.ExName", "==", searchEmployeeExName.trim()));
            }

            const que = query(EmployeecolRef, ...conditions);

            // for retrieving the current user
            onSnapshot(que, (snapshot) => {
                if (!snapshot.empty) {
                    snapshot.docs.forEach((docData) => {
                        const data = docData.data();
                        const employeeDocID = data.documentID;

                        console.log(data);
                        alert("A record was retrieved.");

                        // Assuming you want to add the employeeDocID to the URL without reloading
                        const url = `admin-IPCRF-search?data=${encodeURIComponent(employeeDocID)}`;

                        // Use pushState to update the URL
                        window.history.pushState({ path: url }, '', url);

                        searchEmployeeBtn.style.display = 'none';
                        //window.location.href = `admin_201file_pds.html?data=${encodeURIComponent(employeeDocID)}`;
                    });
                } else {
                    alert("No record retrieved.");
                    console.log("No record retrieved.");
                }
            });


        } catch {

            alert("No record retrieved.");
        }


    })

}

window.addEventListener('load', SearchEmployee)


