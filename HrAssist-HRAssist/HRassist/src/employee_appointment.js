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
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);

function AddAppointmentData() {
  const EmployeeColRef = collection(db, '201File Information');

  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');

  const addDataSheetForm = document.querySelector("#employeeAppointmentForm");
  const appointmentSubmitBtn = document.getElementById('appointmentSubmitBtn')

  let EmpcustomDocId;

  addDataSheetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    console.log(receivedStringData, 'hey')

    try {

      const employeeData = {
        employeeDocID: receivedStringData,
        createdAt: serverTimestamp(),
        Appointment_Details: {
          PositionTitle: addDataSheetForm.positionSelector.value.trim(),
          PositionCategory: addDataSheetForm.inputPosCategory.value.trim(),
          Office: addDataSheetForm.inputOffice.value.trim(),
          SalaryGrade: addDataSheetForm.inputSJP.value.trim(),
          Compensation: addDataSheetForm.inputAmount.value.trim(),
          NatureAppointment: addDataSheetForm.inputNatofApp.value.trim(),
          Vice: addDataSheetForm.inputVice.value.trim(),
          Who: addDataSheetForm.inputWho.value.trim(),
          PlantillaNum: addDataSheetForm.inputPlant.value.trim(),
          Page: addDataSheetForm.inputPage.value.trim(),
          AppointingOfficer: addDataSheetForm.inputAppOff.value.trim(),
          DateofSigning: addDataSheetForm.inputDate.value.trim()
        }

      }

      Swal.fire({
        title: "Are you sure?",
        text: "Employee's personal information will be saved",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirm"
      }).then((result) => {
        if (result.isConfirmed) {
          //const employeeDocRef = doc(EmployeecolRef, currentDocumentID);
          //return setDoc(employeeDocRef, employeeData, { merge: true })
          return addDoc(EmployeeColRef, employeeData)
            .then((docRef) => {
              EmpcustomDocId = docRef.id;
              return setDoc(doc(EmployeeColRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
            })
            .then(() => {
              Swal.fire({
                title: "Saved!",
                text: "Your appointment details added successfully...",
                icon: "success"
              }).then(() => {
                //addDataSheetForm.reset();
                console.log("Added appointment successfully...");
                window.location.href = `admin_201file_attachments.html?data=${encodeURIComponent(receivedStringData)}&201filedoc=${encodeURIComponent(EmpcustomDocId)}`;

                console.log("Hello")

              });
            })
            .catch(error => console.error('Error adding employee document:', error));
        }
      });


    } catch {
      console.log("There was an error...")
    }
  })

}

window.addEventListener('load', AddAppointmentData)



/// ito na gamitin na algo for retrieving

export function fetchAppointmentData() {
  const File201ColRef = collection(db, '201File Information');
  const EmployeeColRef = collection(db, 'Employee Information');

  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');
  const received201File = urlParams.get('201filedoc');

  try {
    fetchEmployeeInfo(File201ColRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
      const data = dataRetrieved;

      const addDataSheetForm = document.querySelector("#employeeAppointmentForm");

      if (data.Appointment_Details) {
        addDataSheetForm.positionSelector.value = data.Appointment_Details.PositionTitle
        addDataSheetForm.inputPosCategory.value = data.Appointment_Details.PositionCategory
        addDataSheetForm.inputOffice.value = data.Appointment_Details.Office
        addDataSheetForm.inputSJP.value = data.Appointment_Details.SalaryGrade
        addDataSheetForm.inputAmount.value = data.Appointment_Details.Compensation
        addDataSheetForm.inputNatofApp.value = data.Appointment_Details.NatureAppointment
        addDataSheetForm.inputVice.value = data.Appointment_Details.Vice
        addDataSheetForm.inputWho.value = data.Appointment_Details.Who
        addDataSheetForm.inputPlant.value = data.Appointment_Details.PlantillaNum
        addDataSheetForm.inputPage.value = data.Appointment_Details.Page
        addDataSheetForm.inputAppOff.value = data.Appointment_Details.AppointingOfficer
        addDataSheetForm.inputDate.value = data.Appointment_Details.DateofSigning

        jobPositionTitle.innerHTML = data.Appointment_Details.PositionTitle
      }
    })
  } catch {
    console.log("No records found...")
  }



}


window.addEventListener('load', fetchAppointmentData)


function fetchOfficeDesignation() {
  const OfficecolRef = collection(db, 'Office Information');
  const que = query(OfficecolRef, orderBy('createdAt'));

  const inputOffice = document.getElementById('inputOffice');
  inputOffice.innerHTML = '<option>Select</option>';
 
  onSnapshot(que, (snapshot) => {
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;

      // Create an option element for each OfficeName and append it to the selector
      const optionElement = document.createElement('option');
      optionElement.value = data.OfficeName;
      optionElement.textContent = data.OfficeName;
      inputOffice.appendChild(optionElement);
    });
  });

  // Add an event listener to detect changes in selection
  inputOffice.addEventListener('change', function () {
    // Get the selected value of the selector
    const selectedValue = inputOffice.value;

    if (selectedValue) {
      // Log or use the selected value
      console.log(selectedValue); 

      fetchEmployeeInfo(OfficecolRef, selectedValue, "OfficeName").then((dataRetrieved) => {
        const designationData = dataRetrieved;

        const positionSelector = document.getElementById('positionSelector');
        positionSelector.innerHTML = '<option>Select</option>';

        // getting data of designation
        const designationCollectionRef = collection(db, 'Office Information', designationData.officeDocumentID, 'Designations'); 
        const designationQue = query(designationCollectionRef)

        onSnapshot(designationQue, (snapshot) => {
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
      
            // Create an option element for each OfficeName and append it to the selector
            const optionElement = document.createElement('option');
            optionElement.value = data.DesignationName;
            optionElement.textContent = data.DesignationName;
            positionSelector.appendChild(optionElement);
          });
        });
      })
    } else {
      console.log("None")
    }
  });
}

window.addEventListener('load', fetchOfficeDesignation);

