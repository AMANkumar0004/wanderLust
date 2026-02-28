# WanderLust 🌍

WanderLust is a full-stack travel listing web application inspired by platforms like Airbnb. It allows users to explore travel destinations, create and manage property listings, upload images, and share reviews with other users.

The application provides a simple and interactive platform where travelers can discover places to stay and hosts can list their properties. The project follows the MVC architecture to maintain a clean and scalable code structure.

---

## 🚀 Features

- Browse travel destinations and property listings  
- Create, edit, and delete property listings  
- Upload images for listings using Cloudinary  
- User authentication and authorization with Passport.js  
- Add and manage reviews for listings  
- Secure login and signup system  
- Flash messages for user feedback  
- Client-side and server-side validation  
- Responsive UI using Bootstrap  

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- Bootstrap
- EJS

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- MongoDB Atlas

### Authentication
- Passport.js
- Express Session

### Image Storage
- Cloudinary

### Architecture
- MVC (Model View Controller)

---

## 📂 Project Structure

```
WanderLust
│
├── models
│   ├── listing.js
│   └── review.js
│
├── routes
│   ├── listings.js
│   └── reviews.js
│
├── controllers
│   ├── listings.js
│   └── reviews.js
│
├── views
│   ├── listings
│   ├── reviews
│   └── layouts
│
├── public
│   ├── css
│   └── js
│
├── utils
├── middleware
├── app.js
└── package.json
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/AMANkumar0004/wanderLust.git
```

### 2. Navigate to the project directory

```bash
cd wanderLust
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create a `.env` file

Add the following environment variables:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

DB_URL=your_mongodb_connection_string

SESSION_SECRET=your_secret
```

### 5. Run the server

```bash
node app.js
```

or

```bash
npm start
```

---

## 🌐 Future Improvements

- Add advanced search and filtering  
- Implement booking functionality  
- Add payment gateway integration  
- Improve UI with modern frameworks like React  
- Add recommendation system for destinations  

---

## 📸 Screenshots

You can add screenshots of your application here to showcase the UI.

Example:

- Home Page  
- Listing Page  
- Add New Listing  
- Review Section  

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to fork the repository and submit a pull request.

---

## 📜 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

Aman Kumar

GitHub: https://github.com/AMANkumar0004
