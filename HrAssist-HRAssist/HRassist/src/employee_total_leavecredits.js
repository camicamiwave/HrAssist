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
import { FetchCurrentUser } from './employee_pass_slip.js';
import { fetchCurrentEmployee } from './employee_home.js';
import { fetchCurrentEmployeePersonalDetails } from './employee_home.js';

console.log("asfsafaqwwr")

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()


function fetchEmployeeLeaveCredits() {
    const TestcolRef = collection(db, 'User Account');
    const EmployeecolRef = collection(db, 'Employee Information');
    const File201colRef = collection(db, '201File Information');

    FetchCurrentUser().then((currentUserUID) => {
        const que = query(TestcolRef, where("userID", "==", currentUserUID));

        onSnapshot(que, (snapshot) => {
            snapshot.docs.forEach((accountdoc) => {
                const accountdata = accountdoc.data();
                const id = accountdoc.id;
                const accountDocID = accountdata.documentID;

                fetchEmployeeInfo(EmployeecolRef, accountDocID, "accountID").then((dataRetrieved) => {
                    const employee_data = dataRetrieved;
                    const employeeDocID = employee_data.documentID;

                    fetchEmployeeInfo(File201colRef, employeeDocID, "employeeDocID").then((dataRetrieved) => {
                        const file201_data = dataRetrieved;
                        const file201DocID = file201_data.documentID;

                        const employeeDocumentRef = doc(File201colRef, file201DocID);

                        // Reference to the nested collection within the document
                        const leaveCreditsCollectionRef = collection(employeeDocumentRef, 'Leave_Credits');
                        const file201query = query(leaveCreditsCollectionRef, where("LeaveCreditStatus", "==", "Present"));

                        console.log('hey', '1224212');

                        onSnapshot(file201query, (snapshot) => {
                            const dynamic_data = snapshot.docs.map((leavedoc) => {
                                const leaveCreditdata = leavedoc.data();

                                console.log(employee_data.Personal_Information.Gender, 'asfsaf')
                                if (employee_data.Personal_Information.Gender === "Male"){

                                    console.log("Hide vawc");
                                    document.getElementById('vawcleave').style.display = 'none';
                                    document.getElementById('maternityleave').style.display = 'none';
                                    document.getElementById('specialwomenleave').style.display = 'none';
                                    totalVacationLeave.innerHTML = leaveCreditdata.Leave_Credit['Vacation Leave'].RemainingUnits
                                    totalMandatoryLeave.innerHTML = leaveCreditdata.Leave_Credit['Mandatory/Forced Leave'].RemainingUnits
                                    totalMandatoryLeave.innerHTML = leaveCreditdata.Leave_Credit['Mandatory/Forced Leave'].RemainingUnits
                                    totalSickLeave.innerHTML = leaveCreditdata.Leave_Credit['Sick Leave'].RemainingUnits                                        
                                    //totalMaternityLeave.innerHTML = leaveCreditdata.Leave_Credit['Maternity Leave'].RemainingUnits
                                    totalSoloParentLeave.innerHTML = leaveCreditdata.Leave_Credit['Solo Parent Leave'].RemainingUnits
                                    totalPaternityLeave.innerHTML = leaveCreditdata.Leave_Credit['Paternity Leave'].RemainingUnits
                                    totalSpecialPrevilegeLeave.innerHTML = leaveCreditdata.Leave_Credit['Special Privilege Leave'].RemainingUnits
                                    //totalSpecialLeaveForWomen.innerHTML = leaveCreditdata.Leave_Credit['Special Leave Benefits for Women'].RemainingUnits
                                    totalStudyLeave.innerHTML = leaveCreditdata.Leave_Credit['Study Leave'].RemainingUnits
                                    //totalVAWCLeave.innerHTML = leaveCreditdata.Leave_Credit['10-Day VAWC Leave'].RemainingUnits
                                    totalRehabilitationLeave.innerHTML = leaveCreditdata.Leave_Credit['Rehabilitation Priviledge'].RemainingUnits
                                    totalSpecialEmergency.innerHTML = leaveCreditdata.Leave_Credit['Special Emergency (Calamity) Leave'].RemainingUnits
                                    totalRehabilitationLeave.innerHTML = leaveCreditdata.Leave_Credit['Rehabilitation Priviledge'].RemainingUnits

                                    if (leaveCreditdata.Leave_Credit['Monetization Leave'].RemainingUnits){
                                        totalMonetization.innerHTML = leaveCreditdata.Leave_Credit['Monetization Leave'].RemainingUnits
                                    }
                                    if (leaveCreditdata.Leave_Credit['Terminal Leave'].RemainingUnits){
                                        totalSpecialEmergency.innerHTML = leaveCreditdata.Leave_Credit['Terminal Leave'].RemainingUnits
                                    }
                                    
                                    if (leaveCreditdata.Leave_Credit['Adoption Leave'].RemainingUnits){
                                        totalAdoptionLeave.innerHTML = leaveCreditdata.Leave_Credit['Adoption Leave'].RemainingUnits
                                    }
                                    
                                } else if (employee_data.Personal_Information.Gender === "Female"){
                                    console.log("Hide paternityleave");
                                    document.getElementById('paternityleave').style.display = 'none';
                                    totalVacationLeave.innerHTML = leaveCreditdata.Leave_Credit['Vacation Leave'].RemainingUnits
                                    totalMandatoryLeave.innerHTML = leaveCreditdata.Leave_Credit['Mandatory/Forced Leave'].RemainingUnits
                                    //totalMandatoryLeave.innerHTML = leaveCreditdata.Leave_Credit['Mandatory/Forced Leave'].RemainingUnits
                                    totalSickLeave.innerHTML = leaveCreditdata.Leave_Credit['Sick Leave'].RemainingUnits                                        
                                    totalMaternityLeave.innerHTML = leaveCreditdata.Leave_Credit['Maternity Leave'].RemainingUnits
                                    totalSoloParentLeave.innerHTML = leaveCreditdata.Leave_Credit['Solo Parent Leave'].RemainingUnits
                                    //totalPaternityLeave.innerHTML = leaveCreditdata.Leave_Credit['Paternity Leave'].RemainingUnits
                                    totalSpecialPrevilegeLeave.innerHTML = leaveCreditdata.Leave_Credit['Special Privilege Leave'].RemainingUnits
                                    totalSpecialLeaveForWomen.innerHTML = leaveCreditdata.Leave_Credit['Special Leave Benefits for Women'].RemainingUnits
                                    totalStudyLeave.innerHTML = leaveCreditdata.Leave_Credit['Study Leave'].RemainingUnits
                                    totalVAWCLeave.innerHTML = leaveCreditdata.Leave_Credit['10-Day VAWC Leave'].RemainingUnits
                                    totalRehabilitationLeave.innerHTML = leaveCreditdata.Leave_Credit['Rehabilitation Priviledge'].RemainingUnits
                                    totalSpecialEmergency.innerHTML = leaveCreditdata.Leave_Credit['Special Emergency (Calamity) Leave'].RemainingUnits
                                    totalRehabilitationLeave.innerHTML = leaveCreditdata.Leave_Credit['Rehabilitation Priviledge'].RemainingUnits

                                    if (leaveCreditdata.Leave_Credit['Monetization Leave'].RemainingUnits){
                                        totalMonetization.innerHTML = leaveCreditdata.Leave_Credit['Monetization Leave'].RemainingUnits
                                    }
                                    if (leaveCreditdata.Leave_Credit['Terminal Leave'].RemainingUnits){
                                        totalSpecialEmergency.innerHTML = leaveCreditdata.Leave_Credit['Terminal Leave'].RemainingUnits
                                    }
                                    
                                    if (leaveCreditdata.Leave_Credit['Adoption Leave'].RemainingUnits){
                                        totalAdoptionLeave.innerHTML = leaveCreditdata.Leave_Credit['Adoption Leave'].RemainingUnits
                                    }
                                }
                                
                            });

                            // Update the ECharts configuration with the dynamic data
                            const updatedOption = {
                                series: [{
                                    data: dynamic_data.flat() // Flatten the array
                                }]
                            };

                            // Set the updated configuration
                            trafficChart.setOption(updatedOption);
                        });
                    });
                });
            });
        });
    });
}

window.addEventListener('load', fetchEmployeeLeaveCredits)