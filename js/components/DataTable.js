import { createTable } from "./Table.js";
import { initFilterModal } from "./FilterModal.js";
import { initSortModal } from "./SortModal.js";
import { showAlert } from "../utils/ui.js";
import { updateStatefulButton } from "./StatefulButton.js";
import { initRefreshButton } from "./RefreshButton.js";

export const createDataTableComponent = ({
  containerId,
  apiBaseUrl,
  allColumns,
  tableColumns,
  title,
  pageSize = 10,
  filterModalId = "filter-modal",
  sortModalId = "sort-modal",
}) => {
  const section = document.getElementById(containerId);
  if (!section) return;

  let skip = 0;
  let activeFilters = [];
  let activeSorts = [];
  let totalCount = 0;

  const updateButtonStates = () => {
    updateStatefulButton({
      buttonSelector: `#${containerId} .filter-button`,
      activeItems: activeFilters,
      name: "Filter",
      onClear: () => {
        activeFilters = [];
        skip = 0;
        renderLoading();
        fetchData();
      },
    });
    updateStatefulButton({
      buttonSelector: `#${containerId} .sort-button`,
      activeItems: activeSorts,
      name: "Sort",
      onClear: () => {
        activeSorts = [];
        skip = 0;
        renderLoading();
        fetchData();
      },
    });
  };

  const renderLoading = () => {
    section.innerHTML = `
      <div class="ticket-header">
        <h2>${title}</h2>
      </div>
      <div id="${containerId}-table-container">
        <div class="loader-container">
          <div class="loader"></div>
          <p>Loading data...</p>
        </div>
      </div>
      <div class="pagination-controls" style="visibility: hidden; justify-content: space-between; align-items: center; margin-top: 1rem;"></div>
    `;
  };

  const render = (data, count) => {
    section.innerHTML = `
      <div class="ticket-header">
        <h2>${title}</h2>
        <div class="header-actions">
          <button class="sort-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z" fill="#5856D6"/>
            </svg>
            <span>Sort</span>
          </button>
          <button class="filter-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.61743 13.0542H18.6174V11.0542H6.61743M3.61743 6.0542V8.0542H21.6174V6.0542M10.6174 18.0542H14.6174V16.0542H10.6174V18.0542Z" fill="#5856D6"/>
            </svg>
            <span>Filter</span>
          </button>
          <button class="refresh-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6666 5.33335L9.99996 8.00002H12C12 9.06089 11.5785 10.0783 10.8284 10.8284C10.0782 11.5786 9.06083 12 7.99996 12C7.33329 12 6.68663 11.8334 6.13329 11.5334L5.15996 12.5067C5.97996 13.0267 6.95329 13.3334 7.99996 13.3334C9.41445 13.3334 10.771 12.7715 11.7712 11.7713C12.7714 10.7711 13.3333 9.41451 13.3333 8.00002H15.3333M3.99996 8.00002C3.99996 6.93915 4.42139 5.92174 5.17153 5.17159C5.92168 4.42145 6.93909 4.00002 7.99996 4.00002C8.66663 4.00002 9.31329 4.16669 9.86663 4.46669L10.84 3.49335C10.02 2.97335 9.04663 2.66669 7.99996 2.66669C6.58547 2.66669 5.22892 3.22859 4.22872 4.22878C3.22853 5.22898 2.66663 6.58553 2.66663 8.00002H0.666626L3.33329 10.6667L5.99996 8.00002" fill="#5856D6"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>
      <div id="${containerId}-table-container"></div>
      <div class="pagination-controls" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
        <button id="${containerId}-prev-page" class="primary-button" ${
      skip === 0 ? "disabled" : ""
    }>Previous</button>
        <span>Page ${count > 0 ? skip / pageSize + 1 : 0} of ${Math.ceil(
      count / pageSize
    )}</span>
        <button id="${containerId}-next-page" class="primary-button" ${
      skip + pageSize >= count ? "disabled" : ""
    }>Next</button>
      </div>
    `;

    const tableContainerId = `${containerId}-table-container`;
    if (data.length > 0) {
      createTable(tableContainerId, tableColumns, data);
    } else {
      document.getElementById(
        tableContainerId
      ).innerHTML = `<p style="text-align: center;">No data found matching the criteria.</p>`;
    }

    document
      .getElementById(`${containerId}-prev-page`)
      .addEventListener("click", () => {
        if (skip > 0) {
          skip -= pageSize;
          renderLoading();
          fetchData();
        }
      });

    document
      .getElementById(`${containerId}-next-page`)
      .addEventListener("click", () => {
        if (skip + pageSize < totalCount) {
          skip += pageSize;
          renderLoading();
          fetchData();
        }
      });

    initializeModals();
    updateButtonStates();
  };

  const fetchData = async () => {
    const selectColumns = tableColumns.map((c) => c.accessor).join(",");
    let url = `${apiBaseUrl}?$count=true&$select=${selectColumns}&$top=${pageSize}&$skip=${skip}`;

    if (activeFilters.length > 0) {
      const filterClauses = activeFilters
        .map((f) => {
          const value = typeof f.value === "string" ? `'${f.value}'` : f.value;
          switch (f.operator) {
            case "is":
              return `${f.field} eq ${value}`;
            case "is_not":
              return `${f.field} ne ${value}`;
            case "starts_with":
              return `startswith(${f.field}, ${value})`;
            case "ends_with":
              return `endswith(${f.field}, ${value})`;
            case "contains":
              return `contains(${f.field}, ${value})`;
            default:
              return "";
          }
        })
        .filter(Boolean);
      if (filterClauses.length > 0) {
        url += `&$filter=${filterClauses.join(" and ")}`;
      }
    }

    if (activeSorts.length > 0) {
      const sortClauses = activeSorts.map((s) => `${s.field} ${s.direction}`);
      url += `&$orderby=${sortClauses.join(",")}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      totalCount = data["@odata.count"];
      render(data.value, totalCount);
    } catch (error) {
      console.error(`Failed to fetch data for ${title}:`, error);
      showAlert(
        `Could not fetch data for ${title}. Please try again later.`,
        "error"
      );
      section.innerHTML = `<p style="text-align: center; color: red;">Error loading data.</p>`;
    }
  };

  const initializeModals = () => {
    initFilterModal({
      modalId: filterModalId,
      triggerButtonSelector: `#${containerId} .filter-button`,
      columns: allColumns,
      initialFilters: activeFilters,
      onApply: (filters) => {
        activeFilters = filters;
        skip = 0;
        renderLoading();
        fetchData();
      },
      onClear: () => {
        activeFilters = [];
        skip = 0;
        renderLoading();
        fetchData();
      },
    });

    initRefreshButton({
      buttonSelector: `#${containerId} .refresh-button`,
      onRefresh: () => {
        activeFilters = [];
        activeSorts = [];
        skip = 0;
        renderLoading();
        fetchData();
      },
    });

    initSortModal({
      modalId: sortModalId,
      triggerButtonSelector: `#${containerId} .sort-button`,
      columns: allColumns,
      initialSorts: activeSorts,
      onApply: (sorts) => {
        activeSorts = sorts;
        skip = 0;
        renderLoading();
        fetchData();
      },
      onClear: () => {
        activeSorts = [];
        skip = 0;
        renderLoading();
        fetchData();
      },
    });
  };

  renderLoading();
  fetchData();
};
