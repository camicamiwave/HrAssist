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


// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore();
 

const auth = getAuth();

const storage = getStorage(app);
 


function fetchOfficeDesignation() {
    const OfficecolRef = collection(db, 'Office Information');
    const que = query(OfficecolRef, orderBy('createdAt'));
  
    const inputOffice = document.getElementById('participants');
    inputOffice.innerHTML = '<option>Select</option>';
    inputOffice.innerHTML = '<option value="All">All</option>';
   
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
  
  window.addEventListener('load', fetchOfficeDesignation);
  
  

function AddTrainings() {
    const CalendarcolRef = collection(db, 'Calendar Information');
    document.getElementById('trainingSubmitBtn').addEventListener('click', () => {

        if (validateForm()){

            const leaveFormData = {
                createdAt: serverTimestamp(),
                EventType: "Training",
                eventPurpose: document.getElementById('title').value.trim(),
                TrainingDetails: {
                    MemoNun: document.getElementById('memoNum').value.trim(),
                    Title: document.getElementById('title').value.trim(),
                    Description: document.getElementById('description').value.trim(),
                    Organizer: document.getElementById('hostDepartment').value.trim(),
                    Participants: document.getElementById('participants').value.trim(),
                    StartDate: document.getElementById('startDate').value.trim(),
                    EndDate: document.getElementById('endDate').value.trim(),
                    Purpose: document.getElementById('purpose').value.trim(),
                },
                formData: {
                    participants: document.getElementById('participants').value.trim(),
                    title: document.getElementById('title').value.trim(),
                    start: document.getElementById('startDate').value.trim(),
                    end: document.getElementById('endDate').value.trim(),
                    color: "#89CFF0"
                },
                TrainingStatus: 'Active'
            };
    
    
            Swal.fire({
                title: 'Are you sure?',
                text: 'Trainings will be recorded.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Confirm'
            }).then((result) => {
                if (result.isConfirmed) {
                    return addDoc(CalendarcolRef, leaveFormData);
                } else {
                    return Promise.reject(new Error('User canceled'));
                }
            }).then((docRef) => {
                ReturnDocumentID(docRef)
                SaveAttachment(docRef)
    
                Swal.fire({
                    title: 'Training Added!',
                    text: 'Your training has been saved.',
                    icon: 'success',
                })
                    .then(() => {
                        const calendarForm = document.querySelector('#trainingForm')
                        calendarForm.reset()
                        // Redirect to the dashboard page
                        window.location.href = `admin_training_content.html?data=${encodeURIComponent(docRef.id)}`;
                    });
            }).catch((error) => {
                if (error.message !== 'User canceled') {
                    console.error('Error occurred:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'An error occurred while processing your request. Please try again.',
                        icon: 'error',
                    });
                }
            });
        } else {
            console.log("Error");
        }

       
    });
}



function ReturnDocumentID(docRef) {
    const RequestcolRef = collection(db, 'Calendar Information');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(RequestcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}


window.addEventListener('load', AddTrainings);




function SaveAttachment(docRef) {
    const storageRef = ref(storage, "Training/Attachments");
    const RequestcolRef = collection(db, 'Calendar Information');

    // Access the file input field
    //const fileInput = document.getElementById('inputAttachment');
    //const selectedFiles = fileInput.files;

    const selectedFiles = AttachmentFiles

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

function validateForm() {

    var MemoInput = document.getElementById('memoNum');
    var TitleInput = document.getElementById('title');
    var DescriptionInput = document.getElementById('description');
    var SponsoredInput = document.getElementById('hostDepartment');

    var StartDateInput = document.getElementById('startDate');
    var EndDateInput = document.getElementById('endDate');
    var PurposeInput = document.getElementById('purpose');


    if (
        MemoInput.value.trim() === '' ||
        TitleInput.value.trim() === '' ||
        DescriptionInput.value.trim() === '' ||
        StartDateInput.value.trim() === '' ||
        EndDateInput.value.trim() === '' ||
        SponsoredInput.value.trim() === '' ||
        PurposeInput.value.trim() === '' 
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

    if (!isValidNumber(MemoInput.value) || parseInt(MemoInput.value) < 0) {
    console.log('Please enter a non-negative value for Memo Input.');
    Swal.fire({
        title: 'Error',
        text: 'Please enter a non-negative value for Memo Input.',
        icon: 'error',
    });
    return false;
    }
    
    if (!isValidString(TitleInput.value)){
        console.log('Please correct your input in Title Input.');
        Swal.fire({
            title: 'Error',
            text: 'Please correct your input in Title Input.',
            icon: 'error',
        });
        return false;

    }

    if (!isValidString(DescriptionInput.value)){
        console.log('Please correct your input in Description Input.');
        Swal.fire({
            title: 'Error',
            text: 'Please correct your input in Description Input.',
            icon: 'error',
        });
        return false;

    }

    if (!isValidString(SponsoredInput.value)){
        console.log('Please correct your input in Sponsor Input.');
        Swal.fire({
            title: 'Error',
            text: 'Please correct your input in Sponsor Input.',
            icon: 'error',
        });
        return false;

    }

    if (!isValidString(PurposeInput.value)){
        console.log('Please correct your input in Purpose Input.');
        Swal.fire({
            title: 'Error',
            text: 'Please correct your input in Purpose Input.',
            icon: 'error',
        });
        return false;

    }
   
   
     
   
       return true;
     
     
   }
   
   
   function isValidString(value) {
   
     return /^[a-zA-Z\s]*$/.test(value.trim());
   }
   
   function isValidNumber(value) {
   
     return /^[0-9]+$/.test(value.trim());
   }
   



