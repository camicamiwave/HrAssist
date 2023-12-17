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
import { fetchCurrentEmployee } from './employee_home.js';
import { fetchCurrentEmployeePersonalDetails } from './employee_home.js';

console.log("asfsafaqwwr")

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()
document.addEventListener("DOMContentLoaded", () => {
    // Initialize ECharts
    const trafficChart = echarts.init(document.querySelector("#trafficChart"));

    // Initial ECharts configuration
    const initialOption = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [{
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            top: '50%',
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '18',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: []
        }]
    };

    // Set the initial configuration
    trafficChart.setOption(initialOption);

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
                            const file201query = query(leaveCreditsCollectionRef, where("LeaveCreditStatus", "==", "Present"));

                            console.log('hey', '1224212');

                            onSnapshot(file201query, (snapshot) => {
                                const dynamic_data = snapshot.docs.map((leavedoc) => {
                                    const leaveCreditdata = leavedoc.data();

                                    if (employee_data.Personal_Information.Gender === "Male"){
                                        return [
                                            { value: leaveCreditdata.Leave_Credit['Vacation Leave'].RemainingUnits, name: 'Vacation Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Mandatory/Forced Leave'].RemainingUnits, name: 'Mandatory/Forced Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Sick Leave'].RemainingUnits, name: 'Sick Leave' },
                                            //{ value: leaveCreditdata.Leave_Credit['Special Leave Benefits for Women'].RemainingUnits, name: 'Special Leave Benefits for Women' },
                                            { value: leaveCreditdata.Leave_Credit['Solo Parent Leave'].RemainingUnits, name: 'Solo Parent Leave' },
                                            //{ value: leaveCreditdata.Leave_Credit['Maternity Leave'].RemainingUnits, name: 'Maternity Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Paternity Leave'].RemainingUnits, name: 'Paternity Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Study Leave'].RemainingUnits, name: 'Study Leave' },
                                            //{ value: leaveCreditdata.Leave_Credit['10-Day VAWC Leave'].RemainingUnits, name: '10-Day VAWC Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Special Emergency (Calamity) Leave'].RemainingUnits, name: 'Special Emergency (Calamity) Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Rehabilitation Priviledge'].RemainingUnits, name: 'Rehabilitation Priviledge' },
                                            { value: leaveCreditdata.Leave_Credit['Special Privilege Leave'].RemainingUnits, name: 'Special Privilege Leave' }
                                        ];
                                      
                                    } else if (employee_data.Personal_Information.Gender === "Female"){
                                        return [
                                            { value: leaveCreditdata.Leave_Credit['Vacation Leave'].RemainingUnits, name: 'Vacation Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Mandatory/Forced Leave'].RemainingUnits, name: 'Mandatory/Forced Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Sick Leave'].RemainingUnits, name: 'Sick Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Special Leave Benefits for Women'].RemainingUnits, name: 'Special Leave Benefits for Women' },
                                            { value: leaveCreditdata.Leave_Credit['Solo Parent Leave'].RemainingUnits, name: 'Solo Parent Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Maternity Leave'].RemainingUnits, name: 'Maternity Leave' },
                                            //{ value: leaveCreditdata.Leave_Credit['Paternity Leave'].RemainingUnits, name: 'Paternity Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Study Leave'].RemainingUnits, name: 'Study Leave' },
                                            { value: leaveCreditdata.Leave_Credit['10-Day VAWC Leave'].RemainingUnits, name: '10-Day VAWC Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Special Emergency (Calamity) Leave'].RemainingUnits, name: 'Special Emergency (Calamity) Leave' },
                                            { value: leaveCreditdata.Leave_Credit['Rehabilitation Priviledge'].RemainingUnits, name: 'Rehabilitation Priviledge' },
                                            { value: leaveCreditdata.Leave_Credit['Special Privilege Leave'].RemainingUnits, name: 'Special Privilege Leave' }
                                        ];
                                    }
                                    
                                });

                                // Update the ECharts configuration with the dynamic data
                                const updatedOption = {
                                    series: [{
                                        data: dynamic_data.flat() // Flatten the array
                                    }]
                                };

                                // Set the updated configuration
                                trafficChart.setOption(updatedOption);
                            });
                        });
                    });
                });
            });
        });
    }

    // Fetch and update data when the page loads
    fetchEmployeeLeaveCredits();
});

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

