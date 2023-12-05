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

    onSnapshot(EmployeecolRef, (snapshot) => {
        const activeEmployees = snapshot.docs.filter(doc => doc.data().employmentStatus === 'Active').length;

        console.log('Total number of active employees:', activeEmployees);

        totalNumberEmployee.innerHTML = activeEmployees

        resolve(activeEmployees);
    });


}

window.addEventListener('load', fetchEmployee)

function fetchPedning() {
    const EmployeecolRef = collection(db, 'Request Information');

    onSnapshot(EmployeecolRef, (snapshot) => {
        const activeEmployees = snapshot.docs.filter(doc => doc.data().RequestStatus === 'Pending').length;

        console.log('Total number of active employees:', activeEmployees);

        pendingRequest.innerHTML = activeEmployees

        resolve(activeEmployees);
    });


}

window.addEventListener('load', fetchPedning)


function fetchJobInfo() {
    const EmployeecolRef = collection(db, 'Job Information');

    onSnapshot(EmployeecolRef, (snapshot) => {
        const totalNumVacancy = snapshot.docs.reduce((total, doc) => {
            const numVacancyString = doc.data().NumVacancy || "0"; // Use "0" if NumVacancy is undefined
            const numVacancy = parseFloat(numVacancyString) || 0; // Convert string to number

            return total + numVacancy;
        }, 0);

        console.log('Total number of active employees:', totalNumVacancy);

        jobInfo.innerHTML = totalNumVacancy;

        // If you want to resolve a promise with the totalNumVacancy, you can do it here
        // resolve(totalNumVacancy);
    });
}

window.addEventListener('load', fetchJobInfo);



document.addEventListener("DOMContentLoaded", () => {
    const EmployeecolRef = collection(db, '201File Information');

    // Fetch data and render the pie chart
    onSnapshot(EmployeecolRef, (snapshot) => {
        // Initialize counters for each employment status
        let regularCount = 0;
        let jobOrderCount = 0;
        let casualCount = 0;

        snapshot.docs.forEach((doc) => {
            const employmentStatus = doc.data().Appointment_Details.PositionCategory;

            // Increment the respective counter based on employment status
            switch (employmentStatus) {
                case 'Regular':
                    regularCount++;
                    break;
                case 'Job Order':
                    jobOrderCount++;
                    break;
                case 'Casual':
                    casualCount++;
                    break;
                // Add more cases for other employment status categories as needed
            }
        });

        // Render the pie chart with the obtained data
        renderPieChart([regularCount, jobOrderCount, casualCount], ['Regular', 'Job Order', 'Casual']);
    });
});

// Function to render/update the pie chart
function renderPieChart(series, labels) {
    new ApexCharts(document.querySelector("#pieChart"), {
        series: series,
        chart: {
            height: 225,
            type: 'pie',
            toolbar: {
                show: true
            }
        },
        labels: labels
    }).render();
}

