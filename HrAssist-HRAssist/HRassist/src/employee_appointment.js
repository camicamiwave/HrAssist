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


export function AddEmployeeAppointment(querySelctorID, employeeData, currentDocumentID) {

    console.log(querySelctorID, employeeData, currentDocumentID)
    const TestcolRef = collection(db, 'User Account');
    const EmployeecolRef = collection(db, 'Employee Information');
    //const addDataSheetForm = document.querySelector(querySelctorID);
  
    FetchCurrentUser().then((current) => {
      console.log(current, 'current user');
      const que = query(TestcolRef, where("userID", "==", current.uid));
  
      onSnapshot(que, (snapshot) => {
        snapshot.docs.forEach((docData) => {
          const data = docData.data();
  
          if (data.UserLevel === "Admin") {
            Swal.fire({
              title: "Are you sure?",
              text: "Employee's personal information will be saved",
              icon: "question",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Confirm"
            }).then((result) => {
              if (result.isConfirmed) {
                const employeeDocRef = doc(EmployeecolRef, currentDocumentID);
                return setDoc(employeeDocRef, employeeData, { merge: true })
                  .then(() => {
                    Swal.fire({
                      title: "Saved!",
                      text: "Your employee added successfully...",
                      icon: "success"
                    }).then(() => {
                      //addDataSheetForm.reset();
                      console.log("Added employee successfully...");
                      //window.location.href = `Education-21Files.html?data=${encodeURIComponent(currentDocumentID)}`;
                      console.log("Hello")
  
                      if (querySelctorID === "#employeeDataSheet") {
                        window.location.href = `Education-21Files.html?data=${encodeURIComponent(currentDocumentID)}`;
                      } else if (querySelctorID === "#EducationForm") {
                        window.location.href = `OtherInfo-201file.html?data=${encodeURIComponent(currentDocumentID)}`;
                      } else if (querySelctorID === "#fileForm") {
                        window.location.href = `Files.html?data=${encodeURIComponent(currentDocumentID)}`;
                      } else if (querySelctorID === "#signatureForm") {
                        window.location.href = `Files.html?data=${encodeURIComponent(currentDocumentID)}`;
                      }
                    });
                  })
                  .catch(error => console.error('Error adding employee document:', error));
              }
            });
          } else {
            console.log("Only admin can add data...");
          }
        });
      });
    })
  
  }
  