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

function AddEmployee(){    
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
        console.log("Added employee successfully...")
        })
        
    })
}

AddEmployee()