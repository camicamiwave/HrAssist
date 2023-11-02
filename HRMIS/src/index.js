import { initializeApp } from 'firebase/app'
import { 
    getFirestore, collection, onSnapshot, 
    addDoc, deleteDoc, doc,
    query, where,
    orderBy, serverTimestamp,
    getDoc, updateDoc
 } from 'firebase/firestore'

import { getStorage, getDownloadURL } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDGqjNEKCAUkaa6j--uBWr5qnhuX4-V5rw",
    authDomain: "hrmis-test1.firebaseapp.com",
    projectId: "hrmis-test1",
    storageBucket: "hrmis-test1.appspot.com",
    messagingSenderId: "647717447115",
    appId: "1:647717447115:web:ad9940d9397d76e724024e",
    measurementId: "G-ZQTQBHD0VN"
  };

// init firebase app
initializeApp(firebaseConfig)

// init services
const db = getFirestore()

// collection ref
const colRef = collection(db, 'Employee')

// queries
//const q = query(colRef, where("lname", "==", "Albos"), orderBy('createdAt'))

//const q = query(colRef, orderBy('createdAt'))
const q = query(colRef, orderBy('createdAt'))

//const subcolRef = collection(colRef, "aNtoHuxwxvVwxFl5fxrG", "PDS")
// get real time collection data
/*
getDocs(colRef)
  .then((snapshot) => {
    let employees = []
    snapshot.docs.forEach((doc) => {
        employees.push({ ...doc.data(), id: doc.id })
    })
    console.log(employees)
  })
  .catch(err =>{
    console.log(err.message)
  })
*/

 
onSnapshot(q, (snapshot) => {
  let employees = []
  snapshot.docs.forEach((doc) => {
      employees.push({ ...doc.data(), id: doc.id})
  })
  console.log(employees) 
}) 


function GetEmployee() {
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
        // Define an action for the Delete button (e.g., delete the record)
        // You can add your specific logic here
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

// Call the GetEmployee function when the page loads
window.addEventListener('load', GetEmployee);



// adding documents
const addEmployeeForm = document.querySelector(".add_employee")
addEmployeeForm.addEventListener('submit', (e) => {
    e.preventDefault()

    addDoc(colRef, { 
        idnum: addEmployeeForm.idnum.value,
        fname: addEmployeeForm.fname.value,
        lname: addEmployeeForm.lname.value, 
        email: addEmployeeForm.email.value, 
        phonenum: addEmployeeForm.phonenum.value, 
        createdAt: serverTimestamp()
    })
    .then(() => {
      addEmployeeForm.reset()
    })
    
})


// adding documents
const deleteEmployeeForm = document.querySelector(".delete")
deleteEmployeeForm.addEventListener('submit', (e) => {
    e.preventDefault()
  
    const docRef = doc(db, 'Employee', deleteEmployeeForm.id.value)

    deleteDoc(docRef)
      .then(() => {
        deleteEmployeeForm.reset()
      })
})

// get a single document

const docRef = doc(db, '201 File', 'aNtoHuxwxvVwxFl5fxrG')

onSnapshot(docRef, (doc) =>{
  console.log(doc.data(), doc.id)
})


const dataDisplay = document.getElementById('data-display');

function displayData(doc) {
    if (doc.exists()) {
        const data = doc.data();
        const ReqStatus = 'ReqStatus'
        const specificField = data.ReqStatus; // Replace 'yourSpecificField' with the actual field name
        dataDisplay.innerHTML = `Specific Field: ${specificField}, ID: ${doc.id}`;
    } else {
        dataDisplay.innerHTML = "Document not found";
    }
}

function setupSnapshotListener(docRef) {
  onSnapshot(docRef, (doc) => {
    displayData(doc);
    console.log(doc.data(), doc.id);
  });
}

setupSnapshotListener(docRef)


// update a document
const updateForm = document.querySelector('.update')
updateForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const docRef = doc(db, 'Employee', updateForm.id.value)
  updateDoc(docRef, {
    fname: 'updated fname'
  })
  .then(() => {
    updateForm.reset()
  })
  
})


// Getting data

console.log('John')
const storage = getStorage(app);

const storageRef = ref(storage, 'requirements/bcert.png');


getDownloadURL(storageRef)
  .then((url) => {
    console.log('Download URL:', url);
    const imageElement = document.getElementById('imageElement');
    imageElement.src = url;
  })
  .catch((error) => {
    console.error('Error getting download URL:', error);
  });
