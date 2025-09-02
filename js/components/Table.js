export const createTable = (containerId, columns, data) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Table container with id ${containerId} not found.`);
    return;
  }
  const table = document.createElement("table");
  table.className = "ticket-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col.header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  tbody.id = "ticket-table-body";
  data.forEach((item) => {
    const row = document.createElement("tr");
    if (item.id) {
      row.dataset.id = item.id;
    }
    columns.forEach((col) => {
      const cell = document.createElement("td");
      cell.dataset.label = col.header;
      if (col.render) {
        cell.innerHTML = col.render(item);
      } else {
        const value = item[col.accessor];
        cell.textContent = value !== null && value !== undefined ? value : "";
      }
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  container.innerHTML = "";
  container.appendChild(table);
};
