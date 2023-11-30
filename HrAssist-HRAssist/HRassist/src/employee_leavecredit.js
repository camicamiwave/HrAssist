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
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');
const received201filedoc = urlParams.get('201filedoc');

export function Employee201LeaveCredit(leaveCreditsCollectionRef, File201Document) {
    const leaveSubmitBtn = document.getElementById('leaveSaveChanges');
    leaveSubmitBtn.addEventListener('click', (e) => {

        const leave_form = document.querySelector('#leaveCreditForm');
        if (leave_form) {

            const LeaveType = leave_form.leaveCreditLeaveType.value.trim()

            const leaveFormData = {
                Leave_Credit: {
                    [LeaveType]: {
                        LeaveType: leave_form.leaveCreditLeaveType.value.trim(),
                        RemainingUnits: leave_form.leaveCreditRemainingUnits.value.trim(),
                        AsOf: leave_form.leaveCreditAsOfNow.value.trim(),
                    }
                }
            }

            if (LeaveType === 'Others') {
                const specifyInput = document.getElementById('otherLeaveType');
                if (specifyInput) {
                    // Add the OtherLeaveType field using the spread operator for merging
                    leaveFormData.Leave_Credit[LeaveType] = {
                        ...leaveFormData.Leave_Credit[LeaveType],
                        OtherLeaveType: specifyInput.value.trim(),
                    };
                }
            }


            Swal.fire({
                title: "Are you sure?",
                text: "Employee's leave credit will be saved",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Confirm"
            }).then((result) => {

                const employeeDocRef = doc(leaveCreditsCollectionRef, File201Document);
                return setDoc(employeeDocRef, leaveFormData, { merge: true })

                // get the current employee data
                //const EmployeecolRef = collection(db, '201File Information');
                /*
                fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
                    const File201Data = dataRetrieved;
                    const leaveData = dataRetrieved.Leave_Credit;

                    const employeeDocRef = doc(EmployeecolRef, File201Data.documentID);
                    return setDoc(employeeDocRef, leaveFormData, { merge: true })
                })*/


            }).then(() => {
                console.log("Added successfully...")

                Swal.fire({
                    title: 'Saved Successfully!',
                    text: "Employee's leave credits saved to the system.",
                    icon: 'success',
                });

                hideEditModal()
            })
        }
    })


}

window.addEventListener('load', Employee201LeaveCredit)




export function fetchEmployeeYearCredit() {
    try {
        // get the current employee data
        const EmployeecolRef = collection(db, '201File Information');

        let File201Document;

        fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
            const File201Data = dataRetrieved;
            const leaveData = dataRetrieved.Leave_Credit;

            File201Document = dataRetrieved.documentID

        }).then(() => {
            const employeeDocumentRef = doc(EmployeecolRef, File201Document);

            // Reference to the nested collection within the document
            const leaveCreditsCollectionRef = collection(employeeDocumentRef, 'Leave_Credits');

            fetchLeaveCreditAnnual(leaveCreditsCollectionRef, File201Document)
            SearchYearCredit(leaveCreditsCollectionRef, File201Document)

            return File201Document;

        })

    } catch (error) {
        console.error("Error fetching leave data:", error);
    }
}

window.addEventListener('load', fetchEmployeeYearCredit);


function SearchYearCredit(leaveCreditsCollectionRef, File201Document) {

    const que = query(leaveCreditsCollectionRef);

    const yearInput = document.getElementById('yearSelctor')
    const selectYearBtn = document.getElementById('selectYearBtn')

    selectYearBtn.addEventListener('click', (e) => {

        const leaveCreditValue = yearInput.value;
        console.log(leaveCreditValue)

        fetchEmployeeInfo(leaveCreditsCollectionRef, leaveCreditValue, 'YearCovered')
            .then((dataRetrieved) => {
                if (dataRetrieved) {
                    // Data found
                    const leaveCreditData = dataRetrieved;
                    const Year = leaveCreditData.YearCovered;
                    alert(`Record found in ${Year}.`);

                    const leaveCreditRecordLayout = document.getElementById('leaveCreditRecordLayout')
                    leaveCreditRecordLayout.style.display = 'block';


                    // Assuming you want to add the employeeDocID to the URL without reloading
                    const url = `admin_201file_leave.html?data=${encodeURIComponent(receivedStringData)}&201filedoc=${encodeURIComponent(File201Document)}&leave_id=${encodeURIComponent(leaveCreditData.leavecreditDocID)}`;

                    // Use pushState to update the URL
                    window.history.pushState({ path: url }, '', url);

                    Employee201LeaveCredit(leaveCreditsCollectionRef, leaveCreditData.leavecreditDocID)



                } else {
                    // Data not found
                    alert("Record not found");
                }


            }).then(() => {
                fetchEmployeeLeaveCredit()
            })
            .catch((error) => {
                // Error handler
                console.error('Error fetching employee info:', error);
            });



    })

}


