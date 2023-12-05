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

        totalActiveEmployee.innerHTML = activeEmployees

        resolve(activeEmployees);
    });


}

window.addEventListener('load', fetchEmployee)


function fetchAverageIPCRFRating() {
    const IPCRFcolRef = collection(db, 'IPCRF Information');
    const ratingElement = document.getElementById('rating'); // Assuming you have an element with id 'rating' to display the result

    onSnapshot(IPCRFcolRef, (snapshot) => {
        let totalRating = 0;
        const numberOfEmployees = snapshot.docs.length;

        snapshot.docs.forEach((doc) => {
            const data = doc.data();

            // Assuming TotalRating is stored as a string, convert it to a number
            const rating = parseFloat(data.TotalRating) || 0;

            totalRating += rating;
        });

        const averageRating = numberOfEmployees > 0 ? totalRating / numberOfEmployees : 0;

        console.log('Total rating of all employees:', totalRating);
        console.log('Average rating of all employees:', averageRating);

        // If you want to display the average rating, you can do it here
        ratingElement.innerHTML = averageRating.toFixed(2);

        if (averageRating >= 4.50) {
            descRating.innerHTML = "Outstanding";
        } if (averageRating <= 4.449 && averageRating >= 3.500) {
            descRating.innerHTML = "Very Satisfactory"
        } if (averageRating >= 2.500 && averageRating <= 3.499) {
            descRating.innerHTML = "Satisfactory";
        } if (averageRating >= 1.500 && averageRating <= 1.500) {
            descRating.innerHTML = "Unsatisfactory";
        } if (averageRating <= 1.499) {
            descRating.innerHTML = "Poor";
        }

    });
}

window.addEventListener('load', fetchAverageIPCRFRating);

function fetchAverageOfficeIPCRF() {
    const IPCRFcolRef = collection(db, 'IPCRF Information');
    const File201colRef = collection(db, '201File Information');
    const ratingElement = document.getElementById('rating'); // Assuming you have an element with id 'rating' to display the result
    const descRating = document.getElementById('descRating'); // Assuming you have an element with id 'descRating' to display the descriptor

    // Define a function to calculate average rating
    const calculateAverageRating = (totalRating, count) => {
        return count > 0 ? totalRating / count : 0;
    };

    onSnapshot(IPCRFcolRef, async (snapshot) => {
        let totalRating = 0;
        let totalEmployees = 0;

        // Map to store the average rating for each office
        const officeAverageRatings = {};

        snapshot.docs.forEach(async (doc) => {
            const data = doc.data();
            const office = data.Office;

            // Assuming TotalRating is stored as a string, convert it to a number
            const rating = parseFloat(data.TotalRating) || 0;

            totalRating += rating;

            if (!officeAverageRatings[office]) {
                officeAverageRatings[office] = { total: rating, count: 1 };
            } else {
                officeAverageRatings[office].total += rating;
                officeAverageRatings[office].count += 1;
            }

            // Fetch records from '201File Information' for the current office
            const officeEmployeesSnapshot = await getDocs(query(File201colRef, where('employeeDocID', '==', doc.id)));

            officeEmployeesSnapshot.forEach((employeeDoc) => {
                // Process employee records here if needed
                // You can add additional logic for employee data processing
            });

            totalEmployees += officeEmployeesSnapshot.size;
        });

        const averageRating = calculateAverageRating(totalRating, snapshot.docs.length);

        console.log('Total rating of all employees:', totalRating);
        console.log('Average rating of all employees:', averageRating);

        // Display average rating per office
        console.log('Average rating per office:', officeAverageRatings);

        // If you have a way to display per office ratings, you can do it here
        // Example: displayOfficeRatings(officeAverageRatings);

        // If you want to display the total number of employees, you can do it here
        console.log('Total number of employees:', totalEmployees);
    });
}

window.addEventListener('load', fetchAverageOfficeIPCRF);


async function RetrieveAllTardiness() {
    try {
        const EmployeecolRef = collection(db, 'DTR Information');
        const File201colRef = collection(db, '201File Information');
        const Employee123colRef = collection(db, 'Employee Information');

        const tardyData = await fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID");
        const file201data = await fetchEmployeeInfo(File201colRef, receivedStringData, "employeeDocID");
        const empdata = await fetchEmployeeInfo(Employee123colRef, receivedStringData, "employeeDocID");

        var tableBody = document.getElementById('ipcrfTable');

        // Clear existing rows
        tableBody.innerHTML = '';

        let num = 1;
        var row = tableBody.insertRow();

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);

        const fullName = `${empdata.Personal_Information.FirstName} ${empdata.Personal_Information.SurName}`;
        cell1.innerHTML = num;
        cell2.innerHTML = fullName;
        cell3.innerHTML = file201data.Office;
        cell4.innerHTML = file201data.PositionTitle;
        cell5.innerHTML = tardyData.Tardy_Details.TotalTimesTardy;
        cell6.innerHTML = file201data.Undertime_Details.TotalTimesUndertime;

        num++;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

window.addEventListener('load', RetrieveAllTardiness);
