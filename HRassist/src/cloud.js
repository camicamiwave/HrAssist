import { getStorage, ref, getDownloadURL,  uploadBytes } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import {firebaseConfig} from './server.js';
import { 
  getFirestore, collection, onSnapshot, 
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimestamp,
  getDoc, updateDoc, setDoc
} from 'firebase/firestore'


const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
    
export function FetchCloudStorage(){
    
    const storageRef = ref(storage, 'requirements/bcert.png');
    
    getDownloadURL(storageRef)
      .then((url) => {
        
        console.log('Download URL:', url); 
        
        
        
      })
      .catch((error) => {
        console.error('Error getting download URL:', error);
        console.log('Catch block executed');
      });
}

function addDataToCloudStorage(formId, storagePath) {

  const db = getFirestore()

  const colRef = collection(db, 'Test')

  // Assuming storage is properly initialized
  const storageRef = ref(storage, storagePath);

  // Get the form element using the formId
  const form = document.getElementById(formId);

  // Event listener for form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevents the default form submission

    // Get the file input element within the form
    const fileInput = form.querySelector('input[type="file"]');
    const selectedFile = fileInput.files[0];

    if (selectedFile) {
      // Create a reference to the file in Cloud Storage
      const fileRef = ref(storageRef, selectedFile.name);

      // Upload the file to Cloud Storage
      uploadBytes(fileRef, selectedFile)
        .then((snapshot) => {
          console.log('Uploaded a blob or file!');

          // Get the download URL of the uploaded file
          getDownloadURL(fileRef)
            .then((downloadURL) => {
              console.log('Download URL:', downloadURL);
              
              const addDtrForm = document.querySelector("#dtr_form"); 
              // Data to be added to Firestore
              const data = {
                test: addDtrForm.test.value,
                test1: addDtrForm.test1.value,
                url: downloadURL, 
                createdAt: serverTimestamp()
              };

              // Add data to Firestore with an automatically generated ID
              addDoc(colRef, data)
                .then((docRef) => {
                  const customDocId = docRef.id;
                  // Update the document with the custom ID
                  return setDoc(doc(colRef, customDocId), { documentID: customDocId }, { merge: true });
                })
                .then(() => {
                  addDtrForm.reset();
                  console.log("Added employee successfully...");
                })
                .catch(error => console.error('Error adding document:', error));
              

                
            })
            .catch((error) => {
              console.error('Error getting download URL:', error);
            });
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    } else {
      console.error('No file selected');
    }
  });
}


export function FetchCloudStorage1(fileURL){
    
  const storageRef = ref(storage, fileURL);
  
  getDownloadURL(storageRef)
    .then((url) => {
      
      console.log('Download URL:', url); 
      
    })
    .catch((error) => {
      console.error('Error getting download URL:', error);
      console.log('Catch block executed');
    });
}

FetchCloudStorage1("https://firebasestorage.googleapis.com/v0/b/hrassist-lgusanvicente.appspot.com/o/applicant%2Frequirements%2Fform138.png?alt=media&token=83969eaf-c3ff-44f4-a07b-4bdeb290181b")


function addDataToCloudStorage1(formId, storagePath) {
  const db = getFirestore();
  const colRef = collection(db, 'Test');
  const storageRef = ref(storage, storagePath);

  const form = document.getElementById(formId);

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const fileInput = form.querySelector('input[type="file"]');
    const selectedFiles = fileInput.files;

    if (selectedFiles.length > 0) {
      const addDtrForm = document.querySelector("#dtr_form"); // Declare it here

      const uploadPromises = [];
      const fileNeedUpload = [];
      const fileURL = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const selectedFile = selectedFiles[i];
        
        // Generate a unique filename by appending a timestamp
        const timestamp = new Date().getTime();
        const uniqueFilename = `${timestamp}_${selectedFile.name}`;

        const fileRef = ref(storageRef, uniqueFilename);

        const uploadPromise = uploadBytes(fileRef, selectedFile)
          .then((snapshot) => getDownloadURL(fileRef))
          .then((downloadURL) => {
            
              fileURL.push(downloadURL);

          });

        uploadPromises.push(uploadPromise);
        fileNeedUpload.push(selectedFile);
      }
      

      Promise.all(uploadPromises)
        .then(() => {

          const data = {
            test: addDtrForm.test.value,
            test1: addDtrForm.test1.value,
            //url: downloadURL,
            createdAt: serverTimestamp(),
          };

          for (let i = 0; i < fileURL.length; i++) {
            data[`file${i + 1}`] = fileURL[i]; // Add each fileURL content to data
          }

          // Add data to Firestore with an automatically generated ID
          addDoc(colRef, data)
          .then((docRef) => {
            const customDocId = docRef.id;
            // Update the document with the custom ID
            return setDoc(doc(colRef, customDocId), { documentID: customDocId }, { merge: true });
          })
          .then(() => {
            addDtrForm.reset();
            console.log("Added employee successfully...");
          })
          .catch(error => console.error('Error adding document:', error));
        
        })
        .catch((error) => console.error('Error adding document:', error));
    } else {
      console.error('No file selected');
    }
  });
}


// Call the function with the form id and storage path
addDataToCloudStorage1('dtr_form', 'applicant/req');