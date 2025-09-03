import { createDataTableComponent } from "../components/DataTable.js";
import { renderNavbar } from "../components/Navbar.js";

const API_BASE_URL =
  "https://services.odata.org/TripPinRESTierService/(S(txgzuyguqicvbxfmod212gyk))/People";
const PAGE_SIZE = 10;

const ALL_COLUMNS = [
  { value: "UserName", text: "User Name" },
  { value: "FirstName", text: "First Name" },
  { value: "LastName", text: "Last Name" },
  { value: "MiddleName", text: "Middle Name" },
  { value: "Gender", text: "Gender" },
  { value: "Age", text: "Age" },
];

const TABLE_COLUMNS = [
  { header: "User Name", accessor: "UserName" },
  { header: "First Name", accessor: "FirstName" },
  { header: "Last Name", accessor: "LastName" },
  { header: "Middle Name", accessor: "MiddleName" },
  { header: "Gender", accessor: "Gender" },
  { header: "Age", accessor: "Age" },
];

export const handlePeoplePage = () => {
  renderNavbar({
    type: "ticketing",
    activePage: "people.html",
    basePath: "../../",
  });

  if (!document.getElementById("people-section")) return;

  createDataTableComponent({
    containerId: "people-section",
    apiBaseUrl: API_BASE_URL,
    allColumns: ALL_COLUMNS,
    tableColumns: TABLE_COLUMNS,
    title: "People Data",
    pageSize: PAGE_SIZE,
  });
};
