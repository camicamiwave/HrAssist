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
import { FetchCurrentUser } from './fetch_current_user.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const auth = getAuth();

const storage = getStorage(app);


function AddApplicantForm() {

    // Get the query string from the URL
    const queryString = window.location.search;

    // Create a URLSearchParams object from the query string
    const urlParams = new URLSearchParams(queryString);
    // Get the values of the customDocId and id parameters
    const jobDetailsURL = urlParams.get('id');


    console.log(jobDetailsURL, 'hello')

    const JobcolRef = collection(db, 'Applicant Information');

    let customDocId;

    const btnId = document.getElementById("inputJobSubmit")

    const addApplicantForm = document.querySelector("#applicant_info_form_admin")

    let applicantCurrentMaxID;
    let userUID;

    FetchCurrentUser().then((currentUserUID) => {
        userUID = currentUserUID;

        const que = query(TestcolRef, where("userID", "==", userUID));
    })

    FetchApplicantIDData().then((maxID) => {
        applicantCurrentMaxID = maxID
    })

    addApplicantForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const applicantID = applicantCurrentMaxID + 1;

        const applicantJobForm = {
            ApplicantStatus: "Pending",
            ApplicationProgess: 1,
            ApplicantID: applicantID,
            createdAt: serverTimestamp(),
            ApplicantStatus: "Pending",
            userID: userUID,
            jobDetailsURL: jobDetailsURL,
            ApplicantID: applicantID,
            Personal_Information: {
                FirstName: addApplicantForm.inputFirstName.value,
                MiddleName: addApplicantForm.inputMiddleName.value,
                LastName: addApplicantForm.inputLastName.value,
                ExName: addApplicantForm.inputExName.value,
                Gender: addApplicantForm.gender.value,
                CivilStatus: addApplicantForm.inputState.value,
                Birthdate: addApplicantForm.birthday.value,
                PlaceBirth: addApplicantForm.inputplacebirth.value,
                Phone: addApplicantForm.phone.value,
                Email: addApplicantForm.inputemail.value,
                Address: addApplicantForm.inputaddress.value,
                Message: addApplicantForm.message.value
            }
        }

        Swal.fire({
            title: "Are you sure?",
            text: "Job details will be saved",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirm"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Saved!",
                    text: "Your job details added successfully...",
                    icon: "success"
                }).then(() => {
                    // Add data to Firestore
                    return addDoc(JobcolRef, applicantJobForm);
                }).then((docRef) => {
                    customDocId = docRef.id;
                    // Update the document with the custom ID
                    return setDoc(doc(JobcolRef, customDocId), { documentID: customDocId }, { merge: true });
                }).then(() => {
                    const storageRef = ref(storage, "Applicant/Profile");

                    // Access the file input field
                    const fileInput = document.getElementById('applicantPic');
                    const selectedFiles = fileInput.files;
                    const firstSelectedFile = selectedFiles[0];  // Access the first file

                    // Generate a unique filename using timestamp
                    const timestamp = new Date().getTime();
                    const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
                    const fileRef = ref(storageRef, uniqueFilename);

                    // Upload the file to Firebase Storage
                    return uploadBytes(fileRef, firstSelectedFile);
                }).then((snapshot) => {
                    // File upload completed successfully
                    const fileRef = snapshot.ref;

                    // Get the download URL
                    return getDownloadURL(fileRef);
                }).then((downloadURL) => {
                    // Update Firestore document with the download URL
                    console.log(downloadURL);
                    return setDoc(doc(JobcolRef, customDocId), { ProfilePicURL: downloadURL }, { merge: true });
                }).then(() => {
                    const storageRef = ref(storage, "Applicant/Profile");

                    // Access the file input field
                    const fileInput = document.getElementById('cvFile');
                    const selectedFiles = fileInput.files;
                    const firstSelectedFile = selectedFiles[0];  // Access the first file

                    // Generate a unique filename using timestamp
                    const timestamp = new Date().getTime();
                    const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
                    const fileRef = ref(storageRef, uniqueFilename);

                    // Upload the file to Firebase Storage
                    return uploadBytes(fileRef, firstSelectedFile);
                }).then((snapshot) => {
                    // File upload completed successfully
                    const fileRef = snapshot.ref;

                    // Get the download URL
                    return getDownloadURL(fileRef);
                }).then((downloadURL) => {
                    // Update Firestore document with the download URL
                    console.log(downloadURL);
                    return setDoc(doc(JobcolRef, customDocId), { CVURL: downloadURL }, { merge: true });
                })

                    .catch((error) => {
                        // Handle any errors that occurred during the process
                        console.error("Error:", error);
                    })
                    .then(() => {
                        console.log("hereee: ", customDocId)
                        // Reset the form
                        //addDataSheetForm.reset();
                        console.log("Added job details successfully...");
                        //window.location.href = 'Education-21Files.html';
                        //window.location.href = `applicant-congrats.html`;
                        window.location.href = `applicant-congrats.html?customDocId=${encodeURIComponent(customDocId)}`;
                    })
                    .catch(error => console.error('Error adding job details document:', error));
            }
        });



    })

}

window.addEventListener('load', AddApplicantForm)


export function FetchApplicantIDData() {
    return new Promise((resolve, reject) => {
        const TestcolRef = collection(db, 'Applicant Information');
        const querySnapshot = query(TestcolRef);

        onSnapshot(querySnapshot, (snapshot) => {
            let maxApplicantIDNum = 0;

            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const applicantIDNum = data.ApplicantID;

                if (applicantIDNum > maxApplicantIDNum) {
                    maxApplicantIDNum = applicantIDNum;
                }
            });

            resolve(maxApplicantIDNum);
        });
    });
}



function officeSelector() {
    const OfficecolRef = collection(db, 'Office Information');
    const que = query(OfficecolRef, orderBy('createdAt'));

    const inputOffice = document.getElementById('officeSelector');
    inputOffice.innerHTML = '<option>Select</option>';

    onSnapshot(que, (snapshot) => {
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            // Create an option element for each OfficeName and append it to the selector
            const optionElement = document.createElement('option');
            optionElement.value = data.OfficeName;
            optionElement.textContent = data.OfficeName;
            inputOffice.appendChild(optionElement);
        });
    });
}

window.addEventListener('load', officeSelector);

