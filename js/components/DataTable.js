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
        updateUrlWithState();
        renderLoading();
        fetchData();
      },
    });
  };

  const updateUrlWithState = () => {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);

    if (activeFilters.length > 0) {
      params.set("filters", btoa(JSON.stringify(activeFilters)));
    } else {
      params.delete("filters");
    }

    if (activeSorts.length > 0) {
      params.set("sorts", btoa(JSON.stringify(activeSorts)));
    } else {
      params.delete("sorts");
    }

    if (skip > 0) {
      params.set("page", skip / pageSize + 1);
    } else {
      params.delete("page");
    }

    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${
      newSearch ? `?${newSearch}` : ""
    }`;
    history.replaceState({}, "", newUrl);
  };

  const readStateFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedFilters = urlParams.get("filters");
    const encodedSorts = urlParams.get("sorts");
    const page = urlParams.get("page");

    if (encodedFilters) {
      try {
        activeFilters = JSON.parse(atob(encodedFilters));
      } catch (e) {
        console.error("Failed to parse filters from URL", e);
        activeFilters = [];
      }
    }

    if (encodedSorts) {
      try {
        activeSorts = JSON.parse(atob(encodedSorts));
      } catch (e) {
        console.error("Failed to parse sorts from URL", e);
        activeSorts = [];
      }
    }

    if (page) {
      const pageNumber = parseInt(page, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        skip = (pageNumber - 1) * pageSize;
      }
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > Math.ceil(totalCount / pageSize)) return;
    skip = (pageNumber - 1) * pageSize;
    updateUrlWithState();
    renderLoading();
    fetchData();
  };

  const getPageNumbers = (totalPages, currentPage) => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l && i - l !== 1) rangeWithDots.push("...");
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
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
    const totalPages = Math.ceil(count / pageSize);
    const currentPage = skip / pageSize + 1;
    const pageNumbers = getPageNumbers(totalPages, currentPage);

    let paginationHTML = "";
    if (totalPages > 1) {
      paginationHTML = `
        <nav class="pagination-container" aria-label="Table navigation">
          <ul class="pagination-list">
            <li class="pagination-item">
              <button class="pagination-link prev-button" ${
                currentPage === 1 ? "disabled" : ""
              } data-page="${currentPage - 1}" aria-label="Previous page">Previous</button>
            </li>
            ${pageNumbers
              .map((page) => {
                if (page === "...") {
                  return `<li class="pagination-item ellipsis" aria-disabled="true"><span class="pagination-link">...</span></li>`;
                }
                return `
                  <li class="pagination-item ${page === currentPage ? "active" : ""}">
                    <button class="pagination-link" data-page="${page}" ${page === currentPage ? 'aria-current="page"' : ""} aria-label="Go to page ${page}">${page}</button>
                  </li>`;
              })
              .join("")}
            <li class="pagination-item">
              <button class="pagination-link next-button" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}" aria-label="Next page">Next</button>
            </li>
          </ul>
        </nav>`;
    }

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
      ${paginationHTML}
    `;

    const tableContainerId = `${containerId}-table-container`;
    if (data.length > 0) {
      createTable(tableContainerId, tableColumns, data);
    } else {
      document.getElementById(
        tableContainerId
      ).innerHTML = `<p style="text-align: center;">No data found matching the criteria.</p>`;
    }

    section
      .querySelector(".pagination-container")
      ?.addEventListener("click", (e) => {
        const target = e.target.closest(".pagination-link");
        if (!target || target.disabled) return;
        const page = parseInt(target.dataset.page, 10);
        if (!isNaN(page)) {
          handlePageClick(page);
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
          if (f.field === 'Gender' && (f.operator === 'starts_with' || f.operator === 'ends_with' || f.operator === 'contains')) {
            showAlert(`The "${f.operator}" operator is not supported for the "Gender" field. Please use "is" or "is not".`, 'error');
            return '';
          }
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
        updateUrlWithState();
        renderLoading();
        fetchData();
      },
      onClear: () => {
        activeFilters = [];
        skip = 0;
        updateUrlWithState();
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
        updateUrlWithState();
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
        updateUrlWithState();
        renderLoading();
        fetchData();
      },
      onClear: () => {
        activeSorts = [];
        skip = 0;
        updateUrlWithState();
        renderLoading();
        fetchData();
      },
    });
  };

  readStateFromUrl();
  renderLoading();
  fetchData();
};
