![Natours Logo](https://github.com/abdomohamed96/Natours/blob/main/public/img/logo-green.png?raw=true)

**Natours** is an exceptional tour booking site built with Node.js. It offers a wide range of features, enabling users to search and book tours, manage their bookings, and update their profiles. The site includes authentication and authorization functionalities, allowing users to securely log in and log out. On the tour page, users can explore tours on a map, read user reviews, and view ratings. Additionally, users can make payments for tours using a credit card.

---

## 🌐 [Visit the live app](https://natours-uijp.onrender.com/)

---
## 🎥 [Demo Video](https://drive.google.com/file/d/1kba02sWffmhaXM_Kw8uQXUjUDgKMxow2/view?usp=sharing)

---
##  [API Documentation](https://documenter.getpostman.com/view/32602280/2sA2r556Kq)

---

## Table of Contents

- [Demo Video](#demo-video)
- [Features and Technologies](#features-and-technologies)
  - [Database and Models](#database-and-models)
  - [API and Backend](#api-and-backend)
  - [Security and Performance](#security-and-performance)
  - [User Experience](#user-experience)
  - [Payment Processing](#payment-processing)
  - [Testing](#testing)
  - [Development and Deployment](#development-and-deployment)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Contributing](#contributing)

---

## ✨ Features and Technologies

### Database and Models

- **MongoDB**: Used as the database to store application data.
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js.
- **Data Modelling**: Efficient data modeling techniques for handling tours, users, bookings, reviews, and more.

### API and Backend

- **RESTful API Design**: Implementation of RESTful APIs for various functionalities.
- **Error Handling**: Robust error handling mechanisms to ensure smooth operation.
- **Authentication and Authorization**: Secure user authentication and authorization using JWT.
- **MVC Architecture**: Structured the backend using the Model-View-Controller pattern.
- **CRUD Operations**: Create, Read, Update, and Delete operations for tours, users, and reviews.
- **API Features**: Filtering, sorting, aliasing, and pagination to enhance API usability.
- **Aggregation Pipeline**: Advanced data processing using MongoDB's aggregation framework.
- **Middleware**: Use of document, query, and aggregation middleware for additional logic.
- **Data Validation**: Built-in and custom validators to ensure data integrity.

### Security and Performance

- **Security Best Practices**: Implementation of best practices to secure the application.
- **Rate Limiting**: Prevent abuse by limiting the number of requests to the API.
- **HTTP Headers**: Setting security HTTP headers to protect the application.
- **Data Sanitization**: Clean user inputs to prevent security vulnerabilities.
- **Parameter Pollution**: Preventing parameter pollution in API requests.
- **JWT via Cookies**: Sending JWT tokens via cookies for secure authentication.
- **CORS**: Implementing Cross-Origin Resource Sharing to allow API access from different origins.

### User Experience

- **Server-Side Rendering with Pug**: Using Pug templates for server-side rendering of the UI.
- **Dynamic Pages**: Building dynamic tour overview and detail pages.
- **User Account Management**: Allow users to update their profiles and manage their bookings.
- **Image Uploads**: Handling image uploads for user profiles and tours using Multer.
- **Email Notifications**: Sending emails for various events like sign-up, password reset, and booking confirmations using Nodemailer and Sendgrid.

### Payment Processing

- **Stripe Integration**: Secure and seamless credit card payments for booking tours.
- **Webhooks**: Handling Stripe webhooks for payment confirmations and booking management.

### Testing

- **Unit Testing and Integration Testing with Jest**: Comprehensive unit and integration tests to ensure code quality and functionality.
- **End-to-End Testing with Puppeteer**: Simulate user interactions and verify the complete flow of the application using Puppeteer.

### Development and Deployment

- **Development Tools**: Debugging with ndb, handling unhandled routes, and error handling during development.
- **Git and GitHub**: Version control using Git, and pushing code to GitHub.
- **Deployment to Render**: Deploying the application to Render with HTTPS support and proper termination handling.
- **Environment Configuration**: Managing different environments for development and production.

---

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **MongoDB**: NoSQL database for storing data.
- **JWT**: JSON Web Token for secure user authentication.
- **Pug**: Template engine for server-side rendering.
- **Multer**: Middleware for handling multipart/form-data, used for image uploads.
- **Nodemailer**: Module for sending emails from Node.js applications.
- **Sendgrid**: Cloud-based service for sending emails.
- **Stripe**: Online payment processing for internet businesses.
- **Parcel**: Web application bundler.
- **Helmet**: Secure HTTP headers middleware.
- **CORS**: Middleware to enable Cross-Origin Resource Sharing.
- **Dotenv**: Module to load environment variables from a `.env` file.
- **Bcrypt**: Library to hash passwords.
- **Validator**: Library to validate and sanitize strings.
- **Jest**: JavaScript testing framework for unit and integration testing.
- **Puppeteer**: Node library to control headless Chrome or Chromium for end-to-end testing.

---

## 🚀 Getting Started

To get started with Natours, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone git@github.com:abdomohamed96/Natours.git
   cd Natours
   ```

2. **Install Dependencies**:
    ```sh
    npm install
    ```

3. **Set Up Environment Variables**: Create a `.env` file and configure the required environment variables.

4. **Start the Development Server**:
    ```sh
    npm run start
    ```

## Contributing

I welcome contributions! Please fork the repository and create a pull request with your changes.
