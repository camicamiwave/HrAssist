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
    getDoc, updateDoc, setDoc, getDocs
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);

const urlParams = new URLSearchParams(window.location.search);
const receivedOfficeID = urlParams.get('officeID');

function addOffice() {

    try {
        const addOfficeBtn = document.getElementById('addOfficeBtn')
        const officeForm = document.querySelector('#organizationChartForm')

        const OfficecolRef = collection(db, 'Office Information');

        addOfficeBtn.addEventListener('click', (e) => {

            const designationName = officeForm.designationName.value.trim()
            const descriptionText = officeForm.descriptionText.value.trim()
            const headOfOffice = officeForm.headOfOffice

            const designationDetails = {
                DesignationName: designationName,
                Description: descriptionText,
                createdAt: serverTimestamp()
            };

            if (headOfOffice.checked){
                designationDetails['HeadOfOffice'] = true
            }

            const employeeDocumentRef = doc(OfficecolRef, receivedOfficeID);

            const designationCollectionRef = collection(employeeDocumentRef, 'Designations');

            // Pange check ng record
            const checkIfValueExists = async (collectionRef, fieldName, targetValue) => {
                try {
                    const querySnapshot = await getDocs(query(collectionRef, where(fieldName, '==', targetValue)));
            
                    return !querySnapshot.empty; // true kung meron nang dokumento na may ganoong value, false kung wala
                } catch (error) {
                    console.error('Error checking value in Firestore:', error);
                    throw error;
                }
            };

            checkIfValueExists(designationCollectionRef, 'DesignationName', designationName)
            .then((exists) => {
                if (exists) { 
                    alert("Designation name existed")
                } else {
                    if (designationName != ''){
                        
                        addDoc(designationCollectionRef, designationDetails)
                        .then(docRef => {
                            const documentId = docRef.id; 
                            return setDoc(doc(designationCollectionRef, documentId), { designationDocumentID: documentId }, { merge: true });
                        }).then(() => {
                            alert("Designation saved successfully...")
                            officeForm.reset()
                        })
                        .catch(error => {
                            console.error('Error adding document: ', error);
                        });

                    } else {
                        alert('Designation name is required.')
                    }
                }
            })
            .catch((error) => {
                console.error('Error checking value:', error);
            });


        });
    } catch {

    }
}

window.addEventListener('load', addOffice)





function fetchOfficeEmployee() {

    const OfficecolRef = collection(db, 'Office Information');

    const officeNameLabel = document.getElementById('officeNameLabel');
    const officeNameSpan = document.getElementById('officeNameSpan');

    fetchEmployeeInfo(OfficecolRef, receivedOfficeID, "officeDocumentID").then((dataRetrieved) => {
        const employeeInfo = dataRetrieved;

        officeNameLabel.innerHTML = employeeInfo.OfficeName
        officeNameSpan.innerHTML = employeeInfo.OfficeName

    })

}

window.addEventListener('load', fetchOfficeEmployee)


function Test(){
    test123()
}

window.addEventListener('load', Test)