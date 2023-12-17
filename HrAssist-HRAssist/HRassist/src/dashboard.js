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

function fetchJobInfoTable() {
    const EmployeecolRef = collection(db, 'Job Information');
    const que = query(EmployeecolRef);
    const tableBody = document.getElementById('jobInfoTable').getElementsByTagName('tbody')[0];

    // for retrieving the current user
    onSnapshot(que, (snapshot) => {
        try {
            if (!snapshot.empty) {
                // Clear existing table rows
                tableBody.innerHTML = '';

                snapshot.docs.forEach((docData, index) => {
                    const data = docData.data();
                    const employeeDocID = data.documentID;

                    // Create a new row
                    const newRow = tableBody.insertRow();

                    // Add cells to the row with data
                    const cellID = newRow.insertCell(0);
                    const cell1 = newRow.insertCell(1);
                    const cell2 = newRow.insertCell(2);
                    const cell3 = newRow.insertCell(3);
                    // Add more cells as needed

                    // Populate cells with data
                    cellID.textContent = index + 1; // Auto-increment ID
                    cell1.textContent = data.JobTitle; // Replace with the actual property name
                    cell2.textContent = data.JobType; // Replace with the actual property name
                    cell3.textContent = data.NumVacancy; // Replace with the actual property name
                    // Populate more cells as needed
                });
            } else {
                // Display a message when there are no records
                tableBody.innerHTML = '<tr><td colspan="4">No records retrieved.</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching IPCRF data:", error);
            // Handle error (e.g., display an error message)
        }
    });
}

window.addEventListener('load', fetchJobInfoTable);


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


function getUpcomingActivities() {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 5);
    const container = document.getElementById("activity");

    // Random design options
    const badgeColors = ["text-success", "text-danger", "text-primary", "text-info", "text-warning"];

    const Employeeque = query(collection(db, 'Calendar Information'),
        where('formData.start', '>=', currentDate.toISOString()), // Convert to ISO string
        where('formData.start', '<=', futureDate.toISOString())
    );

    onSnapshot(Employeeque, (snapshot) => {
        if (snapshot.empty) {
            // No documents matched the query
            console.log('None');
        } else {
            // Documents matched the query
            const data = snapshot.docs.map(doc => doc.data());
            console.log(data, 'asfasfsafwqwewr');

            // Clear existing content in the container
            container.innerHTML = '';

            // Loop through the retrieved data and append HTML to the container
            data.forEach(activity => {
                const badgeColor = badgeColors[Math.floor(Math.random() * badgeColors.length)];

                // Extract year, month, and day from formData.start
                const startDate = new Date(activity.formData.start);
                const year = startDate.getFullYear();
                const month = startDate.getMonth() + 1; // Months are zero-based
                const day = startDate.getDate();

                const activityHTML = `
                    <div class="activity-item d-flex">
                        <div class="activite-label">${year}/${month}/${day}</div>
                        <i class='bi bi-circle-fill activity-badge ${badgeColor} align-self-start'></i>
                        <div class="activity-content">  <a href="#" class="fw-bold text-dark">${activity.formData.title}</a><br> ${activity.eventPurpose}
                        </div>
                    </div>
                `;

                container.innerHTML += activityHTML;
            });
        }
    });
}

window.addEventListener('load', getUpcomingActivities);