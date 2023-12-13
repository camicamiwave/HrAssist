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
    query, where, getDocs,
    orderBy, serverTimestamp,
    getDoc, updateDoc, setDoc
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { UserLoginChecker } from './page_restriction.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// Import ApexCharts library
import ApexCharts from 'apexcharts';

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

    });
}

window.addEventListener('load', fetchAverageOfficeIPCRF);



function fetchPerformanceTable() {
    const DTRcolRef = collection(db, 'DTR Information');
    const EmployeecolRef = collection(db, 'Employee Information');
    const File201colRef = collection(db, '201File Information');

    const que = query(DTRcolRef);
    const tableBody = document.getElementById('tadinessTable').getElementsByTagName('tbody')[0];

    // for retrieving the current user
    onSnapshot(que, (snapshot) => {
        try {
            if (!snapshot.empty) {
                // Clear existing table rows
                tableBody.innerHTML = '';

                snapshot.docs.forEach((docData, index) => {
                    const data = docData.data();
                    const EmployeeDocID = data.employeeDocID;

                    // Create a new row
                    const newRow = tableBody.insertRow();

                    fetchEmployeeInfo(EmployeecolRef, EmployeeDocID, "documentID").then((dataRetrieved) => {
                        const employeeData = dataRetrieved;

                        
                        fetchEmployeeInfo(File201colRef, EmployeeDocID, "employeeDocID").then((dataRetrieved) => {
                            const file201employeeData = dataRetrieved;

                            // Add cells to the row with data
                            const cellID = newRow.insertCell(0);
                            const cell1 = newRow.insertCell(1);
                            const cell2 = newRow.insertCell(2);
                            const cell3 = newRow.insertCell(3);
                            const cell4 = newRow.insertCell(4);
                            const cell5 = newRow.insertCell(5); 
                            
                            // Apply CSS styling to center text in cells
                            cellID.style.textAlign = 'left';
                            cell1.style.textAlign = 'left';
                            cell2.style.textAlign = 'left';
                            cell3.style.textAlign = 'center';
                            cell4.style.textAlign = 'center';
                            cell5.style.textAlign = 'center';

                            const fullName = `${employeeData.Personal_Information.FirstName} ${employeeData.Personal_Information.SurName} `

                            // Populate cells with data
                            cellID.textContent = index + 1; // Auto-increment ID
                            cell1.textContent = fullName; 
                            cell2.textContent = file201employeeData.Appointment_Details.Office; 
                            cell3.textContent = file201employeeData.Appointment_Details.PositionTitle;  
                            cell4.textContent = data.Tardy_Details.TotalTimesTardy;  
                            cell5.textContent = data.Undertime_Details.TotalTimesUndertime;   

                        })
                    })                    
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

window.addEventListener('load', fetchPerformanceTable);


document.addEventListener("DOMContentLoaded", () => {
    // Assuming you have Firebase initialized and db is your Firestore instance
    const ipcRfColRef = collection(db, 'IPCRF Information');
    const que = query(ipcRfColRef);

    // Object to store total ratings and count per office
    const officeRatings = {};

    // Fetch IPCRF Information data
    onSnapshot(que, (snapshot) => {
        try {
            if (!snapshot.empty) {
                snapshot.docs.forEach((docData, index) => {
                    const data = docData.data();
                    const officeName = data.Office;

                    // If the office doesn't exist in the ratings object, initialize it
                    if (!officeRatings.hasOwnProperty(officeName)) {
                        officeRatings[officeName] = {
                            totalRating: 0,
                            count: 0,
                        };
                    }

                    // Add the rating to the total for the corresponding office
                    officeRatings[officeName].totalRating += parseFloat(data.TotalRating || 0);
                    // Increment the count for the corresponding office
                    officeRatings[officeName].count += 1;
                });

                // Calculate average rating per office
                const averageRatings = {};
                for (const [officeName, ratingData] of Object.entries(officeRatings)) {
                    averageRatings[officeName] = ratingData.totalRating / ratingData.count;
                }

                // Now averageRatings object contains the average ratings per office

                // Now use the data to configure ApexCharts
                const chartData = Object.values(averageRatings);
                const chartCategories = Object.keys(averageRatings);

                new ApexCharts(document.querySelector("#barChart"), {
                    series: [{
                        data: chartData,
                    }],
                    chart: {
                        type: 'bar',
                        height: 350
                    },
                    plotOptions: {
                        bar: {
                            borderRadius: 4,
                            horizontal: true,
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    xaxis: {
                        categories: chartCategories,
                    }
                }).render();
            }
        } catch (error) {
            console.error("Error fetching IPCRF data:", error);
            // Handle error (e.g., display an error message)
        }
    });
});