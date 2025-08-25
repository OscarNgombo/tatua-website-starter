document.addEventListener("DOMContentLoaded", () => {
  const secretKey = "T@tuaS0lut1onsK3y"; // A simple key for obfuscation

  // Determine which storage to use based on URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const storageType = urlParams.get("storage");
  let currentTicketStorage = localStorage;

  if (storageType === "session") {
    currentTicketStorage = sessionStorage;
    console.log("Ticket data will be stored in sessionStorage.");
  } else {
    console.log("Ticket data will be stored in localStorage (default).");
  }
  const encryptData = (data) => {
    const jsonString = JSON.stringify(data);
    let encrypted = "";
    for (let i = 0; i < jsonString.length; i++) {
      encrypted += String.fromCharCode(
        jsonString.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length)
      );
    }
    return btoa(encrypted); // Base64 encode to handle special characters
  };

  const decryptData = (encryptedData) => {
    if (!encryptedData) return null;
    try {
      const fromBase64 = atob(encryptedData);
      let decrypted = "";
      for (let i = 0; i < fromBase64.length; i++) {
        decrypted += String.fromCharCode(
          fromBase64.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length)
        );
      }
      return JSON.parse(decrypted);
    } catch (e) {
      console.warn("Decryption failed, assuming plain JSON.", e);
      try {
        return JSON.parse(encryptedData);
      } catch (jsonError) {
        console.error(
          "Could not parse data as JSON. Data is corrupt.",
          jsonError
        );
        localStorage.removeItem("tickets");
        return null;
      }
    }
  };

  // --- Customized Alert Function ---
  const showAlert = (message, type = "info") => {
    const alertModal = document.getElementById("custom-alert-modal");
    if (!alertModal) {
      console.error("Custom alert modal not found.");
      alert(message);
      return;
    }
    const alertMessageBody = alertModal.querySelector(".alert-message-body");
    const alertOkButton = alertModal.querySelector(".alert-ok-button");
    const alertCloseButton = alertModal.querySelector(".modal-close");
    const alertContent = alertModal.querySelector(".custom-alert-content");

    alertMessageBody.textContent = message;
    alertContent.className = "modal-content custom-alert-content";
    if (type === "success") {
      alertContent.classList.add("success");
    } else if (type === "error") {
      alertContent.classList.add("error");
    }

    alertModal.classList.add("active");

    const closeAlert = () => {
      alertModal.classList.remove("active");
      alertContent.classList.remove("success", "error");
    };
    alertOkButton.onclick = closeAlert;
    alertCloseButton.onclick = closeAlert;
    alertModal.onclick = (e) => {
      if (e.target === alertModal) {
        closeAlert();
      }
    };
  };

  // --- Validation Helpers ---
  const showError = (fieldContainer, message) => {
    if (!fieldContainer) return;
    fieldContainer.classList.add("invalid");
    const errorMessageElement = fieldContainer.querySelector(".error-message");
    if (errorMessageElement) {
      errorMessageElement.textContent = message;
    }
  };

  const clearError = (fieldContainer) => {
    if (!fieldContainer) return;
    fieldContainer.classList.remove("invalid");
    const errorMessageElement = fieldContainer.querySelector(".error-message");
    if (errorMessageElement) {
      errorMessageElement.textContent = "";
    }
  };

  const validateField = (fieldContainer, validationFn, message) => {
    if (!fieldContainer) return false;
    if (!validationFn()) {
      showError(fieldContainer, message);
      return false;
    } else {
      clearError(fieldContainer);
      return true;
    }
  };

  const validateRadioGroup = (
    radioElements,
    fieldContainer,
    message = "Please select an option."
  ) => {
    return validateField(
      fieldContainer,
      () => Array.from(radioElements).some((radio) => radio.checked),
      message
    );
  };

  const validateFiles = (
    files,
    fieldContainer,
    isRequired,
    MAX_SIZE = 1 * 1024 * 1024,
    ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"]
  ) => {
    // This function is now globally available and used by both create and edit forms.
  };

  // --- Theme Switcher ---
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
  // Login and Logout Handlers
  const handleLogout = () => {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("loggedIn");
        showAlert("You have been logged out.");
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
          showAlert(
            "Invalid credentials. Please use 'admin' and 'password'.",
            "error"
          );
        }
      });
    }
  };

  // Ticket Form Handling
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

    const validateName = () =>
      validateField(
        nameInput.closest(".fName"),
        () => nameInput.value.trim() !== "",
        "Full Name cannot be empty."
      );
    const validateEmail = () =>
      validateField(
        emailInput.closest(".emailField"),
        () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value),
        "Please enter a valid email address."
      );
    const validatePhone = () =>
      validateField(
        phoneInput.closest(".phoneField"),
        () => /^(\+254|0)(7|1)\d{8}$/.test(phoneInput.value),
        "Please enter a valid Kenyan phone number (e.g., 0712345678)."
      );
    const validateSubject = () =>
      validateField(
        subjectSelect.closest(".subjectField"),
        () => subjectSelect.value !== "",
        "Please select a subject."
      );
    const validateDescription = () =>
      validateField(
        descriptionTextarea.closest(".messageField"),
        () => descriptionTextarea.value.trim() !== "",
        "Message cannot be empty."
      );

    // Reusable file validation function (defined globally now)
    const validateFiles = (
      files,
      fieldContainer,
      isRequired,
      MAX_SIZE = 1 * 1024 * 1024,
      ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"]
    ) => {
      if (isRequired && (!files || files.length === 0)) {
        return validateField(
          fieldContainer,
          () => false,
          "Please select at least one file."
        );
      }

      if (!files || files.length === 0) {
        // If not required and no files, it's valid
        clearError(fieldContainer);
        return true;
      }

      let totalSize = 0;
      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          return validateField(
            fieldContainer,
            () => false,
            `Invalid file type: ${file.name}. Allowed: PDF, JPG, PNG, JPEG.`
          );
        }
        totalSize += file.size;
      }

      if (totalSize > MAX_SIZE) {
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        return validateField(
          fieldContainer,
          () => false,
          `Total file size exceeds 1MB. Current: ${sizeInMB}MB.`
        );
      }

      clearError(fieldContainer);
      return true;
    };

    const validateAttachment = () =>
      validateFiles(
        attachmentInput.files,
        attachmentInput.closest(".let"),
        true
      );

    const validateTerms = () =>
      validateField(
        termsCheckbox.closest(".form-group-checkbox"),
        () => termsCheckbox.checked,
        "You must agree to the Terms of Service."
      );

    const contactMethodRadios = document.querySelectorAll(
      'input[name="contact_method"]'
    );
    const validateContactMethod = () =>
      validateRadioGroup(
        contactMethodRadios,
        contactMethodRadios[0].closest(".form-group-radio")
      );

    const validateAllFields = () => {
      const results = [
        validateName(),
        validateEmail(),
        validatePhone(),
        validateSubject(),
        validateDescription(),
        validateContactMethod(),
        validateAttachment(),
        validateTerms(),
      ];
      return results.every(Boolean);
    };

    // File name display logic for create form
    if (attachmentInput && fileNameDisplay) {
      const defaultText = fileNameDisplay.innerText;
      attachmentInput.addEventListener("change", () => {
        const files = attachmentInput.files;
        if (files && files.length > 0) {
          fileNameDisplay.innerText =
            files.length === 1
              ? files[0].name
              : `${files.length} files selected`;
          fileNameDisplay.style.color = "var(--text-color)";
        } else {
          fileNameDisplay.innerText = defaultText;
          fileNameDisplay.style.color = "#6c6a6a";
        }
      });
    }

    nameInput.addEventListener("blur", validateName);
    emailInput.addEventListener("blur", validateEmail);
    phoneInput.addEventListener("blur", validatePhone);
    subjectSelect.addEventListener("change", validateSubject);
    descriptionTextarea.addEventListener("blur", validateDescription);
    attachmentInput.addEventListener("change", validateAttachment);
    attachmentInput.addEventListener("blur", validateAttachment);
    termsCheckbox.addEventListener("change", validateTerms);
    contactMethodRadios.forEach((radio) => {
      radio.addEventListener("change", validateContactMethod);
      radio.addEventListener("blur", validateContactMethod);
    });

    [nameInput, emailInput, phoneInput, descriptionTextarea].forEach(
      (input) => {
        input.addEventListener("input", () => {
          const container = input.closest(
            ".fName, .emailField, .phoneField, .messageField"
          );
          if (container.classList.contains("invalid")) {
            clearError(container);
          }
        });
      }
    );

    ticketForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const isFormValid = validateAllFields();

      if (isFormValid) {
        const contactMethodRadio = ticketForm.querySelector(
          'input[name="contact_method"]:checked'
        );
        const ticketPayload = {
          full_name: nameInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
          description: descriptionTextarea.value,
          contact_method: contactMethodRadio ? contactMethodRadio.value : null,
        };
        const attachmentFiles = attachmentInput.files;

        const saveTicket = (attachmentsData) => {
          const selectedSubjectText =
            subjectSelect.options[subjectSelect.selectedIndex].text;
          const newTicket = {
            id: `#T${Date.now().toString().slice(-6)}`,
            fullName: ticketPayload.full_name,
            subject: selectedSubjectText,
            dateCreated: new Date().toISOString(),
            status: "Open",
            email: ticketPayload.email,
            phone: ticketPayload.phone,
            description: ticketPayload.description,
            contact_method: ticketPayload.contact_method,
            attachments: attachmentsData || [],
          };

          const tickets =
            decryptData(currentTicketStorage.getItem("tickets")) || [];
          tickets.push(newTicket);
          currentTicketStorage.setItem("tickets", encryptData(tickets));

          showAlert(
            "Ticket submitted successfully! You can view it in the 'My Tickets' section.",
            "success"
          );
          ticketForm.reset();
          if (fileNameDisplay) {
            fileNameDisplay.innerText = "No file chosen";
            fileNameDisplay.style.color = "#6c6a6a";
          }
        };

        if (attachmentFiles && attachmentFiles.length > 0) {
          const filePromises = Array.from(attachmentFiles).map((file) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                resolve({
                  name: file.name,
                  type: file.type,
                  content: event.target.result,
                });
              };
              reader.onerror = (error) => reject(error);
              reader.readAsDataURL(file);
            });
          });

          Promise.all(filePromises)
            .then((attachmentsData) => {
              saveTicket(attachmentsData);
            })
            .catch((error) => {
              console.error("Error reading attachments:", error);
              showAlert(
                "Could not process attachments. Please try again.",
                "error"
              );
            });
        } else {
          saveTicket([]);
        }
      }
    });
  };

  const handleMyTicketsPage = () => {
    const ticketTableBody = document.getElementById("ticket-table-body");
    if (!ticketTableBody) {
      return;
    }

    let allTickets = decryptData(currentTicketStorage.getItem("tickets")) || [];
    let activeFilters = [];
    let activeSorts = [];

    const updateDisplayedTickets = () => {
      let ticketsToDisplay = [...allTickets];

      // Apply filters
      if (activeFilters.length > 0) {
        ticketsToDisplay = ticketsToDisplay.filter((ticket) => {
          return activeFilters.every((filter) => {
            if (!filter.field || !filter.operator || !filter.value) return true;
            let ticketValue;
            if (filter.field === "dateCreated") {
              const date = new Date(ticket.dateCreated);
              ticketValue = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
            } else {
              ticketValue = ticket[filter.field]
                ? ticket[filter.field].toString().toLowerCase()
                : "";
            }

            switch (filter.operator) {
              case "contains":
                return ticketValue.includes(filter.value);
              case "is":
                return ticketValue === filter.value;
              case "is_not":
                return ticketValue !== filter.value;
              case "starts_with":
                return ticketValue.startsWith(filter.value);
              case "ends_with":
                return ticketValue.endsWith(filter.value);
              default:
                return true;
            }
          });
        });
      }

      // Apply sorts
      if (activeSorts.length > 0) {
        ticketsToDisplay.sort((a, b) => {
          for (const sort of activeSorts) {
            const valA = a[sort.field] || "";
            const valB = b[sort.field] || "";
            const comparison = valA.toString().localeCompare(valB.toString());
            if (comparison !== 0) {
              return sort.direction === "asc" ? comparison : -comparison;
            }
          }
          return 0;
        });
      }

      renderTickets(ticketsToDisplay);
    };

    const renderTickets = (ticketsToRender) => {
      ticketTableBody.innerHTML = "";
      const noTicketsMessage =
        activeFilters.length > 0 || activeSorts.length > 0
          ? "No tickets match the current criteria."
          : "No tickets have been submitted yet.";

      if (ticketsToRender.length === 0) {
        ticketTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">${noTicketsMessage}</td></tr>`;
        return;
      }

      ticketsToRender.forEach((ticket) => {
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

        const attachments =
          ticket.attachments || (ticket.attachment ? [ticket.attachment] : []);
        const hasAttachments = attachments.length > 0;
        const attachmentTitle =
          attachments.length > 1 ? "View Attachments" : "Download Attachment";
        const row = `
          <tr data-id="${ticket.id}">
            <td data-label="Ticket ID" >${ticket.id}</td>
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
                <button class="action-icon more-info-button" title="More Info"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.33337 4.66665V5.99998H8.66671V4.66665H7.33337ZM9.33337 11.3333V9.99998H8.66671V7.33331H6.66671V8.66665H7.33337V9.99998H6.66671V11.3333H9.33337ZM14.6667 7.99998C14.6667 11.6666 11.6667 14.6666 8.00004 14.6666C4.33337 14.6666 1.33337 11.6666 1.33337 7.99998C1.33337 4.33331 4.33337 1.33331 8.00004 1.33331C11.6667 1.33331 14.6667 4.33331 14.6667 7.99998ZM13.3334 7.99998C13.3334 5.05331 10.9467 2.66665 8.00004 2.66665C5.05337 2.66665 2.66671 5.05331 2.66671 7.99998C2.66671 10.9466 5.05337 13.3333 8.00004 13.3333C10.9467 13.3333 13.3334 10.9466 13.3334 7.99998Z" fill="#444054"/>
</svg>
</button>
                <button class="action-icon download-button" title="${attachmentTitle}" ${
          !hasAttachments ? "disabled" : ""
        }><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.33337 13.3333H12.6667V12H3.33337M12.6667 6H10V2H6.00004V6H3.33337L8.00004 10.6667L12.6667 6Z" fill="#444054"/>
</svg>
</button>
                <button class="action-icon call-button" title="Call User" ${
                  ticket.contact_method === "phone" ? "active" : "inactive"
                }>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.41333 7.19333C5.37333 9.08 6.92 10.6267 8.80667 11.5867L10.2733 10.12C10.46 9.93333 10.72 9.88 10.9533 9.95333C11.7 10.2 12.5 10.3333 13.3333 10.3333C13.5101 10.3333 13.6797 10.4036 13.8047 10.5286C13.9298 10.6536 14 10.8232 14 11V13.3333C14 13.5101 13.9298 13.6797 13.8047 13.8047C13.6797 13.9298 13.5101 14 13.3333 14C10.3275 14 7.44487 12.806 5.31946 10.6805C3.19404 8.55513 2 5.67245 2 2.66667C2 2.48986 2.07024 2.32029 2.19526 2.19526C2.32029 2.07024 2.48986 2 2.66667 2H5C5.17681 2 5.34638 2.07024 5.4714 2.19526C5.59643 2.32029 5.66667 2.48986 5.66667 2.66667C5.66667 3.5 5.8 4.3 6.04667 5.04667C6.12 5.28 6.06667 5.54 5.88 5.72667L4.41333 7.19333Z" fill="#999999"/>
</svg>

                </button>
                <button class="action-icon email-button" title="Email User" ${
                  ticket.contact_method === "email" ? "active" : "inactive"
                }>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.6667 3.66669H6C5.26667 3.66669 4.66667 4.26669 4.66667 5.00002V11C4.66667 11.74 5.26667 12.3334 6 12.3334H14.6667C15.4067 12.3334 16 11.74 16 11V5.00002C16 4.26669 15.4067 3.66669 14.6667 3.66669ZM14.6667 11H6V6.11335L10.3333 8.33335L14.6667 6.11335V11ZM10.3333 7.20669L6 5.00002H14.6667L10.3333 7.20669ZM3.33333 11C3.33333 11.1134 3.35333 11.22 3.36667 11.3334H0.666667C0.298667 11.3334 0 11.0334 0 10.6667C0 10.3 0.298667 10 0.666667 10H3.33333V11ZM2 4.66669H3.36667C3.35333 4.78002 3.33333 4.88669 3.33333 5.00002V6.00002H2C1.63333 6.00002 1.33333 5.70002 1.33333 5.33335C1.33333 4.96669 1.63333 4.66669 2 4.66669ZM0.666667 8.00002C0.666667 7.63335 0.966667 7.33335 1.33333 7.33335H3.33333V8.66669H1.33333C0.966667 8.66669 0.666667 8.36669 0.666667 8.00002Z" fill="#444054"/>
</svg>

                </button>
                <button class="action-icon edit-button" title="Edit Ticket"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.57333 14.2867L6 14.6667L4 13.3333L2 14.6667V2H14V6.8C13.58 6.62 13.0933 6.62 12.6667 6.81333V3.33333H3.33333V12.1733L4 11.7333L6 13.0667L6.57333 12.6667V14.2867ZM7.90667 13.3067L12 9.22L13.3533 10.58L9.26667 14.6667H7.90667V13.3067ZM14.4733 9.46L13.82 10.1133L12.46 8.75333L13.1133 8.1L13.12 8.09333L13.1267 8.08667C13.24 7.98 13.4133 7.97333 13.54 8.06C13.56 8.06667 13.58 8.08667 13.5933 8.1L14.4733 8.98C14.6067 9.11333 14.6067 9.33333 14.4733 9.46ZM11.3333 6V4.66667H4.66667V6H11.3333ZM10 8.66667V7.33333H4.66667V8.66667H10Z" fill="#444054"/>
</svg>
</button>
                <button class="action-icon delete-button" title="Delete Ticket"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.99996 2V2.66667H2.66663V4H3.33329V12.6667C3.33329 13.0203 3.47377 13.3594 3.72382 13.6095C3.97387 13.8595 4.313 14 4.66663 14H11.3333C11.6869 14 12.0261 13.8595 12.2761 13.6095C12.5261 13.3594 12.6666 13.0203 12.6666 12.6667V4H13.3333V2.66667H9.99996V2H5.99996ZM4.66663 4H11.3333V12.6667H4.66663V4ZM5.99996 5.33333V11.3333H7.33329V5.33333H5.99996ZM8.66663 5.33333V11.3333H9.99996V5.33333H8.66663Z" fill="#FF3B30"/>
</svg>
</button>
              </div>
            </td>
          </tr>`;
        ticketTableBody.insertAdjacentHTML("beforeend", row);
      });
    };

    const refreshButton = document.querySelector(".refresh-button");

    if (refreshButton) {
      refreshButton.addEventListener("click", () => {
        const icon = refreshButton.querySelector(".fa-sync-alt");
        if (icon) {
          icon.classList.add("fa-spin");
        }
        setTimeout(() => {
          allTickets =
            decryptData(currentTicketStorage.getItem("tickets")) || [];
          activeFilters = [];
          activeSorts = [];
          document
            .querySelectorAll("#filter-rows-container .filter-row")
            .forEach((r) => r.remove());
          document
            .querySelectorAll("#sort-rows-container .sort-row")
            .forEach((r) => r.remove());
          updateDisplayedTickets();
          if (icon) {
            icon.classList.remove("fa-spin");
          }
        }, 300);
      });
    }

    const modal = document.getElementById("ticket-modal");
    const modalBody = document.getElementById("modal-body");
    const modalClose = document.querySelector(".modal-close");

    const openModal = () => modal.classList.add("active");
    const closeModal = () => modal.classList.remove("active");

    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    // Filter Modal
    const filterButton = document.querySelector(".filter-button");
    const filterModal = document.getElementById("filter-modal");

    if (filterModal) {
      const filterModalClose = filterModal.querySelector(".filter-modal-close");

      const openFilterModal = () => filterModal.classList.add("active");
      const closeFilterModal = () => filterModal.classList.remove("active");

      if (filterButton) {
        filterButton.addEventListener("click", openFilterModal);
      }
      if (filterModalClose) {
        filterModalClose.addEventListener("click", closeFilterModal);
      }
      filterModal.addEventListener("click", (e) => {
        if (e.target === filterModal) {
          closeFilterModal();
        }
      });

      const addFilterButton = filterModal.querySelector(".add-filter-button");
      const filterRowsContainer = filterModal.querySelector(
        "#filter-rows-container"
      );
      const filterRowHeader = filterModal.querySelector(".filter-row-header");
      const clearFiltersButton = filterModal.querySelector(
        ".filter-clear-button"
      );
      const applyFiltersButton = filterModal.querySelector(
        ".filter-apply-button"
      );

      const allColumnOptions = [
        { value: "id", text: "Ticket ID" },
        { value: "fullName", text: "Raised By" },
        { value: "subject", text: "Subject" },
        { value: "status", text: "Status" },
        { value: "dateCreated", text: "Date Created" },
      ];

      const updateHeaderVisibility = () => {
        const filterRows = filterRowsContainer.querySelectorAll(".filter-row");
        if (filterRows.length > 0) {
          filterRowHeader.classList.add("visible");
        } else {
          filterRowHeader.classList.remove("visible");
        }
      };

      const updateAllFilterOptions = () => {
        const allSelects =
          filterRowsContainer.querySelectorAll(".filter-field");
        const selectedValues = Array.from(allSelects)
          .map((s) => s.value)
          .filter((v) => v);

        allSelects.forEach((currentSelect) => {
          const currentSelectedValue = currentSelect.value;

          let newOptionsHtml = `<option value="" disabled ${
            currentSelectedValue ? "" : "selected"
          } hidden>Select Column</option>`;

          allColumnOptions.forEach((opt) => {
            const isSelectedInOther =
              selectedValues.includes(opt.value) &&
              opt.value !== currentSelectedValue;
            const isSelected = opt.value === currentSelectedValue;

            newOptionsHtml += `<option value="${opt.value}" ${
              isSelectedInOther ? "disabled" : ""
            } ${isSelected ? "selected" : ""}>${opt.text}</option>`;
          });

          currentSelect.innerHTML = newOptionsHtml;
        });
      };
      const addFilterRow = () => {
        const filterRow = document.createElement("div");
        filterRow.className = "filter-row";
        filterRow.innerHTML = `
          <div class="filter-control">
            <select name="filter-field" class="filter-field" required></select>
          </div>
          <div class="filter-control">
            <select name="filter-operator" class="filter-operator" required>
                <option value="" disabled selected hidden>Select Relation</option>
                <option value="contains">contains</option>
                <option value="is">is</option>
                <option value="is_not">is not</option>
                <option value="starts_with">starts with</option>
                <option value="ends_with">ends with</option>
            </select>
          </div>
          <div class="filter-control">
            <input type="text" name="filter-value" class="filter-value" placeholder="Enter value">
          </div>
          <button type="button" class="delete-row-button" title="Remove filter"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 3V4H4V6H5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z" fill="#A10900"/>
</svg>
</button>
        `;
        filterRowsContainer.appendChild(filterRow);
        updateAllFilterOptions();
        updateHeaderVisibility();
      };

      if (addFilterButton) {
        addFilterButton.addEventListener("click", addFilterRow);
      }

      filterRowsContainer.addEventListener("click", (e) => {
        if (e.target.closest(".delete-row-button")) {
          e.target.closest(".filter-row").remove();
          updateAllFilterOptions();
          updateHeaderVisibility();
        }
      });

      filterRowsContainer.addEventListener("change", (e) => {
        if (e.target.classList.contains("filter-field")) {
          updateAllFilterOptions();
        }
      });

      if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", () => {
          const filterRows =
            filterRowsContainer.querySelectorAll(".filter-row");
          filterRows.forEach((row) => row.remove());
          updateAllFilterOptions();
          updateHeaderVisibility();
          activeFilters = [];
          updateDisplayedTickets();
        });
      }
      if (applyFiltersButton) {
        applyFiltersButton.addEventListener("click", () => {
          const filterRows =
            filterRowsContainer.querySelectorAll(".filter-row");
          activeFilters = Array.from(filterRows)
            .map((row) => ({
              field: row.querySelector(".filter-field").value,
              operator: row.querySelector(".filter-operator").value,
              value: row
                .querySelector(".filter-value")
                .value.toLowerCase()
                .trim(),
            }))
            .filter((f) => f.field && f.operator && f.value);

          updateDisplayedTickets();
          closeFilterModal();
        });
      }
    }

    // Sort Modal
    const sortButton = document.querySelector(".sort-button");
    const sortModal = document.getElementById("sort-modal");

    if (sortModal) {
      const sortModalClose = sortModal.querySelector(".sort-modal-close");
      const openSortModal = () => sortModal.classList.add("active");
      const closeSortModal = () => sortModal.classList.remove("active");

      if (sortButton) sortButton.addEventListener("click", openSortModal);
      if (sortModalClose)
        sortModalClose.addEventListener("click", closeSortModal);
      sortModal.addEventListener("click", (e) => {
        if (e.target === sortModal) closeSortModal();
      });

      const addSortButton = sortModal.querySelector(".add-sort-button");
      const sortRowsContainer = sortModal.querySelector("#sort-rows-container");
      const sortRowHeader = sortModal.querySelector(".sort-row-header");
      const clearSortsButton = sortModal.querySelector(".sort-clear-button");
      const applySortsButton = sortModal.querySelector(".sort-apply-button");

      const updateSortHeaderVisibility = () => {
        const sortRows = sortRowsContainer.querySelectorAll(".sort-row");
        if (sortRows.length > 0) {
          sortRowHeader.classList.add("visible");
        } else {
          sortRowHeader.classList.remove("visible");
        }
      };

      const updateAllSortOptions = () => {
        const allSelects = sortRowsContainer.querySelectorAll(".sort-field");
        const selectedValues = Array.from(allSelects)
          .map((s) => s.value)
          .filter((v) => v);

        allSelects.forEach((currentSelect) => {
          const currentSelectedValue = currentSelect.value;
          let newOptionsHtml = `<option value="" disabled ${
            currentSelectedValue ? "" : "selected"
          } hidden>Select Column</option>`;
          allColumnOptions.forEach((opt) => {
            const isSelectedInOther =
              selectedValues.includes(opt.value) &&
              opt.value !== currentSelectedValue;
            const isSelected = opt.value === currentSelectedValue;
            newOptionsHtml += `<option value="${opt.value}" ${
              isSelectedInOther ? "disabled" : ""
            } ${isSelected ? "selected" : ""}>${opt.text}</option>`;
          });
          currentSelect.innerHTML = newOptionsHtml;
        });
      };

      const addSortRow = () => {
        const sortRow = document.createElement("div");
        sortRow.className = "sort-row";
        sortRow.innerHTML = `
          <div class="sort-control">
            <select name="sort-field" class="sort-field" required>
              <option value="" disabled selected hidden>Select Column</option>
            </select>
          </div>
          <div class="sort-control">
            <select name="sort-direction" class="sort-direction" required>
              <option value="" disabled selected hidden>Select Order</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <button type="button" class="delete-row-button" title="Remove sort"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 3V4H4V6H5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z" fill="#A10900"/>
</svg></button>
        `;
        sortRowsContainer.appendChild(sortRow);
        updateAllSortOptions();
        updateSortHeaderVisibility();
      };

      if (addSortButton) addSortButton.addEventListener("click", addSortRow);

      sortRowsContainer.addEventListener("click", (e) => {
        if (e.target.closest(".delete-row-button")) {
          e.target.closest(".sort-row").remove();
          updateAllSortOptions();
          updateSortHeaderVisibility();
        }
      });

      sortRowsContainer.addEventListener("change", (e) => {
        if (e.target.classList.contains("sort-field")) {
          updateAllSortOptions();
        }
      });

      if (clearSortsButton) {
        clearSortsButton.addEventListener("click", () => {
          sortRowsContainer
            .querySelectorAll(".sort-row")
            .forEach((row) => row.remove());
          updateAllSortOptions();
          updateSortHeaderVisibility();
          activeSorts = [];
          updateDisplayedTickets();
        });
      }

      if (applySortsButton) {
        applySortsButton.addEventListener("click", () => {
          const sortRows = sortRowsContainer.querySelectorAll(".sort-row");
          activeSorts = Array.from(sortRows)
            .map((row) => ({
              field: row.querySelector(".sort-field").value,
              direction: row.querySelector(".sort-direction").value,
            }))
            .filter((s) => s.field && s.direction);

          updateDisplayedTickets();
          closeSortModal();
        });
      }
    }

    const getTicketById = (id) => {
      const tickets =
        decryptData(currentTicketStorage.getItem("tickets")) || [];
      return tickets.find((ticket) => ticket.id === id);
    };

    ticketTableBody.addEventListener("click", (e) => {
      const targetButton = e.target.closest(".action-icon");
      if (!targetButton) return;

      const ticketId = e.target.closest("tr").dataset.id;
      const ticket = getTicketById(ticketId);
      if (!ticket) return;
      const attachments =
        ticket.attachments || (ticket.attachment ? [ticket.attachment] : []);

      if (targetButton.classList.contains("delete-button")) {
        if (
          confirm(
            `Are you sure you want to delete ticket ${ticketId}? This action cannot be undone.`
          )
        ) {
          const tickets =
            decryptData(currentTicketStorage.getItem("tickets")) || [];
          allTickets = tickets.filter((ticket) => ticket.id !== ticketId);
          currentTicketStorage.setItem("tickets", encryptData(allTickets));
          updateDisplayedTickets();
        }
      } else if (targetButton.classList.contains("more-info-button")) {
        modalBody.innerHTML = `
            <h3>Ticket Details: ${ticket.id}</h3>
            <div class="detail-grid">
                <strong>Full Name:</strong> <span>${ticket.fullName}</span>
                <strong>Email:</strong> <span>${ticket.email}</span>
                <strong>Phone:</strong> <span>${ticket.phone}</span>
                <strong>Subject:</strong> <span>${ticket.subject}</span>
                <strong>Description:</strong> <span>${ticket.description}</span>
                <strong>Contact Method:</strong> <span>${
                  ticket.contact_method
                }</span>
                <strong>Attachments:</strong> <div class="attachments-container">${
                  attachments.length > 0
                    ? attachments
                        .map((att) => {
                          if (att.type.startsWith("image/")) {
                            return `
                              <div class="attachment-preview">
                                <a href="${att.content}" target="_blank" rel="noopener noreferrer">
                                  <img src="${att.content}" alt="Preview of ${att.name}" class="attachment-thumbnail">
                                </a>
                                <a href="${att.content}" download="${att.name}">${att.name}</a>
                              </div>
                            `;
                          } else if (att.type === "application/pdf") {
                            return `
                              <div class="attachment-preview">
                                <svg class="attachment-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H8V4H20V16ZM4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6ZM14 12V9C14 8.45 13.55 8 13 8H10.5C9.95 8 9.5 8.45 9.5 9V12C9.5 12.55 9.95 13 10.5 13H11V15H12.5V13H13C13.55 13 14 12.55 14 12ZM12.5 11.5H11V9.5H12.5V11.5Z" fill="#D32F2F"/></svg>
                                <a href="${att.content}" download="${att.name}">${att.name}</a>
                              </div>
                            `;
                          }
                          return `<div class="attachment-preview"><a href="${att.content}" download="${att.name}">${att.name}</a></div>`;
                        })
                        .join("")
                    : "<span>None</span>"
                }</div>
                <strong>Date Created:</strong> <span>${new Date(
                  ticket.dateCreated
                ).toLocaleString()}</span>
            </div>
        `;
        openModal();
      } else if (targetButton.classList.contains("download-button")) {
        if (attachments.length > 0) {
          if (attachments.length === 1) {
            const attachment = attachments[0];
            const link = document.createElement("a");
            link.href = attachment.content;
            link.download = attachment.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            targetButton
              .closest("tr")
              .querySelector(".more-info-button")
              .click();
          }
        }
      } else if (targetButton.classList.contains("call-button")) {
        if (ticket.phone) {
          window.location.href = `tel:${ticket.phone}`;
        } else {
          showAlert("No phone number available for this ticket.");
        }
      } else if (targetButton.classList.contains("email-button")) {
        if (ticket.email) {
          const subject = encodeURIComponent(
            `Re: Ticket ${ticket.id} - ${ticket.subject}`
          );
          window.location.href = `mailto:${ticket.email}?subject=${subject}`;
        } else {
          showAlert("No email address available for this ticket.");
        }
      } else if (targetButton.classList.contains("edit-button")) {
        const subjectOptions = [
          { value: "bug_report", text: "Bug Report" },
          { value: "feature_request", text: "Feature Request" },
          { value: "technical_debt", text: "Technical Debt" },
          {
            value: "security_vulnerability",
            text: "Security Vulnerability",
          },
          { value: "infrastructure", text: "Infrastructure Issue" },
          { value: "other", text: "Other" },
        ];

        modalBody.innerHTML = `
            <h3>Edit Ticket: ${ticket.id}</h3>
            <form class="modal-edit-form" id="edit-ticket-form">
                <div class="form-group">
                    <label for="edit-full-name">Full Name</label>
                    <input type="text" id="edit-full-name" value="${
                      ticket.fullName
                    }" required>
                    <div class="error-message"></div>
                </div>
                 <div class="form-group">
                    <label for="edit-email">Email</label>
                    <input type="email" id="edit-email" value="${
                      ticket.email
                    }" required>
                    <div class="error-message"></div>
                </div>
                <div class="form-group">
                    <label for="edit-phone">Phone</label>
                    <input type="tel" id="edit-phone" value="${
                      ticket.phone
                    }" required>
                    <div class="error-message"></div>
                </div>
                <div class="form-group">
                    <label for="edit-subject">Subject</label>
                    <select id="edit-subject" required>
                        ${subjectOptions
                          .map(
                            (opt) =>
                              `<option value="${opt.value}" ${
                                ticket.subject === "" && opt.value === ""
                                  ? "selected"
                                  : ""
                              } ${
                                ticket.subject === opt.text ? "selected" : ""
                              }>${opt.text}</option>`
                          )
                          .join("")}
                    </select>
                    <div class="error-message"></div>
                </div>
                <div class="form-group">
                    <label for="edit-description">Description</label>
                    <textarea id="edit-description" rows="4" required>${
                      ticket.description
                    }</textarea>
                    <div class="error-message"></div>
                </div>
                <div class="form-group">
                  <label>Preferred Contact Method</label>
                  <div class="radio-group">
                    <label><input type="radio" name="edit_contact_method" value="email" ${
                      ticket.contact_method === "email" ? "checked" : ""
                    }> Email</label>
                    <label><input type="radio" name="edit_contact_method" value="phone" ${
                      ticket.contact_method === "phone" ? "checked" : ""
                    }> Phone</label>
                  </div>
                  <div class="error-message"></div>
                </div>
                <div class="form-group">
                  <label>Current Attachments</label>
                  <div id="current-attachments">
                    ${
                      attachments.length > 0
                        ? attachments
                            .map(
                              (att, index) => `
                              <div class="current-attachment-item" data-index="${index}">
                                  <span>${att.name}</span>
                                  <button type="button" class="remove-attachment-btn" title="Remove attachment">&times;</button>
                              </div>`
                            )
                            .join("")
                        : "<span>None</span>"
                    }
                  </div>
                </div>
                 <div class="form-group">
                    <label for="edit-attachment">Add Attachments</label>
                    <input type="file" id="edit-attachment" multiple accept=".pdf,.jpg,.jpeg,.png">
                    <div class="error-message"></div>
                    <div class="field-hint">Max size: 1MB total. Allowed: PDF, JPG, PNG.</div>
                </div>
                <div class="form-actions">
                    <button type="button" class="secondary-button" id="cancel-edit">Cancel</button>
                    <button type="submit" class="primary-button">Save Changes</button>
                </div>
            </form>
        `;

        openModal();

        // Get references to edit form elements
        const editNameInput = document.getElementById("edit-full-name");
        const editEmailInput = document.getElementById("edit-email");
        const editPhoneInput = document.getElementById("edit-phone");
        const editSubjectSelect = document.getElementById("edit-subject");
        const editDescriptionTextarea =
          document.getElementById("edit-description");
        const editAttachmentInput = document.getElementById("edit-attachment");
        const editContactMethodRadios = document.querySelectorAll(
          'input[name="edit_contact_method"]'
        );

        // Define validation functions for edit form fields
        const validateEditName = () =>
          validateField(
            editNameInput.closest(".form-group"),
            () => editNameInput.value.trim() !== "",
            "Full Name cannot be empty."
          );
        const validateEditEmail = () =>
          validateField(
            editEmailInput.closest(".form-group"),
            () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmailInput.value),
            "Please enter a valid email address."
          );
        const validateEditPhone = () =>
          validateField(
            editPhoneInput.closest(".form-group"),
            () => /^(\+254|0)(7|1)\d{8}$/.test(editPhoneInput.value),
            "Please enter a valid Kenyan phone number (e.g., 0712345678)."
          );
        const validateEditSubject = () =>
          validateField(
            editSubjectSelect.closest(".form-group"),
            () => editSubjectSelect.value !== "",
            "Please select a subject."
          );
        const validateEditDescription = () =>
          validateField(
            editDescriptionTextarea.closest(".form-group"),
            () => editDescriptionTextarea.value.trim() !== "",
            "Message cannot be empty."
          );
        const validateEditAttachment = () =>
          validateFiles(
            editAttachmentInput.files,
            editAttachmentInput.closest(".form-group"),
            false
          ); // New attachments are not required
        const validateEditContactMethod = () =>
          validateRadioGroup(
            editContactMethodRadios,
            editContactMethodRadios[0].closest(".form-group")
          );

        // Attach event listeners for edit form fields
        editNameInput.addEventListener("blur", validateEditName);
        editEmailInput.addEventListener("blur", validateEditEmail);
        editPhoneInput.addEventListener("blur", validateEditPhone);
        editSubjectSelect.addEventListener("change", validateEditSubject);
        editDescriptionTextarea.addEventListener(
          "blur",
          validateEditDescription
        );
        editAttachmentInput.addEventListener("change", validateEditAttachment);
        editAttachmentInput.addEventListener("blur", validateEditAttachment);
        editContactMethodRadios.forEach((radio) => {
          radio.addEventListener("change", validateEditContactMethod);
          radio.addEventListener("blur", validateEditContactMethod);
        });

        // Clear error on input for text/email/phone/textarea
        [
          editNameInput,
          editEmailInput,
          editPhoneInput,
          editDescriptionTextarea,
        ].forEach((input) => {
          input.addEventListener("input", () => {
            const container = input.closest(".form-group");
            if (container && container.classList.contains("invalid")) {
              clearError(container);
            }
          });
        });

        // Function to validate all fields in the edit form
        const validateAllEditFields = () => {
          const results = [
            validateEditName(),
            validateEditEmail(),
            validateEditPhone(),
            validateEditSubject(),
            validateEditDescription(),
            validateEditContactMethod(),
            validateEditAttachment(),
          ];
          return results.every(Boolean);
        };

        const currentAttachmentsContainer = document.getElementById(
          "current-attachments"
        );
        if (currentAttachmentsContainer) {
          currentAttachmentsContainer.addEventListener("click", (e) => {
            const removeBtn = e.target.closest(".remove-attachment-btn");
            if (removeBtn) {
              removeBtn.closest(".current-attachment-item").remove();
            }
          });
        }

        document
          .getElementById("cancel-edit")
          .addEventListener("click", closeModal);

        document
          .getElementById("edit-ticket-form")
          .addEventListener("submit", async (event) => {
            event.preventDefault();

            const isEditFormValid = validateAllEditFields();
            if (!isEditFormValid) {
              console.log(
                "Edit form validation failed. Preventing submission."
              );
              return; // Stop submission if validation fails
            }

            try {
              let tickets =
                decryptData(currentTicketStorage.getItem("tickets")) || [];
              const ticketIndex = tickets.findIndex((t) => t.id === ticket.id);

              if (ticketIndex > -1) {
                const keptAttachmentElements = document.querySelectorAll(
                  ".current-attachment-item"
                );
                const keptAttachments = Array.from(keptAttachmentElements).map(
                  (el) => {
                    const index = parseInt(el.dataset.index, 10);
                    return attachments[index];
                  }
                );

                const newAttachmentInput =
                  document.getElementById("edit-attachment");
                const newFiles = newAttachmentInput.files;
                let newAttachmentsData = [];

                if (newFiles.length > 0) {
                  const filePromises = Array.from(newFiles).map((file) => {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = (e) =>
                        resolve({
                          name: file.name,
                          type: file.type,
                          content: e.target.result,
                        });
                      reader.onerror = (err) => reject(err);
                      reader.readAsDataURL(file);
                    });
                  });
                  newAttachmentsData = await Promise.all(filePromises);
                }

                const finalAttachments = [
                  ...keptAttachments,
                  ...newAttachmentsData,
                ];

                const editSubjectSelect =
                  document.getElementById("edit-subject");
                const editContactMethodRadio = document.querySelector(
                  'input[name="edit_contact_method"]:checked'
                );

                tickets[ticketIndex].fullName =
                  document.getElementById("edit-full-name").value;
                tickets[ticketIndex].email =
                  document.getElementById("edit-email").value;
                tickets[ticketIndex].phone =
                  document.getElementById("edit-phone").value;
                tickets[ticketIndex].subject =
                  editSubjectSelect.options[
                    editSubjectSelect.selectedIndex
                  ].text;
                tickets[ticketIndex].description =
                  document.getElementById("edit-description").value;
                tickets[ticketIndex].contact_method = editContactMethodRadio
                  ? editContactMethodRadio.value
                  : null;
                tickets[ticketIndex].attachments = finalAttachments;

                currentTicketStorage.setItem("tickets", encryptData(tickets));
                showAlert("Ticket updated successfully!", "success");
                allTickets = tickets;
                closeModal();
                updateDisplayedTickets();
              }
            } catch (error) {
              console.error("Error updating ticket:", error);
              showAlert(
                "Failed to update ticket. Could not process attachments.",
                "error"
              );
            }
          });
      }
    });

    updateDisplayedTickets();
  };

  applySavedSettings();
  updateNav();
  handleLogout();
  handleLogin();
  handleTicketFormSubmission();
  handleMyTicketsPage();
});
