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
import { UserLoginChecker } from './page_restriction.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()


export function SearchEmployee() {
    // Assuming you have an HTML form with id="employeeDataSheet"
    const SearchEmployeeForm = document.querySelector("#rewardsForm");
    const EmployeecolRef = collection(db, 'Employee Information');

    const searchbtn = document.getElementById('searchEmployeeBtn')

    const searchEmployeeFname = document.getElementById('searchEmployeeFname')
    const searchEmployeeMname = document.getElementById('searchEmployeeMname')
    const searchEmployeeLname = document.getElementById('searchEmployeeLname')
    const searchEmployeeExName = document.getElementById('searchEmployeeExName')

    // Event listener for the form submission
    searchbtn.addEventListener('click', (e) => {
        e.preventDefault();

        console.log("heheehe")

        const FirstName = searchEmployeeFname.value
        const MiddleName = searchEmployeeMname.value
        const LastName = searchEmployeeLname.value
        const ExtName = searchEmployeeExName.value

        console.log(`Fullname:${FirstName}${MiddleName}${LastName}${ExtName}`)

        try {

            const conditions = [
                where("Personal_Information.FirstName", "==", FirstName.trim()),
                where("Personal_Information.MiddleName", "==", MiddleName.trim()),
                where("Personal_Information.SurName", "==", LastName.trim())
            ];

            if (ExtName !== "") {
                conditions.push(where("Personal_Information.ExName", "==", ExtName.trim()));
            }

            const que = query(EmployeecolRef, ...conditions);

            // for retrieving the current user
            onSnapshot(que, (snapshot) => {
                if (!snapshot.empty) {
                    snapshot.docs.forEach((docData) => {
                        const data = docData.data();
                        const employeeDocID = data.documentID;

                        console.log(data);
                        alert("A record was retrieved.");
                        //window.location.href = `admin_201file_pds.html?data=${encodeURIComponent(employeeDocID)}`;

                        // Assuming you want to add the employeeDocID to the URL without reloading
                        const url = `admin_add_reward.html?data=${encodeURIComponent(employeeDocID)}`;

                        // Use pushState to update the URL
                        window.history.pushState({ path: url }, '', url);


                        SearchEmployeeForm.style.display = 'block'
                        searchbtn.style.display = 'none'

                    });
                } else {
                    alert("No record retrieved.");
                    console.log("No record retrieved.");
                }
            });


        } catch {

            alert("No record retrieved.");
        }

    })

}

window.addEventListener('load', SearchEmployee)


function fetchAppointment(){

    try {
        const EmployeecolRef = collection(db, '201File Information');

        const rewardsForm = document.querySelector('#rewardsForm')

        const urlParams = new URLSearchParams(window.location.search);
        const receivedStringData = urlParams.get('data');
        
        if (receivedStringData){
            fetchEmployeeInfo(EmployeecolRef, receivedStringData, 'employeeDocID').then((dataRetrieved) => {
                const File201Data = dataRetrieved;
    
                rewardsForm.officeSelecor.value = File201Data.Appointment_Details.Office
                rewardsForm.designationSelecor.value = File201Data.Appointment_Details.PositionTitle


                
            })    
        }
    
    
    } catch{
        console.log("No employee appointment found...")
    }

}

window.addEventListener('load', fetchAppointment)