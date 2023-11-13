import { initializeApp } from 'firebase/app'
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, updateProfile
} from "firebase/auth";
import { 
    getFirestore, collection, onSnapshot, 
    addDoc, deleteDoc, doc,
    query, where,
    orderBy, serverTimestamp,
    getDoc, updateDoc
 } from 'firebase/firestore'

import {firebaseConfig} from './server.js';


// init firebase app
initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

function GetApplicantTable() {
    // Assuming you have Firestore data in the 'employees' array
    const employeeTable = document.getElementById('applicantTable');
    const tbody = employeeTable.querySelector('tbody');

    onSnapshot(q, (snapshot) => {
      // Clear the existing rows in the table body
      tbody.innerHTML = '';

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        const row = document.createElement('tr');

        const personal_info = data.Personal_Information;
        const ApplicantFullName = personal_info.FirstName + " " + personal_info.LastName;
        
        const createdAt = data.createdAt.toDate(); // Assuming createdAt is a timestamp
        // Extracting date only from createdAt
        const dateString = createdAt.toLocaleDateString();

        /*
        // Create and populate table cells
        // Create an image element
        const imageElement = document.createElement('img');

        // Set the src attribute to the image URL
        imageElement.src = "https://firebasestorage.googleapis.com/v0/b/hrassist-lgusanvicente.appspot.com/o/Applicant%2FRequirements%2F1699720150322_bcert.png?alt=media&token=31d4f8c5-a4f2-4070-b104-624f27975f63";
        // Append the image element to the table cell
        const profileCell = document.createElement('td');
        profileCell.appendChild(imageElement);*/

        const idCell = document.createElement('td');
        idCell.textContent = id;

        const nameCell = document.createElement('td');
        nameCell.textContent = ApplicantFullName;

        const jobApplicationDateCell = document.createElement('td');
        jobApplicationDateCell.textContent = dateString;

        const applicantStatusCell = document.createElement('td');
        applicantStatusCell.textContent = data.ApplicantStatus;

        // Add button
        // Create a button element for actions and add it to the row
        const actionCell = document.createElement('td');
        const actionButtonEdit = document.createElement('button');
        //actionButtonEdit.textContent = 'Edit'; // Customize the button label
        actionButtonEdit.classList.add('btn', 'bx', 'bx-edit', 'mx-2'); // You can use Bootstrap's 'btn' and 'btn-primary' classes

        actionButtonEdit.addEventListener('click', () => {
          // Define an action for the Edit button (e.g., edit the record)
          // You can add your specific logic here
          console.log('Edit button clicked for record with ID:', id);
        });

        const actionButtonDelete = document.createElement('button');
        //actionButtonDelete.textContent = 'Delete'; // Customize the button label
        actionButtonDelete.classList.add('btn', 'bx', 'bx-trash'); // You can use Bootstrap's 'btn' and 'btn-danger' classes

        actionButtonDelete.addEventListener('click', () => {
          
          console.log('Delete button clicked for record with ID:', id);

        });
        
        actionCell.appendChild(actionButtonEdit);
        actionCell.appendChild(actionButtonDelete);

        // Add a click event listener to the row
        row.addEventListener('click', () => {
            console.log('Row ID clicked:', id);
        });

        // Append cells to the row 
        //row.appendChild(profileCell); 
        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(jobApplicationDateCell);
        row.appendChild(applicantStatusCell);
        row.appendChild(actionCell);

        // Append the row to the table body
        tbody.appendChild(row);
      });
    });
  }


window.addEventListener('load', GetApplicantTable);

export function FetchCurrentUser() {
  return new Promise((resolve, reject) => {
    // Listen for changes in authentication state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Hello1");
        
        // User is signed in
        const currentUserID = user.uid;
        console.log("Current User UID:", currentUserID);
        resolve(currentUserID);
      } else {
        // No user is signed in
        console.log("No user is signed in.");
        resolve("None");
      }
    });
  });
}

export function FetchApplicantProfile() {
  const TestcolRef = collection(db, 'Applicant Information');

  FetchCurrentUser().then((currentUserUID) => { 
    const que = query(TestcolRef, where("userID", "==", currentUserUID)); 

    onSnapshot(que, (snapshot) => { 
      snapshot.docs.forEach((doc) => {
        const data = doc.data(); 
        const id = doc.id;

        const personalInfo = data.Personal_Information;
        const fullName = personalInfo.FirstName + " " + personalInfo.LastName
        
        const applicantProfile = document.getElementById('applicantProfilePic');
        const newProfilePicUrl = data.ApplicantProfilePicture;

        // Change the src attribute
        applicantProfile.src = newProfilePicUrl;

        console.log(newProfilePicUrl, 'eto na');

        const applicantName = document.getElementById('applicantName');
        applicantName.innerHTML = fullName;

        const firstName = document.getElementById('inputFirstName');
        firstName.value = personalInfo.FirstName;

        const lastName = document.getElementById('inputLastName');
        lastName.value = personalInfo.LastName;

        const sex = document.getElementById('inputSex');
        sex.value = personalInfo.Sex;
        
        const birthPlace = document.getElementById('inputBplace');
        birthPlace.value = personalInfo.Placebirth;
        
        const emailAddress = document.getElementById('inputEmailAddress');
        emailAddress.value = personalInfo.Email;
        
        const phoneNum = document.getElementById('inputPhone');
        phoneNum.value = personalInfo.Phone;
        
        const birthday = document.getElementById('inputEmail');
        birthday.value = personalInfo.Email;
        

      });

    });
  });
}

window.addEventListener('load', FetchApplicantProfile);