function fetchLeaveCreditAnnual(leaveCreditsCollectionRef, File201Document) {

    const colRef = collection(db, 'Applicant Information');
    const que = query(leaveCreditsCollectionRef, orderBy('LeaveCreditStatus'));

    // Assuming you have Firestore data in the 'employees' array
    const employeeTable = document.getElementById('yearTable');
    const tbody = employeeTable.querySelector('#annualRecordBody');

    onSnapshot(que, (snapshot) => {
        // Clear the existing rows in the table body
        tbody.innerHTML = '';

        let num = 0;
        snapshot.docs.forEach((leavedoc) => {
            const data = leavedoc.data();
            const id = leavedoc.id;
            const row = document.createElement('tr');

            const currentYear = new Date().getFullYear(); 

            if (data.LeaveCreditStatus === "Present"){
                if (data.YearCovered !== currentYear.toString()){
                    console.log("tamaaa", data.leavecreditDocID)
                    
                    const leaveCreditsCollectionRef1 = collection(db, '201File Information', File201Document, 'Leave_Credits');

                    return setDoc(doc(leaveCreditsCollectionRef1, data.leavecreditDocID), { LeaveCreditStatus: "" }, { merge: true });
                }
            } else if (data.LeaveCreditStatus !== "Present") {
                if (data.YearCovered === currentYear.toString()){

                    const leaveCreditsCollectionRef1 = collection(db, '201File Information', File201Document, 'Leave_Credits');

                    return setDoc(doc(leaveCreditsCollectionRef1, data.leavecreditDocID), { LeaveCreditStatus: "Present" }, { merge: true });

                }
            }

            num++; // Increment num for each row

            const idCell = document.createElement('td');
            idCell.textContent = num; // Use the incremented num value

            const yearCell = document.createElement('td');
            yearCell.textContent = data.YearCovered;

            const statusCell = document.createElement('td');
            statusCell.textContent = data.LeaveCreditStatus;

            const actionCell = document.createElement('td');
            actionCell.innerHTML = '<button class="btn btn-danger">Delete</button>';

            // Add a click event listener to the row
            actionCell.addEventListener('click', () => {
                Swal.fire({
                    title: "Are you sure?",
                    text: "All employee's leave credit record for this year will be lost",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Confirm"
                }).then((result) => {
                    if (result.isConfirmed) {
                        // If the user clicks "Confirm"
                        console.log('Row ID clicked:', id);

                        // Reference to the Leave_Credits collection
                        const leaveCreditsCollectionRef1 = collection(db, '201File Information', File201Document, 'Leave_Credits');

                        console.log('leaveCreditsCollectionRef1:', leaveCreditsCollectionRef1);
                        console.log('id:', id);

                        DeleteYearDocument(leaveCreditsCollectionRef1, id);
                    } else {
                        // Handle the case where the user cancels the action
                    }
                });
            });

            row.appendChild(idCell);
            row.appendChild(yearCell);
            row.appendChild(statusCell);
            row.appendChild(actionCell);

            // Append the row to the table body
            tbody.appendChild(row);
        });
    }, (error) => {
        console.error('Error fetching documents:', error);
    });
}


//window.addEventListener('load', fetchLeaveCreditAnnual);

