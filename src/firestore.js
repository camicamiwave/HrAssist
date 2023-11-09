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
 
// QUERIES
//const q = query(colRef, where("lname", "==", "Albos"), orderBy('createdAt'))

function FetchAllEmployeeData(){
    onSnapshot(q, (snapshot) => {
        let employees = []
        snapshot.docs.forEach((doc) => {
            employees.push({ ...doc.data(), id: doc.id})
        })
        console.log(employees) 
      })       
}

function DeleteEmployee(){
    const deleteEmployeeForm = document.querySelector(".delete")
    deleteEmployeeForm.addEventListener('submit', (e) => {
        e.preventDefault()
  
    const docRef = doc(db, 'Employee', deleteEmployeeForm.id.value)

    deleteDoc(docRef)
      .then(() => {
        deleteEmployeeForm.reset()
      })
})

}

function UpdateEmployee(){    
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
}




FetchAllEmployeeData();
DeleteEmployee();
UpdateEmployee(); 