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


function GetIndividualIPCRFInformation() {

    const urlParams = new URLSearchParams(window.location.search);
    const receivedIpcrfID = urlParams.get('ipcrfid');
    const receivedemployeeDocID = urlParams.get('employeedocid');

    const colRef = collection(db, 'IPCRF Information')
    const File201colRef = collection(db, '201File Information')
    const EmployeecolRef = collection(db, 'Employee Information')

    const tableBody = document.getElementById('ipcrfTable').getElementsByTagName('tbody')[0];


    const q = query(colRef, where("documentID", "==", receivedIpcrfID))

    onSnapshot(q, (snapshot) => {

        tableBody.innerHTML = '';

        let num = 1;

        snapshot.docs.forEach((empdoc) => {
            const data = empdoc.data();
            const id = empdoc.id;


            labelLeaveUnits.innerHTML = data.TotalRating

            if (data.TotalRating >= 4.50) {
                descriptiveRating.innerHTML = "Outstanding";
                descriptiveRating.style.color = '#0275d8'; 
            } if (data.TotalRating <= 4.449 && data.TotalRating >= 3.500) {
                descriptiveRating.innerHTML = "Very Satisfactory"
                descriptiveRating.style.color = '#5cb85c';
            } if (data.TotalRating >= 2.500 && data.TotalRating <= 3.499) {
                descriptiveRating.innerHTML = "Satisfactory";
                descriptiveRating.style.color = '#5bc0de';
            } if (data.TotalRating >= 1.500 && data.TotalRating <= 1.500) {
                descriptiveRating.innerHTML = "Unsatisfactory";
                descriptiveRating.style.color = '#f0ad4e';
            } if (data.TotalRating <= 1.499) {
                descriptiveRating.innerHTML = "Poor";
                descriptiveRating.style.color = '#d9534f';
            }

            ipcrfSemesterYear.innerHTML = data.ForTheYear
            ipcrfSemesterDate.innerHTML = data.ForTheSemester

            const attachmentData = data.AttachmentURLs


            // Loop through the AttachmentURLs object and add rows to the table
            for (const index in attachmentData) {
                if (attachmentData.hasOwnProperty(index)) {
                    var row = tableBody.insertRow();
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);

                    // Set values for each cell
                    cell1.innerHTML = num; // You can set an ID or index here
                    cell2.innerHTML = `<a href='${attachmentData[index]}' style='width: 60%; text-align: center'>Docs${num}</a>`;

                    // Assuming you have created the button and assigned it to the variable 'viewButton'
                    const viewButton = document.createElement('button');

                    viewButton.textContent = `View`;
                    viewButton.className = 'btn btn-primary';
                    viewButton.style.width = '25%';
                    viewButton.id = `viewbtn${index}`;
                    viewButton.type = 'button'

                    // Add an event listener to the button
                    viewButton.addEventListener('click', function () {
                        // Get the file URL associated with the button
                        const fileURL = attachmentData[index];

                        // Open the file in a new tab or window
                        window.open(fileURL, '_blank');
                    });

                    cell3.appendChild(viewButton);
                }
                num++;
            }



        })
    })


    fetchEmployeeInfo(EmployeecolRef, receivedemployeeDocID, "documentID").then((dataRetrieved) => {
        const data = dataRetrieved;
        const employeeDocID = data.documentID

        console.log(data)

        const fullName = `${data.Personal_Information.FirstName} ${data.Personal_Information.SurName}`

        empfullName.innerHTML = fullName
        empPhone.innerHTML = data.Personal_Information.MobileNumber
        empEmail.innerHTML = data.Personal_Information.Email

        employeeProfile.src = data.ProfilePictureURL


        fetchEmployeeInfo(File201colRef, receivedemployeeDocID, "employeeDocID").then((dataRetrieved) => {
            const file201data = dataRetrieved;
            const file201DocID = file201data.documentID

            console.log(file201data, 'a')
            empDesignation.innerHTML = file201data.Appointment_Details.PositionTitle
            empOffice.innerHTML = file201data.Appointment_Details.Office
            empJobType.innerHTML = file201data.Appointment_Details.PositionCategory

        })


    })




}

window.addEventListener('load', GetIndividualIPCRFInformation);

