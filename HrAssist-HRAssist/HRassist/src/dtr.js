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
import { FetchCurrentUser } from './employee_leave_form.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);

const urlParams = new URLSearchParams(window.location.search);

const receivedStringData = urlParams.get('data');
const received201filedoc = urlParams.get('201filedoc');

export function EmployeeDtrForm() {
    const leaveSubmitBtn = document.getElementById('requestLeaveBtn');
    const leave_form = document.querySelector('#requestLeaveForm');

    const TestcolRef = collection(db, 'User Account');
    // get the current employee data
    const EmployeecolRef = collection(db, 'Employee Information');

    const RequestcolRef = collection(db, 'Request Information');

    let EmpcustomDocId;;

    FetchCurrentUser().then((currentUserUID) => {

        const que = query(TestcolRef, where("userID", "==", currentUserUID));

        onSnapshot(que, (snapshot) => {
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const id = doc.id;

                const accountDocID = data.documentID;


                fetchEmployeeInfo(EmployeecolRef, accountDocID, "accountID").then((dataRetrieved) => {
                    const data = dataRetrieved;

                    const employeeDocID = data.documentID;

                    leaveSubmitBtn.addEventListener('click', (e) => {
                        if (leave_form) {

                            const leaveFormData = {
                                employeeDocID: employeeDocID,
                                createdAt: serverTimestamp(),
                                RequestType: 'Request Leave',
                                RequestStatus: 'Pending',
                                Request_Details: {

                                }
                            };

                            if (leave_form.leaveTypeSelector.value) {
                                leaveFormData.Request_Details.LeaveType = leave_form.leaveTypeSelector.value;
                            }
                            if (leave_form.otherLeaveReason.value) {
                                leaveFormData.Request_Details.OtherReason = leave_form.otherLeaveReason.value;
                            }
                            if (leave_form.vacationLeave.value) {
                                leaveFormData.Request_Details.VacationLeave = leave_form.vacationLeave.value;
                            }
                            if (leave_form.withinDetails.value) {
                                leaveFormData.Request_Details.VacationPh = leave_form.withinDetails.value;
                            }
                            if (leave_form.abroadDetails.value) {
                                leaveFormData.Request_Details.VacationAbroad = leave_form.abroadDetails.value;
                            }
                            if (leave_form.sickLeave.value) {
                                leaveFormData.Request_Details.SickLeave = leave_form.sickLeave.value;
                            }
                            if (leave_form.inputInHospital.value) {
                                leaveFormData.Request_Details.InHospital = leave_form.inputInHospital.value;
                            }
                            if (leave_form.inputoutPatient.value) {
                                leaveFormData.Request_Details.OutPatient = leave_form.inputoutPatient.value;
                            }
                            if (leave_form.inputSpecialLeaveWomen.value) {
                                leaveFormData.Request_Details.SpecialLeaveWomen = leave_form.inputSpecialLeaveWomen.value;
                            }
                            if (leave_form.studyLeave.value) {
                                leaveFormData.Request_Details.StudyLeave = leave_form.studyLeave.value;
                            }
                            if (leave_form.detailsOfLeave.value) {
                                leaveFormData.Request_Details.DetailsofLeave = leave_form.detailsOfLeave.value;
                            }
                            if (leave_form.startDate.value) {
                                leaveFormData.Request_Details.StartDate = leave_form.startDate.value;
                            }
                            if (leave_form.endDate.value) {
                                leaveFormData.Request_Details.EndDate = leave_form.endDate.value;
                            }

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
                                    // If the user clicks "Confirm"
                                    return addDoc(RequestcolRef, leaveFormData);
                                } else {
                                    // If the user clicks "Cancel", return a resolved promise
                                    return Promise.resolve();
                                }
                            }).then((docRef) => {
                                if (docRef) {
                                    console.log(leaveFormData);
                                    ReturnDocumentID(docRef);
                                    SaveAttachment(docRef);
                                    Swal.fire({
                                        title: 'Request Sent!',
                                        text: 'Please wait for further updates.',
                                        icon: 'success',
                                    });
                                    leave_form.reset();
                                    console.log('Request saved...');
                                }
                            }).catch((error) => {
                                console.error("Error occurred:", error);
                                // You can handle the error here, e.g., show a custom error message to the user
                                Swal.fire({
                                    title: 'Error',
                                    text: 'An error occurred while processing your request. Please try again.',
                                    icon: 'error',
                                });
                            });
                            
                        }
                    })

                })

                // retrieve ng info
            })
        })
    })


}

//window.addEventListener('load', EmployeeRequestForm)


function GetDtr(){

    const dtrSubmitBtn = document.getElementById('dtrSubmitBtn')

    dtrSubmitBtn.addEventListener('click', (e) => {
        const dtrData = getDtrFormValues(); 

        const daysWithTimesBeyond8AM = getDaysWithTimesBeyond8AMOr1PM(dtrData);

        console.log('Days with times beyond 08:00 AM:', daysWithTimesBeyond8AM);

    })
}

window.addEventListener('load', GetDtr)

function getDaysWithTimesBeyond8AMOr1PM(dtrData) {
    // Get the days where at least one time value is beyond 08:00 AM or 01:00 PM
    return dtrData.filter((rowData) => {
        // Assuming that the time values are in HH:mm format
        const amInTime = new Date(`2022-01-01T${rowData.amIn}`);
        const amOutTime = new Date(`2022-01-01T${rowData.amOut}`);
        const pmInTime = new Date(`2022-01-01T${rowData.pmIn}`);
        const pmOutTime = new Date(`2022-01-01T${rowData.pmOut}`);

        // Check if any time value is beyond 08:00 AM or 01:00 PM
        return amInTime > new Date(`2022-01-01T08:00:00`) ||
               amOutTime > new Date(`2022-01-01T08:00:00`) ||
               pmInTime > new Date(`2022-01-01T13:00:00`) ||
               pmOutTime > new Date(`2022-01-01T13:00:00`);
    }).map(rowData => rowData.day); // Extract only the days
}