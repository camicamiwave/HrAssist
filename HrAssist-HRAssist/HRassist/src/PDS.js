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
  try{
    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('data');
  
    // Trigger to send document id when it was called
    Employee201Navigator(receivedStringData);
  
    const addDataSheetForm = document.querySelector("#EducationForm");
  
    addDataSheetForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const employeeData = {
        Education_Details: {
          Elementary: {
            ElementarySchool: addDataSheetForm.elemSchoolName.value.trim(),
            ElementaryGrade: addDataSheetForm.elemGrade.value.trim(),
            ElementaryFrom: addDataSheetForm.elemFrom.value.trim(),
            ElementaryTo: addDataSheetForm.elemTo.value.trim(),
            ElementaryLevel: addDataSheetForm.elemHighestLevel.value.trim(),
            ElementaryScholarship: addDataSheetForm.elemScholarship.value.trim(),
          },
          Secondary: {
            SecondarySchool: addDataSheetForm.secondSchoolName.value.trim(),
            SecondaryGrade: addDataSheetForm.secondGrade.value.trim(),
            SecondaryFrom: addDataSheetForm.secondFrom.value.trim(),
            SecondaryTo: addDataSheetForm.secondTo.value.trim(),
            SecondaryLevel: addDataSheetForm.secondHighestLevel.value.trim(),
            SecondaryScholarship: addDataSheetForm.secondScholarship.value.trim(),
          },
          Vocational: {
            VocationalSchool: addDataSheetForm.vocationalSchoolName.value.trim(),
            VocationalGrade: addDataSheetForm.vocationalGrade.value.trim(),
            VocationalFrom: addDataSheetForm.vocationalFrom.value.trim(),
            VocationalTo: addDataSheetForm.vocationalTo.value.trim(),
            VocationalLevel: addDataSheetForm.vocationalHighestLevel.value.trim(),
            VocationalScholarship: addDataSheetForm.vocationalScholarship.value.trim(),
          },
          College: {
            CollegeSchool: addDataSheetForm.collegeSchoolName.value.trim(),
            CollegeGrade: addDataSheetForm.collegeGrade.value.trim(),
            CollegeFrom: addDataSheetForm.collegeFrom.value.trim(),
            CollegeTo: addDataSheetForm.collegeTo.value.trim(),
            CollegeLevel: addDataSheetForm.collegeHighestLevel.value.trim(),
            CollegeScholarship: addDataSheetForm.collegeScholarship.value.trim(),
          },
          Graduate: {
            GraduateSchool: addDataSheetForm.graduateSchoolName.value.trim(),
            GraduateGrade: addDataSheetForm.graduateGrade.value.trim(),
            GraduateFrom: addDataSheetForm.graduateFrom.value.trim(),
            GraduateTo: addDataSheetForm.graduateTo.value.trim(),
            GraduateLevel: addDataSheetForm.graduateHighestLevel.value.trim(),
            GraduateScholarship: addDataSheetForm.graduateScholarship.value.trim(),
          }
        }
      };
  
      // Saving to firestore
      AddEmployeeDataFirestore('#EducationForm', employeeData, receivedStringData)
    })
  } catch {
    console.log("Not Education form")

  }



}

window.addEventListener('load', Employee201Buttons)

