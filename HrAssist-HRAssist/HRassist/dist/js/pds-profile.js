function EmployeeProfileNavigator() {
    try {
        const overviewPDSLink = document.getElementById('overviewPDS');
        overviewPDSLink.setAttribute('href', 'admin-employee-profile.html');
    
        const personalPDSLink = document.getElementById('personalPDS');
        personalPDSLink.setAttribute('href', 'admin-employee-datasheet.html');
    
        const appointmentPDS = document.getElementById('appointmentPDS');
        appointmentPDS.setAttribute('href', 'admin-employee-appointment.html');
    
        const leavecreditsPDS = document.getElementById('leavecreditsPDS');
        leavecreditsPDS.setAttribute('href', 'admin-employee-leave.html');
    
        const behaviorPDS = document.getElementById('behaviorPDS');
        behaviorPDS.setAttribute('href', 'admin-employee-behavior.html');
    
        const activityPDS = document.getElementById('activityPDS');
        activityPDS.setAttribute('href', 'admin-employee-activity.html');
        
    } catch {
        return
    }
    

}

window.addEventListener('load', EmployeeProfileNavigator);
 

function PDSNavigator(){
    try{
        const personalPDSLayout = document.getElementById('personalPDSLayout');
        const educationPDSLayout = document.getElementById('educationPDSLayout')
        const workExpPDSLayout = document.getElementById('workExpPDSLayout')
        const trainingPDSLayout = document.getElementById('trainingPDSLayout')
        const learningPDSLayout = document.getElementById('learningPDSLayout')
        const otherInfoPDSLayout = document.getElementById('otherInfoPDSLayout')
        const esignaturePDSLayout = document.getElementById('esignaturePDSLayout')
        
        const personalPDSSec = document.getElementById('personalPDSSec'); 
        personalPDSSec.addEventListener('click', (e) => {
          personalPDSLayout.style.display = 'block'
          educationPDSLayout.style.display = 'none'
          workExpPDSLayout.style.display = 'none'
          trainingPDSLayout.style.display = 'none'
          learningPDSLayout.style.display = 'none'
          otherInfoPDSLayout.style.display = 'none'
          esignaturePDSLayout.style.display = 'none'
        })
        
        const educPDS = document.getElementById('educPDS'); 
        educPDS.addEventListener('click', (e) => {
            personalPDSLayout.style.display = 'none'
            educationPDSLayout.style.display = 'block'
            workExpPDSLayout.style.display = 'none'
            trainingPDSLayout.style.display = 'none'
            learningPDSLayout.style.display = 'none'
            otherInfoPDSLayout.style.display = 'none'
            esignaturePDSLayout.style.display = 'none'
        })
         
        const workExpPDS = document.getElementById('workExpPDS'); 
        workExpPDS.addEventListener('click', (e) => {
            personalPDSLayout.style.display = 'none'
            educationPDSLayout.style.display = 'none'
            workExpPDSLayout.style.display = 'block'
            trainingPDSLayout.style.display = 'none'
            learningPDSLayout.style.display = 'none'
            otherInfoPDSLayout.style.display = 'none'
            esignaturePDSLayout.style.display = 'none'
        })
        
        
        
        const trainingPDS = document.getElementById('trainingPDS'); 
        trainingPDS.addEventListener('click', (e) => {
            personalPDSLayout.style.display = 'none'
            educationPDSLayout.style.display = 'none'
            workExpPDSLayout.style.display = 'none'
            trainingPDSLayout.style.display = 'none'
            learningPDSLayout.style.display = 'block'
            otherInfoPDSLayout.style.display = 'none'
            esignaturePDSLayout.style.display = 'none'
            
        })
        
        
        const otherInfoPDS = document.getElementById('otherInfoPDS'); 
        otherInfoPDS.addEventListener('click', (e) => {
            personalPDSLayout.style.display = 'none'
            educationPDSLayout.style.display = 'none'
            workExpPDSLayout.style.display = 'none'
            trainingPDSLayout.style.display = 'none'
            learningPDSLayout.style.display = 'none'
            otherInfoPDSLayout.style.display = 'block'
            esignaturePDSLayout.style.display = 'none'
            
        })
        
        
        const esignaturePDS = document.getElementById('esignaturePDS'); 
        esignaturePDS.addEventListener('click', (e) => {
            personalPDSLayout.style.display = 'none'
            educationPDSLayout.style.display = 'none'
            workExpPDSLayout.style.display = 'none'
            trainingPDSLayout.style.display = 'none'
            learningPDSLayout.style.display = 'none'
            otherInfoPDSLayout.style.display = 'none'
            esignaturePDSLayout.style.display = 'block'
            
        })
    
    } catch {
        return
    }
    
}

window.addEventListener('load', PDSNavigator)