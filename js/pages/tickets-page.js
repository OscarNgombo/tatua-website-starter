import { createTable } from "../components/Table.js";
import { initFilterModal } from "../components/FilterModal.js";
import { initSortModal } from "../components/SortModal.js";
import { updateStatefulButton } from "../components/StatefulButton.js";
import { initRefreshButton } from "../components/RefreshButton.js";
import { showAlert, showConfirm } from "../utils/ui.js";
import { encryptData, decryptData } from "../utils/crypto.js";
import { renderNavbar } from "../components/Navbar.js";

const PAGE_SIZE = 10;

export const handleMyTicketsPage = (currentTicketStorage) => {
  renderNavbar({
    type: "ticketing",
    activePage: "tickets.html",
    basePath: "../../",
  });

  const ticketSection = document.getElementById("ticket-section");
  if (!ticketSection) {
    return;
  }

  ticketSection.innerHTML = `
    <div class="ticket-header">
      <h2></h2>
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
    <div id="table-container"></div>
    <div class="pagination-controls" style="display: none; justify-content: space-between; align-items: center; margin-top: 1rem;">
    </div>
  `;

  const ticketHeader = ticketSection.querySelector(".ticket-header");
  const tableContainer = document.getElementById("table-container");
  let allTickets = decryptData(currentTicketStorage.getItem("tickets")) || [];
  let activeFilters = [];
  let activeSorts = [];
  let skip = 0;

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
      params.set("page", skip / PAGE_SIZE + 1);
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
      if (!isNaN(pageNumber) && pageNumber > 0)
        skip = (pageNumber - 1) * PAGE_SIZE;
    }
  };

  const allColumnOptions = [
    { value: "id", text: "Ticket ID" },
    { value: "fullName", text: "Raised By" },
    { value: "subject", text: "Subject" },
    { value: "dateCreated", text: "Date Created" },
  ];

  const columns = [
    {
      header: "Ticket ID",
      accessor: "id",
    },
    {
      header: "Raised By",
      render: (ticket) => `
        <div class="td-main-content">${ticket.fullName}</div>
        <div class="td-sub-content">${ticket.email}</div>
      `,
    },
    {
      header: "Ticket Details",
      render: (ticket) => {
        const eclipsedDescription =
          ticket.description.length > 40
            ? ticket.description.substring(0, 40) + "..."
            : ticket.description;
        return `
          <div class="td-main-content">${ticket.subject}</div>
          <div class="td-sub-content">${eclipsedDescription}</div>
        `;
      },
    },
    {
      header: "Date Created",
      render: (ticket) => {
        const date = new Date(ticket.dateCreated);
        return `${date.toLocaleDateString("en-KE")} ${date.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        )}`;
      },
    },
    {
      header: "Actions",
      render: (ticket) => {
        const attachments =
          ticket.attachments || (ticket.attachment ? [ticket.attachment] : []);
        const hasAttachments = attachments.length > 0;
        const attachmentTitle =
          attachments.length > 1 ? "View Attachments" : "Download Attachment";
        return `
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
            <button class="action-icon call-button ${
              ticket.contact_method === "phone" ? "active" : ""
            }" title="Call User"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.41333 7.19333C5.37333 9.08 6.92 10.6267 8.80667 11.5867L10.2733 10.12C10.46 9.93333 10.72 9.88 10.9533 9.95333C11.7 10.2 12.5 10.3333 13.3333 10.3333C13.5101 10.3333 13.6797 10.4036 13.8047 10.5286C13.9298 10.6536 14 10.8232 14 11V13.3333C14 13.5101 13.9298 13.6797 13.8047 13.8047C13.6797 13.9298 13.5101 14 13.3333 14C10.3275 14 7.44487 12.806 5.31946 10.6805C3.19404 8.55513 2 5.67245 2 2.66667C2 2.48986 2.07024 2.32029 2.19526 2.19526C2.32029 2.07024 2.48986 2 2.66667 2H5C5.17681 2 5.34638 2.07024 5.4714 2.19526C5.59643 2.32029 5.66667 2.48986 5.66667 2.66667C5.66667 3.5 5.8 4.3 6.04667 5.04667C6.12 5.28 6.06667 5.54 5.88 5.72667L4.41333 7.19333Z" fill="currentColor"/></svg></button>
            <button class="action-icon email-button ${
              ticket.contact_method === "email" ? "active" : ""
            }" title="Email User"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.6667 3.66669H6C5.26667 3.66669 4.66667 4.26669 4.66667 5.00002V11C4.66667 11.74 5.26667 12.3334 6 12.3334H14.6667C15.4067 12.3334 16 11.74 16 11V5.00002C16 4.26669 15.4067 3.66669 14.6667 3.66669ZM14.6667 11H6V6.11335L10.3333 8.33335L14.6667 6.11335V11ZM10.3333 7.20669L6 5.00002H14.6667L10.3333 7.20669ZM3.33333 11C3.33333 11.1134 3.35333 11.22 3.36667 11.3334H0.666667C0.298667 11.3334 0 11.0334 0 10.6667C0 10.3 0.298667 10 0.666667 10H3.33333V11ZM2 4.66669H3.36667C3.35333 4.78002 3.33333 4.88669 3.33333 5.00002V6.00002H2C1.63333 6.00002 1.33333 5.70002 1.33333 5.33335C1.33333 4.96669 1.63333 4.66669 2 4.66669ZM0.666667 8.00002C0.666667 7.63335 0.966667 7.33335 1.33333 7.33335H3.33333V8.66669H1.33333C0.966667 8.66669 0.666667 8.36669 0.666667 8.00002Z" fill="currentColor"/></svg></button>
            <button class="action-icon edit-button" title="Edit Ticket"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.57333 14.2867L6 14.6667L4 13.3333L2 14.6667V2H14V6.8C13.58 6.62 13.0933 6.62 12.6667 6.81333V3.33333H3.33333V12.1733L4 11.7333L6 13.0667L6.57333 12.6667V14.2867ZM7.90667 13.3067L12 9.22L13.3533 10.58L9.26667 14.6667H7.90667V13.3067ZM14.4733 9.46L13.82 10.1133L12.46 8.75333L13.1133 8.1L13.12 8.09333L13.1267 8.08667C13.24 7.98 13.4133 7.97333 13.54 8.06C13.56 8.06667 13.58 8.08667 13.5933 8.1L14.4733 8.98C14.6067 9.11333 14.6067 9.33333 14.4733 9.46ZM11.3333 6V4.66667H4.66667V6H11.3333ZM10 8.66667V7.33333H4.66667V8.66667H10Z" fill="#444054"/></svg></button>
            <button class="action-icon delete-button" title="Delete Ticket"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.99996 2V2.66667H2.66663V4H3.33329V12.6667C3.33329 13.0203 3.47377 13.3594 3.72382 13.6095C3.97387 13.8595 4.313 14 4.66663 14H11.3333C11.6869 14 12.0261 13.8595 12.2761 13.6095C12.5261 13.3594 12.6666 13.0203 12.6666 12.6667V4H13.3333V2.66667H9.99996V2H5.99996ZM4.66663 4H11.3333V12.6667H4.66663V4ZM5.99996 5.33333V11.3333H7.33329V5.33333H5.99996ZM8.66663 5.33333V11.3333H9.99996V5.33333H8.66663Z" fill="#FF3B30"/></svg></button>
          </div>
        `;
      },
    },
  ];

  const updateDisplayedTickets = () => {
    // Hide filter/sort/refresh header if there are no tickets at all.
    if (ticketHeader) {
      ticketHeader.style.display = allTickets.length > 0 ? "flex" : "none";
    }

    // Add extra top margin/padding to the body if no tickets exist to enhance layout.
    if (allTickets.length === 0) {
      document.body.style.marginTop = "2rem";
      document.body.style.paddingTop = "2rem";
    } else {
      document.body.style.marginTop = "";
      document.body.style.paddingTop = "";
    }

    let ticketsToDisplay = [...allTickets];

    if (activeFilters.length > 0) {
      ticketsToDisplay = ticketsToDisplay.filter((ticket) => {
        return activeFilters.every((filter) => {
          if (!filter.field || !filter.operator || !filter.value) return true;
          let ticketValue;
          if (filter.field === "dateCreated") {
            const date = new Date(ticket.dateCreated);
            ticketValue = date.toLocaleDateString("en-KE");
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

    const totalCount = ticketsToDisplay.length;
    const paginationControls = ticketSection.querySelector(
      ".pagination-controls"
    );

    if (totalCount > PAGE_SIZE) {
      paginationControls.style.display = "flex";
      const totalPages = Math.ceil(totalCount / PAGE_SIZE);
      const currentPage = skip / PAGE_SIZE + 1;

      paginationControls.innerHTML = `
            <button id="tickets-prev-page" class="primary-button" ${
              skip === 0 ? "disabled" : ""
            }>Previous</button>
            <span>Page ${currentPage} of ${totalPages}</span>
            <button id="tickets-next-page" class="primary-button" ${
              skip + PAGE_SIZE >= totalCount ? "disabled" : ""
            }>Next</button>
        `;

      document
        .getElementById("tickets-prev-page")
        .addEventListener("click", () => {
          if (skip > 0) {
            skip -= PAGE_SIZE;
            updateDisplayedTickets();
            updateUrlWithState();
          }
        });

      document
        .getElementById("tickets-next-page")
        .addEventListener("click", () => {
          if (skip + PAGE_SIZE < totalCount) {
            skip += PAGE_SIZE;
            updateDisplayedTickets();
            updateUrlWithState();
          }
        });
    } else {
      paginationControls.style.display = "none";
    }

    const paginatedTickets = ticketsToDisplay.slice(skip, skip + PAGE_SIZE);

    const noTicketsMessage =
      activeFilters.length > 0 || activeSorts.length > 0
        ? "No tickets match the current criteria."
        : "No tickets have been submitted yet.";

    if (paginatedTickets.length === 0) {
      const headerHtml = columns
        .map((col) => `<th>${col.header}</th>`)
        .join("");
      tableContainer.innerHTML = `
        <table class="ticket-table">
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>
            <tr>
              <td colspan="${columns.length}" style="text-align: center;">${
        totalCount > 0 ? "No tickets on this page." : noTicketsMessage
      }</td>
            </tr>
          </tbody>
        </table>`;
    } else {
      createTable("table-container", columns, paginatedTickets);
    }
  };

  initRefreshButton({
    buttonSelector: ".refresh-button",
    onRefresh: () => {
      allTickets = decryptData(currentTicketStorage.getItem("tickets")) || [];
      activeFilters = [];
      activeSorts = [];
      skip = 0;
      updateDisplayedTickets();
      updateButtonStates();
      updateUrlWithState();
    },
  });

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

  const updateButtonStates = () => {
    updateStatefulButton({
      buttonSelector: ".filter-button",
      activeItems: activeFilters,
      name: "Filter",
      onClear: () => {
        activeFilters = [];
        skip = 0;
        updateDisplayedTickets();
        updateButtonStates();
        updateUrlWithState();
      },
    });
    updateStatefulButton({
      buttonSelector: ".sort-button",
      activeItems: activeSorts,
      name: "Sort",
      onClear: () => {
        activeSorts = [];
        skip = 0;
        updateDisplayedTickets();
        updateButtonStates();
        updateUrlWithState();
      },
    });
  };

  const getTicketById = (id) => {
    const tickets = decryptData(currentTicketStorage.getItem("tickets")) || [];
    return tickets.find((ticket) => ticket.id === id);
  };

  tableContainer.addEventListener("click", (e) => {
    const targetButton = e.target.closest(".action-icon");
    if (!targetButton) return;

    const ticketId = e.target.closest("tr")?.dataset.id;
    if (!ticketId) return;

    const ticket = getTicketById(ticketId);
    const attachments =
      ticket.attachments || (ticket.attachment ? [ticket.attachment] : []);

    if (targetButton.classList.contains("delete-button")) {
      showConfirm(
        `Are you sure you want to delete ticket ${ticketId}? This action cannot be undone.`
      ).then((confirmed) => {
        if (confirmed) {
          const tickets =
            decryptData(currentTicketStorage.getItem("tickets")) || [];
          allTickets = tickets.filter((ticket) => ticket.id !== ticketId);
          currentTicketStorage.setItem("tickets", encryptData(allTickets));
          updateDisplayedTickets();
          showAlert(`Ticket ${ticketId} has been deleted.`, "success");
        }
      });
    } else if (targetButton.classList.contains("more-info-button")) {
      const date = new Date(ticket.dateCreated);
      const formattedModalDate = `${date.toLocaleDateString(
        "en-KE"
      )} ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
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
                      .map((att) =>
                        att.type.startsWith("image/")
                          ? `
                          <div class="attachment-preview">
                            <a href="${att.content}" target="_blank" rel="noopener noreferrer">
                              <img src="${att.content}" alt="Preview of ${att.name}" class="attachment-thumbnail">
                            </a>
                            <a href="${att.content}" download="${att.name}">${att.name}</a>
                          </div>`
                          : `
                          <div class="attachment-preview">
                            <svg class="attachment-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#4F4F4F"/></svg>
                            <a href="${att.content}" download="${att.name}">${att.name}</a>
                          </div>`
                      )
                      .join("")
                  : "<span>None</span>"
              }</div>
              <strong>Date Created:</strong> <span>${formattedModalDate}</span>
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
          targetButton.closest("tr").querySelector(".more-info-button").click();
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
      const url = new URL(
        "../ticketing_system/raise_ticket.html",
        window.location.href
      );
      url.searchParams.set("edit", ticketId);

      const currentUrlParams = new URLSearchParams(window.location.search);
      const storageType = currentUrlParams.get("storage");
      if (storageType) {
        url.searchParams.set("storage", storageType);
      }

      window.location.href = url.toString();
    }
  });

  initFilterModal({
    modalId: "filter-modal",
    triggerButtonSelector: ".filter-button",
    columns: allColumnOptions,
    initialFilters: activeFilters,
    onApply: (filters) => {
      activeFilters = filters;
      skip = 0;
      updateDisplayedTickets();
      updateButtonStates();
      updateUrlWithState();
    },
    onClear: () => {
      activeFilters = [];
      updateDisplayedTickets();
      skip = 0;
      updateButtonStates();
      updateUrlWithState();
    },
  });

  initSortModal({
    modalId: "sort-modal",
    triggerButtonSelector: ".sort-button",
    columns: allColumnOptions,
    initialSorts: activeSorts,
    onApply: (sorts) => {
      activeSorts = sorts;
      skip = 0;
      updateDisplayedTickets();
      updateButtonStates();
      updateUrlWithState();
    },
    onClear: () => {
      activeSorts = [];
      updateDisplayedTickets();
      skip = 0;
      updateButtonStates();
      updateUrlWithState();
    },
  });

  readStateFromUrl();
  updateDisplayedTickets();
  updateButtonStates();
};
