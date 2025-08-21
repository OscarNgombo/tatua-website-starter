document.addEventListener("DOMContentLoaded", () => {
  const applySavedSettings = () => {
    const savedTheme = localStorage.getItem("theme");
    setTheme(savedTheme !== "brown");
    const savedFontScale = localStorage.getItem("fontScale");
    if (savedFontScale) {
      document.documentElement.style.setProperty(
        "--font-scale",
        savedFontScale
      );
      const fontSlider = document.getElementById("font-slider");
      if (fontSlider) {
        fontSlider.value = savedFontScale;
      }
    }
  };

  const themeSwitcher = document.getElementById("theme-switcher");
  let isPurple = localStorage.getItem("theme") !== "brown";

  const setTheme = (purple) => {
    const theme = purple ? "purple" : "brown";
    const colors = {
      purple: {
        "--primary-color": "var(--purple-500)",
        "--primary-hover": "var(--purple-600)",
        "--primary-50": "var(--purple-50)",
        "--primary-100": "var(--purple-100)",
        "--primary-200": "var(--purple-200)",
        "--primary-400": "var(--purple-400)",
        "--primary-500": "var(--purple-500)",
        "--primary-600": "var(--purple-600)",
        "--primary-700": "var(--purple-700)",
        "--primary-900": "var(--purple-900)",
        "--orange-light": "var(--orange-200)",
      },
      brown: {
        "--primary-color": "var(--brown-500)",
        "--primary-hover": "var(--brown-600)",
        "--primary-50": "var(--brown-50)",
        "--primary-100": "var(--brown-100)",
        "--primary-200": "var(--brown-200)",
        "--primary-400": "var(--brown-400)",
        "--primary-500": "var(--brown-500)",
        "--primary-600": "var(--brown-600)",
        "--primary-700": "var(--brown-700)",
        "--primary-900": "var(--brown-900)",
        "--orange-light": "var(--brown-200)",
      },
    };

    const selectedColors = colors[theme];
    for (const [key, value] of Object.entries(selectedColors)) {
      document.documentElement.style.setProperty(key, value);
    }
    localStorage.setItem("theme", theme);
    isPurple = purple;
  };

  if (themeSwitcher) {
    themeSwitcher.addEventListener("click", () => {
      setTheme(!isPurple);
    });
  }

  const fontSlider = document.getElementById("font-slider");
  if (fontSlider) {
    fontSlider.addEventListener("input", () => {
      const scale = fontSlider.value;
      document.documentElement.style.setProperty("--font-scale", scale);
      localStorage.setItem("fontScale", scale);
    });
  }

  const updateNav = () => {
    const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";
    const loginNavItem = document.getElementById("login-nav-item");
    const logoutNavItem = document.getElementById("logout-nav-item");

    if (loginNavItem && logoutNavItem) {
      if (isLoggedIn) {
        loginNavItem.style.display = "none";
        logoutNavItem.style.display = "list-item";
      } else {
        loginNavItem.style.display = "list-item";
        logoutNavItem.style.display = "none";
      }
    }
  };

  const handleLogout = () => {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("loggedIn");
        alert("You have been logged out.");
        window.location.href = "/index.html";
      });
    }
  };

  const handleLogin = () => {
    const loginForm = document.querySelector(".login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (email === "admin" && password === "password") {
          sessionStorage.setItem("loggedIn", "true");
          window.location.href = "/pages/ticketing_system/raise_ticket.html";
        } else {
          alert("Invalid credentials. Please use 'admin' and 'password'.");
        }
      });
    }
  };

  const handleTicketFormSubmission = () => {
    const ticketForm = document.querySelector(".ticket-form");
    if (!ticketForm) {
      return;
    }
    const nameInput = document.getElementById("full-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const subjectSelect = document.getElementById("subject");
    const descriptionTextarea = document.getElementById("description");
    const attachmentInput = document.getElementById("attachment");
    const termsCheckbox = document.getElementById("terms");
    const fileNameDisplay = document.getElementById("file-name-display");

    if (attachmentInput && fileNameDisplay) {
      const defaultText = fileNameDisplay.innerText;
      attachmentInput.addEventListener("change", () => {
        if (attachmentInput.files && attachmentInput.files.length > 0) {
          fileNameDisplay.innerText = attachmentInput.files[0].name;
          fileNameDisplay.style.color = "var(--text-color)";
        } else {
          fileNameDisplay.innerText = defaultText;
          fileNameDisplay.style.color = "#6c6a6a";
        }
      });
    }

    const validateName = () => {
      if (nameInput.value.trim() === "") {
        alert("Full Name: This field cannot be empty.");
        return false;
      }
      return true;
    };

    const validateEmail = () => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(emailInput.value)) {
        alert("Email: Please enter a valid email address.");
        return false;
      }
      return true;
    };

    const validatePhone = () => {
      const regex = /^(\+254|0)(7|1)\d{8}$/;
      if (!regex.test(phoneInput.value)) {
        alert(
          "Phone: Please enter a valid Kenyan phone number (e.g., 0712345678)."
        );
        return false;
      }
      return true;
    };

    const validateSubject = () => {
      if (subjectSelect.value === "") {
        alert("Subject: Please select a subject from the list.");
        return false;
      }
      return true;
    };

    const validateDescription = () => {
      if (descriptionTextarea.value.trim() === "") {
        alert("Message: Please enter a description for your ticket.");
        return false;
      }
      return true;
    };

    const validateAttachment = () => {
      if (!attachmentInput.files || attachmentInput.files.length === 0) {
        alert("Attachment: Please select a file to upload.");
        return false;
      }
      return true;
    };

    const validateTerms = () => {
      if (!termsCheckbox.checked) {
        alert("Terms: You must agree to the Terms of Service.");
        return false;
      }
      return true;
    };

    ticketForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const isFormValid = [
        validateName(),
        validateEmail(),
        validatePhone(),
        validateSubject(),
        validateDescription(),
        validateAttachment(),
        validateTerms(),
      ].every(Boolean);

      if (isFormValid) {
        const formData = new FormData(ticketForm);
        const ticketData = Object.fromEntries(formData.entries());
        const newTicket = {
          id: `#T${Date.now().toString().slice(-6)}`,
          fullName: ticketData.full_name,
          subject: ticketData.subject,
          dateCreated: new Date().toISOString(),
          status: "Open",
          email: ticketData.email,
          phone: ticketData.phone,
          description: ticketData.description,
          contact_method: ticketData.contact_method,
          attachment:
            ticketData.attachment instanceof File
              ? ticketData.attachment.name
              : "",
        };

        const tickets = JSON.parse(sessionStorage.getItem("tickets")) || [];
        tickets.push(newTicket);
        sessionStorage.setItem("tickets", JSON.stringify(tickets));

        alert(
          "Ticket submitted successfully! You can view it in the 'My Tickets' section."
        );
        ticketForm.reset();
        if (fileNameDisplay) {
          fileNameDisplay.innerText = "No file chosen";
        }
      } else {
        alert("Please correct the errors in the form before submitting.");
      }
    });
  };

  const handleMyTicketsPage = () => {
    const ticketTableBody = document.getElementById("ticket-table-body");
    if (!ticketTableBody) {
      return;
    }

    const renderTickets = () => {
      const tickets = JSON.parse(sessionStorage.getItem("tickets")) || [];
      ticketTableBody.innerHTML = "";

      if (tickets.length === 0) {
        ticketTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No tickets have been submitted yet.</td></tr>`;
        return;
      }

      tickets.forEach((ticket) => {
        const date = new Date(ticket.dateCreated);
        const formattedDate = `${date.toLocaleDateString(
          "en-CA"
        )} ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`;
        const eclipsedDescription =
          ticket.description.length > 40
            ? ticket.description.substring(0, 40) + "..."
            : ticket.description;

        const row = `
          <tr>
            <td data-label="Ticket ID">${ticket.id}</td>
            <td data-label="Raised By">
              <div class="td-main-content">${ticket.fullName}</div>
              <div class="td-sub-content">${ticket.email}</div>
            </td>
            <td data-label="Ticket Details">
              <div class="td-main-content">${ticket.subject}</div>
              <div class="td-sub-content">${eclipsedDescription}</div>
            </td>
            <td data-label="Date Created">${formattedDate}</td>
            <td data-label="Actions">
              <div class="action-icons">
                <button class="action-icon" title="More Info"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224zM280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312C256 298.7 266.7 288 280 288z"/></svg></button>
                <button class="action-icon" title="Download Attachment" ${
                  !ticket.attachment ? "disabled" : ""
                }><i class="fas fa-download"></i></button>
                <button class="action-icon" title="Call User"><i class="fas fa-phone ${
                  ticket.contact_method === "phone" ? "active" : "inactive"
                }"></i></button>
                <button class="action-icon" title="Email User"><i class="fas fa-envelope ${
                  ticket.contact_method === "email" ? "active" : "inactive"
                }"></i></button>
                <button class="action-icon" title="Edit Ticket"><i class="fas fa-pen-nib"></i></button>
                <button class="action-icon delete-button" title="Delete Ticket" data-id="${
                  ticket.id
                }"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M232.7 69.9C237.1 56.8 249.3 48 263.1 48L377 48C390.8 48 403 56.8 407.4 69.9L416 96L512 96C529.7 96 544 110.3 544 128C544 145.7 529.7 160 512 160L128 160C110.3 160 96 145.7 96 128C96 110.3 110.3 96 128 96L224 96L232.7 69.9zM128 208L512 208L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 208zM216 272C202.7 272 192 282.7 192 296L192 488C192 501.3 202.7 512 216 512C229.3 512 240 501.3 240 488L240 296C240 282.7 229.3 272 216 272zM320 272C306.7 272 296 282.7 296 296L296 488C296 501.3 306.7 512 320 512C333.3 512 344 501.3 344 488L344 296C344 282.7 333.3 272 320 272zM424 272C410.7 272 400 282.7 400 296L400 488C400 501.3 410.7 512 424 512C437.3 512 448 501.3 448 488L448 296C448 282.7 437.3 272 424 272z"/></svg></button>
              </div>
            </td>
          </tr>`;
        ticketTableBody.insertAdjacentHTML("beforeend", row);
      });
    };

    ticketTableBody.addEventListener("click", (e) => {
      const deleteButton = e.target.closest(".delete-button");
      if (deleteButton) {
        const ticketId = deleteButton.dataset.id;
        if (
          confirm(
            `Are you sure you want to delete ticket ${ticketId}? This action cannot be undone.`
          )
        ) {
          let tickets = JSON.parse(sessionStorage.getItem("tickets")) || [];
          tickets = tickets.filter((ticket) => ticket.id !== ticketId);
          sessionStorage.setItem("tickets", JSON.stringify(tickets));
          renderTickets();
        }
      }
    });

    renderTickets();
  };

  applySavedSettings();
  updateNav();
  handleLogout();
  handleLogin();
  handleTicketFormSubmission();
  handleMyTicketsPage();
});
