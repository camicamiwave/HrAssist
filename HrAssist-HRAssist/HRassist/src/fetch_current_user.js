import Swal from 'sweetalert2';
import { initializeApp } from 'firebase/app';
import {
  getAuth, onAuthStateChanged, sendPasswordResetEmail, deleteUser
} from "firebase/auth";

import { firebaseConfig } from './server.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function FetchCurrentUser() {
  return new Promise((resolve, reject) => {
    // Listen for changes in authentication state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const currentUserID = user.uid;
        console.log("Current User UID:", currentUserID);
        resolve(currentUserID);
      } else {
        // No user is signed in
        console.log("No user is signed in.");
        resolve("None");
      }
    });
  });
}

export function ResetPassword123() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const userEmail = user.email;
        console.log("User Email:", userEmail);

        const applyBtn123 = document.getElementById('resetbtn');

        applyBtn123.addEventListener('click', function () {
          console.log("Reset button clicked");


          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: "btn btn-success",
              cancelButton: "btn btn-danger mr-4"
            },
            buttonsStyling: false
          });
          swalWithBootstrapButtons.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, reset it!",
            cancelButtonText: "No, cancel!",
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              swalWithBootstrapButtons.fire({
                title: "Confirm!",
                text: "Password reset email sent successfully.",
                icon: "success"
              }).then(() =>{
                  // Send a password reset email to the user's email address
                  sendPasswordResetEmail(auth, userEmail)
                  .then(() => {
                    // Password reset email sent successfully
                    console.log("Password reset email sent successfully.");
                    resolve("Email sent successfully");
                  })
                  .catch((error) => {
                    // Handle errors
                    console.error("Error sending password reset email:", error.code, error.message);
                    reject(`Error: ${error.message}`);
                  });
              })
            } else if (
              /* Read more about handling dismissals below */
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire({
                title: "Cancelled",
                text: "Your password doesn't change",
                icon: "error"
              });
            }
          });


          
        });

      } else {
        // No user is signed in
        console.log("No user is signed in.");
        resolve("None");
      }
    });
  });
}

window.addEventListener('load', () => {
  FetchCurrentUser().then(() => {
    ResetPassword123().then((result) => {
      console.log(result);
    }).catch((error) => {
      console.error(error);
    });
  });
});


export function DeleteUserAccount(){
  // Assuming you have a button with id 'deleteAccountBtn'
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');

  deleteAccountBtn.addEventListener('click', () => {
    
  const user = auth.currentUser;

  if (user) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire({
          title: "Deleted!",
          text: "Your account has been deleted.",
          icon: "success"
        })
        deleteUser(user)
        .then(() => {
          // Account deleted successfully
          console.log('Account deleted successfully.');
        })
        .catch((error) => {
          // Handle errors
          console.error('Error deleting account:', error.code, error.message);
        });

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your account is safe :)",
          icon: "error"
        });
      }
    });
      
  } else {
    // No user is signed in
    console.log('No user is signed in.');
  }
});
}

window.addEventListener('load', DeleteUserAccount)