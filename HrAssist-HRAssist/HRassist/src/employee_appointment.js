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


export function AddEmployeeAppointment(querySelctorID, employeeData, currentDocumentID) {

    console.log(querySelctorID, employeeData, currentDocumentID)
    const TestcolRef = collection(db, 'User Account');
    const EmployeecolRef = collection(db, 'Employee Information');
    //const addDataSheetForm = document.querySelector(querySelctorID);
  
    FetchCurrentUser().then((current) => {
      console.log(current, 'current user');
      const que = query(TestcolRef, where("userID", "==", current.uid));
  
      onSnapshot(que, (snapshot) => {
        snapshot.docs.forEach((docData) => {
          const data = docData.data();
  
          if (data.UserLevel === "Admin") {
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
                const employeeDocRef = doc(EmployeecolRef, currentDocumentID);
                return setDoc(employeeDocRef, employeeData, { merge: true })
                  .then(() => {
                    Swal.fire({
                      title: "Saved!",
                      text: "Your employee added successfully...",
                      icon: "success"
                    }).then(() => {
                      //addDataSheetForm.reset();
                      console.log("Added employee successfully...");
                      //window.location.href = `Education-21Files.html?data=${encodeURIComponent(currentDocumentID)}`;
                      console.log("Hello")
  
                      if (querySelctorID === "#employeeDataSheet") {
                        window.location.href = `Education-21Files.html?data=${encodeURIComponent(currentDocumentID)}`;
                      } else if (querySelctorID === "#EducationForm") {
                        window.location.href = `OtherInfo-201file.html?data=${encodeURIComponent(currentDocumentID)}`;
                      } else if (querySelctorID === "#fileForm") {
                        window.location.href = `Files.html?data=${encodeURIComponent(currentDocumentID)}`;
                      } else if (querySelctorID === "#signatureForm") {
                        window.location.href = `Files.html?data=${encodeURIComponent(currentDocumentID)}`;
                      }
                    });
                  })
                  .catch(error => console.error('Error adding employee document:', error));
              }
            });
          } else {
            console.log("Only admin can add data...");
          }
        });
      });
    })
  
  }

export function AppointmentInitializer(){
  try{
    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('data');
  
    // Trigger to send document id when it was called
    Employee201Navigator(receivedStringData);
  
  } catch {
    console.log("Not Education form")
  }

}



function AddAppointmentData(){
  const EmployeeColRef = collection(db, '201File Information');

  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');

  console.log(receivedStringData)

  const addDataSheetForm = document.querySelector("#employeeAppointmentForm");
  const appointmentSubmitBtn = document.getElementById('appointmentSubmitBtn')

  let EmpcustomDocId;

  addDataSheetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    try {
      
    const employeeData = {
        employeeDocID: receivedStringData,
        createdAt: serverTimestamp(),
        Appointment_Details: {
          PositionTitle: addDataSheetForm.inputPosTitle.value.trim(),
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
        return addDoc(EmployeeColRef, {employeeData, id: receivedStringData})
        .then((docRef) =>{
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
              //window.location.href = `Education-21Files.html?data=${encodeURIComponent(EmpcustomDocId)}`;
              console.log("Hello")

            });
          })
          .catch(error => console.error('Error adding employee document:', error));
      }
    });


    console.log(employeeData)



  } catch {
    console.log("There was an error...")
  }
  })

}

window.addEventListener('load', AddAppointmentData)



/// ito na gamitin na algo for retrieving

export function fetchAppointmentData(){
  const File201ColRef = collection(db, '201File Information');
  const EmployeeColRef = collection(db, 'Employee Information');

  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');

  try{
    fetchEmployeeInfo(File201ColRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
      
      console.log(dataRetrieved, 'Data mo heheheh');

      const data = dataRetrieved;

      const addDataSheetForm = document.querySelector("#employeeAppointmentForm");

      if (data.Appointment_Details){
        addDataSheetForm.inputPosTitle.value = data.Appointment_Details.PositionTitle,
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
        addDataSheetForm.inputDate.value =  data.Appointment_Details.DateofSigning

        jobPositionTitle.innerHTML = data.Appointment_Details.PositionTitle
      }
    })    
  } catch {
    console.log("No records found...")
  }
  


}


window.addEventListener('load', fetchAppointmentData)
