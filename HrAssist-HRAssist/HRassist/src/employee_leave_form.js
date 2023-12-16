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


export function FetchCurrentUser() {
    return new Promise((resolve, reject) => {
        // Listen for changes in authentication state
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                const currentUserID = user.uid;
                //console.log("Current User UID:", currentUserID);
                resolve(currentUserID);
            } else {
                // No user is signed in
                console.log("No user is signed in.");
                resolve("None");
            }
        });
    });
}


export function EmployeeRequestForm() {
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
                    console.log(data.Personal_Information.Gender, 'asfsaf')

                    if (data.Personal_Information.Gender === "Male"){
                        hideMaternityLeaveOption()
                        hideVAWCLeaveOption()
                        hideSLFWOption()

                    }else if (data.Personal_Information.Gender === "Female") {
                        hidePaternityLeaveOption()
                    }

                    
                    leaveSubmitBtn.addEventListener('click', (e) => {

                        if (validateForm()) {

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

                    } else {
                        console.log('Form is not valid. Please correct errors.');
                    }
                    })

                })

                // retrieve ng info
            })
        })
    })


}

window.addEventListener('load', EmployeeRequestForm)


function SaveAttachment(docRef) {
    const storageRef = ref(storage, "Employee Request/Leave Form");
    const RequestcolRef = collection(db, 'Request Information');

    // Access the file input field
    const fileInput = document.getElementById('inputAttachment');
    const selectedFiles = fileInput.files;

    // Create an array to store download URLs
    const downloadURLs = [];

    // Loop through each selected file
    const uploadPromises = Array.from(selectedFiles).map((file) => {
        // Generate a unique filename using timestamp
        const timestamp = new Date().getTime();
        const uniqueFilename = `${timestamp}_${file.name}`;
        const fileRef = ref(storageRef, uniqueFilename);

        // Upload the file to Firebase Storage
        return uploadBytes(fileRef, file)
            .then((snapshot) => getDownloadURL(fileRef))
            .then((downloadURL) => {
                downloadURLs.push(downloadURL);
            });
    });

    // Wait for all uploads to complete
    Promise.all(uploadPromises)
        .then(() => {
            // All files are uploaded, and their URLs are in the downloadURLs array
            console.log(downloadURLs);
            
            const EmpcustomDocId = docRef.id;
            return setDoc(doc(RequestcolRef, EmpcustomDocId), { AttachmentsURL: downloadURLs }, { merge: true });

        })
        .catch((error) => {
            // Handle errors, if any
            console.error("Error uploading files:", error);
        });
}


function ReturnDocumentID(docRef) {
    const RequestcolRef = collection(db, 'Request Information');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(RequestcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}

function validateForm() {

    var leaveoption = document.getElementById('leaveTypeSelector');
    var vacationCheckBox = document.getElementById('specifyVacationCheckbox');
    var sickCheckBox = document.getElementById('specifySickCheckbox');
    var womenCheckBox = document.getElementById('specifyWomenCheckbox');
    var studyCheckBox = document.getElementById('specifyStudyCheckbox');
    var inclusives = document.getElementById('inclusiveDates');
    var attachments = document.getElementById('inputAttachment');
    var withinDetailsInput = document.getElementById('withinDetails');
    var abroadDetailsInput = document.getElementById('abroadDetails');
    var inHospitalInput = document.getElementById('inputInHospital');
    var outPatientInput = document.getElementById('inputoutPatient'); 
    var SpecialleavewomenInput = document.getElementById('inputSpecialLeaveWomen');



   
    if (leaveoption.value === '--- Select ---') {
        console.log('Please select a leave option!');
        Swal.fire({
            title: 'Error',
            text: 'Please select a leave option',
            icon: 'error',
        });
        return false;
    }

    if (inclusives.value === 'dd/mm/yyyy') {
        console.log('Please enter inclusive dates');
        Swal.fire({
            title: 'Error',
            text: 'Please enter inclusive dates',
            icon: 'error',
        });
        return false;
    }



    if (!isValidString(withinDetailsInput.value)) {
        console.log('Please enter a valid input!');
        Swal.fire({
            title: 'Error',
            text: 'Please enter a valid input',
            icon: 'error',
        });
        return false;
    }


    if (!isValidString(abroadDetailsInput.value)) {
        console.log('Please enter a valid input!');
        Swal.fire({
            title: 'Error',
            text: 'Please enter a valid input',
            icon: 'error',
        });
        return false;
    }

    if (!isValidString(inHospitalInput.value)) {
        console.log('Please enter a valid input!');
        Swal.fire({
            title: 'Error',
            text: 'Please enter a valid input',
            icon: 'error',
        });
        return false;
    }

    if (!isValidString(outPatientInput.value)) {
        console.log('Please enter a valid input!');
        Swal.fire({
            title: 'Error',
            text: 'Please enter a valid input',
            icon: 'error',
        });
        return false;
    }
    
    if (!isValidString(SpecialleavewomenInput.value)) {
        console.log('Please enter a valid input!');
        Swal.fire({
            title: 'Error',
            text: 'Please enter a valid input',
            icon: 'error',
        });
        return false;
    }

    if (!isValidFileType(attachments)) {
        console.log('Please enter a valid input!');
        Swal.fire({
            title: 'Error',
            text: 'Please upload a valid file (PDF, DOC/DOCX, PNG, or JPEG).',
            icon: 'error',
        });
        return false;
    }

    return true;
}


function isValidString(value) {

    return /^[a-zA-Z\s]*$/.test(value.trim());
}

function isEmpty(value) {

    return value && value.trim() === '';
}

function isValidFileType(fileInput) {
    var fileName = fileInput.value;
    var fileExtension = fileName.split('.').pop().toLowerCase();
    var allowedExtensions = ['pdf', 'doc', 'docx', 'png', 'jpeg', 'jpg'];
    return allowedExtensions.includes(fileExtension);
}

function hideMaternityLeaveOption() {
    const maternityLeaveOption = document.querySelector('select#leaveTypeSelector option[value="Maternity Leave"]');
    if (maternityLeaveOption) {
        maternityLeaveOption.style.display = 'none';
    }
}

function hideVAWCLeaveOption() {
    const vawcLeaveOption = document.querySelector('select#leaveTypeSelector option[value="10-Day VAWC Leave"]');
    if (vawcLeaveOption) {
        vawcLeaveOption.style.display = 'none';
    }
}

function hideSLFWOption() {
    const SLFWOption = document.querySelector('select#leaveTypeSelector option[value="Special Leave Benefits for Women"]');
    if (SLFWOption) {
        SLFWOption.style.display = 'none';
    }
}

function hidePaternityLeaveOption() {
    const PaternityOption = document.querySelector('select#leaveTypeSelector option[value="Paternity Leave"]');
    if (PaternityOption) {
        PaternityOption.style.display = 'none';
    }
}
