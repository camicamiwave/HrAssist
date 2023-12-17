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

function addApplicantAdmin() {

    console.log('heheehe')
    const JobcolRef = collection(db, 'Applicant Information');


    let applicantCurrentMaxID;
    let userUID;
    let customDocId;


    FetchApplicantIDData().then((maxID) => {
        applicantCurrentMaxID = maxID
    })

 
    submitApplicationAdmin.addEventListener('click', (e) => {
        
        e.preventDefault();
        const applicantID = applicantCurrentMaxID + 1;

        console.log("hehehehe")

        if(validateForm()){
            const office_Selector = document.getElementById('officeSelector').value

            const applicantJobForm = { 
                ApplicantStatus: "Pending", 
                ApplicationProgess: 1,
                ApplicantID: applicantID, 
                createdAt: serverTimestamp(),
                ApplicantStatus: "Pending", 
                jobDetailsURL: inputJobType.value, 
                Office: office_Selector,
                Personal_Information: {
                    FirstName: inputFirstName.value,
                    MiddleName: inputMiddleName.value,
                    LastName: inputLastName.value,
                    ExName: inputExName.value,
                    Gender: gender.value,
                    CivilStatus: inputState.value,
                    Birthdate: birthday.value,
                    PlaceBirth: inputplacebirth.value,
                    Phone: phone.value,
                    Email: inputemail.value,
                    Address: inputaddress.value, 
                }
            }
    
            Swal.fire({
                title: "Are you sure?",
                text: "Applicant will be saved",
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
                        SaveAttachmentProfile(docRef)
                        SaveAttachment(docRef)
                        customDocId = docRef.id;
                        // Update the document with the custom ID
                        return setDoc(doc(JobcolRef, customDocId), { documentID: customDocId }, { merge: true });
                    }).then(() => { 
                            console.log("Added job details successfully..."); 
                        })
                        .catch(error => console.error('Error adding job details document:', error));
                }
            });
        } else {
            console.log("Error");
        }

       



    })
}

window.addEventListener('load', addApplicantAdmin);


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

function SaveAttachmentProfile(docRef) {
    const storageRef = ref(storage, "Applicant/Profile");
    const RequestcolRef = collection(db, 'Applicant Information');
    const fileInput = document.getElementById('fileInput2');
    const selectedFiles = fileInput.files;
    const firstSelectedFile = selectedFiles[0];  // Access the first file
  
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
    const fileRef = ref(storageRef, uniqueFilename);
  
    let ApplicantProfileURL;  // Declare the variable in a higher scope
  
    const uploadPromise = uploadBytes(fileRef, firstSelectedFile)
      .then((snapshot) => getDownloadURL(fileRef))
      .then((downloadURL) => {
        ApplicantProfileURL = downloadURL;  // Assign the value to the variable
      })
      .then(() => {
        const customDocId = docRef.id;
        // Update the document with the custom ID
        return setDoc(doc(RequestcolRef, customDocId), { ProfilePicURL: ApplicantProfileURL }, { merge: true });
      });
  }
  
  


  function SaveAttachment(docRef) {
    const storageRef = ref(storage, "Applicant/Profile");
    const RequestcolRef = collection(db, 'Applicant Information');
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = fileInput.files;
    const firstSelectedFile = selectedFiles[0];  // Access the first file
  
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
    const fileRef = ref(storageRef, uniqueFilename);
  
    let ApplicantProfileURL;  // Declare the variable in a higher scope
  
    const uploadPromise = uploadBytes(fileRef, firstSelectedFile)
      .then((snapshot) => getDownloadURL(fileRef))
      .then((downloadURL) => {
        ApplicantProfileURL = downloadURL;  // Assign the value to the variable
      })
      .then(() => {
        const customDocId = docRef.id;
        // Update the document with the custom ID
        return setDoc(doc(RequestcolRef, customDocId), { CVURL: ApplicantProfileURL }, { merge: true });
      });
  }

  function validateForm() {


    var FirstNameInput = document.getElementById('inputFirstName');
    var MiddleInput = document.getElementById('inputMiddleName');
    var LastNameInput = document.getElementById('inputLastName');
    //var womenCheckBox = document.getElementById('inputExName');
    var GenderInput = document.getElementById('gender');
    var StateInput = document.getElementById('inputState');
    var BirthdayInput = document.getElementById('birthday');
    var BirthPlaceInput = document.getElementById('inputplacebirth');
    var EmailInput = document.getElementById('inputemail');
    var AddressInput = document.getElementById('inputaddress');
    var JobTypeInput = document.getElementById('inputJobType'); 
    var OfficeInput = document.getElementById('officeSelector');
       if (
        FirstNameInput.value.trim() === '' ||
        MiddleInput.value.trim() === '' ||
        LastNameInput.value.trim() === '' ||
        GenderInput.value.trim() === '' ||
        StateInput.value.trim() === '' ||
        BirthPlaceInput.value.trim() === '' ||
        BirthdayInput.value.trim() === '' ||
        EmailInput.value.trim() === '' ||
        AddressInput.value.trim() === '' ||
        JobTypeInput.value.trim() === '' ||
        OfficeInput.value.trim() === '' 
     ) {
       //alert('Please fill in all required fields.');
       console.log('Please fill in all required fields.');
       Swal.fire({
           title: 'Error',
           text: 'Please fill in all required fields.',
           icon: 'error',
       });
       return false;
     }

     if(!isValidString(FirstNameInput.value)){
        console.log('Please input proper name');
        Swal.fire({
            title: 'Error',
            text: 'Please input proper name',
            icon: 'error',
        });
        return false;
     }

     if(!isValidString(MiddleInput.value)){
        console.log('Please input proper Middle Name');
        Swal.fire({
            title: 'Error',
            text: 'Please input proper Middle Name',
            icon: 'error',
        });
        return false;
     }

     if(!isValidString(LastNameInput.value)){
        console.log('Please input proper Last Name');
        Swal.fire({
            title: 'Error',
            text: 'Please input proper Last Name',
            icon: 'error',
        });
        return false;
     }

     if(!isValidString(StateInput.value)){
        console.log('Please input proper Civil Status');
        Swal.fire({
            title: 'Error',
            text: 'Please input proper Civil Status',
            icon: 'error',
        });
        return false;
     }


     if(!isValidString(JobTypeInput.value)){
        console.log('Please input proper Job Type');
        Swal.fire({
            title: 'Error',
            text: 'Please input proper Job Type',
            icon: 'error',
        });
        return false;
     }
    

   

     return true;
 }


 function isValidString(value) {

     return /^[a-zA-Z\s]*$/.test(value.trim());
 }


  
  

