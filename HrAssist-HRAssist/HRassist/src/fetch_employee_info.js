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

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');

export function fetchEmployeeInfo(collectionReference, recievedDocumentID, nameOfData) {
  return new Promise((resolve) => {
    const Employeeque = query(collectionReference, where(nameOfData, "==", recievedDocumentID));

    
    onSnapshot(Employeeque, (snapshot) => {
      if (snapshot.empty) {
        // No documents matched the query
        resolve('None');
        // Handle the case when there are no matching documents
      } else {
        // Documents matched the query
        snapshot.docs.forEach((accountdocData) => {
          const data = accountdocData.data();
          resolve(data);
        });
      }
    });


    /*
    // for retrieving the current user
    onSnapshot(Employeeque, (snapshot) => {
      snapshot.docs.forEach((accountdocData) => {
        const data = accountdocData.data();
        resolve(data);

      })
    })*/
  });
}


export function fetchProfileData(){
    const File201ColRef = collection(db, '201File Information');
    const EmployeeColRef = collection(db, 'Employee Information');
    const UserAccountColRef = collection(db, 'User Account');

    let data; 

    try {
      fetchEmployeeInfo(EmployeeColRef, receivedStringData, "documentID").then((dataRetrieved) => {
        
        data = dataRetrieved;
        
          if (data){ 
            
            if (data.ProfilePictureURL){
              applicantProfilePic.src = data.ProfilePictureURL
            } 
            
            console.log(data.Personal_Information.FirstName)
            const fullName = `${data.Personal_Information.FirstName} ${data.Personal_Information.MiddleName} ${data.Personal_Information.SurName}`
            profile_name_id.innerHTML = fullName
            
          } else {

          }
        
          /*
          const accountDocumentID = data.accountID;

          fetchEmployeeInfo(UserAccountColRef, accountDocumentID, "documentID").then((accountdataRetrieved) => {          
            const accountdata = accountdataRetrieved 
                account_status_label.innerHTML = accountdata.AccountStatus;
          })*/
          
      })
    } catch {
      console.log("No records found...")
    }
    
    try {
        fetchEmployeeInfo(File201ColRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
            data = dataRetrieved;        
            jobPositionTitle.innerHTML = data.Appointment_Details.PositionTitle
        })
      } catch {
        console.log("No records found...")
      }
  }
  
  
window.addEventListener('load', fetchProfileData)
  