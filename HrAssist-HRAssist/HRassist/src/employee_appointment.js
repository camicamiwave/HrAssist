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

    if (validateForm()){
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

    } else {
      console.log("Error");
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

function validateForm() {


 var OfficeSelector = document.getElementById('inputOffice');
 var PositionSelector = document.getElementById('positionSelector');
 var PosCategory = document.getElementById('inputPosCategory');
 var SalaryGrade = document.getElementById('inputSJP');
 var Amount = document.getElementById('inputAmount');
 var NatureOfAppointment = document.getElementById('inputNatofApp');
 var Viceinput = document.getElementById('inputVice');
 var PlantillaInput = document.getElementById('inputPlant');
 var Pageinput = document.getElementById('inputPage');
 var AppointingOfficerInput = document.getElementById('inputAppOff');
 var AppointmentDateInput = document.getElementById('inputDate');
 var AttachmentInput = document.getElementById('fileInput');


     if (OfficeSelector.value === 'Select') {
        console.log('Please select an Office!');
        Swal.fire({
            title: 'Error',
            text: 'Please select an Office!',
            icon: 'error',
        });
        return false;
    }

    if (PositionSelector.value === 'Select') {
      console.log('Please select a position!');
      Swal.fire({
          title: 'Error',
          text: 'Please select a position!',
          icon: 'error',
      });
      return false;
  }

  if (PosCategory.value === '') {
    console.log('Please select a position category!');
    Swal.fire({
        title: 'Error',
        text: 'Please select a position category!',
        icon: 'error',
    });
    return false;
 }

  if (SalaryGrade.value === '') {
    console.log('Please select a Salary Grade!');
    Swal.fire({
        title: 'Error',
        text: 'Please select a position category!',
        icon: 'error',
    });
    return false;
  }


  if (!isValidNumber(Amount.value)) {
    console.log('Please input numerical digits in Compensation');
    Swal.fire({
        title: 'Error',
        text: 'Please input numerical digits in Compensation',
        icon: 'error',
    });
    return false;
  }

  if (NatureOfAppointment.value === '') {
    console.log('Please select a Nature of Appointment!');
    Swal.fire({
        title: 'Error',
        text: 'Please select a Nature of Appointment!',
        icon: 'error',
    });
    return false;
 }

  if (!isValidString(Viceinput.value)) {
    console.log('Please correct your input in choosing the Vice');
    Swal.fire({
        title: 'Error',
        text: 'Please correct your input in choosing the Vice',
        icon: 'error',
    });
    return false;
  }

  if (!isValidNumber(PlantillaInput.value)) {
    console.log('Please input numerical digits in Plantilla');
    Swal.fire({
        title: 'Error',
        text: 'Please input numerical digits in Plantilla',
        icon: 'error',
    });
    return false;
  }

  if (!isValidNumber(Pageinput.value)) {
    console.log('Please input numerical digits in Page');
    Swal.fire({
        title: 'Error',
        text: 'Please input numerical digits in Plantilla',
        icon: 'error',
    });
    return false;
  }

  if (!isValidString(AppointingOfficerInput.value)) {
    console.log('Please correct your input in choosing the Appointing Officer');
    Swal.fire({
        title: 'Error',
        text: 'Please correct your input in choosing the Appointing Officer',
        icon: 'error',
    });
    return false;
  }

  if (AppointmentDateInput.value === '') {
    console.log('Please select an Appointment Date');
    Swal.fire({
        title: 'Error',
        text: 'Please select an Appointment Date',
        icon: 'error',
    });
    return false;
 }



    return true;
  
  
    
}


function isValidString(value) {

  return /^[a-zA-Z\s]*$/.test(value.trim());
}

function isValidNumber(value) {

  return /^[0-9]+$/.test(value.trim());
}