export function Add201OtherInfo(){
  const TestcolRef = collection(db, 'User Account');

  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');

  const addOtherInfoForm = document.getElementById("otherInfoSubmitBtn");

  let customDocId; // Declare customDocId outside the then block

  addOtherInfoForm.addEventListener('click', (e) => {
    e.preventDefault();
  
    const OtherInformationData = {
      OtherInformation: {
        CSC_Eligibility: {
          Eligibility: {
                          EligibilityName: document.getElementById(`EmpEligibility`).value.trim(),
                          Rating: document.getElementById(`EmpRating`).value.trim(),
                          BasicDegree: document.getElementById(`EmpBasicDegree`).value.trim(),
                          ExamDate: document.getElementById(`EmpExamDate`).value.trim(),
                          ExamPlace: document.getElementById(`EmpExamPlace`).value.trim(),
                          HighestLevel: document.getElementById(`EmpHighestLevel`).value.trim(),
                          Scholarship: document.getElementById(`EmpScholarship`).value.trim(),
                          LicenseNumber: document.getElementById(`EmpLicenseNumber`).value.trim(),
                          LicenseDate: document.getElementById(`EmpLicenseDate`).value.trim(),}  
                        },
        WorkExperience: {
          WorkExperienceDetails: {
            WorkName: document.getElementById(`WorkName`).value.trim(),
            WorkFrom: document.getElementById(`WorkFrom`).value.trim(),
            WorkTo: document.getElementById(`WorkTo`).value.trim(),
            WorkNumHours: document.getElementById(`WorkNumHours`).value.trim(),
            WorkPosition: document.getElementById(`WorkPosition`).value.trim()
          } 
        },
        LearingDevelopment: {
          LearingDevelopmentDetails: {
            LearningTitle: document.getElementById(`LearningTitle`).value.trim(),
            LearningFrom: document.getElementById(`LearningFrom`).value.trim(),
            LearningTo: document.getElementById(`LearningTo`).value.trim(),
            LearningHours: document.getElementById(`LearningHours`).value.trim(),
            LearningLD: document.getElementById(`LearningLD`).value.trim(), 
            LearningSponsored: document.getElementById(`LearningSponsored`).value.trim(),  
          } 
        },
        SpecialSkills: {
          SpecialSkillDetails: {        
            LearningTitle: document.getElementById(`SpecialSkillsHobies`).value.trim(),
          }
        },
        AcademicDistinction: {
          AcademicDistinctionDetails: {        
            AcademicDistinctionName: document.getElementById(`AcademicName`).value.trim(),
          }
        },
        Organization: {
          OrganizationDetails: {
            LearningTitle: document.getElementById(`OrgMember`).value.trim(),
          }
        },
        Other_Information: {
          RadioThirdDegree: document.getElementById(`RadioThirdDegree`).value.trim(),
          RadioFourthDegree: document.getElementById(`RadioFourthDegree`).value.trim(),
          DegreeSpecify: document.getElementById(`DegreeSpecify`).value.trim(),
          Guilty: document.getElementById(`GuiltyID`).value.trim(),
          GuiltySpecify: document.getElementById(`GuiltyID`).value.trim(),
          CriminalRecord: document.getElementById(`CriminalRecord`).value.trim(),
          CriminalRecordSpecify: document.getElementById(`CriminalRecordSpecify`).value.trim(),
          CountryResidence: document.getElementById(`CountryResidence`).value.trim(),
          CountryResidenceSpecify: document.getElementById(`CountryResidenceSpecify`).value.trim(),
          Indigenous: document.getElementById(`Indigenous`).value.trim(),
          IndigenousSpecify: document.getElementById(`IndigenousSpecify`).value.trim(),
          Disability: document.getElementById(`Disability`).value.trim(),
          DisabilitySpecify: document.getElementById(`DisabilitySpecify`).value.trim(),
          SoloParent: document.getElementById(`SoloParent`).value.trim(),
          SoloParentSpecify: document.getElementById(`SoloParentSpecify`).value.trim(),
        },
        References: {
          ReferencesDetails: {
            ReferenceName: document.getElementById(`ReferenceName`).value.trim(),
            ReferenceAddress: document.getElementById(`ReferenceAddress`).value.trim(),
            ReferenceTellNo: document.getElementById(`ReferenceTellNo`).value.trim(),
          }
        }
      }
    }

    // Eligibilityyyyy
    const EligibilityIDS = numberOfIds;
    
    for (let i = 1; i < EligibilityIDS; i++) { 
      const eligibilityData = {
        EligibilityName: document.getElementById(`EmpEligibility${i}`).value.trim(),
        Rating: document.getElementById(`EmpRating${i}`).value.trim(),
        BasicDegree: document.getElementById(`EmpBasicDegree${i}`).value.trim(),
        ExamDate: document.getElementById(`EmpExamDate${i}`).value.trim(),
        ExamPlace: document.getElementById(`EmpExamPlace${i}`).value.trim(),
        HighestLevel: document.getElementById(`EmpHighestLevel${i}`).value.trim(),
        Scholarship: document.getElementById(`EmpScholarship${i}`).value.trim(),
        LicenseNumber: document.getElementById(`EmpLicenseNumber${i}`).value.trim(),
        LicenseDate: document.getElementById(`EmpLicenseDate${i}`).value.trim()
      };
    
      // Create a key for each eligibility and add the data
      OtherInformationData.OtherInformation.CSC_Eligibility[`Eligibility${i}`] = eligibilityData;

    }

    // Work Experience
    const WorkExpIDS = WorknumberOfIds;
    for (let i = 1; i < WorkExpIDS; i++) { 
      const workExpData = {
        WorkName: document.getElementById(`WorkName${i}`).value.trim(),
        WorkFrom: document.getElementById(`WorkFrom${i}`).value.trim(),
        WorkTo: document.getElementById(`WorkTo${i}`).value.trim(),
        WorkNumHours: document.getElementById(`WorkNumHours${i}`).value.trim(),
        WorkPosition: document.getElementById(`WorkPosition${i}`).value.trim(), 
      };
    
      // Create a key for each eligibility and add the data
      OtherInformationData.OtherInformation.WorkExperience[`WorkExperienceDetails${i}`] = workExpData;

    }

    const LearningIDS = LearningnumberOfIds;
    for (let i = 1; i < LearningIDS; i++) { 
      const LeaningData = {
        LearningTitle: document.getElementById(`LearningTitle${i}`).value.trim(),
        LearningFrom: document.getElementById(`LearningFrom${i}`).value.trim(),
        LearningTo: document.getElementById(`LearningTo${i}`).value.trim(),
        LearningHours: document.getElementById(`LearningHours${i}`).value.trim(),
        LearningLD: document.getElementById(`LearningLD${i}`).value.trim(), 
        LearningSponsored: document.getElementById(`LearningSponsored${i}`).value.trim(),
      };
    
      // Create a key for each eligibility and add the data
      OtherInformationData.OtherInformation.LearingDevelopment[`LearingDevelopmentDetails${i}`] = LeaningData;

    }

    const SpecialSkillIDS = SkillsID;

    for (let i = 1; i < SpecialSkillIDS; i++) { 
      const SpecialSkillDets = {
        LearningTitle: document.getElementById(`LearningTitle${i}`).value.trim(),
      };
    
      // Create a key for each eligibility and add the data
      OtherInformationData.OtherInformation.SpecialSkills[`SpecialSkillDetails${i}`] = SpecialSkillDets;
    }

    const AcademicID = SkillsID;

    for (let i = 1; i < AcademicID; i++) { 
      const AcademicDets = {
        AcademicName: document.getElementById(`AcademicName${i}`).value.trim(),
      };
    
      // Create a key for each eligibility and add the data
      OtherInformationData.OtherInformation.AcademicDistinction[`AcademicDetail${i}`] = AcademicDets;
    }

    const OrgID = OrganizationID;

    for (let i = 1; i < OrgID; i++) { 
      const OrganizationDets = {
        LearningTitle: document.getElementById(`OrgMember${i}`).value.trim(),
      };
    
      // Create a key for each eligibility and add the data
      OtherInformationData.OtherInformation.AcademicDistinction[`AcademicDetail${i}`] = OrganizationDets;
    }

    
    const ReferenceID = ReferenceNameID;

    for (let i = 1; i < ReferenceID; i++) { 
      const ReferencesDets = {
        ReferenceName: document.getElementById(`ReferenceName${i}`).value.trim(),
        ReferenceAddress: document.getElementById(`ReferenceAddress${i}`).value.trim(),
        ReferenceTellNo: document.getElementById(`ReferenceTellNo${i}`).value.trim(),
      };
    
      // Create a key for each eligibility and add the data
      OtherInformationData.OtherInformation.References[`ReferencesDets${i}`] = ReferencesDets;
    }

    console.log(OtherInformationData)


    // Saving to firestore
    AddEmployeeDataFirestore('', OtherInformationData, receivedStringData)
    
  })

}

