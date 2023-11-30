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


function addOffice(){

    try{ 
        const addOfficeBtn = document.getElementById('addOfficeBtn')
        const officeForm = document.querySelector('#officeForm')
        
        const OfficecolRef = collection(db, 'Office Information');
        
    
        addOfficeBtn.addEventListener('click', (e) => {
            
            const officeName = officeForm.departmentName.value.trim()


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

            checkIfValueExists(OfficecolRef, 'OfficeName', officeName)
            .then((exists) => {
                if (exists) { 
                    alert("Office name existed")
                } else {
                    if (officeName != ''){
                        const officeDetails = {
                            OfficeName: officeName,
                            createdAt: serverTimestamp()
                        };
                        
                        addDoc(OfficecolRef, officeDetails)
                            .then(docRef => {
                                const documentId = docRef.id; 
                                SaveLogo(docRef)
                                return setDoc(doc(OfficecolRef, documentId), { officeDocumentID: documentId }, { merge: true });
                            }).then(() => { 
                                alert("Office saved successfully...")
                                officeForm.reset()  
        
                            })
                            .catch(error => {
                                console.error('Error adding document: ', error);
                            });

                    } else {
                        alert('Office name is required.')
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






function SaveLogo(docRef) {
    const storageRef = ref(storage, "Office/Logo");
    
    const OfficecolRef = collection(db, 'Office Information');

    // Access the file input field
    const fileInput = document.getElementById('logoFileInput');
    const selectedFiles = fileInput.files;

    // Create an array to store download URLs
    const downloadURLs = [];

    const file = selectedFiles[0]; // Kunin ang iisang file
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}_${file.name}`;
    const fileRef = ref(storageRef, uniqueFilename);
    
    uploadBytes(fileRef, file)
        .then((snapshot) => getDownloadURL(fileRef))
        .then((downloadURL) => {
            const EmpcustomDocId = docRef.id;
            return setDoc(doc(OfficecolRef, EmpcustomDocId), { logoURL: downloadURL }, { merge: true });
        })
        .then(() => {
            console.log("File uploaded successfully.");
        })
        .catch((error) => {
            console.error("Error uploading file:", error);
        });
 
}



// Fetch officess

function fetchOffices() {
    const OfficecolRef = collection(db, 'Office Information');
    const officesContainer = document.querySelector('.organization-container');

    const que = query(OfficecolRef, orderBy('createdAt'))

    onSnapshot(que, (snapshot) => {
        officesContainer.innerHTML = '';

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            const officeName = data.OfficeName;
            const officeLogo = data.logoURL; 

            // Create HTML elements for each office
            const officeElement = document.createElement('div');
            officeElement.classList.add('organization-container');
            officeElement.dataset.documentId = data.officeDocumentID; // Set the documentId as a data attribute

            const officeLink = document.createElement('a');
            officeLink.classList.add('org-link');
            officeLink.href = `organizational_chart.html?officeID=${encodeURIComponent(data.officeDocumentID)}`;

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('details');

            const orgLeftDiv = document.createElement('div');
            orgLeftDiv.classList.add('org-left');

            const orgLogoImg = document.createElement('img');
            orgLogoImg.classList.add('org-logo');
            orgLogoImg.src = officeLogo;
            orgLogoImg.alt = 'Organization Logo';
            orgLogoImg.width = 80;
            orgLogoImg.height = 80;
            orgLogoImg.id = 'logoImg'; // Assign ID to the image element

            const orgRightDiv = document.createElement('div');
            orgRightDiv.classList.add('org-right');

            const orgNameHeader = document.createElement('h3');
            orgNameHeader.classList.add('org-name');
            orgNameHeader.id = 'officeName'; // Assign ID to the header element
            orgNameHeader.textContent = officeName;

            const numOrgMembersDiv = document.createElement('div');
            numOrgMembersDiv.classList.add('num-orgmember');
            if (data.TotalDesignated){
                numOrgMembersDiv.innerHTML = `<i class="bx bx-user"></i> &nbsp;&nbsp;${data.TotalDesignated} Designation`;
            } else {
                numOrgMembersDiv.innerHTML = `<i class="bx bx-user"></i> &nbsp;&nbsp; 0 Designation`;
            }
            //numOrgMembersDiv.innerHTML = `<img src="assets/images/offices/members.png" /> ${numMembers} Members`;

            // Append created elements to the container
            orgLeftDiv.appendChild(orgLogoImg);
            orgRightDiv.appendChild(orgNameHeader);
            orgRightDiv.appendChild(numOrgMembersDiv);

            detailsDiv.appendChild(orgLeftDiv);
            detailsDiv.appendChild(orgRightDiv);

            officeLink.appendChild(detailsDiv);
            officeElement.appendChild(officeLink);

            officesContainer.appendChild(officeElement);
        });
    });

        // Add event listener to the container to handle click events
    officesContainer.addEventListener('click', (event) => {
        const clickedContainer = event.target.closest('.organization-container');
        if (clickedContainer) {
            const documentId = clickedContainer.dataset.documentId;
            console.log('Clicked container with documentId:', documentId);
            // You can now use the documentId as needed
        }
    });    
    
}


// Call the fetchOffices function to initiate the dynamic display
window.addEventListener('load', fetchOffices)