function DeleteYearDocument(leaveCreditsCollectionRef1, id) {

    const docRef = doc(leaveCreditsCollectionRef1, id)

    deleteDoc(docRef)
        .then(() => {
            Swal.fire({
                title: 'Deleted Successfully!',
                text: 'All employee record deleted on that year.',
                icon: 'success',
            });
        })
}




function AddYearLeaveRecord() {
    const addYearSubmitBtn = document.getElementById('addYearSubmitBtn');
    const yearSelectorForm = document.querySelector('#yearSelectorForm')

    addYearSubmitBtn.addEventListener('click', (e) => {
        // get the current employee data
        const EmployeecolRef = collection(db, '201File Information');

        fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
            const File201Data = dataRetrieved;

            // Reference to the root collection
            const employeeCollectionRef = collection(db, '201File Information');

            // Replace 'documentID' with the actual ID of the document you want to reference
            const documentID = File201Data.documentID;

            // Reference to the specific document
            const employeeDocumentRef = doc(employeeCollectionRef, documentID);

            // Reference to the nested collection within the document
            const leaveCreditsCollectionRef = collection(employeeDocumentRef, 'Leave_Credits');

            
            Swal.fire({
                title: "Are you sure?",
                text: "Your request will be recorded",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Confirm"
            }).then((result) => {
                if (result.isConfirmed) {

                    const currentDate = new Date();

                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                    const day = String(currentDate.getDate()).padStart(2, '0');

                    const formattedDate = `${year}-${month}-${day}`;

                    const leaveDetails = {
                        createdAt: serverTimestamp(),
                        YearCovered: yearSelectorForm.yearSelctor.value.trim(),
                        file201documentID: documentID,
                        Leave_Credit: {
                            'Sick Leave': {
                                LeaveType: "Sick Leave",
                                RemainingUnits: 0,
                                AsOf: formattedDate
                            },
                            'Vacation Leave': {
                                LeaveType: "Vacation Leave",
                                RemainingUnits: 0,
                                AsOf: formattedDate
                            },
                            'Maternity Leave': {
                                LeaveType: "Maternity Leave",
                                RemainingUnits: 105,
                                AsOf: formattedDate
                            },
                            'Mandatory/Forced Leave': {
                                LeaveType: "Mandatory/Forced Leave",
                                RemainingUnits: 5,
                                AsOf: formattedDate
                            },
                            'Paternity Leave': {
                                LeaveType: "Paternity Leave",
                                RemainingUnits: 7,
                                AsOf: formattedDate
                            },
                            'Special Privilege Leave': {
                                LeaveType: "Special Privilege Leave",
                                RemainingUnits: 3,
                                AsOf: formattedDate
                            },
                            'Solo Parent Leave': {
                                LeaveType: "Solo Parent Leave",
                                RemainingUnits: 7,
                                AsOf: formattedDate
                            },
                            'Study Leave': {
                                LeaveType: "Study Leave",
                                RemainingUnits: 180,
                                AsOf: formattedDate
                            },
                            '10-Day VAWC Leave': {
                                LeaveType: "10-Day VAWC Leave",
                                RemainingUnits: 10,
                                AsOf: formattedDate
                            },
                            'Rehabilitation Priviledge': {
                                LeaveType: "Rehabilitation Priviledge",
                                RemainingUnits: 180,
                                AsOf: formattedDate
                            },
                            'Special Leave Benefits for Women': {
                                LeaveType: "Special Leave Benefits for Women",
                                RemainingUnits: 60,
                                AsOf: formattedDate
                            },
                            'Special Emergency (Calamity) Leave': {
                                LeaveType: "Special Emergency (Calamity) Leave",
                                RemainingUnits: 5,
                                AsOf: formattedDate
                            },


                        }

                    };


                    // Add a document to the nested collection and get the document reference
                    return addDoc(leaveCreditsCollectionRef, leaveDetails)
                        .then((docRef) => {
                            const EmpcustomDocId = docRef.id;


                            const currentYear = new Date().getFullYear();
                            console.log(currentYear, 'asdfsd');

                            if (yearSelectorForm.yearSelctor.value === currentYear.toString()) {

                                console.log('log')
                                const leaveCreditDetails = {
                                    leavecreditDocID: EmpcustomDocId,
                                    LeaveCreditStatus: 'Present'
                                }
                                // Assuming downloadURLs is defined somewhere
                                return setDoc(doc(leaveCreditsCollectionRef, EmpcustomDocId), leaveCreditDetails, { merge: true });

                            } else {

                                const leaveCreditDetails = {
                                    leavecreditDocID: EmpcustomDocId,
                                    LeaveCreditStatus: ''
                                }

                                // Assuming downloadURLs is defined somewhere
                                return setDoc(doc(leaveCreditsCollectionRef, EmpcustomDocId), leaveCreditDetails, { merge: true });

                            }


                        }).then(() => {
                            Swal.fire({
                                title: 'Saved successfully!',
                                text: 'Record has been saved.',
                                icon: 'success',
                            });

                            hideYearModal()

                        })
                        .catch((error) => {
                            console.error('Error adding document:', error);
                        });

                } else {
                    // If the user clicks "Cancel", return a resolved promise
                    return Promise.resolve();
                }
            }).catch((error) => {
                console.error("Error occurred:", error);
                // You can handle the error here, e.g., show a custom error message to the user
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while processing your transaction. Please try again.',
                    icon: 'error',
                });
            });




        })

    })
}

