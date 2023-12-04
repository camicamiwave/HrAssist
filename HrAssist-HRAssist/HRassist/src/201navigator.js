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

function fetchEmployee() {
    const EmployeecolRef = collection(db, 'Employee Information');

    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('data');

    fetchEmployeeInfo(EmployeecolRef, receivedStringData, "documentID").then((dataRetrieved) => {
        const empdata = dataRetrieved;
        const file201DocID = empdata.documentID

        console.log(empdata)
       

        const fullName = `${empdata.Personal_Information.FirstName} ${empdata.Personal_Information.SurName}`

        applicantFullName.innerHTML = empdata.EmployeeUsername
        empPhone.innerHTML = empdata.Personal_Information.MobileNumber
        empEmail.innerHTML = empdata.Personal_Information.Email
        applicantProfile.src = empdata.ProfilePictureURL


        const employeeFullName = document.getElementById('employeeFullName')
        if (employeeFullName) {
            employeeFullName.innerHTML = fullName
        }
    })
}

window.addEventListener('load', fetchEmployee)







function EmployeeProfileNavigator() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const receivedStringData = urlParams.get('data');

        const overviewPDSLink = document.getElementById('overviewPDS');
        overviewPDSLink.setAttribute('href', `admin-employee-profile.html?data=${encodeURIComponent(receivedStringData)}`);

        const personalPDSLink = document.getElementById('personalPDS');
        personalPDSLink.setAttribute('href', `admin-employee-datasheet.html?data=${encodeURIComponent(receivedStringData)}`);

        const appointmentPDS = document.getElementById('appointmentPDS');
        appointmentPDS.setAttribute('href', `admin-employee-appointment.html?data=${encodeURIComponent(receivedStringData)}`);

        const leavecreditsPDS = document.getElementById('leavecreditsPDS');
        leavecreditsPDS.setAttribute('href', `admin-employee-leave.html?data=${encodeURIComponent(receivedStringData)}`);

        const behaviorPDS = document.getElementById('behaviorPDS');
        behaviorPDS.setAttribute('href', `admin-employee-behavior.html?data=${encodeURIComponent(receivedStringData)}`);

        const activityPDS = document.getElementById('activityPDS');
        activityPDS.setAttribute('href', `admin-employee-activity.html?data=${encodeURIComponent(receivedStringData)}`);

    } catch {
        return
    }


}

window.addEventListener('load', EmployeeProfileNavigator);

