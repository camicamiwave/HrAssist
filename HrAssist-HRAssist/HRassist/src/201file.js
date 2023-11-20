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

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);

function Employee201Navigator(customDocId) {
    const AccountBtn = document.getElementById('AccountBtn');
    const PersonalInfoBtn = document.getElementById('PersonalInfoBtn');
    const AppointmentBtn = document.getElementById('AppointmentBtn');
    const AttachmentBtn = document.getElementById('AttachmentBtn');
    const LeaveCreditBtn = document.getElementById('LeaveCreditBtn');
  
    AccountBtn.addEventListener('click', (e) => {
      e.preventDefault();
      confirmAction("AccountBtn", customDocId)
    })
  
    PersonalInfoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      confirmAction("PersonalInfoBtn", customDocId)
    })
  
    AppointmentBtn.addEventListener('click', (e) => {
      e.preventDefault();
      confirmAction("AppointmentBtn", customDocId)
    })
  
    AttachmentBtn.addEventListener('click', (e) => {
      e.preventDefault();
      confirmAction("AttachmentBtn", customDocId)
    })
  
    LeaveCreditBtn.addEventListener('click', (e) => {
      e.preventDefault();
      confirmAction("LeaveCreditBtn", customDocId)
    })
  }
  
  
  
  // method for checking if the user wants to go to other pages
  function confirmAction(category, documentID) {
    Swal.fire({
      title: "Are you sure?",
      text: `Your changes will be lost. Do you want to proceed?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, proceed!"
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to the corresponding page based on the clicked link
        switch (category) {
          case 'AccountBtn':
            //window.location.href = "datasheet.html";
            window.location.href = `201file_account.html?data=${encodeURIComponent(documentID)}`;
            break;
          case 'PersonalInfoBtn':
            window.location.href = `datasheet.html?data=${encodeURIComponent(documentID)}`;
            break;
          case 'AppointmentBtn':
            //window.location.href = "OtherInfo-201file.html";
            window.location.href = `201file_appointment.html?data=${encodeURIComponent(documentID)}`;
            break;
          case 'AttachmentBtn':
            //window.location.href = "signature-201file.html";
            window.location.href = `201file_attachments.html?data=${encodeURIComponent(documentID)}`;
            break;
          case 'LeaveCreditBtn':
            //window.location.href = "signature-201file.html";
            window.location.href = `201file_leave.html?data=${encodeURIComponent(documentID)}`;
            break;
          default:
            break;
        }
      }
    });
  }
  

  export function Employee201Buttons() {
    try{
      const urlParams = new URLSearchParams(window.location.search);
      const receivedStringData = urlParams.get('data');
    
      // Trigger to send document id when it was called
      Employee201Navigator(receivedStringData);
    
      const addDataSheetForm = document.querySelector("#EducationForm");
    
      addDataSheetForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const employeeData = {
          Education_Details: {
            Elementary: {
              ElementarySchool: addDataSheetForm.elemSchoolName.value.trim(),
              ElementaryGrade: addDataSheetForm.elemGrade.value.trim(),
              ElementaryFrom: addDataSheetForm.elemFrom.value.trim(),
              ElementaryTo: addDataSheetForm.elemTo.value.trim(),
              ElementaryLevel: addDataSheetForm.elemHighestLevel.value.trim(),
              ElementaryScholarship: addDataSheetForm.elemScholarship.value.trim(),
            },
            Secondary: {
              SecondarySchool: addDataSheetForm.secondSchoolName.value.trim(),
              SecondaryGrade: addDataSheetForm.secondGrade.value.trim(),
              SecondaryFrom: addDataSheetForm.secondFrom.value.trim(),
              SecondaryTo: addDataSheetForm.secondTo.value.trim(),
              SecondaryLevel: addDataSheetForm.secondHighestLevel.value.trim(),
              SecondaryScholarship: addDataSheetForm.secondScholarship.value.trim(),
            },
            Vocational: {
              VocationalSchool: addDataSheetForm.vocationalSchoolName.value.trim(),
              VocationalGrade: addDataSheetForm.vocationalGrade.value.trim(),
              VocationalFrom: addDataSheetForm.vocationalFrom.value.trim(),
              VocationalTo: addDataSheetForm.vocationalTo.value.trim(),
              VocationalLevel: addDataSheetForm.vocationalHighestLevel.value.trim(),
              VocationalScholarship: addDataSheetForm.vocationalScholarship.value.trim(),
            },
            College: {
              CollegeSchool: addDataSheetForm.collegeSchoolName.value.trim(),
              CollegeGrade: addDataSheetForm.collegeGrade.value.trim(),
              CollegeFrom: addDataSheetForm.collegeFrom.value.trim(),
              CollegeTo: addDataSheetForm.collegeTo.value.trim(),
              CollegeLevel: addDataSheetForm.collegeHighestLevel.value.trim(),
              CollegeScholarship: addDataSheetForm.collegeScholarship.value.trim(),
            },
            Graduate: {
              GraduateSchool: addDataSheetForm.graduateSchoolName.value.trim(),
              GraduateGrade: addDataSheetForm.graduateGrade.value.trim(),
              GraduateFrom: addDataSheetForm.graduateFrom.value.trim(),
              GraduateTo: addDataSheetForm.graduateTo.value.trim(),
              GraduateLevel: addDataSheetForm.graduateHighestLevel.value.trim(),
              GraduateScholarship: addDataSheetForm.graduateScholarship.value.trim(),
            }
          }
        };
    
        // Saving to firestore
        AddEmployeeDataFirestore('#EducationForm', employeeData, receivedStringData)
      })
    } catch {
      console.log("Not Education form")
  
    }
  
  
  
  }
  Employee201Navigator("")