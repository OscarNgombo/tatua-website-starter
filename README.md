# Tatua - Enterprise Ticketing Web Application

This repository contains the source code for the Tatua Solutions web application, a fictional enterprise ticketing solutions provider. What started as a simple corporate website has evolved into a feature-rich, single-page application (SPA-like) experience for managing support tickets and viewing data.

## Live Demo

The website is deployed and can be viewed live at:
**[tatua.surge.sh](http://tatua.surge.sh)**

## Features

*   **Full-Featured Ticketing System:**
    *   Create, view, edit, and delete support tickets.
    *   Client-side data persistence using `localStorage` with encryption for security.
    *   Rich form with validation and file attachment capabilities.

*   **Advanced & Reusable Data Tables:**
    *   **OData Integration:** The "People" page demonstrates fetching, filtering,sorting, and paginating data from a live OData v4 service.
    *   **Client-Side Table:** The "Tickets" page showcases a fully client-side managed table.
    *   **Stateful URL:** Table states (filters, sorts, pagination) are persisted in the URL query parameters, allowing users to bookmark and share specific views.
    *   **Advanced Controls:** Includes multi-column sorting, complex filtering modals, and intelligent pagination controls.

*   **Component-Based Architecture:**
    *   Built with vanilla JavaScript using ES6 Modules.
    *   Reusable components for common UI elements like Headers, Data Tables, Modals, and Buttons.
    *   A simple client-side router in `main.js` directs traffic to the correct page-handling logic.

*   **User Authentication:**
    *   A basic login/logout flow to simulate a secure area.
    *   Protected routes that require authentication.

*   **Modern UI/UX:**
    *   **Fully Responsive Design:** Adapts seamlessly to various screen sizes.
    *   **Accessibility Controls:**
        *   **Theme Switcher:** Toggle between different color themes.
        *   **Font Size Slider:** Dynamically adjust the base font size for readability.

## Technologies Used

*   **HTML5:** For the structure and semantic content.
*   **CSS3:** For styling, layout (Flexbox/Grid), and responsiveness.
*   **JavaScript (Vanilla ES6 Modules):** Powers all interactivity, component logic, routing, and API communication.
*   **OData:** The "People" data table uses the OData v4 protocol for querying a remote data service.

## Project Structure

The project follows a modern JavaScript structure, separating logic into components, pages, and utilities.

```
tatua-website-starter/
├── assets/
│   ├── fonts/
│   └── ... (images and other static assets)
├── src/
│   ├── about.html
│   ├── case_studies.html
│   ├── contact.html
│   ├── script.js
│   └── styles.css
├── index.html
└── README.md
```

## How to Run Locally

1.  Clone this repository to your local machine.
2.  Navigate into the `tatua-website-starter` directory.
3.  Open the `index.html` file directly in your web browser. No special server or build step is required.