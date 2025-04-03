function changeQuantity(change, inputElement, ticketBuyingQuantity) {
  // Ensure the input value is a number
  const currentValue = parseInt(inputElement.value) || 0;
  const newValue = currentValue + change;
  // Ensure the value is between 1 and the ticket quantity set by the provider
  const clampedValue = Math.min(Math.max(newValue, 1), ticketBuyingQuantity);
  inputElement.value = clampedValue;
  return clampedValue;
}

function updatePrices(admissionPrices, quantity) {
  // const quantity = parseInt(ticketInput.value);
  const selectedAdmission = admission.value;

  const prices = admissionPrices[selectedAdmission];

  const ticketPrice = prices.ticketPrice * quantity;
  const serviceFee = prices.serviceFee * quantity;
  const processingFee = prices.processingFee;
  const total = ticketPrice + serviceFee + processingFee;

  // Update displayed prices
  document.getElementById('ticket-price').textContent = `$${ticketPrice.toFixed(2)}`;
  document.getElementById('service-fee-price').textContent = `$${serviceFee.toFixed(2)}`;
  document.getElementById('processing-fee-price').textContent = `$${processingFee.toFixed(2)}`;
  document.getElementById('total-ticket-price').textContent = `$${total.toFixed(2)}`;
}

function populateEventData(event) {

  console.log(event);

  document.getElementById('event-title').textContent = event.title;

  console.log(typeof(event.datetime)); //string
  document.getElementById('event-date').textContent = 
    new Date(event.datetime).toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  document.getElementById('event-location').textContent = event.location;
  // document.getElementById('event-image').src = event.image_url;
  
  // Update other elements similarly
  
  const eventId = event.id;
  console.log(eventId);
  document.querySelector('form').addEventListener('submit',  (e) => handleSubmit(eventId, e));
}


async function handleSubmit(eventId, e) {
  e.preventDefault();

  const ticketInput = document.getElementById('ticket-quantity');
  const ticketQuantity = parseInt(ticketInput.value);
  const ticketHoldername = document.getElementById('ticket-holdername').value;
  const ticketPriceValue = document.getElementById('total-ticket-price').textContent;
  const ticketPrice = parseInt(ticketPriceValue.replace('$', ''));
  const admissionType = document.getElementById('admission');

  // console.log(ticketQuantity);
  // console.log(admission.value);
  // console.log(ticketHoldername);

  console.log(ticketPrice);
  
  let userdata = await getProfile();
  console.log(userdata);

  const ticket = {
    ticket_holder_name: ticketHoldername,
    quantity: ticketQuantity,
    admission: admissionType.value,
    event_id: eventId,
    user_id: userdata.id,
    price: ticketPrice,
    status: 'purchased'
  };
  
  console.log(ticket);
  
  let submittedTicket = await submitTicket(ticket);
  const ticketId = submittedTicket.ticket_id;
  console.log("ticket", ticketId);
  if (ticketId) {
    const attendedEvent = {
      event_id: eventId,
      user_id: userdata.id,
      ticket_id: ticketId,
      status: 'attending'
    };
    submitAttendedEvent(attendedEvent);
    window.location.href = `../tickets/purchased.html?id=${eventId}`;
  }
}

async function submitTicket (ticket) {
  // Only proceed with the update if there's at least one field to update
  let updateData = {};
    if (ticket.ticket_holder_name) updateData.ticket_holder_name = ticket.ticket_holder_name;
    if (ticket.quantity) updateData.quantity = ticket.quantity;
    if (ticket.admission) updateData.admission = ticket.admission;
    if (ticket.event_id)  updateData.event_id = ticket.event_id;
    if (ticket.user_id)  updateData.user_id = ticket.user_id;
    if (ticket.price)  updateData.price = ticket.price;
    if (ticket.status) updateData.status = 'purchased';
  // console.log(updateData);
  
  const { data, error } = await supabase
    .from('tickets')
    .insert(ticket)
    .select(); // Add this to return the inserted record
  if (error) {
    console.error('Error submitting ticket:', error);
  } else {
    // console.log('Ticket submitted successfully:', data[0]);
    // Redirect or show success message
    return data[0];
  }
}

async function submitAttendedEvent (attendedEvent) {
  // Only proceed with the update if there's at least one field to update
  let updateData = {};
    if (attendedEvent.event_id) updateData.event_id = attendedEvent.event_id;
    if (attendedEvent.user_id) updateData.user_id = attendedEvent.user_id;
    if (attendedEvent.ticket_id) updateData.ticket_id = attendedEvent.ticket_id;
    if (attendedEvent.status) updateData.status = attendedEvent.status;
  // console.log(updateData);

  const { data, error } = await supabase
    .from('attended_events')
    .insert(attendedEvent)
    // .select(); // Add this to return the inserted record
  if (error) {
    console.error('Error creating attended event:', error);
  }
  else {
    console.log('Attended event successfuly created:', data[0]);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Get event ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  // Update back button URL
  const backBtn = document.getElementById('back-explore-btn');
  if (backBtn && eventId) {
    backBtn.href = `../events/eventOV.html?id=${eventId}`;
  }

  try {
    let event = await fetchOneEventData(eventId);
    if (event){
      populateEventData(event);
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    // Redirect or show error message
  }

  const decreaseBtn = document.getElementById("decrease");
  const increaseBtn = document.getElementById("increase");
  const ticketInput = document.getElementById("ticket-quantity");

  const ticketBuyingQuantity = 20;
  ticketInput.max = ticketBuyingQuantity;

  // Price constants
  // const ticketPricePerUnit = 100;
  // const serviceFeePerUnit = 40.95;
  // const processingFee = 10.12;

  const admissionPrices = {
    general: {
      ticketPrice: 100,
      serviceFee: 40.95,
      processingFee: 10.12
    },
    vip: {
      ticketPrice: 200,
      serviceFee: 60.95,
      processingFee: 15.00
    },
    early: {
      ticketPrice: 150,
      serviceFee: 50.50,
      processingFee: 12.50
    }
  };

  decreaseBtn.addEventListener("click", function () {
    let quantity = changeQuantity(-1, ticketInput, ticketBuyingQuantity);
    // updatePrices(ticketPricePerUnit, serviceFeePerUnit, processingFee, quantity);
    updatePrices(admissionPrices, quantity);
  });

  increaseBtn.addEventListener("click", function () {
    let quantity = changeQuantity(1, ticketInput, ticketBuyingQuantity);
    // updatePrices(ticketPricePerUnit, serviceFeePerUnit, processingFee, quantity);
    updatePrices(admissionPrices, quantity);
  });

  admission.addEventListener("change", function () {
    updatePrices(admissionPrices, ticketInput.value);
  });
});