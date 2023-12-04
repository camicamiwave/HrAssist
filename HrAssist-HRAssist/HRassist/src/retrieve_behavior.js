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
    query, where, arrayUnion,
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

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');

function fetchTotalIPCRF() {

    const yearSelector = document.getElementById('yearSelctorIPCRF');

    yearSelector.addEventListener('change', function () {
        const selectedYear = yearSelector.value;
        console.log(selectedYear, 'asfsaf');

        fetchIPCRF(receivedStringData, selectedYear)
    });

    fetchIPCRF(receivedStringData, yearSelector.value)


    const yearSelctorDTR = document.getElementById('yearSelctorDTR');

    yearSelctorDTR.addEventListener('change', function () {
        const selectedYear = yearSelctorDTR.value;
        console.log(selectedYear, 'asfsaf');

        fetchDailyTimeRecord(receivedStringData, selectedYear)
    });

    fetchDailyTimeRecord(receivedStringData, yearSelctorDTR.value)

}

window.addEventListener('load', fetchTotalIPCRF)


function fetchIPCRF(receivedStringData, selectedYear) {
    console.log("Fetching IPCRF data...");

    const IPCRFcolRef = collection(db, 'IPCRF Information');

    const conditions = [
        where("employeeDocID", "==", receivedStringData),
        where("ForTheYear", "==", selectedYear)
    ];

    const que = query(IPCRFcolRef, ...conditions);

    // for retrieving the current user
    onSnapshot(que, (snapshot) => {
        try {
            if (!snapshot.empty) {
                snapshot.docs.forEach((docData) => {
                    const data = docData.data();
                    const employeeDocID = data.documentID;

                    console.log(data, 121323);

                    if (data.ForTheSemester === "1st Semester") {
                        firstsemIPCRFRating.innerHTML = data.TotalRating;

                        if (data.TotalRating >= 4.50) {
                            firstsemIPCRFDescRating.innerHTML = "Outstanding";
                        } if (data.TotalRating <= 4.449 && data.TotalRating >= 3.500) {
                            firstsemIPCRFDescRating.innerHTML = "Very Satisfactory"
                        } if (data.TotalRating >= 2.500 && data.TotalRating <= 3.499) {
                            firstsemIPCRFDescRating.innerHTML = "Satisfactory";
                        } if (data.TotalRating >= 1.500 && data.TotalRating <= 1.500) {
                            firstsemIPCRFDescRating.innerHTML = "Unsatisfactory";
                        } if (data.TotalRating <= 1.499) {
                            firstsemIPCRFDescRating.innerHTML = "Poor";
                        }

                    }

                    if (data.ForTheSemester === "2nd Semester") {
                        secondsemIPCRFRating.innerHTML = data.TotalRating;

                        if (data.TotalRating >= 4.50) {
                            secondsemIPCRFDescRating.innerHTML = "Outstanding";
                        } if (data.TotalRating <= 4.449 && data.TotalRating >= 3.500) {
                            secondsemIPCRFDescRating.innerHTML = "Very Satisfactory"
                        } if (data.TotalRating >= 2.500 && data.TotalRating <= 3.499) {
                            secondsemIPCRFDescRating.innerHTML = "Satisfactory";
                        } if (data.TotalRating >= 1.500 && data.TotalRating <= 1.500) {
                            secondsemIPCRFDescRating.innerHTML = "Unsatisfactory";
                        } if (data.TotalRating <= 1.499) {
                            secondsemIPCRFDescRating.innerHTML = "Poor";
                        }
                    }

                });
            } else {
                firstsemIPCRFRating.innerHTML = 0
                firstsemIPCRFDescRating.innerHTML = ""

                secondsemIPCRFRating.innerHTML = 0
                secondsemIPCRFDescRating.innerHTML = ""
                console.log("No records retrieved.");

            }
        } catch (error) {
            console.error("Error fetching IPCRF data:", error);
            // Handle error (e.g., display an error message)
        }
    });
}








function fetchDailyTimeRecord(receivedStringData, selectedYear) {
    console.log("Fetching IPCRF data...");

    const DTRcolRef = collection(db, 'DTR Information');

    const conditions = [
        where("employeeDocID", "==", receivedStringData),
        where("Year", "==", selectedYear),
    ];

    const que = query(DTRcolRef, ...conditions);

    // Assuming you have a table with id "dataTable"
    const dataTable = document.getElementById('dataTable');
    let currentID = 1; // Initialize the ID counter

    // for retrieving the current user
    onSnapshot(que, (snapshot) => {
        try {
            // Clear existing rows, excluding the header
            const tableRows = Array.from(dataTable.getElementsByTagName('tr'));
            tableRows.slice(1).forEach(row => row.remove());

            if (!snapshot.empty) {
                snapshot.docs.forEach((docData) => {
                    const data = docData.data();

                    console.log('asfsaf', data);

                    // Create a new row with an auto-incrementing ID
                    const newRow = document.createElement('tr');

                    newRow.id = 'row_' + currentID++;

                    const idnumCell = document.createElement('td');
                    idnumCell.textContent = currentID;

                    const monthCell = document.createElement('td');
                    monthCell.textContent = data.Month;

                    const timetardyCell = document.createElement('td');
                    timetardyCell.textContent = data.Tardy_Details.TotalTimesTardy;

                    const hourstardyCell = document.createElement('td');
                    hourstardyCell.textContent = data.Tardy_Details.HoursTardy;

                    const minsCell = document.createElement('td');
                    minsCell.textContent = data.Tardy_Details.MinsTardy;

                    const timeCell = document.createElement('td');
                    timeCell.textContent = data.Undertime_Details.TotalTimesUndertime;

                    const minsunderCell = document.createElement('td');
                    minsunderCell.textContent = data.Undertime_Details.MinsUndertime;

                    const hoursunderCell = document.createElement('td');
                    hoursunderCell.textContent = data.Undertime_Details.HoursUndertime;

                    // Append cells to the row
                    newRow.appendChild(idnumCell);
                    newRow.appendChild(monthCell);
                    newRow.appendChild(timetardyCell);
                    newRow.appendChild(hourstardyCell);
                    newRow.appendChild(minsCell);
                    newRow.appendChild(timeCell);
                    newRow.appendChild(minsunderCell);
                    newRow.appendChild(hoursunderCell);

                    // Append the row to the table
                    dataTable.appendChild(newRow);
                });
            } else {
                // If no records, create a single row with an error message
                const errorRow = document.createElement('tr');
                const errorCell = document.createElement('td');
                errorCell.textContent = 'No records found.';
                errorCell.colSpan = 8; // Set the colspan based on the number of columns

                // Append the error cell to the error row
                errorRow.appendChild(errorCell);

                // Append the error row to the table
                dataTable.appendChild(errorRow);

                console.log("No records retrieved.");
            }
        } catch (error) {
            console.error("Error fetching DTR data:", error);
            // Handle error (e.g., display an error message)
        }
    });
}







export function fetchEmployeeDTR() {
    try {
        // get the current employee data
        const EmployeecolRef = collection(db, 'DTR Information');

        fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
            const tardyData = dataRetrieved.Tardy_Details;
            const undertimeData = dataRetrieved.Undertime_Details;

            console.log(undertimeData, 'asfaf')

            var tableBody = document.getElementById('DTRTable');

            // Clear existing rows
            tableBody.innerHTML = '';

            let num = 1;
            var row = tableBody.insertRow();

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            cell1.innerHTML = num;
            cell2.innerHTML = ""

            num++;
        });

    } catch (error) {
        console.error("Error fetching attachment data:", error);
    }
}

window.addEventListener('load', fetchEmployeeDTR);


