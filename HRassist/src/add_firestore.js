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

export function AddApplicantInfo(){  
    const ApplicanColRef = collection(db, 'Applicant Information')
    
    // adding documents
    const addApplicantForm = document.querySelector("#applicant_info_form")
    addApplicantForm.addEventListener('submit', (e) => {
        e.preventDefault()

        //const selectedSex = document.querySelector('input[name="sex"]:checked');
        //const sexValue = selectedSex ? selectedSex.value : null; 

        addDoc(ApplicanColRef, { 
            inputFirstName: addApplicantForm.inputFirstName.value,
            inputMiddleName: addApplicantForm.inputMiddleName.value,
            inputLastName: addApplicantForm.inputLastName.value, 
            inputExName: addApplicantForm.inputExName.value, 
            //sex: sexValue,
            inputplacebirth: addApplicantForm.inputplacebirth.value,
            phone: addApplicantForm.phone.value,
            inputemail: addApplicantForm.inputemail.value,
            inputaddress: addApplicantForm.inputaddress.value,
            message: addApplicantForm.message.value, 
            createdAt: serverTimestamp()
            
        })
        .then(() => {
            addApplicantForm.reset()
            console.log("Added employee successfully...")
        })
        
    })
}


export function AddingAlgorithm(queryDB, querySelectorElements, ElementsList){

    
    for (let i = 0; i < ElementsList.length; i++){
        console.log(ElementsList[i])
    }


    /*
    const DBcolRef = collection(db, queryDB)

    const AddForm = document.querySelector(querySelectorElements)
    AddForm.addEventListener('submit', (e) => {
        e.preventDefault()

        for (let i = 0; i < ElementsList.length; i++){
            console.log(ElementsList[i])
        }
    */

    /*addDoc(DBcolRef, {                
        })
        .then(() => {
            AddForm.reset()
            console.log("Added Successfully...")
        })  

    */
    //})

}

export function Test(MyList){

    /*
    const addEmployeeForm = document.querySelector(".dtr_form")
    addEmployeeForm.addEventListener('submit', (e) => {
        e.preventDefault()

        console.log(addEmployeeForm.test.value)
        console.log(addEmployeeForm.test1.value)
        console.log(addEmployeeForm.test2.value)
        
        
    })
    */


    document.getElementById('dtr_form').addEventListener('submit', function(e) {
        e.preventDefault();

    
        // Retrieve values from form fields
        const test = this.querySelector('input[name="test"]').value;
        const test1 = this.querySelector('input[name="test1"]').value;
        const test2 = this.querySelector('input[name="test2"]').value;
        
        const testList = [test, test1, test2]
        console.log(test)
        console.log(test1)
        console.log(test2)

        AddingAlgorithm("", "", testList);

    });

}




const cars = ["BMW", "VOLVO", "HONDA", "FORD", "MITSUBISHI"];
Test(cars)

window.addEventListener('load', AddApplicantInfo);





AddEmployee()