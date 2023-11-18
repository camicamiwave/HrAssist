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

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);

export function AddEmployeeDataSheet() {

  const TestcolRef = collection(db, 'User Account');
  const EmployeecolRef = collection(db, 'Employee Information');
  const storageRef = ref(storage, "Employee/Requirements");

  // Assuming you have an HTML form with id="employeeDataSheet"
  const addDataSheetForm = document.querySelector("#employeeDataSheet");

  let customDocId; // Declare customDocId outside the then block


  onAuthStateChanged(auth, (user) => {
    if (user) {
      const currentUser = user;
      const userId = user.uid;

      // Assuming there's a 'userID' field in your 'User Account' collection
      const que = query(TestcolRef, where("userID", "==", userId));

      onSnapshot(que, (snapshot) => {
        snapshot.docs.forEach((docData) => {
          const data = docData.data();
          const id = docData.id;

          console.log(data, 'hello');

          // Make sure the user is an admin before proceeding
          // For example, check if data.UserLevel === "Admin"
          if (data.UserLevel === "Admin") {
            console.log("User is an admin...");

            // Event listener for the form submission
            addDataSheetForm.addEventListener('submit', (e) => {
              e.preventDefault();

              // Access the file input field
              const fileInput = document.getElementById('fileInput');
              const selectedFiles = fileInput.files;
              const firstSelectedFile = selectedFiles[0];  // Access the first file

              // Generate a unique filename using timestamp
              const timestamp = new Date().getTime();
              const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
              const fileRef = ref(storageRef, uniqueFilename);

              // Upload the file to Firebase Storage
              const uploadPromise = uploadBytes(fileRef, firstSelectedFile)
                .then((snapshot) => getDownloadURL(fileRef))
                .then((downloadURL) => {
                  // Prepare data for Firestore
                  const employeeData = {
                    userID: user.uid,
                    UserLevel: "Employee",
                    createdAt: serverTimestamp(),
                    ProfilePictureURL: downloadURL,
                    Personal_Information: {
                      // Add other fields based on your form
                      CSCID: addDataSheetForm.inputCsId.value.trim(),
                      FirstName: addDataSheetForm.inputFirstName.value.trim(),
                      MiddleName: addDataSheetForm.inputMiddleName.value.trim(),
                      SurName: addDataSheetForm.inputSurName.value.trim(),
                      ExName: addDataSheetForm.inputExName.value.trim(),
                      Gender: addDataSheetForm.gender.value.trim(),
                      Birthdate: addDataSheetForm.Birthdate.value.trim(),
                      PlaceBirth: addDataSheetForm.PlaceBirth.value.trim(),
                      CivilStatus: addDataSheetForm.inputStatus.value.trim(),
                      Email: addDataSheetForm.inputEmail.value.trim(),
                      MobileNumber: addDataSheetForm.inputMnumber.value.trim(),
                      TelNum: addDataSheetForm.inputTel.value.trim(),
                      Height: addDataSheetForm.inputHeight.value.trim(),
                      BloodType: addDataSheetForm.inputWeight.value.trim(),
                      GSIS: addDataSheetForm.InputGsis.value.trim(),
                      PagIbig: addDataSheetForm.InputPagibig.value.trim(),
                      PhilHealth: addDataSheetForm.inputPhealth.value.trim(),
                      SSS: addDataSheetForm.inputSSS.value.trim(),
                      Tin: addDataSheetForm.inputTIN.value.trim(),
                      Agency: addDataSheetForm.InputAgency.value.trim(),
                      Citizen: addDataSheetForm.inputCitizen.value.trim(),
                      Naturalize: addDataSheetForm.naturalization.value.trim(),
                      Country: addDataSheetForm.inputCountry.value.trim(),
                      HouseBlock: addDataSheetForm.inputHouse.value.trim(),
                      Street: addDataSheetForm.inputStreet.value.trim(),
                      Subdivision: addDataSheetForm.InputSub.value.trim(),
                      Barangay: addDataSheetForm.inputBarangay.value.trim(),
                      Municipality: addDataSheetForm.inputMun.value.trim(),
                      Subdivision: addDataSheetForm.InputSub.value.trim(),
                      Province: addDataSheetForm.InputProv.value.trim(),
                      ZipCode: addDataSheetForm.inputZip.value.trim(),
                    },
                    SpouseDetails: {
                      SpouseFirstName: addDataSheetForm.inputSpouseFirstName.value.trim(),
                      SpouseMiddleName: addDataSheetForm.inputSpouseMiddleName.value.trim(),
                      SpouseSurName: addDataSheetForm.inputSpouseSurName.value.trim(),
                      SpouseExName: addDataSheetForm.inputSpouseExName.value.trim(),
                      SpouseOccupation: addDataSheetForm.inputSpouseOccupation.value.trim(),
                      SpouseEmployer: addDataSheetForm.inputSpouseEmployer.value.trim(),
                      SpouseBusinessAdd: addDataSheetForm.inputSpouseBusinessAdd.value.trim(),
                      SpouseTelNum: addDataSheetForm.inputSpouseTelNo.value.trim(),
                    },
                    FatherDetails: {
                      FatherFirstName: addDataSheetForm.inputFatherFirstName.value.trim(),
                      FatherMiddleName: addDataSheetForm.inputFatherMiddleName.value.trim(),
                      FatherSurName: addDataSheetForm.inputFatherSurName.value.trim(),
                      FatherExName: addDataSheetForm.inputFatherExName.value.trim()
                    },
                    MotherDetails: {
                      MotherFirstName: addDataSheetForm.inputMotherFirstName.value.trim(),
                      MotherMiddleName: addDataSheetForm.inputMotherMiddleName.value.trim(),
                      MotherSurName: addDataSheetForm.inputMotherSurName.value.trim(),
                      MotherMaidenName: addDataSheetForm.inputMotherMaiden.value.trim()
                    },
                    NumberChildren: addDataSheetForm.numberOfChildren.value.trim(),
                    ChildrenDetails: []
                  };

                  try {
                    const numberChildren = document.getElementById("numberOfChildren").value;

                    const formData = []

                    for (let i = 1; i <= numberChildren; i++) {
                      employeeData.ChildrenDetails.push({
                        ChildrenFirstName: document.getElementById(`inputChildrenFirstName${i}`).value.trim(),
                        ChiildrenMiddleName: document.getElementById(`inputChildrenMiddleName${i}`).value.trim(),
                        ChiildrenSurName: document.getElementById(`inputChildrenSurName${i}`).value.trim(),
                        ChiildrenExName: document.getElementById(`inputChildrenExName${i}`).value.trim(),
                      });
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
                        Swal.fire({
                          title: "Saved!",
                          text: "Your employee added successfully...",
                          icon: "success"
                        }).then(() => {
                          // Add data to Firestore
                          return addDoc(EmployeecolRef, employeeData);
                        }).then((docRef) => {
                          customDocId = docRef.id;
                          // Update the document with the custom ID
                          return setDoc(doc(EmployeecolRef, customDocId), { documentID: customDocId }, { merge: true });
                        })
                          .then(() => {
                            console.log("hereee: ", customDocId)
                            // Reset the form
                            addDataSheetForm.reset();
                            console.log("Added employee successfully...");
                            //window.location.href = 'Education-21Files.html';
                            window.location.href = `Education-21Files.html?data=${encodeURIComponent(customDocId)}`;
                          })
                          .catch(error => console.error('Error adding employee document:', error));
                      }
                    });

                  }
                  catch {
                    alert("Please provide the required fields.")
                  }
                })

            });
          } else {
            console.log("User is not an admin.");
          }
        });
      });
    } else {
      console.log("No user is signed in.");
    }
  });
}

