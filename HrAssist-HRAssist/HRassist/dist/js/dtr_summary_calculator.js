function RequiredTimeSelector() {
    // Kunin ang elements
    const requiredSelector = document.getElementById('requiredSelector');
    const atndRequired = document.getElementById('atndRequired'); // Baguhin ang pangalan mula sa "noATTND" patungo sa "atndRequired"
    const actualWorkHours = document.getElementById('actualWorkHours');
    const dtrSummaryForm = document.querySelector('#dtrSummaryForm');

    // Function to update atndRequired based on actualWorkHours
    function updateAtndRequired() {
        switch (true) {
            case (actualWorkHours.value >= 33 && actualWorkHours.value <= 40):
                atndRequired.value = '5/5';
                break;
            case (actualWorkHours.value >= 25 && actualWorkHours.value <= 32):
                atndRequired.value = '5/4';
                break;
            case (actualWorkHours.value >= 17 && actualWorkHours.value <= 24):
                atndRequired.value = '5/3';
                break;
            case (actualWorkHours.value >= 9 && actualWorkHours.value <= 16):
                atndRequired.value = '5/2';
                break;
            case (actualWorkHours.value >= 0 && actualWorkHours.value <= 8):
                atndRequired.value = '5/1';
                break;
            // Iba pang kaso na gusto mo i-handle
            default:
                atndRequired.value = ''; // O i-set ang desired default value
                break;
        }
    }

    // Event listener for requiredSelector change
    requiredSelector.addEventListener('change', function () {
        const selectedValue = parseInt(requiredSelector.value, 10);
        console.log('Selected Value:', selectedValue);

        // I-update ang value ng input base sa piniling value
        switch (selectedValue) {
            case 40:
                actualWorkHours.value = 40;
                break;
            case 32:
                actualWorkHours.value = 32;
                break;
            case 24:
                actualWorkHours.value = 24;
                break;
            case 16:
                actualWorkHours.value = 16;
                break;
            case 8:
                actualWorkHours.value = 8;
                break;
            default:
                // Iba pang default value kung kinakailangan
                break;
        }

        // Update atndRequired based on the changed actualWorkHours value
        updateAtndRequired();
    });

    // Event listener for actualWorkHours input
    actualWorkHours.addEventListener('input', function () {
        // Update atndRequired whenever actualWorkHours is changed
        updateAtndRequired();
    });
}
window.addEventListener('load', RequiredTimeSelector)

function LateMinus() {
    const actualWorkHours = document.getElementById('actualWorkHours');

    // Get references to the input fields
    const actualWorkHrs2 = document.getElementById('actualWorkHrs2');
    const actualWorkHrs3 = document.getElementById('actualWorkHrs3');


    // Add event listeners for the "Min." input fields
    actualWorkHrs3.addEventListener('input', calculateDecimalTime);

    // Function to calculate decimal time
    function calculateDecimalTime() {
        // Get the values from the "Time" and "Min." input fields
        const timeValue = parseFloat(actualWorkHrs2.value) || 0; // Default to 0 if NaN
        const minInputValue = parseFloat(actualWorkHrs3.value) || 0; // Default to 0 if NaN

        // Calculate decimal time by converting minutes to hours (divide by 60) and adding it to the original time
        const decimalTime = minInputValue / 60;

        console.log(decimalTime, 'Hey')

        console.log("afsf", actualWorkHours.value)
        // I-save ang orihinal na actualWorkHours
        const originalActualWorkHours2 = parseFloat(actualWorkHours.value) || 0;

        // I-revert ang actualWorkHours sa orihinal na value
        actualWorkHours.value = originalActualWorkHours2;

        const current_actualWorkHours = actualWorkHours.value;

        const total_actual_time = actualWorkHours.value - decimalTime;

        // Display the calculated decimal time in the "Time" input field
        actualWorkHours.value = total_actual_time.toFixed(2); // Display up to 2 decimal places
    }

}

window.addEventListener('load', LateMinus)


function EarlyLeaveMinus() {
    const actualWorkHours = document.getElementById('actualWorkHours');

    const actualWorkHrs3 = document.getElementById('earyLeaveMin');


    // Add event listeners for the "Min." input fields
    actualWorkHrs3.addEventListener('input', calculateDecimalTime);

    // Function to calculate decimal time
    function calculateDecimalTime() { 
        const minInputValue = parseFloat(actualWorkHrs3.value) || 0; // Default to 0 if NaN

        // Calculate decimal time by converting minutes to hours (divide by 60) and adding it to the original time
        const decimalTime = minInputValue / 60;

        console.log("afsf", actualWorkHours.value)
        // I-save ang orihinal na actualWorkHours
        const originalActualWorkHours2 = parseFloat(actualWorkHours.value) || 0;

        // I-revert ang actualWorkHours sa orihinal na value
        actualWorkHours.value = originalActualWorkHours2;

        const current_actualWorkHours = actualWorkHours.value;

        const total_actual_time = actualWorkHours.value - decimalTime;

        // Display the calculated decimal time in the "Time" input field
        actualWorkHours.value = total_actual_time.toFixed(2); // Display up to 2 decimal places
    }

}

window.addEventListener('load', EarlyLeaveMinus)
