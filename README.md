# Web Page Content Analyser

This project is a web-based application built using the MERN (MongoDB, Express, React, Node.js) stack. It allows users to input multiple URLs to extract and count the readable text content, focusing on the main article or body text of the web page. The application then provides results that include the total readable text, main content text, and non-content elements like navigation bars, headers, and footers.

## 📋 Brief Documentation

### Overview
The project is designed to accurately extract the main content from any given URL while excluding non-essential elements (such as ads, headers, footers, etc.). This is achieved using a backend service built with Node.js, Express, and Puppeteer for web scraping. The frontend, developed with React and styled using Tailwind CSS, allows users to input URLs and view results in a clean, responsive interface.

### Key Components

#### Backend
- **Node.js + Express**: Handles server-side logic and manages API endpoints.
- **Puppeteer**: A headless browser library used to scrape web pages and extract content. It loads web pages in a headless Chrome instance to ensure the content is accurately retrieved.
- **Logic Decisions**:
  - Fallback mechanisms for finding the main article content (using common HTML tags like `<article>`, `<div class="content">`, etc.).
  - I have computed the non relevant content like navbars, sidebars, headers, ads, etc.
  - Then I have computed the article/blog length by subtracting it from the whole content.
  - Uses error handling to manage cases where URLs are invalid or web pages are blocked.
  - A focus on avoiding over-extraction by separating main content text from headers, footers, and sidebars.
  - Implements bulk URL processing for efficient handling of multiple URLs at once.

#### Frontend
- **React**: Provides the interactive UI for users to input URLs, trigger extraction, and display results.
- **Tailwind CSS**: Ensures responsive and clean design across devices.
- **Key Features**:
  - Loading indicators during data fetching.
  - Validation of URLs to ensure inputs are correct before sending requests.
  - Error handling with toast notifications for user feedback.

### Key Decisions
- **URL Validation**: URLs are validated on the frontend to prevent sending incorrect inputs to the server.
- **Headless Browsing**: Puppeteer is used to accurately capture dynamic content from web pages, making sure that the text retrieved is the same as what a real user would see.
- **Content Separation**: Focus on distinguishing between main content and other page elements, allowing for accurate content analysis.

### Change of Logic

The previous content extraction relied solely on manually traversing the DOM to gather visible text content. While effective, this approach required a complex set of rules to handle dynamic web content, advertisements, navigation menus, and other non-essential elements. The new logic improves the accuracy of content extraction by leveraging Mozilla’s `Readability` library, which specializes in isolating the main article or relevant content from a webpage.

1. **Use of `Puppeteer` for Page Rendering**:
   - `Puppeteer` is utilized to open web pages and handle JavaScript-heavy websites that rely on client-side rendering. This ensures that all content, including dynamically loaded elements, is available for parsing.
   - After loading the page with `Puppeteer`, the full HTML content is retrieved using `page.content()`.

2. **Introduction of `JSDOM`**:
   - The extracted HTML content is fed into `JSDOM`, creating an in-memory representation of the DOM, similar to how a browser renders a page.
   - `JSDOM` allows `Readability` to parse the HTML structure as if it were a live browser instance.

3. **Integration of Mozilla’s `Readability` Library**:
   - `Readability` is used to analyze the document structure provided by `JSDOM` and extract the main content body.
   - It removes irrelevant elements like ads, navigation links, footers, and sidebars, leaving only the core readable content.
   - The `parse` method returns an `article` object containing structured information, including the main content text, title, and other metadata.

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** and **npm** installed on your local machine.
- **Git** for cloning the repository.

### 1. Clone the Repository
```bash
git clone https://github.com/Ayushpatel26/A.-J.-D.-Solutions-Task.git

cd A.-J.-D.-Solutions-Task
```

### 2 🔄 Additional Steps to Run the Project

1. **Ensure Backend and Frontend Ports Are Correct**:
   - Make sure the frontend (`client`) is pointing to the correct backend API URL. In the frontend code, ensure the base URL for Axios requests is set to `http://localhost:5000` (or your preferred port if you change the backend port).

2. **Environment Setup for Backend**:
   - Create a `.env` file in the `Backend` folder if it doesn't already exist, and set the required variables like `PORT`.
   - Start the backend server first to ensure it's ready to handle incoming requests.

3. **Running Backend in Development Mode**:
   - Start the backend using:
     ```bash
     cd Backend
     npm i
     npm run dev
     ```
   - This will run the server using `nodemon` if it's set up in the `package.json`, allowing for automatic restarts on code changes.

4. **Running Frontend in Development Mode**:
   - Start the frontend with:
     ```bash
     cd Frontend
     npm i
     npm run dev
     ```
   - This will start a development server, and changes to the React code will automatically reload the page in your browser.

5. **Running the Application**:
   - Open the frontend in your browser (`http://localhost:5173` if running locally).
   - Enter URLs separated by spaces in the input field.
   - Check that results are displayed correctly, and validate that no errors are appearing in the console or server logs.