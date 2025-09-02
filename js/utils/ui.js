export const showAlert = (message, type = "info") => {
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

export const showConfirm = (message) => {
  return new Promise((resolve) => {
    const confirmModal = document.getElementById("custom-confirm-modal");
    if (!confirmModal) {
      console.error(
        "Custom confirm modal not found. Falling back to native confirm."
      );
      resolve(confirm(message));
      return;
    }

    const messageBody = confirmModal.querySelector(".confirm-message-body");
    const okButton = confirmModal.querySelector(".confirm-ok-button");
    const cancelButton = confirmModal.querySelector(".confirm-cancel-button");
    const closeButton = confirmModal.querySelector(".modal-close");

    messageBody.textContent = message;

    const closeConfirm = (value) => {
      confirmModal.classList.remove("active");
      okButton.onclick = null;
      cancelButton.onclick = null;
      closeButton.onclick = null;
      confirmModal.onclick = null;
      resolve(value);
    };

    okButton.onclick = () => closeConfirm(true);
    cancelButton.onclick = () => closeConfirm(false);
    closeButton.onclick = () => closeConfirm(false);
    confirmModal.onclick = (e) =>
      e.target === confirmModal && closeConfirm(false);

    confirmModal.classList.add("active");
  });
};
