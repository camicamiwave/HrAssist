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
import { fetchEmployeeInfo } from './fetch_employee_info.js';

console.log("asfsafaqwwr")

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');


function fetchEmployee() {
    const EmployeecolRef = collection(db, 'Employee Information');
    const File201colRef = collection(db, '201File Information');

    fetchEmployeeInfo(EmployeecolRef, receivedStringData, "documentID").then((dataRetrieved) => {
        const empdata = dataRetrieved;
        const file201DocID = empdata.documentID

        console.log(empdata)

        fetchEmployeeInfo(File201colRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
            const file201 = dataRetrieved;

            empDesignation.innerHTML = file201.Appointment_Details.PositionTitle
            employmentStatus.innerHTML = file201.Appointment_Details.PositionCategory

            const formattedDate = new Date(file201.Appointment_Details.DateofSigning).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            startOfAppointment.innerHTML = formattedDate

            employementStatus.innerHTML = empdata.employmentStatus

        })

        const dropdownMenu = document.getElementById('dropdownMenu');

        // Attach click event listeners to each dropdown item
        dropdownMenu.addEventListener('click', function (event) {
            Swal.fire({
                title: "Are you sure?",
                text: "Employee's status will be updated",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Confirm"
            }).then((result) => {
                if (result.isConfirmed) {
                    if (event.target.classList.contains('dropdown-item')) {
                        // Get the data-action attribute value (the selected action)
                        const selectedAction = event.target.getAttribute('data-action');

                        // Perform action based on the selectedAction
                        switch (selectedAction) {
                            case 'Resigned':
                                updateEmploymentStatus(receivedStringData, "Resigned")
                                break;
                            case 'End of Contract':
                                updateEmploymentStatus(receivedStringData, "End of Contract")
                                break;
                            case 'Retired':
                                updateEmploymentStatus(receivedStringData, "Retired")
                                break;
                            case 'Fired':
                                updateEmploymentStatus(receivedStringData, "Fired")
                                break;
                            case 'Active':
                                updateEmploymentStatus(receivedStringData, "Active")
                                break;
                            // Add more cases as needed
                        }

                        // Show success message
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: `Employee's status has been successfully updated.`,
                            showConfirmButton: false,
                            timer: 1500 // Display for 1.5 seconds
                        }).then(() => { 
                            window.location.href = `admin-employee-profile.html?data=${encodeURIComponent(receivedStringData)}`;
                        })

                        console.log('Selected Action:', selectedAction);
                    }
                    
                }
            });
        });



        

    })
}

window.addEventListener('load', fetchEmployee)



async function updateEmploymentStatus(customID, accountStatus) {
    const userDocRef = doc(db, 'Employee Information', customID);

    try {
        await updateDoc(userDocRef, {
            employmentStatus: accountStatus
        });

        console.log('Employment status updated successfully.');
    } catch (error) {
        console.error('Error updating employment status:', error);
    }
}
 