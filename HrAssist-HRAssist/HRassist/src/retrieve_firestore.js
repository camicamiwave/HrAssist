import { initializeApp } from 'firebase/app'
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

const colRef = collection(db, 'Employee')

const q = query(colRef, orderBy('createdAt'))


function GetEmployeeTable() {
    // Assuming you have Firestore data in the 'employees' array
    const employeeTable = document.getElementById('employeeTable');
    const tbody = employeeTable.querySelector('tbody');

    onSnapshot(q, (snapshot) => {
      // Clear the existing rows in the table body
      tbody.innerHTML = '';

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        const row = document.createElement('tr');

        // Create and populate table cells
        const idCell = document.createElement('td');
        idCell.textContent = data.idnum;

        const firstNameCell = document.createElement('td');
        firstNameCell.textContent = data.fname;

        const lastNameCell = document.createElement('td');
        lastNameCell.textContent = data.lname;

        const phoneCell = document.createElement('td');
        phoneCell.textContent = data.phonenum;

        // Create a button element for actions and add it to the row
        const actionCell = document.createElement('td');
        const actionButtonEdit = document.createElement('button');
        actionButtonEdit.textContent = 'Edit'; // Customize the button label
        actionButtonEdit.classList.add('btn', 'btn-primary', 'mx-2'); // You can use Bootstrap's 'btn' and 'btn-primary' classes

        actionButtonEdit.addEventListener('click', () => {
          // Define an action for the Edit button (e.g., edit the record)
          // You can add your specific logic here
          console.log('Edit button clicked for record with ID:', id);
        });

        const actionButtonDelete = document.createElement('button');
        actionButtonDelete.textContent = 'Delete'; // Customize the button label
        actionButtonDelete.classList.add('btn', 'btn-danger'); // You can use Bootstrap's 'btn' and 'btn-danger' classes

        actionButtonDelete.addEventListener('click', () => {
          
          console.log('Delete button clicked for record with ID:', id);

        });
        

        actionCell.appendChild(actionButtonEdit);
        actionCell.appendChild(actionButtonDelete);

        // Append cells to the row
        row.appendChild(idCell);
        row.appendChild(firstNameCell);
        row.appendChild(lastNameCell);
        row.appendChild(phoneCell);
        row.appendChild(actionCell);

        // Append the row to the table body
        tbody.appendChild(row);
      });
    });
  }

export function FetchData() { 
  const TestcolRef = collection(db, 'Applicant Information');
  
  const querySnapshot = query(TestcolRef);

  onSnapshot(querySnapshot, (snapshot) => {
    let employees = [];
    snapshot.docs.forEach((doc) => {
      employees.push({ ...doc.data(), id: doc.id });
    });
    console.log(employees);
    return employees;
  });

}

window.addEventListener('load', FetchData);
window.addEventListener('load', GetEmployeeTable);
