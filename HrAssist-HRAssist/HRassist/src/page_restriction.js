import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimestamp,
  getDoc, updateDoc, setDoc
} from 'firebase/firestore'

import { firebaseConfig } from './server.js'; 

const app = initializeApp(firebaseConfig)

const db = getFirestore()

export function UserLoginChecker(Account_UserID, User_Action) {
  
    //console.log(Account_UserID, 'page restriction pageeee ', User_Action)
  
    const TestcolRef = collection(db, 'User Account');
  
    const que = query(TestcolRef, where("userID", "==", Account_UserID))
  
    try {
      onSnapshot(que, (snapshot) => {
        let employees = [];
        snapshot.docs.forEach((doc) => {
          employees.push({ ...doc.data(), id: doc.id });
        });
        console.log(employees);
  
        if (employees.length > 0) {
          //console.log("User login...123");
          const userlevel = employees[0].UserLevel;

          // get the current path of user
          const currentPath = window.location.pathname; 

          if (userlevel === "Employee") {
            if (User_Action === "Login"){
                window.location.href = "employee_home.html";
            } else if (User_Action === "Browsing"){ 
                PageRestrictionMethod(currentPath, userlevel);
            }

          } else if (userlevel === "Applicant") {
            if (User_Action === "Login"){
                window.location.href = "index.html";
            } else if (User_Action === "Browsing"){ 
              PageRestrictionMethod(currentPath, userlevel);
            }

          } else if (userlevel === "Admin") {
            if (User_Action === "Login"){
                window.location.href = "admin_dashboard.html";
            } else if (User_Action === "Browsing"){ 
                PageRestrictionMethod(currentPath, userlevel); 
            }

          } else {
            PageRestrictionMethod(currentPath, "Guest");
          }
  
        } else {
          console.log("No user found")
        }



      });
  
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  

export function PageRestrictionMethod(currentPath, userLevel){
    
  var splitResult = currentPath.split('/dist/');
  var restOfTheCode = splitResult[1];
  currentPath = "/dist/" + restOfTheCode;

  console.log(currentPath)


  // lagay nyo dito lahat ng pages na exclusive lang for employees
  const Employee_Pages = [
    '/dist/employee_home.html',
    '/dist/employee_changepass.html',
    '/dist/employee_profile.html',
    '/dist/employee_contactus.html',

  ];
  
  // lagay nyo dito lahat ng pages na exclusive lang for admin or HR
  const Admin_Pages = [
    '/dist/admin_dashboard.html',
    '/dist/admin_manage_applicant_view.html',
  ];


  if (userLevel === "Applicant"){
    // Check if the currentPath is in the list of Applicant_Pages
    const isEmployee_Pages = Employee_Pages.includes(currentPath);
    const isAdmin_Pages = Admin_Pages.includes(currentPath);

    console.log(isAdmin_Pages)

    if (isEmployee_Pages || isAdmin_Pages) {
      // Perform actions for Employee or Admin pages
      console.log('This is not an Applicant page.');
      window.location.href = "index.html";
    } else {
      // Perform actions for other pages
      console.log('This is an Applicant page.');
    }
  }

  else if (userLevel === "Employee"){
    // Check if the currentPath is in the list of Applicant_Pages
    const isAdmin_Pages = Admin_Pages.includes(currentPath);


    if (isAdmin_Pages) {
      // Perform actions for other pages
      console.log('This is not an Employee page.');
      window.location.href = "employee_home.html";
    } else {
      // Perform actions for Applicant pages
      console.log('This is an Employee page.');
    }
  }

  else if (userLevel === "Admin"){
    // Check if the currentPath is in the list of Applicant_Pages 
    const isEmployee_Pages = Employee_Pages.includes(currentPath);

    console.log(isEmployee_Pages, "asfssafs");

    if (isEmployee_Pages) {
      // Perform actions for other pages
      console.log('This is not an Admin page.');
      window.location.href = "admin_dashboard.html";
    } else {
      // Perform actions for Applicant pages
      console.log('This is an Admin page.');
      
    }

  } else {
    // Check if the currentPath is in the list of Applicant_Pages
    const isEmployee_Pages = Employee_Pages.includes(currentPath);
    const isAdmin_Pages = Admin_Pages.includes(currentPath);

    if (isEmployee_Pages) {
      // Perform actions for Applicant pages
      console.log('This is not an Guest page.');
      window.location.href = "index.html";
    } else if (isAdmin_Pages) {
      console.log('This is not an Guest page.');
      window.location.href = "index.html";
    }  else {
      // Perform actions for other pages
      console.log('This is an Guest page.');
    }
  }

}
  

// Using URL object
const url = new URL(window.location.href);
console.log(url.href , "asfsa1123s"); 
  