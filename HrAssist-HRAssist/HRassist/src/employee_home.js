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
import { FetchCurrentUser } from './employee_pass_slip.js';

console.log("asfsafaqwwr")

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');


export function fetchCurrentEmployeePersonalDetails() {
    return new Promise((resolve, reject) => {
        const TestcolRef = collection(db, 'User Account');
        const EmployeecolRef = collection(db, 'Employee Information');
        const File201colRef = collection(db, '201File Information');

        FetchCurrentUser().then((currentUserUID) => {
            const que = query(TestcolRef, where("userID", "==", currentUserUID));

            onSnapshot(que, (snapshot) => {
                const promises = snapshot.docs.map((accountdoc) => {
                    const accountdata = accountdoc.data();
                    const accountDocID = accountdata.documentID;

                    return fetchEmployeeInfo(EmployeecolRef, accountDocID, "accountID").then((dataRetrieved) => {
                        const employee_data = dataRetrieved;
                        const employee_DocID = employee_data.documentID;


                        resolve(employee_data);
                    });
                });

                Promise.all(promises)
                    .then((employeeDataArray) => {
                        resolve(employeeDataArray);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        }).catch((error) => {
            reject(error);
        });
    });
}

export function fetchCurrentEmployee() {
    return new Promise((resolve, reject) => {
        const TestcolRef = collection(db, 'User Account');
        const EmployeecolRef = collection(db, 'Employee Information');
        const File201colRef = collection(db, '201File Information');

        FetchCurrentUser().then((currentUserUID) => {
            const que = query(TestcolRef, where("userID", "==", currentUserUID));

            onSnapshot(que, (snapshot) => {
                const promises = snapshot.docs.map((accountdoc) => {
                    const accountdata = accountdoc.data();
                    const accountDocID = accountdata.documentID;

                    return fetchEmployeeInfo(EmployeecolRef, accountDocID, "accountID").then((dataRetrieved) => {
                        const employee_data = dataRetrieved;
                        const employee_DocID = employee_data.documentID;

                        return fetchEmployeeInfo(File201colRef, employee_DocID, "employeeDocID").then((file201dataRetrieved) => {
                            const file201_data = file201dataRetrieved;
                            const file201DocID = file201_data.documentID;

                            resolve(file201_data);
                        });
                    });
                });

                Promise.all(promises)
                    .then((employeeDataArray) => {
                        resolve(employeeDataArray);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        }).catch((error) => {
            reject(error);
        });
    });
}

function fetchEmployeeLeaveCredits() {
    const TestcolRef = collection(db, 'User Account');
    const EmployeecolRef = collection(db, 'Employee Information');
    const File201colRef = collection(db, '201File Information');

    FetchCurrentUser().then((currentUserUID) => {
        const que = query(TestcolRef, where("userID", "==", currentUserUID));

        onSnapshot(que, (snapshot) => {
            snapshot.docs.forEach((accountdoc) => {
                const accountdata = accountdoc.data();
                const id = accountdoc.id;
                const accountDocID = accountdata.documentID;


                fetchEmployeeInfo(EmployeecolRef, accountDocID, "accountID").then((dataRetrieved) => {
                    const employee_data = dataRetrieved;
                    const employeeDocID = employee_data.documentID;


                    fetchEmployeeInfo(File201colRef, employeeDocID, "employeeDocID").then((dataRetrieved) => {
                        const file201_data = dataRetrieved;
                        const file201DocID = file201_data.documentID;


                        const employeeDocumentRef = doc(File201colRef, file201DocID);

                        // Reference to the nested collection within the document
                        const leaveCreditsCollectionRef = collection(employeeDocumentRef, 'Leave_Credits');
                        const file201query = query(leaveCreditsCollectionRef, where("LeaveCreditStatus", "==", "Present"))

                        onSnapshot(file201query, (snapshot) => {
                            snapshot.docs.forEach((leavedoc) => {
                                const leaveCreditdata = leavedoc.data();
                                const id = leavedoc.id;
                                const accountDocID = leaveCreditdata.documentID;

                                totalVacationLeave.innerHTML = leaveCreditdata.Leave_Credit['Vacation Leave'].RemainingUnits
                                totalSickLeave.innerHTML = leaveCreditdata.Leave_Credit['Sick Leave'].RemainingUnits

                            })
                        })



                    })



                });
            });
        });
    });


}

window.addEventListener('load', fetchEmployeeLeaveCredits)




function getUpcomingActivities() {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 5);


    fetchCurrentEmployee()
        .then((employeeDataArray) => {
            // Access specific field

            const employee_office = employeeDataArray.Appointment_Details.Office;

            const container = document.getElementById("employee_activity");

            // Random design options
            const badgeColors = ["text-success", "text-danger", "text-primary", "text-info", "text-warning"];
            const Employeeque = query(
                collection(db, 'Calendar Information'),
                where('formData.start', '>=', currentDate.toISOString()),
                where('formData.start', '<=', futureDate.toISOString()),
                where(
                    'formData.participants', '==', employee_office,
                    'formData.participants', '==', 'All',
                    'TrainingDetails.Participants', '==', employee_office
                )
            );

            onSnapshot(Employeeque, (snapshot) => {
                if (snapshot.empty) {

                    container.innerHTML = `<div class="activity-item d-flex">  
                                            <div class="activity-content">
                                                <a href="#" class="text-dark" style='text-align: center;'>No upcoming activities</a><br> 
                                            </div>
                                        </div>
                `;
                } else {
                    // Documents matched the query 
                    const data = snapshot.docs.map(doc => doc.data());

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
                            <div class="activity-content">
                                <a href="#" class="fw-bold text-dark">${activity.formData.title}</a><br>
                                ${activity.eventPurpose}
                            </div>
                        </div>
                    `;

                        container.innerHTML += activityHTML;
                    });
                }
            });

        })
        .catch((error) => {
            console.error('Error:', error);
        });


}

window.addEventListener('load', getUpcomingActivities);

function fetchCurrentRequest() {
    const RequestcolRef = collection(db, 'Request Information');
    const tableBody = document.getElementById('employee_request').getElementsByTagName('tbody')[0];

    fetchCurrentEmployeePersonalDetails()
        .then((employeeDataArray) => {
            const employee_documentID = employeeDataArray.documentID

            console.log(employee_documentID)

            const que = query(RequestcolRef, where('employeeDocID', '==', employee_documentID));

            onSnapshot(que, (snapshot) => {
                // Clear existing rows
                tableBody.innerHTML = '';

                let num = 1;

                if (snapshot.empty) {
                    // Display a message if there are no records
                    const noRecordsRow = tableBody.insertRow();
                    const noRecordsCell = noRecordsRow.insertCell(0);
                    noRecordsCell.colSpan = 5; // Set colspan to cover all columns
                    noRecordsCell.style.textAlign = 'center';
                    noRecordsCell.textContent = 'No records found';

                } else {
                    snapshot.docs.forEach((doc) => {
                        const employee_data = doc.data();
                        const employeeID = employee_data.employeeDocID; 

                        // Create a new row
                        const row = tableBody.insertRow();

                        // Create cells and set values
                        const cell1 = row.insertCell(0);
                        const cell2 = row.insertCell(1);
                        const cell3 = row.insertCell(2);
                        const cell4 = row.insertCell(3);
                        const cell5 = row.insertCell(4);

                        cell1.style.textAlign = 'left'
                        cell2.style.textAlign = 'left'
                        cell3.style.textAlign = 'left'
                        cell4.style.textAlign = 'left'
                        cell5.style.textAlign = 'left'

                        cell1.textContent = num;

                        if (employee_data.RequestType === "Leave Request") {
                            cell2.textContent = employee_data.RequestType;
                            cell3.textContent = employee_data.Request_Details.LeaveType;
                            cell4.textContent = employee_data.Request_Details.StartDate;
                        } else if (employee_data.RequestType === "Pass Slip Leave") {
                            cell2.textContent = "Pass Slip";
                            cell3.textContent = employee_data.Request_Details.PurposeStatement;
                            cell4.textContent = employee_data.Request_Details.PassSlipDate;

                        }

                        if (employee_data.RequestStatus === "Pending") {
                            cell5.innerHTML = `<span class="badge bg-warning">Pending</span>`
                        } else if (employee_data.RequestStatus === "Approved") {
                            cell5.innerHTML = `<span class="badge bg-success">Approved</span>`
                        } else if (employee_data.RequestStatus === "Declined") {
                            cell5.innerHTML = `<span class="badge bg-danger">Declined</span>`
                        }

                        num++;
                    });
                }
            })
        })

        .catch((error) => {
            console.error('Error:', error);
        });
}

window.addEventListener('load', fetchCurrentRequest);


function fetchCurrentJobVacancy() {

    const JobcolRef = collection(db, 'Job Information');
    
    const container = document.getElementById("job_vacancy_container");

    const que = query(JobcolRef, where('JobStatus', '==', "Ongoing"));

    onSnapshot(que, (snapshot) => {

        container.innerHTML = '';
        
        snapshot.docs.forEach((doc) => {
            const employee_data = doc.data();



            const activityHTML = `<div class="post-item clearfix">
                                    <img src="img/favicon.png" alt="">
                                    <h4><a href="job-list.html">${employee_data.JobTitle}</a></h4>
                                    <p>${employee_data.JobDesc}</p>
                                </div>`

            container.innerHTML += activityHTML;


        })
    })

}


window.addEventListener('load', fetchCurrentJobVacancy)