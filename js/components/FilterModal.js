export const initFilterModal = ({
  modalId,
  triggerButtonSelector,
  columns,
  initialFilters = [],
  onApply,
  onClear,
}) => {
  const filterModal = document.getElementById(modalId);
  const triggerButton = document.querySelector(triggerButtonSelector);

  if (!filterModal || !triggerButton) {
    console.warn("Filter modal or trigger button not found.", {
      modalId,
      triggerButtonSelector,
    });
    return;
  }

  const filterModalClose = filterModal.querySelector(".filter-modal-close");
  const addFilterButton = filterModal.querySelector(".add-filter-button");
  const filterRowsContainer = filterModal.querySelector(
    "#filter-rows-container"
  );
  const applyFiltersButton = filterModal.querySelector(".filter-apply-button");
  const clearFiltersButton = filterModal.querySelector(".filter-clear-button");
  const filterRowHeader = filterModal.querySelector(".filter-row-header");

  const openModal = () => filterModal.classList.add("active");
  const closeModal = () => filterModal.classList.remove("active");

  triggerButton.addEventListener("click", openModal);
  filterModalClose.addEventListener("click", closeModal);
  filterModal.addEventListener("click", (e) => {
    if (e.target === filterModal) closeModal();
  });

  const updateHeaderVisibility = () => {
    const hasRows = filterRowsContainer.querySelector(".filter-row");
    if (filterRowHeader) {
      filterRowHeader.style.display = hasRows ? "flex" : "none";
    }
  };

  const addFilterRow = (filter = {}) => {
    const filterRow = document.createElement("div");
    filterRow.className = "filter-row";
    filterRow.innerHTML = `
      <div class="filter-control">
        <select name="filter-field" class="filter-field" required>
          <option value="" disabled ${
            !filter.field ? "selected" : ""
          } hidden>Select Column</option>
          ${columns
            .map(
              (c) =>
                `<option value="${c.value}" ${
                  filter.field === c.value ? "selected" : ""
                }>${c.text}</option>`
            )
            .join("")}
        </select>
      </div>
      <div class="filter-control">
        <select name="filter-operator" class="filter-operator" required>
            <option value="" disabled ${
              !filter.operator ? "selected" : ""
            } hidden>Select Relation</option>
            <option value="contains" ${
              filter.operator === "contains" ? "selected" : ""
            }>contains</option>
            <option value="is" ${
              filter.operator === "is" ? "selected" : ""
            }>is</option>
            <option value="is_not" ${
              filter.operator === "is_not" ? "selected" : ""
            }>is not</option>
            <option value="starts_with" ${
              filter.operator === "starts_with" ? "selected" : ""
            }>starts with</option>
            <option value="ends_with" ${
              filter.operator === "ends_with" ? "selected" : ""
            }>ends with</option>
        </select>
      </div>
      <div class="filter-control">
        <input type="text" name="filter-value" class="filter-value" placeholder="Enter value" value="${
          filter.value || ""
        }">
      </div>
      <button type="button" class="delete-row-button" title="Remove filter"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3V4H4V6H5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z" fill="#A10900"/></svg></button>
    `;
    filterRowsContainer.appendChild(filterRow);
    filterRow
      .querySelector(".delete-row-button")
      .addEventListener("click", () => {
        filterRow.remove();
        updateHeaderVisibility();
      });
    updateHeaderVisibility();
  };

  addFilterButton.addEventListener("click", () => addFilterRow());

  applyFiltersButton.addEventListener("click", () => {
    const activeFilters = Array.from(
      filterRowsContainer.querySelectorAll(".filter-row")
    )
      .map((row) => ({
        field: row.querySelector(".filter-field").value,
        operator: row.querySelector(".filter-operator").value,
        value: row.querySelector(".filter-value").value.trim(),
      }))
      .filter((f) => f.field && f.operator && f.value);

    if (onApply) onApply(activeFilters);
    closeModal();
  });

  clearFiltersButton.addEventListener("click", () => {
    filterRowsContainer.innerHTML = "";
    updateHeaderVisibility();
    if (onClear) onClear();
  });

  filterRowsContainer.innerHTML = "";
  initialFilters.forEach((filter) => addFilterRow(filter));
  updateHeaderVisibility();
};
