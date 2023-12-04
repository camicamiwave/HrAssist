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

console.log("asfsffs123232")

function fetchEmployee() {
    const EmployeecolRef = collection(db, 'Employee Information');


    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('data');

    const tableBody = document.getElementById('ipcrfTable').getElementsByTagName('tbody')[0];

    tableBody.innerHTML = '';

    fetchEmployeeInfo(EmployeecolRef, receivedStringData, "documentID").then((dataRetrieved) => {
        const empdata = dataRetrieved;
        const file201DocID = empdata.documentID

        console.log(empdata, 'HOYYYY')
 
        inputCsId.innerHTML = empdata.Personal_Information.CSCID
        inputFname.innerHTML = empdata.Personal_Information.FirstName
        inputMname.innerHTML = empdata.Personal_Information.MiddleName
        inputLname.innerHTML = empdata.Personal_Information.SurName
        inputExtname.innerHTML = empdata.Personal_Information.ExName
        inputGender.innerHTML = empdata.Personal_Information.Gender
        inputBirthdate.innerHTML = empdata.Personal_Information.Birthdate
        inputPlaceBirth.innerHTML = empdata.Personal_Information.PlaceBirth
        inputCivilStatus.innerHTML = empdata.Personal_Information.CivilStatus
        inputEmail.innerHTML = empdata.Personal_Information.Email
        inputMobileNum.innerHTML = empdata.Personal_Information.MobileNumber
        inputTelephone.innerHTML = empdata.Personal_Information.TelNum
        inputHeight.innerHTML = empdata.Personal_Information.Height
        inputWeight.innerHTML = empdata.Personal_Information.Weight
        inputBloodType.innerHTML = empdata.Personal_Information.BloodType
        inputGSISID.innerHTML = empdata.Personal_Information.GSIS
        inputPAGIBIGID.innerHTML = empdata.Personal_Information.PagIbig
        inputPHILHEALTHID.innerHTML = empdata.Personal_Information.PhilHealth
        inputSSSID.innerHTML = empdata.Personal_Information.SSS
        inputTINID.innerHTML = empdata.Personal_Information.Tin
        inputAGENCYID.innerHTML = empdata.Personal_Information.Agency
        inputFilipino.innerHTML = empdata.Personal_Information.Citizen
        //inputDualCitizen.innerHTML = empdata.Personal_Information.Agency
        inputCountry.innerHTML = empdata.Personal_Information.Country
        inputHouseBlock.innerHTML = empdata.Personal_Information.HouseBlock
        inputStreet.innerHTML = empdata.Personal_Information.Street
        inputSubdivision.innerHTML = empdata.Personal_Information.Subdivision
        inputBarangay.innerHTML = empdata.Personal_Information.Barangay
        inputCity.innerHTML = empdata.Personal_Information.Municipality
        inputProvince.innerHTML = empdata.Personal_Information.Provine
        inputZipCode.innerHTML = empdata.Personal_Information.ZipCode

        inputSpouseFname.innerHTML = empdata.SpouseDetails.SpouseFirstName
        inputSpouseMname.innerHTML = empdata.SpouseDetails.SpouseMiddleName
        inputSpouseLname.innerHTML = empdata.SpouseDetails.SpouseSurName
        inputSpouseExtName.innerHTML = empdata.SpouseDetails.SpouseExName

        inputSpouseOccupation.innerHTML = empdata.SpouseDetails.SpouseOccupation
        inputSpouseEmployer.innerHTML = empdata.SpouseDetails.SpouseEmployer
        inputSpouseBusinessAd.innerHTML = empdata.SpouseDetails.SpouseBusinessAdd
        inputSpouseTelPhone.innerHTML = empdata.SpouseDetails.SpouseTelNum

        inputFatherFname.innerHTML = empdata.FatherDetails.FatherFirstName
        inputFatherMname.innerHTML = empdata.FatherDetails.FatherMiddleName
        inputFatherLname.innerHTML = empdata.FatherDetails.FatherSurName
        inputFatherExtName.innerHTML = empdata.FatherDetails.FatherExName

        inputMotherFname.innerHTML = empdata.MotherDetails.MotherFirstName
        inputMotherMname.innerHTML = empdata.MotherDetails.MotherMiddleName
        inputMotherLname.innerHTML = empdata.MotherDetails.MotherSurName
        inputMotherMaidenName.innerHTML = empdata.MotherDetails.MotherMaidenName

        // para sa children
        const childrenContainer = document.querySelector('.children-container');
        // Assuming empdata.ChildrenDetails is an array of child objects
        for (const child of empdata.ChildrenDetails) {
            const childDiv = document.createElement('div');
            childDiv.className = 'row';

            console.log(child, 'asf')

            const childFirstNameDiv = createLabelDiv('First Name: ', child.ChildrenFirstName);
            const childMiddleNameDiv = createLabelDiv('Middle Name: ', child.ChiildrenMiddleName);
            const childLastNameDiv = createLabelDiv('Last Name: ', child.ChiildrenSurName);
            const childExtNameDiv = createLabelDiv('ExtName: ', child.ChiildrenExName);

            childDiv.appendChild(childFirstNameDiv);
            childDiv.appendChild(childMiddleNameDiv);
            childDiv.appendChild(childLastNameDiv);
            childDiv.appendChild(childExtNameDiv);

            childrenContainer.appendChild(childDiv);
        }

        function createLabelDiv(labelText, content) {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-3';

            const label = document.createElement('label');
            label.className = 'small mb-1';
            label.innerHTML = `<b>${labelText}</b>`;
            colDiv.appendChild(label);

            const contentLabel = document.createElement('label');
            contentLabel.className = 'small mb-1';
            contentLabel.innerHTML = content;
            colDiv.appendChild(contentLabel);

            return colDiv;
        }

        // Educational Background
        elementarySchoolName.innerHTML = empdata.Education_Details.Elementary.ElementarySchool
        elementaryBasicDegree.innerHTML = empdata.Education_Details.Elementary.ElementaryGrade
        elementaryFrom.innerHTML = empdata.Education_Details.Elementary.ElementaryFrom
        elementaryTo.innerHTML = empdata.Education_Details.Elementary.ElementaryTo
        elementaryUnits.innerHTML = empdata.Education_Details.Elementary.ElementaryLevel
        elementaryScholar.innerHTML = empdata.Education_Details.Elementary.ElementaryScholarship
        
        secondaryHighSchool.innerHTML = empdata.Education_Details.Secondary.SecondarySchool
        secondaryBasicDegree.innerHTML = empdata.Education_Details.Secondary.SecondaryGrade 
        secondaryFrom.innerHTML = empdata.Education_Details.Secondary.SecondaryFrom
        secondaryTo.innerHTML = empdata.Education_Details.Secondary.SecondaryTo
        secondaryUnits.innerHTML = empdata.Education_Details.Secondary.SecondaryLevel
        secondaryScholar.innerHTML = empdata.Education_Details.Secondary.SecondaryScholarship
        
        seniorHighName.innerHTML = empdata.Education_Details.Vocational.VocationalSchool
        seniorHighDegree.innerHTML = empdata.Education_Details.Vocational.VocationalGrade 
        seniorHighFrom.innerHTML = empdata.Education_Details.Vocational.VocationalFrom
        seniorHighTo.innerHTML = empdata.Education_Details.Vocational.VocationalTo
        seniorHighUnits.innerHTML = empdata.Education_Details.Vocational.VocationalLevel
        seniorHighScholar.innerHTML = empdata.Education_Details.Vocational.VocationalScholarship
        
        collegeName.innerHTML = empdata.Education_Details.College.CollegeSchool
        collegeDegree.innerHTML = empdata.Education_Details.College.CollegeGrade 
        collegeFrom.innerHTML = empdata.Education_Details.College.CollegeFrom
        collegeTo.innerHTML = empdata.Education_Details.College.CollegeTo
        collegeUnits.innerHTML = empdata.Education_Details.College.CollegeLevel
        collegeScholar.innerHTML = empdata.Education_Details.College.CollegeScholarship

        graduteName.innerHTML = empdata.Education_Details.Graduate.GraduateSchool
        graduteDegree.innerHTML = empdata.Education_Details.Graduate.GraduateGrade 
        graduteFrom.innerHTML = empdata.Education_Details.Graduate.GraduateFrom
        graduteTo.innerHTML = empdata.Education_Details.Graduate.GraduateTo
        graduteUnits.innerHTML = empdata.Education_Details.Graduate.GraduateLevel
        graduteScholar.innerHTML = empdata.Education_Details.Graduate.GraduateScholarship




    })
}

window.addEventListener('load', fetchEmployee)

/*
function fetchEligibility(){

    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('data');

    const EmployeecolRef = collection(db, 'Employee Information')

    const tableBody = document.getElementById('eligibilityTable').getElementsByTagName('tbody')[0];

    const q = query(EmployeecolRef, where("documentID", "==", receivedStringData))

    onSnapshot(q, (snapshot) => {

        tableBody.innerHTML = '';

        snapshot.docs.forEach((empdoc) => {
            const data = empdoc.data();
            const id = empdoc.id;

            const eligibilityData = data.OtherInformation.CSC_Eligibility.Eligibility

            console.log(eligibilityData,' 123224')


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

                    
                    cell3.appendChild(viewButton);
                }
                
            }


        })
    })

}

window.addEventListener('load', fetchEligibility)
*/