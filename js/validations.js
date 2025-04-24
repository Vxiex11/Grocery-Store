

// sanitize function
// this function sanitize symbol "<>" for XSS, quit spaces for the end or begin
function sanitize(input) {
    const div = document.createElement('div');
    div.textContent = input;
    const cleaned = div.innerHTML;
    return cleaned.replace(/[<>]/g,"").trim();
}

// FUNCTIONS

function validatestreet(value)
{
    const islarge = value.length >= 15; // verificate if the length is more than 15
    const onlyNumbers = /^\d+$/.test(value); // check the answer is not all numbers

    return islarge && !onlyNumbers; // return the results
}

function validateRFC(rfc)
{
    const regex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
    const onlyValidChars = /^[a-zA-Z0-9\s]+$/; // not symbols
    return onlyValidChars.test(rfc) && regex.test(rfc.toUpperCase());
}

function validatename(name)
{
    const onlyLetters = /^[a-zA-Z\s]{3,}$/; // at least 3 letters
    const words = name.trim().split(/\s+/);
    return words.length >= 3 && onlyLetters.test(name); // return true if not have numbers
}

function validateZip(zip)
{
    const numExact = /^\d{5}$/;
    return numExact.test(zip);
}

function validateEmail(email)
{
    const check = /^[a-zA-Z][^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return check.test(email);
}

// The client have only 2 days for invice
function validateDate(date)
{
    const inputDate = new Date(date);
    const today = new Date();

    today.setHours(0,0,0,0);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 2); // 2 days before invice

    return inputDate >= minDate && inputDate <= today;
}

// Not XSS
function sanitize2(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// LISTENER 

const form = document.getElementById("invoiceForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let isValid = true;

  form.querySelectorAll("input").forEach(input =>
    {
        input.classList.remove("is-invalid");

        // if not pass validation native
        if (!input.checkValidity()) 
        {
        input.classList.add("is-invalid");
        isValid = false;
        }

        // Not spaces (Vulnerability)
        if (input.value.trim() === "") {
            input.classList.add("is-invalid");
            isValid = false;
        }        

        // Validation

        if (input.id === "street" && !validatestreet(input.value))
        {
            input.classList.add("is-invalid");
            isValid = false;
        }

        if(input.id === "rfc" && !validateRFC(input.value))
        {
            input.classList.add("is-invalid");
            isValid = false;
        }

        if(input.id === "name" && !validatename(input.value))
        {
            input.classList.add("is-invalid");
            isValid = false;
        }

        if (input.id === "zipCode" && !validateZip(input.value)) {
            input.classList.add("is-invalid");
            isValid = false;
        }

        if (input.id === "email" && !validateEmail(input.value)) {
            input.classList.add("is-invalid");
            isValid = false;
        }

        if (input.id === "date" && !validateDate(input.value)) {
            input.classList.add("is-invalid");
            isValid = false;
        }
        
    });

    // Validation state
    const state = document.getElementById('state');
    state.classList.remove("is-invalid");
    if (!state.value) {
        state.classList.add("is-invalid");
        isValid = false;
    }


    if (isValid) 
    {
        // Not send every time (Brute force)
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;

        // Message before build the invoice 
        const loader = document.createElement("div");
        loader.textContent = "Generating PDF...";
        loader.style.color = "green";
        form.appendChild(loader);


          
        // SANITIZE
        const ticket = sanitize(document.getElementById('ticket').value);
        const date = sanitize(document.getElementById('date').value);
        const rfc = sanitize(document.getElementById('rfc').value);
        const name = sanitize(document.getElementById('name').value);
        const street = sanitize(document.getElementById('street').value);
        const zip = sanitize(document.getElementById('zipCode').value);
        const state = sanitize(document.getElementById('state').value);
        const email = sanitize(document.getElementById('email').value);
      
        const doc = new jsPDF();

        // We need to use the structure ${sanitize} for not XSS
        doc.setFillColor(230, 230, 250); 
        doc.rect(10, 10, 190, 20, 'F'); 
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Invoice Sale", 90, 22);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);

        doc.text(`ID Ticket: ${sanitize(ticket)}`, 20, 40);
        doc.text(`Date: ${sanitize(date)}`, 20, 50);
        doc.text(`RFC: ${sanitize(rfc)}`, 20, 60);
        doc.text(`Name: ${sanitize(name)}`, 20, 70);
        doc.text(`Street: ${sanitize(street)}`, 20, 80);
        doc.text(`Zip: ${sanitize(zip)}`, 20, 90);
        doc.text(`State: ${sanitize(state)}`, 20, 100);
        doc.text(`Email: ${sanitize(email)}`, 20, 110);
        doc.text(`Be sure to keep this voucher`,20, 130);
      
        doc.save('invoice.pdf');
          
    }
});

