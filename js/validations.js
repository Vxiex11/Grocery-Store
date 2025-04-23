

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
    const onlyValidChars = /^[a-zA-Z0-9\s]+$/;
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

    if (isValid) 
    {
        alert("Form successfully submitted");
        // sent data with fetch
        form.reset();
    }
});
