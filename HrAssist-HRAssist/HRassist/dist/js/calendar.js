document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      navLinks: true, // can click day/week names to navigate views
      headerToolbar: {
          left: 'prev today next',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        }, 
      eventClick: function(arg) {
      if (confirm('Are you sure you want to delete this event?')) {
          arg.event.remove()
      }
      },
      editable: true,
      dayMaxEvents: true, // allow "more" link when too many events
      events: [
      {
          title: '',
          color: ''
      },
      ] 

  });

  calendar.render();
  document.getElementById('btnSubmit').addEventListener('click', function(event) {
      event.preventDefault(); 
  
      var eventName = document.querySelector('.event-name').value;
      var participants = document.getElementById('participants').value;
      var tagColor = document.querySelector('.tag-color').value;
      var startFrom = document.querySelector('.start-from').value;
      var endTo = document.querySelector('.end-to').value;
  
      var formData = {
          title: eventName,
          start: startFrom,
          end: endTo,
          color: tagColor
      };
  
      // Add the new event to the calendar's events array
      calendar.addEvent(formData);
  
      // Rerender the calendar to reflect the changes
      calendar.render();
  
      // Log the form data in the console
      console.log(formData);
  });
});

