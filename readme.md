```
📺 VideoTube Backend API

A production-ready backend for a YouTube-like application built with Node.js, Express, MongoDB, featuring authentication, video upload, likes, comments, playlists, and subscriptions.

🚀 Live Deployment (Render)

Base URL:

https://videotube-backend-vyh2.onrender.com


⚠️ Render free tier may sleep after inactivity.
First request can take 30–60 seconds.

🛠 Tech Stack

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

Multer (file uploads)

Cloudinary (media storage)

Render (deployment)

📂 API Base Path

All APIs are prefixed with:

/api/v1


Example:

/api/v1/users/login

✅ How to Test the API

You can test the backend in two ways:

Browser (GET routes only)

Postman (recommended for all routes)

🌐 1️⃣ Testing in Browser (GET routes)

Browser works only for GET requests.

🔹 Get all videos
GET /api/v1/videos


👉 Open in browser:

https://videotube-backend-vyh2.onrender.com/api/v1/videos


Expected response:

{
  "success": true,
  "videos": []
}

🔹 Test video routes
GET /api/v1/videos/test

https://videotube-backend-vyh2.onrender.com/api/v1/videos/test


Response:

{ "message": "Video routes working ✅" }

🔹 Test comment routes
GET /api/v1/comments/test

https://videotube-backend-vyh2.onrender.com/api/v1/comments/test


Response:

{ "message": "comment routes working ✅" }


❌ Do NOT use browser for:

login

register

upload

protected routes

🧪 2️⃣ Testing with Postman (Recommended)

Postman supports:

POST / PATCH / DELETE

JWT tokens

Cookies

File uploads

👤 User Routes (/api/v1/users)
🔹 Register user
POST /api/v1/users/register


Body → form-data

Key	Type
username	Text
email	Text
password	Text
avatar	File
coverImage	File (optional)
🔹 Login user
POST /api/v1/users/login


Body → raw JSON

{
  "email": "test@gmail.com",
  "password": "123456"
}

🔹 Get current user (Protected)
POST /api/v1/users/current-user


Header

Authorization: Bearer <ACCESS_TOKEN>

🔹 Logout
POST /api/v1/users/logout

🎥 Video Routes (/api/v1/videos)
🔹 Upload video (Protected)
POST /api/v1/videos/upload


Body → form-data

Key	Type
videoFile	File
thumbnail	File
🔹 Get all videos
GET /api/v1/videos

🔹 Get my videos (Protected)
GET /api/v1/videos/get-allMy-Video

🔹 Watch video (Protected)
GET /api/v1/videos/watch/:videoId

💬 Comment Routes (/api/v1/comments)
🔹 Add comment (Protected)
POST /api/v1/comments/add-comment/:videoId

❤️ Like Routes (/api/v1/likes)
🔹 Like video/comment (Protected)
POST /api/v1/likes/like/:type/:id


type → video | comment

🔹 Get all likes (Protected)
GET /api/v1/likes/get-all-like/:type/:id

📂 Playlist Routes (/api/v1/playlists)
🔹 Create playlist
POST /api/v1/playlists/create-playlist

🔹 Add / remove video from playlist
POST /api/v1/playlists/playlists/:playlistId/videos/:videoId

🔹 Get all playlists of a user
GET /api/v1/playlists/get-all-playlist/:userId

🔔 Subscription Routes (/api/v1/subscription)
🔹 Subscribe to channel
POST /api/v1/subscription/channel/:channelId

🔹 Get subscribers
GET /api/v1/subscription/get-subscriber/:channelId

🔹 Unsubscribe
GET /api/v1/subscription/unsubscribe/:channelId

🔐 Authentication

JWT-based authentication

Protected routes require:

Authorization: Bearer <ACCESS_TOKEN>

🧑‍💻 Local Development
npm install
npm run dev


Server runs on:

http://localhost:8000

✅ Deployment Status

✔ Backend deployed on Render
✔ MongoDB Atlas connected
✔ All routes tested via Postman & browser

📌 Notes

Browser → only for GET routes

Postman → required for auth & uploads

Render free tier may sleep
```