# Multi-Country Time Conversion Website

This is a simple and responsive web application that allows users to select three countries from dropdown menus and view their current local times simultaneously. The app automatically updates the time in real-time and provides time conversion based on user input or the current system time.

## Features

-   **Country Selection:** Three dropdown menus for selecting countries.
-   **Real-Time Display:** Display current time for each selected country, updating every second.
-   **Time Conversion:** Input field to select a custom time in any one country and see the corresponding time in the other two countries.
-   **Responsive UI:** Fully responsive for mobile, tablet, and desktop.

## Setup and Deployment

### Prerequisites

You will need a modern web browser to run this application.

### Running Locally

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/multi-country-time-converter.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd multi-country-time-converter
    ```
3.  Open the `index.html` file in your web browser.

### Deployment

This project can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

1.  **Vercel/Netlify:**
    -   Connect your Git repository to Vercel or Netlify.
    -   Configure the build settings (no build command needed for this project).
    -   Deploy the `main` branch.

2.  **GitHub Pages:**
    -   Go to your repository's settings.
    -   Under the "Pages" section, select the `main` branch as the source.
    -   Your site will be deployed at `https://your-username.github.io/multi-country-time-converter/`.

## API

This project uses the [WorldTimeAPI](http://worldtimeapi.org/) to fetch accurate time data for different timezones. No API key is required.

## Technologies Used

-   HTML5
-   CSS3
-   JavaScript (ES6)
-   [Poppins](https://fonts.google.com/specimen/Poppins) font from Google Fonts