window.addEventListener('load', AddYearLeaveRecord);


export function fetchEmployeeLeaveCredit() {

    try {
        const urlParams = new URLSearchParams(window.location.search);

        const receivedleave_id = urlParams.get('leave_id');
        const receivedfile201 = urlParams.get('201filedoc');

        // Reference to the Leave_Credits collection
        const leaveCreditsCollectionRef = collection(db, '201File Information', receivedfile201, 'Leave_Credits');

        // Create a query to get the Leave_Credit data
        const leaveCreditQuery = query(leaveCreditsCollectionRef, where('leavecreditDocID', '==', receivedleave_id));
        // Listen for real-time updates
        const unsubscribe = onSnapshot(leaveCreditQuery, (snapshot) => {
            snapshot.docs.forEach((leaveTypeDoc) => {
                const leaveTypeData = leaveTypeDoc.data();
                const leaveDetails = leaveTypeData.Leave_Credit
                const id = leaveTypeData.id;

                var tableBody = document.getElementById('fileListBody');

                // Clear existing rows
                tableBody.innerHTML = '';
                let num = 1
                // Loop through the Leave_Credit object and add rows to the table
                for (var leaveType in leaveDetails) {
                    if (leaveDetails.hasOwnProperty(leaveType)) {
                        var row = tableBody.insertRow();
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);
                        var cell5 = row.insertCell(4);
                        var cell6 = row.insertCell(5);

                        // Set values for each cell
                        cell2.innerHTML = num; // You can set an ID or index here

                        if (leaveDetails[leaveType].LeaveType === 'Others') {
                            cell3.innerHTML = leaveDetails[leaveType].OtherLeaveType;
                        } else {
                            cell3.innerHTML = leaveDetails[leaveType].LeaveType;
                        }

                        cell4.innerHTML = leaveDetails[leaveType].RemainingUnits;
                        cell5.innerHTML = leaveDetails[leaveType].AsOf;
                        //cell6.innerHTML = `<button onclick="openEditModal1()" class="btn btn-primary">Edit</button>`;

                        // Assuming you have created the button and assigned it to the variable 'editButton'
                        const editButton = document.createElement('button');

                        editButton.textContent = 'Edit';
                        editButton.className = 'btn btn-primary';
                        editButton.id = `${leaveType}`;

                        // Add an event listener to the button
                        editButton.addEventListener('click', function () {
                            const leaveData = leaveDetails[this.id]

                            leaveCreditLeaveType.value = leaveData.LeaveType
                            leaveCreditRemainingUnits.value = leaveData.RemainingUnits
                            leaveCreditAsOfNow.value = leaveData.AsOf
                            
                            openEditModal();
                        });

                        // Append the button to the cell (cell6 in this case)
                        cell6.appendChild(editButton);



                    }
                    num++
                }
            })
        })



    } catch (error) {
        console.error("Error fetching leave data:", error);
    }
}