window.addEventListener('load', Add201OtherInfo)



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
                addDataSheetForm.inputCsId.value = data.Personal_Information.CSCID.trim()
                addDataSheetForm.inputFirstName.value = data.Personal_Information.FirstName.trim()
                addDataSheetForm.inputMiddleName.value = data.Personal_Information.MiddleName.trim()
                addDataSheetForm.inputSurName.value = data.Personal_Information.SurName.trim()
                addDataSheetForm.inputExName.value = data.Personal_Information.ExName.trim()
                addDataSheetForm.gender.value = data.Personal_Information.Gender.trim()
                addDataSheetForm.Birthdate.value = data.Personal_Information.Birthdate.trim()
                addDataSheetForm.PlaceBirth.value = data.Personal_Information.PlaceBirth.trim()
                addDataSheetForm.inputStatus.value = data.Personal_Information.CivilStatus.trim()
                addDataSheetForm.inputEmail.value = data.Personal_Information.Email.trim()
                addDataSheetForm.inputMnumber.value = data.Personal_Information.MobileNumber.trim()
                addDataSheetForm.inputTel.value = data.Personal_Information.TelNum.trim()
                addDataSheetForm.inputHeight.value = data.Personal_Information.Height.trim()
                addDataSheetForm.inputWeight.value = data.Personal_Information.Height.trim()
                addDataSheetForm.InputGsis.value = data.Personal_Information.GSIS.trim()
                addDataSheetForm.InputPagibig.value = data.Personal_Information.PagIbig.trim()
                addDataSheetForm.inputPhealth.value = data.Personal_Information.PhilHealth.trim()
                addDataSheetForm.inputSSS.value = data.Personal_Information.SSS.trim()
                addDataSheetForm.inputTIN.value = data.Personal_Information.Tin.trim()
                addDataSheetForm.InputAgency.value = data.Personal_Information.Agency.trim()
                addDataSheetForm.citizenshipType.value = data.Personal_Information.Citizen.trim()
                addDataSheetForm.inputCountry.value = data.Personal_Information.Country.trim()
                addDataSheetForm.inputHouse.value = data.Personal_Information.HouseBlock.trim()
                addDataSheetForm.inputStreet.value = data.Personal_Information.Street.trim()
                addDataSheetForm.InputSub.value = data.Personal_Information.Subdivision.trim()
                addDataSheetForm.inputBarangay.value = data.Personal_Information.Barangay.trim()
                addDataSheetForm.inputMun.value = data.Personal_Information.Municipality.trim()
                addDataSheetForm.InputSub.value = data.Personal_Information.Subdivision.trim()
                addDataSheetForm.InputProv.value = data.Personal_Information.Province.trim()
                addDataSheetForm.inputZip.value = data.Personal_Information.ZipCode.trim()

                // Family Background
                // Spouse Details
                addDataSheetForm.inputSpouseFirstName.value = data.Personal_Information.SpouseFirstName.trim()
                addDataSheetForm.inputSpouseMiddleName.value = data.Personal_Information.SpouseMiddleName.trim()
                addDataSheetForm.inputSpouseSurName.value = data.Personal_Information.SpouseSurName.trim()
                addDataSheetForm.inputSpouseExName.value = data.Personal_Information.SpouseExName.trim()
                addDataSheetForm.inputSpouseOccupation.value = data.Personal_Information.SpouseOccupation.trim()
                addDataSheetForm.inputSpouseEmployer.value = data.Personal_Information.SpouseEmployer.trim()
                addDataSheetForm.inputSpouseBusinessAdd.value = data.Personal_Information.SpouseBusinessAdd.trim()
                addDataSheetForm.inputSpouseTelNo.value = data.Personal_Information.SpouseTelNum.trim()
                .trim()
                // Father Details
                addDataSheetForm.inputFatherFirstName.value = data.Personal_Information.FatherFirstName.trim()
                addDataSheetForm.inputFatherMiddleName.value = data.Personal_Information.MiddleName.trim()
                addDataSheetForm.inputFatherSurName.value = data.Personal_Information.FatherSurName.trim()
                addDataSheetForm.inputFatherExName.value = data.Personal_Information.FatherExName.trim()

                // Mother Details
                addDataSheetForm.inputMotherFirstName.value = data.Personal_Information.MotherFirstName.trim()
                addDataSheetForm.inputMotherMiddleName.value = data.Personal_Information.MotherMiddleName.trim()
                addDataSheetForm.inputMotherSurName.value = data.Personal_Information.MotherSurName.trim()
                addDataSheetForm.inputMotherMaiden.value = data.Personal_Information.MotherMaidenName.trim()

              } else if (isEducationPresent) {
                console.log("Nahanap ko")
                const addDataSheetForm = document.querySelector("#EducationForm");
                // Elementary Details
                addDataSheetForm.elemSchoolName.value = data.Education_Details.Elementary.ElementarySchool.trim()
                addDataSheetForm.elemGrade.value = data.Education_Details.Elementary.ElementaryGrade.trim()
                addDataSheetForm.elemFrom.value = data.Education_Details.Elementary.ElementaryFrom.trim()
                addDataSheetForm.elemTo.value = data.Education_Details.Elementary.ElementaryTo.trim()
                addDataSheetForm.elemHighestLevel.value = data.Education_Details.Elementary.ElementaryLevel.trim()
                addDataSheetForm.elemScholarship.value = data.Education_Details.Elementary.ElementaryScholarship.trim()

                // Secondary Details
                addDataSheetForm.secondSchoolName.value = data.Education_Details.Secondary.SecondarySchool.trim()
                addDataSheetForm.secondGrade.value = data.Education_Details.Secondary.SecondaryGrade.trim()
                addDataSheetForm.secondFrom.value = data.Education_Details.Secondary.SecondaryFrom.trim()
                addDataSheetForm.secondTo.value = data.Education_Details.Secondary.SecondaryTo.trim()
                addDataSheetForm.secondHighestLevel.value = data.Education_Details.Secondary.SecondaryLevel.trim()
                addDataSheetForm.secondScholarship.value = data.Education_Details.Secondary.SecondaryScholarship.trim()

                // Vocational Details
                addDataSheetForm.vocationalSchoolName.value = data.Education_Details.Vocational.VocationalSchool.trim()
                addDataSheetForm.vocationalGrade.value = data.Education_Details.Vocational.VocationalGrade.trim()
                addDataSheetForm.vocationalFrom.value = data.Education_Details.Vocational.VocationalFrom.trim()
                addDataSheetForm.vocationalTo.value = data.Education_Details.Vocational.VocationalTo.trim()
                addDataSheetForm.vocationalHighestLevel.value = data.Education_Details.Vocational.VocationalLevel.trim()
                addDataSheetForm.vocationalScholarship.value = data.Education_Details.Vocational.VocationalScholarship.trim()

                // College Details
                addDataSheetForm.collegeSchoolName.value = data.Education_Details.College.CollegeSchool.trim()
                addDataSheetForm.collegeGrade.value = data.Education_Details.College.CollegeGrade.trim()
                addDataSheetForm.collegeFrom.value = data.Education_Details.College.CollegeFrom.trim()
                addDataSheetForm.collegeTo.value = data.Education_Details.College.CollegeTo.trim()
                addDataSheetForm.collegeHighestLevel.value = data.Education_Details.College.CollegeLevel.trim()
                addDataSheetForm.collegeScholarship.value = data.Education_Details.College.CollegeScholarship.trim()

                // Graduate Details
                addDataSheetForm.graduateSchoolName.value = data.Education_Details.Graduate.GraduateSchool.trim()
                addDataSheetForm.graduateGrade.value = data.Education_Details.Graduate.GraduateGrade.trim()
                addDataSheetForm.graduateFrom.value = data.Education_Details.Graduate.GraduateFrom.trim()
                addDataSheetForm.graduateTo.value = data.Education_Details.Graduate.GraduateTo.trim()
                addDataSheetForm.graduateHighestLevel.value = data.Education_Details.Graduate.GraduateLevel.trim()
                addDataSheetForm.graduateScholarship.value = data.Education_Details.Graduate.GraduateScholarship.trim()

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
          alert("There was record retrieved.")

          console.log("No record retrieved.")
        }
      })


    })
  })

}

window.addEventListener('load', SearchEmployee)

// ------> Other Information <---------------------------------------------------


