export const initSortModal = ({
  modalId,
  triggerButtonSelector,
  columns,
  initialSorts = [],
  onApply,
  onClear,
}) => {
  const sortModal = document.getElementById(modalId);
  const triggerButton = document.querySelector(triggerButtonSelector);

  if (!sortModal || !triggerButton) {
    console.warn("Sort modal or trigger button not found.", {
      modalId,
      triggerButtonSelector,
    });
    return;
  }

  const sortModalClose = sortModal.querySelector(".sort-modal-close");
  const addSortButton = sortModal.querySelector(".add-sort-button");
  const sortRowsContainer = sortModal.querySelector("#sort-rows-container");
  const applySortsButton = sortModal.querySelector(".sort-apply-button");
  const clearSortsButton = sortModal.querySelector(".sort-clear-button");
  const sortRowHeader = sortModal.querySelector(".sort-row-header");

  const openModal = () => sortModal.classList.add("active");
  const closeModal = () => sortModal.classList.remove("active");

  triggerButton.addEventListener("click", openModal);
  sortModalClose.addEventListener("click", closeModal);
  sortModal.addEventListener("click", (e) => {
    if (e.target === sortModal) closeModal();
  });

  const updateHeaderVisibility = () => {
    const hasRows = sortRowsContainer.querySelector(".sort-row");
    if (sortRowHeader) {
      sortRowHeader.style.display = hasRows ? "flex" : "none";
    }
  };

  const addSortRow = (sort = {}) => {
    const sortRow = document.createElement("div");
    sortRow.className = "sort-row";
    sortRow.innerHTML = `
      <div class="sort-control">
        <select name="sort-field" class="sort-field" required>
          <option value="" disabled ${
            !sort.field ? "selected" : ""
          } hidden>Select Column</option>
          ${
            columns
              .map(
                (c) =>
                  `<option value="${c.value}" ${
                    sort.field === c.value ? "selected" : ""
                  }>${c.text}</option>`
              )
              .join("")
          }
        </select>
      </div>
      <div class="sort-control">
        <select name="sort-direction" class="sort-direction" required>
          <option value="" disabled ${
            !sort.direction ? "selected" : ""
          } hidden>Select Order</option>
          <option value="asc" ${
            sort.direction === "asc" ? "selected" : ""
          }>Ascending</option>
          <option value="desc" ${
            sort.direction === "desc" ? "selected" : ""
          }>Descending</option>
        </select>
      </div>
      <button type="button" class="delete-row-button" title="Remove sort"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3V4H4V6H5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z" fill="#A10900"/></svg></button>
    `;
    sortRowsContainer.appendChild(sortRow);
    sortRow
      .querySelector(".delete-row-button")
      .addEventListener("click", () => {
        sortRow.remove();
        updateHeaderVisibility();
      });
    updateHeaderVisibility();
  };

  if (!addSortButton.dataset.initialized) {
    addSortButton.addEventListener("click", addSortRow);
    addSortButton.dataset.initialized = "true";
  }

  applySortsButton.addEventListener("click", () => {
    const activeSorts = Array.from(
      sortRowsContainer.querySelectorAll(".sort-row")
    )
      .map((row) => ({
        field: row.querySelector(".sort-field").value,
        direction: row.querySelector(".sort-direction").value,
      }))
      .filter((s) => s.field && s.direction);

    if (onApply) onApply(activeSorts);
    closeModal();
  });

  clearSortsButton.addEventListener("click", () => {
    sortRowsContainer.innerHTML = "";
    updateHeaderVisibility();
    if (onClear) onClear();
  });

  sortRowsContainer.innerHTML = "";
  initialSorts.forEach((sort) => addSortRow(sort));
  updateHeaderVisibility();
};