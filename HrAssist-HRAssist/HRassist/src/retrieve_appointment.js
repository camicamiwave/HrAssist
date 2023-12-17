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


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');

function fetchEmployee() {
    const EmployeecolRef = collection(db, '201File Information');

    fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
        const empdata = dataRetrieved;
        const file201DocID = empdata.documentID

        empOffice.innerHTML = empdata.Appointment_Details.Office
        empPositionTile.innerHTML = empdata.Appointment_Details.PositionTitle
        empEmployementStatus.innerHTML = empdata.Appointment_Details.PositionCategory
        empsgjgpg.innerHTML = empdata.Appointment_Details.SalaryGrade
        natureOfAppointment.innerHTML = empdata.Appointment_Details.NatureAppointment
        vice.innerHTML = empdata.Appointment_Details.Vice
        who.innerHTML = empdata.Appointment_Details.Who
        plantillaItemNo.innerHTML = empdata.Appointment_Details.PlantillaNum
        page.innerHTML = empdata.Appointment_Details.Page
        appointingOfficer.innerHTML = empdata.Appointment_Details.AppointingOfficer
        dateOfSigning.innerHTML = empdata.Appointment_Details.DateofSigning
        compensationPerMonth.innerHTML = empdata.Appointment_Details.Compensation


        const listAttachmentsURL = empdata.Appointment_URL

        document.getElementById('viewAttachedDocument').addEventListener('click', function() {
            // Get the document URL from your data (replace this with your actual data structure)
            const listAttachmentsURL = empdata.Appointment_URL;
        
            // Open the document in a new tab or window
            window.open(listAttachmentsURL, '_blank');
        });
    })



}

window.addEventListener('load', fetchEmployee)

