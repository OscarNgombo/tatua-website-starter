import { showAlert } from "../utils/ui.js";
import { encryptData, decryptData } from "../utils/crypto.js";
import { renderHeader } from "../components/Header.js";

export const handleTicketFormSubmission = (currentTicketStorage) => {
  renderHeader({
    type: "ticketing",
    activePage: "Raise Ticket",
    basePath: "../../",
  });

  const ticketForm = document.querySelector(".form-grid");
  if (!ticketForm) return;

  const urlParams = new URLSearchParams(window.location.search);
  const ticketIdToEdit = urlParams.get("edit");
  const isEditMode = !!ticketIdToEdit;

  const setValidationState = (field, isValid, message) => {
    if (!field) return;
    let errorEl = field.nextElementSibling;
    if (
      field.classList.contains("file-input-container") &&
      errorEl?.classList.contains("field-hint")
    ) {
      errorEl = errorEl.nextElementSibling;
    }

    if (!errorEl || !errorEl.classList.contains("error-message")) {
      const newErrorEl = document.createElement("div");
      newErrorEl.className = "error-message";

      const referenceNode = field.nextElementSibling?.classList.contains(
        "field-hint"
      )
        ? field.nextElementSibling
        : field;
      referenceNode.after(newErrorEl);
      errorEl = newErrorEl;
    }

    if (!isValid) {
      field.classList.add("invalid");
      errorEl.textContent = message;
    } else {
      field.classList.remove("invalid");
      errorEl.textContent = "";
    }
  };

  const validateAttachment = (input) => {
    if (!input.required && input.files.length === 0) return { valid: true };
    if (input.required && input.files.length === 0) {
      return { valid: false, message: "Please select a file." };
    }
    const MAX_SIZE = 1 * 1024 * 1024;
    const ALLOWED_TYPES = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    let totalSize = 0;
    for (const file of input.files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, message: `Invalid file type: ${file.name}.` };
      }
      totalSize += file.size;
    }
    if (totalSize > MAX_SIZE) {
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        message: `Total file size exceeds 1MB. Current: ${sizeInMB}MB.`,
      };
    }
    return { valid: true };
  };

  const validate = (element) => {
    let isValid = true;
    let message = "";
    const fieldToValidate =
      element.closest(
        ".radio-options-container, .file-input-container, .conditions-container"
      ) || element;

    if (element.type === "radio") {
      const radios = ticketForm.elements[element.name];
      isValid = Array.from(radios).some((r) => r.checked);
      if (!isValid) message = "Please select a contact method.";
    } else if (element.type === "file") {
      const fileValidation = validateAttachment(element);
      isValid = fileValidation.valid;
      message = fileValidation.message || "";
    } else if (element.type === "checkbox") {
      isValid = element.checkValidity();
      if (!isValid) message = "You must agree to the Terms of Service.";
    } else {
      isValid = element.checkValidity();
      if (!isValid) {
        message = element.validationMessage;
      }
    }
    setValidationState(fieldToValidate, isValid, message);
    return isValid;
  };

  const validateAllFields = () => {
    let isFormValid = true;
    for (const element of ticketForm.elements) {
      if (element.willValidate || element.type === "radio") {
        if (
          element.type === "radio" &&
          element !== ticketForm.elements[element.name][0]
        ) {
          continue;
        }
        if (!validate(element)) {
          isFormValid = false;
        }
      }
    }
    return isFormValid;
  };

  const renderPreview = (attachment) => {
    const previewContainer = document.getElementById("preview-container");
    if (!previewContainer) return;

    previewContainer.innerHTML = "";

    if (attachment.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = attachment.content;
      img.alt = `Preview of ${attachment.name}`;
      img.className = "preview-image";
      previewContainer.appendChild(img);
    } else if (attachment.type === "application/pdf") {
      const iframe = document.createElement("iframe");
      iframe.src = attachment.content;
      iframe.type = "application/pdf";
      iframe.className = "preview-iframe";
      previewContainer.appendChild(iframe);
    } else {
      const genericPreview = document.createElement("div");
      genericPreview.className = "preview-generic";
      genericPreview.innerHTML = `
        <div class="preview-generic-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#cccccc"/></svg>
        </div>
        <div class="preview-generic-name">${attachment.name}</div>
        <div class="preview-generic-type">${attachment.type}</div>
        <p>No preview available for this file type.</p>
      `;
      previewContainer.appendChild(genericPreview);
    }
  };

  const createTicket = () => {
    const contactMethodRadio = ticketForm.querySelector(
      'input[name="contact_method"]:checked'
    );
    const nameInput = document.getElementById("full-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const subjectSelect = document.getElementById("subject");
    const descriptionTextarea = document.getElementById("description");
    const attachmentInput = document.getElementById("attachment");
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
  };

  const updateTicket = async () => {
    try {
      let tickets = decryptData(currentTicketStorage.getItem("tickets")) || [];
      const ticketIndex = tickets.findIndex((t) => t.id === ticketIdToEdit);

      if (ticketIndex === -1) {
        showAlert(`Ticket ${ticketIdToEdit} not found for update.`, "error");
        return;
      }

      const originalAttachments = tickets[ticketIndex].attachments || [];
      const keptAttachmentElements = document.querySelectorAll(
        ".current-attachment-item"
      );
      const keptAttachments = Array.from(keptAttachmentElements).map((el) => {
        const index = parseInt(el.dataset.index, 10);
        return originalAttachments[index];
      });

      const newAttachmentInput = document.getElementById("attachment");
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

      const subjectSelect = document.getElementById("subject");
      const contactMethodRadio = ticketForm.querySelector(
        'input[name="contact_method"]:checked'
      );

      tickets[ticketIndex].fullName =
        document.getElementById("full-name").value;
      tickets[ticketIndex].email = document.getElementById("email").value;
      tickets[ticketIndex].phone = document.getElementById("phone").value;
      tickets[ticketIndex].subject =
        subjectSelect.options[subjectSelect.selectedIndex].text;
      tickets[ticketIndex].description =
        document.getElementById("description").value;
      tickets[ticketIndex].contact_method = contactMethodRadio
        ? contactMethodRadio.value
        : null;
      tickets[ticketIndex].attachments = [
        ...keptAttachments,
        ...newAttachmentsData,
      ];

      currentTicketStorage.setItem("tickets", encryptData(tickets));
      showAlert("Ticket updated successfully!", "success");

      const url = new URL(
        "../pages/ticketing_system/tickets.html",
        window.location.href
      );
      const storageType = urlParams.get("storage");
      if (storageType) {
        url.searchParams.set("storage", storageType);
      }
      window.location.href = url.toString();
    } catch (error) {
      console.error("Error updating ticket:", error);
      showAlert(
        "Failed to update ticket. Could not process attachments.",
        "error"
      );
    }
  };

  const attachmentInput = document.getElementById("attachment");
  const fileNameDisplay = document.getElementById("file-name-display");
  if (attachmentInput && fileNameDisplay) {
    const defaultText = fileNameDisplay.innerText;
    attachmentInput.addEventListener("change", () => {
      const files = attachmentInput.files;
      if (files && files.length > 0) {
        fileNameDisplay.innerText =
          files.length === 1 ? files[0].name : `${files.length} files selected`;
        fileNameDisplay.style.color = "var(--text-color)";
      } else {
        fileNameDisplay.innerText = defaultText;
        fileNameDisplay.style.color = "#6c6a6a";
      }
    });
  }

  if (isEditMode) {
    document.title = `Edit Ticket ${ticketIdToEdit} - Tatua Solutions`;
    const pageHeader = ticketForm.previousElementSibling;
    if (pageHeader) {
      pageHeader.innerHTML = `You are editing ticket <strong>${ticketIdToEdit}</strong>. Make your changes below and save.`;
    }
    const submitButton = ticketForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Save Changes";
    }

    const attachmentInput = document.getElementById("attachment");
    if (attachmentInput) {
      attachmentInput.required = false;
    }

    const termsContainer = ticketForm.querySelector(".conditions-container");
    if (termsContainer) {
      const termsError = termsContainer.nextElementSibling;
      if (termsError && termsError.classList.contains("error-message")) {
        termsError.remove();
      }
      termsContainer.remove();
    }

    const tickets = decryptData(currentTicketStorage.getItem("tickets")) || [];
    const ticketToEdit = tickets.find((t) => t.id === ticketIdToEdit);

    if (ticketToEdit) {
      document.getElementById("full-name").value = ticketToEdit.fullName || "";
      document.getElementById("email").value = ticketToEdit.email || "";
      document.getElementById("phone").value = ticketToEdit.phone || "";
      document.getElementById("description").value =
        ticketToEdit.description || "";

      const subjectSelect = document.getElementById("subject");
      const subjectOption = Array.from(subjectSelect.options).find(
        (opt) => opt.text === ticketToEdit.subject
      );
      if (subjectOption) {
        subjectSelect.value = subjectOption.value;
      }

      if (ticketToEdit.contact_method) {
        const radio = document.querySelector(
          `input[name="contact_method"][value="${ticketToEdit.contact_method}"]`
        );
        if (radio) radio.checked = true;
      }

      const attachmentLabel = document.querySelector('label[for="attachment"]');
      if (attachmentLabel && ticketToEdit.attachments?.length > 0) {
        const container = document.createElement("div");
        container.className = "form-group-attachments";
        container.innerHTML = `
          <label>Current Attachments</label>
          <div id="current-attachments">
            ${ticketToEdit.attachments
              .map(
                (att, index) => `
              <div class="current-attachment-item" data-index="${index}">
                <span>${att.name}</span>
                <button type="button" class="remove-attachment-btn" title="Remove attachment">&times;</button>
              </div>`
              )
              .join("")}
          </div>`;
        attachmentLabel.before(container);

        container.addEventListener("click", (e) => {
          const item = e.target.closest(".current-attachment-item");
          if (!item) return;

          if (e.target.closest(".remove-attachment-btn")) {
            const wasActive = item.classList.contains("active");
            item.remove();
            if (wasActive) {
              const previewContainer =
                document.getElementById("preview-container");
              if (previewContainer) {
                previewContainer.innerHTML = `<div class="preview-placeholder"><p>Select an attachment to preview it here.</p></div>`;
              }
            }
          } else {
            const index = parseInt(item.dataset.index, 10);
            const attachment = ticketToEdit.attachments[index];
            if (attachment) {
              renderPreview(attachment);
            }
            container
              .querySelectorAll(".current-attachment-item")
              .forEach((el) => el.classList.remove("active"));
            item.classList.add("active");
          }
        });

        const ticketContainer = document.querySelector(".ticket-container");
        const formColumn = document.createElement("div");
        formColumn.className = "form-column";
        while (ticketContainer.firstChild) {
          formColumn.appendChild(ticketContainer.firstChild);
        }
        const previewColumn = document.createElement("div");
        previewColumn.id = "preview-column";
        previewColumn.className = "preview-column";
        previewColumn.innerHTML = `<div id="preview-container" class="preview-container"><div class="preview-placeholder"><p>Select an attachment to preview it here.</p></div></div>`;
        const layoutContainer = document.createElement("div");
        layoutContainer.className = "edit-layout-container";
        layoutContainer.appendChild(formColumn);
        layoutContainer.appendChild(previewColumn);
        ticketContainer.appendChild(layoutContainer);
      }
    }
  }

  for (const element of ticketForm.elements) {
    if (element.willValidate || element.type === "radio") {
      const eventType = ["checkbox", "radio", "file", "select-one"].includes(
        element.type
      )
        ? "change"
        : "blur";
      element.addEventListener(eventType, () => validate(element));

      if (eventType === "blur") {
        element.addEventListener("input", () => {
          if (
            element.closest(".invalid") ||
            element.classList.contains("invalid")
          ) {
            setValidationState(element, true, "");
          }
        });
      }
    }
  }

  ticketForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const isFormValid = validateAllFields();
    if (!isFormValid) {
      return;
    }

    if (isEditMode) {
      updateTicket();
    } else {
      createTicket();
    }
  });
};