// Trigger the function on page load
window.addEventListener('load', AddEmployeeDataSheet);

export function UrlParameterRetriever() {
  // In your second.html JavaScript file
  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');

  console.log("Data Retrieved: ", receivedStringData);

}

window.addEventListener('load', UrlParameterRetriever);


function Employee201Navigator(customDocId) {
  const personalBtn = document.getElementById('201Personal');
  const educationBtn = document.getElementById('201Education');
  const otherBtn = document.getElementById('201Other');
  const signatureBtn = document.getElementById('201Signature');
  const filesBtn = document.getElementById('201Files');

  personalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    confirmAction("Personal", customDocId)
  })

  educationBtn.addEventListener('click', (e) => {
    e.preventDefault();
    confirmAction("Education", customDocId)
  })

  otherBtn.addEventListener('click', (e) => {
    e.preventDefault();
    confirmAction("Other Information", customDocId)
  })

  signatureBtn.addEventListener('click', (e) => {
    e.preventDefault();
    confirmAction("Signature", customDocId)
  })

  filesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    confirmAction("Files", customDocId)
  })
}



// method for checking if the user wants to go to other pages
function confirmAction(category, documentID) {
  Swal.fire({
    title: "Are you sure?",
    text: `Your changes will be lost. Do you want to proceed?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, proceed!"
  }).then((result) => {
    if (result.isConfirmed) {
      // Redirect to the corresponding page based on the clicked link
      switch (category) {
        case 'Personal':
          //window.location.href = "datasheet.html";
          window.location.href = `datasheet.html?data=${encodeURIComponent(documentID)}`;
          break;
        case 'Education':
          window.location.href = `Education-21Files.html?data=${encodeURIComponent(documentID)}`;
          break;
        case 'Other Information':
          //window.location.href = "OtherInfo-201file.html";
          window.location.href = `OtherInfo-201file.html?data=${encodeURIComponent(documentID)}`;
          break;
        case 'Signature':
          //window.location.href = "signature-201file.html";
          window.location.href = `signature-201file.html?data=${encodeURIComponent(documentID)}`;
          break;
        case 'Files':
          //window.location.href = "signature-201file.html";
          window.location.href = `signature-201file.html?data=${encodeURIComponent(documentID)}`;
          break;
        default:
          break;
      }
    }
  });
}

export function FetchCurrentUser() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const currentUser = user;
        const userId = user.uid;
        resolve(currentUser);
      } else {
        resolve("None");
      }
    });
  });
}

export function AddEmployeeDataFirestore(querySelctorID, employeeData, currentDocumentID) {

  console.log(querySelctorID, employeeData, currentDocumentID)
  const TestcolRef = collection(db, 'User Account');
  const EmployeecolRef = collection(db, 'Employee Information');
  const addDataSheetForm = document.querySelector(querySelctorID);

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
                    addDataSheetForm.reset();
                    console.log("Added employee successfully...");
                    //window.location.href = `Education-21Files.html?data=${encodeURIComponent(currentDocumentID)}`;
                    console.log("Hello")

                    if (querySelctorID === "#EducationForm") {
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

export function Employee201Buttons() {

  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');

  // Trigger to send document id when it was called
  Employee201Navigator(receivedStringData);

  const addDataSheetForm = document.querySelector("#EducationForm");

  console.log("safsafs12312")


  addDataSheetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const employeeData = {
      Education_Details: {
        Elementary: {
          ElementarySchool: addDataSheetForm.elemSchoolName.value,
          ElementaryGrade: addDataSheetForm.elemGrade.value,
          ElementaryFrom: addDataSheetForm.elemFrom.value,
          ElementaryTo: addDataSheetForm.elemTo.value,
          ElementaryLevel: addDataSheetForm.elemHighestLevel.value,
          ElementaryScholarship: addDataSheetForm.elemScholarship.value,
        },
        Secondary: {
          SecondarySchool: addDataSheetForm.secondSchoolName.value,
          SecondaryGrade: addDataSheetForm.secondGrade.value,
          SecondaryFrom: addDataSheetForm.secondFrom.value,
          SecondaryTo: addDataSheetForm.secondTo.value,
          SecondaryLevel: addDataSheetForm.secondHighestLevel.value,
          SecondaryScholarship: addDataSheetForm.secondScholarship.value,
        },
        Vocational: {
          VocationalSchool: addDataSheetForm.vocationalSchoolName.value,
          VocationalGrade: addDataSheetForm.vocationalGrade.value,
          VocationalFrom: addDataSheetForm.vocationalFrom.value,
          VocationalTo: addDataSheetForm.vocationalTo.value,
          VocationalLevel: addDataSheetForm.vocationalHighestLevel.value,
          VocationalScholarship: addDataSheetForm.vocationalScholarship.value,
        },
        College: {
          CollegeSchool: addDataSheetForm.collegeSchoolName.value,
          CollegeGrade: addDataSheetForm.collegeGrade.value,
          CollegeFrom: addDataSheetForm.collegeFrom.value,
          CollegeTo: addDataSheetForm.collegeTo.value,
          CollegeLevel: addDataSheetForm.collegeHighestLevel.value,
          CollegeScholarship: addDataSheetForm.collegeScholarship.value,
        },
        Graduate: {
          GraduateSchool: addDataSheetForm.graduateSchoolName.value,
          GraduateGrade: addDataSheetForm.graduateGrade.value,
          GraduateFrom: addDataSheetForm.graduateFrom.value,
          GraduateTo: addDataSheetForm.graduateTo.value,
          GraduateLevel: addDataSheetForm.graduateHighestLevel.value,
          GraduateScholarship: addDataSheetForm.graduateScholarship.value,
        }
      }
    };

    // Saving to firestore
    AddEmployeeDataFirestore('#EducationForm', employeeData, receivedStringData)
  })



}

window.addEventListener('load', Employee201Buttons)


export function addEmployeeSignatureForm() {

  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');

  // Trigger to send document id when it was called
  Employee201Navigator(receivedStringData);

  const addSignatureForm = document.querySelector("#signatureForm");

  let URL;
  const storageRef = ref(storage, "Employee/Requirements");

  addSignatureForm.addEventListener('submit', (e) => {
    e.preventDefault();


    // Access the file input field
    const fileInput = document.getElementById('inputGroupFile01');
    const selectedFiles = fileInput.files;
    const firstSelectedFile = selectedFiles[0];  // Access the first file

    // Generate a unique filename using timestamp
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
    const fileRef = ref(storageRef, uniqueFilename);


    // Upload the file to Firebase Storage
    const uploadPromise = uploadBytes(fileRef, firstSelectedFile)
      .then((snapshot) => getDownloadURL(fileRef))
      .then((downloadURL) => {
        // declaring the url outside
        URL = downloadURL;
      }).then(() => {
        const employeeData = {
          EsignatureURL: URL,
        }
        AddEmployeeDataFirestore('#signatureForm', employeeData, receivedStringData)
      })
  })

}

window.addEventListener('load', addEmployeeSignatureForm)



export function fetchEmployeeData() {

  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');

  const TestcolRef = collection(db, 'User Account');
  const EmployeecolRef = collection(db, 'Employee Information');

  const empName = document.getElementById('profile_name_id')
  const empProfilePicture = document.getElementById('applicantProfilePic')

  // Retrieve the current document
  const url = new URL(window.location.href);
  const urlHref = url.href;

  FetchCurrentUser().then((current) => {
    console.log(current, 'current user');
    const Accountque = query(TestcolRef, where("userID", "==", current.uid));
    const Employeeque = query(EmployeecolRef, where("documentID", "==", receivedStringData));


    // for retrieving the current user
    onSnapshot(Accountque, (snapshot) => {
      snapshot.docs.forEach((accountdocData) => {
        const data = accountdocData.data();

        // for checking if the user is admin
        if (data.UserLevel === "Admin") {
          onSnapshot(Employeeque, (snapshot) => {
            snapshot.docs.forEach((docData) => {
              const data = docData.data();
              
              const fullname = `${data.Personal_Information.FirstName} ${data.Personal_Information.MiddleName} ${data.Personal_Information.SurName}`
              const ProfileURL = data.ProfilePictureURL;
              empName.innerHTML = fullname;
              empProfilePicture.src = ProfileURL

              var splitResult = urlHref.split('/dist/');
              console.log(splitResult, 'Hello')

              // Check if any string in the array contains 'datasheet.html'
              var isDataSheetPresent = splitResult.some(function (item) {
                return item.includes('datasheet.html');
              });

              // Check if any string in the array contains 'datasheet.html'
              var isOtherFilesPresent = splitResult.some(function (item) {
                return item.includes('OtherInfo-201file.html');
              });

              // Check if any string in the array contains 'datasheet.html'
              var isEducationPresent = splitResult.some(function (item) {
                return item.includes('Education-21Files.html');
              });

              // Check if any string in the array contains 'datasheet.html'
              var isSignaturePresent = splitResult.some(function (item) {
                return item.includes('signature-201file.html');
              });

              // Check if any string in the array contains 'datasheet.html'
              var isFilesPresent = splitResult.some(function (item) {
                return item.includes('files-201.html');
              });

              // Check the current document
              if (isDataSheetPresent) {
                console.log("PResents")
                const addDataSheetForm = document.querySelector("#employeeDataSheet");
                // Personal details
                addDataSheetForm.inputCsId.value = data.Personal_Information.CSCID
                addDataSheetForm.inputFirstName.value = data.Personal_Information.FirstName
                addDataSheetForm.inputMiddleName.value = data.Personal_Information.MiddleName
                addDataSheetForm.inputSurName.value = data.Personal_Information.SurName
                addDataSheetForm.inputExName.value = data.Personal_Information.ExName
                addDataSheetForm.gender.value = data.Personal_Information.Gender
                addDataSheetForm.Birthdate.value = data.Personal_Information.Birthdate
                addDataSheetForm.PlaceBirth.value = data.Personal_Information.PlaceBirth
                addDataSheetForm.inputStatus.value = data.Personal_Information.CivilStatus
                addDataSheetForm.inputEmail.value = data.Personal_Information.Email
                addDataSheetForm.inputMnumber.value = data.Personal_Information.MobileNumber
                addDataSheetForm.inputTel.value = data.Personal_Information.TelNum
                addDataSheetForm.inputHeight.value = data.Personal_Information.Height
                addDataSheetForm.inputWeight.value = data.Personal_Information.Height
                addDataSheetForm.InputGsis.value = data.Personal_Information.GSIS
                addDataSheetForm.InputPagibig.value = data.Personal_Information.PagIbig
                addDataSheetForm.inputPhealth.value = data.Personal_Information.PhilHealth
                addDataSheetForm.inputSSS.value = data.Personal_Information.SSS
                addDataSheetForm.inputTIN.value = data.Personal_Information.Tin
                addDataSheetForm.InputAgency.value = data.Personal_Information.Agency
                addDataSheetForm.citizenshipType.value = data.Personal_Information.Citizen
                addDataSheetForm.inputCountry.value = data.Personal_Information.Country
                addDataSheetForm.inputHouse.value = data.Personal_Information.HouseBlock
                addDataSheetForm.inputStreet.value = data.Personal_Information.Street
                addDataSheetForm.InputSub.value = data.Personal_Information.Subdivision
                addDataSheetForm.inputBarangay.value = data.Personal_Information.Barangay
                addDataSheetForm.inputMun.value = data.Personal_Information.Municipality
                addDataSheetForm.InputSub.value = data.Personal_Information.Subdivision
                addDataSheetForm.InputProv.value = data.Personal_Information.Province
                addDataSheetForm.inputZip.value = data.Personal_Information.ZipCode

                // Family Background
                // Spouse Details
                addDataSheetForm.inputSpouseFirstName.value = data.Personal_Information.SpouseFirstName
                addDataSheetForm.inputSpouseMiddleName.value = data.Personal_Information.SpouseMiddleName
                addDataSheetForm.inputSpouseSurName.value = data.Personal_Information.SpouseSurName
                addDataSheetForm.inputSpouseExName.value = data.Personal_Information.SpouseExName
                addDataSheetForm.inputSpouseOccupation.value = data.Personal_Information.SpouseOccupation
                addDataSheetForm.inputSpouseEmployer.value = data.Personal_Information.SpouseEmployer
                addDataSheetForm.inputSpouseBusinessAdd.value = data.Personal_Information.SpouseBusinessAdd
                addDataSheetForm.inputSpouseTelNo.value = data.Personal_Information.SpouseTelNum

                // Father Details
                addDataSheetForm.inputFatherFirstName.value = data.Personal_Information.FatherFirstName
                addDataSheetForm.inputFatherMiddleName.value = data.Personal_Information.MiddleName
                addDataSheetForm.inputFatherSurName.value = data.Personal_Information.FatherSurName
                addDataSheetForm.inputFatherExName.value = data.Personal_Information.FatherExName

                // Mother Details
                addDataSheetForm.inputMotherFirstName.value = data.Personal_Information.MotherFirstName
                addDataSheetForm.inputMotherMiddleName.value = data.Personal_Information.MotherMiddleName
                addDataSheetForm.inputMotherSurName.value = data.Personal_Information.MotherSurName
                addDataSheetForm.inputMotherMaiden.value = data.Personal_Information.MotherMaidenName

              } else if (isEducationPresent) {
                console.log("Nahanap ko")
                const addDataSheetForm = document.querySelector("#EducationForm");
                // Elementary Details
                addDataSheetForm.elemSchoolName.value = data.Education_Details.Elementary.ElementarySchool
                addDataSheetForm.elemGrade.value = data.Education_Details.Elementary.ElementaryGrade
                addDataSheetForm.elemFrom.value = data.Education_Details.Elementary.ElementaryFrom
                addDataSheetForm.elemTo.value = data.Education_Details.Elementary.ElementaryTo
                addDataSheetForm.elemHighestLevel.value = data.Education_Details.Elementary.ElementaryLevel
                addDataSheetForm.elemScholarship.value = data.Education_Details.Elementary.ElementaryScholarship

                // Secondary Details
                addDataSheetForm.secondSchoolName.value = data.Education_Details.Secondary.SecondarySchool
                addDataSheetForm.secondGrade.value = data.Education_Details.Secondary.SecondaryGrade
                addDataSheetForm.secondFrom.value = data.Education_Details.Secondary.SecondaryFrom
                addDataSheetForm.secondTo.value = data.Education_Details.Secondary.SecondaryTo
                addDataSheetForm.secondHighestLevel.value = data.Education_Details.Secondary.SecondaryLevel
                addDataSheetForm.secondScholarship.value = data.Education_Details.Secondary.SecondaryScholarship

                // Vocational Details
                addDataSheetForm.vocationalSchoolName.value = data.Education_Details.Vocational.VocationalSchool
                addDataSheetForm.vocationalGrade.value = data.Education_Details.Vocational.VocationalGrade
                addDataSheetForm.vocationalFrom.value = data.Education_Details.Vocational.VocationalFrom
                addDataSheetForm.vocationalTo.value = data.Education_Details.Vocational.VocationalTo
                addDataSheetForm.vocationalHighestLevel.value = data.Education_Details.Vocational.VocationalLevel
                addDataSheetForm.vocationalScholarship.value = data.Education_Details.Vocational.VocationalScholarship

                // College Details
                addDataSheetForm.collegeSchoolName.value = data.Education_Details.College.CollegeSchool
                addDataSheetForm.collegeGrade.value = data.Education_Details.College.CollegeGrade
                addDataSheetForm.collegeFrom.value = data.Education_Details.College.CollegeFrom
                addDataSheetForm.collegeTo.value = data.Education_Details.College.CollegeTo
                addDataSheetForm.collegeHighestLevel.value = data.Education_Details.College.CollegeLevel
                addDataSheetForm.collegeScholarship.value = data.Education_Details.College.CollegeScholarship

                // Graduate Details
                addDataSheetForm.graduateSchoolName.value = data.Education_Details.Graduate.GraduateSchool
                addDataSheetForm.graduateGrade.value = data.Education_Details.Graduate.GraduateGrade
                addDataSheetForm.graduateFrom.value = data.Education_Details.Graduate.GraduateFrom
                addDataSheetForm.graduateTo.value = data.Education_Details.Graduate.GraduateTo
                addDataSheetForm.graduateHighestLevel.value = data.Education_Details.Graduate.GraduateLevel
                addDataSheetForm.graduateScholarship.value = data.Education_Details.Graduate.GraduateScholarship

              } else if (isOtherFilesPresent) {

              } else if (isSignaturePresent) {
                // Access the file input field
                const fileInput = document.getElementById('fileInput');

                fileInput.innerHTML = data.EsignatureURL;

              } else if (isFilesPresent) {


              } else {
                console.log("No fields to be changed...")
              }



            })
          })


        } else {
          alert("This is for admin only...");
          console.log("This is for admin only...")
        }


      })
    })
  })

}


window.addEventListener('load', fetchEmployeeData)


export function SearchEmployee() {
  // Assuming you have an HTML form with id="employeeDataSheet"
  const addDataSheetForm = document.querySelector("#SearchEmployeeForm");
  const EmployeecolRef = collection(db, 'Employee Information');

  // Event listener for the form submission
  addDataSheetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const LastName = addDataSheetForm.inputLastName.value
    const FirstName = addDataSheetForm.inputFirstName.value
    const MiddleName = addDataSheetForm.inputMiddleName.value
    const ExtName = addDataSheetForm.inputExtName.value

    console.log(`Fullname:${LastName}${FirstName}${MiddleName}${ExtName}`)

    //alert(`Fullname:${LastName} ${FirstName} ${MiddleName} ${ExtName}`)

    const que = query(EmployeecolRef,
      where("Personal_Information.FirstName", "==", FirstName),
      where("Personal_Information.MiddleName", "==", MiddleName),
      where("Personal_Information.SurName", "==", LastName),
      where("Personal_Information.ExName", "==", ExtName)
    );

    // for retrieving the current user
    onSnapshot(que, (snapshot) => {
      snapshot.docs.forEach((docData) => {
        const data = docData.data();

        const employeeDocID = data.documentID;

        if (data) {
          console.log(data)
          alert("There was record retrieved.")



          window.location.href = `datasheet.html?data=${encodeURIComponent(employeeDocID)}`;

        } else {
          console.log("No record retrieved.")
        }
      })


    })
  })

}

window.addEventListener('load', SearchEmployee)