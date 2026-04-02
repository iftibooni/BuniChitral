# BuniChitral - Book Local Travel Guides in Chitral

A modern web application that connects tourists with local travel guides and predefined travel packages in Chitral, Pakistan.

## Features

- 🏔️ Browse local travel guides with ratings and reviews
- 📅 View and book curated travel packages
- 👤 User authentication (Tourist & Guide accounts)
- 💳 Booking management system
- 📊 User dashboard to track bookings
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Hosting**: GitHub Pages (Free)

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Enter project name: `BuniChitral`
4. Click "Create project"
5. Once created, go to Project Settings ⚙️ > Service Accounts > Firebase Admin SDK

### 2. Enable Firebase Services

1. **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Save

2. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Select "Start in test mode" (for development)
   - Choose location: `asia-southeast1` (closest to Pakistan)
   - Click "Create"

### 3. Get Firebase Config

1. Go to Project Settings (⚙️ icon)
2. Under "Your apps", click the web icon (</>)
3. Copy the Firebase config object that looks like:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 4. Update Firebase Config

1. Open `js/firebase-config.js`
2. Replace the placeholder values with your Firebase config
3. Save the file

### 5. Update Firestore Security Rules

1. Go to Firestore Database > Rules
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /travelPlans/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /bookings/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### 6. Deploy to GitHub Pages

1. Create a new GitHub repository named `bunichitral`
2. Clone and add all project files:
```bash
git clone https://github.com/yourusername/bunichitral.git
cd bunichitral
# Add all project files here
git add .
git commit -m "Initial commit"
git push origin main
```

3. Go to repository Settings > Pages
4. Under "Source", select "Deploy from a branch"
5. Select `main` branch and `/root` folder
6. Click "Save"
7. Your site will be live at: `https://yourusername.github.io/bunichitral/`

## Project Structure

```
bunichitral/
├── index.html          # Home page
├── guides.html         # Browse guides
├── plans.html          # Travel packages
├── booking.html        # Booking page
├── auth.html           # Login/Signup
├── dashboard.html      # User dashboard
├── css/
│   └── style.css       # Styling
├── js/
│   ├── firebase-config.js   # Firebase setup
│   ├── auth.js              # Authentication logic
│   ├── auth-page.js         # Login/Signup handlers
│   ├── guides.js            # Guides page logic
│   ├── plans.js             # Plans page logic
│   ├── booking.js           # Booking logic
│   ├── dashboard.js         # Dashboard logic
│   └── navbar.js            # Navbar updates
└── README.md           # This file
```

## How It Works

### For Tourists:
1. Sign up or login
2. Browse available guides and travel packages
3. Select and book a guide or travel plan
4. Check your dashboard for booking confirmations
5. Leave reviews and ratings

### For Guides:
1. Sign up with role "Travel Guide"
2. Complete your profile (daily rate, experience, languages)
3. Receive booking requests
4. Build your reputation through reviews

## Database Schema

### Users Collection
```javascript
{
  name: string,
  email: string,
  phone: string,
  role: "tourist" | "guide",
  // Guide fields:
  dailyRate: number,
  experience: string,
  languages: string,
  about: string,
  rating: number,
  reviews: number,
  totalBookings: number
}
```

### Travel Plans Collection
```javascript
{
  title: string,
  description: string,
  duration: number,
  price: number,
  rating: number,
  reviews: number,
  includes: array
}
```

### Bookings Collection
```javascript
{
  userId: string,
  guideId: string,
  planId: string,
  date: timestamp,
  days: number,
  participants: number,
  totalPrice: number,
  status: "pending" | "confirmed" | "completed",
  createdAt: timestamp
}
```

## Future Enhancements

- [ ] Payment integration (Stripe, Jazz Cash)
- [ ] Email notifications
- [ ] Image uploads for guides
- [ ] Advanced search and filters
- [ ] Review and rating system
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Real-time chat between guide and tourist

## Development

To run locally:
1. Open `index.html` in a web browser
2. Set up Firebase config in `js/firebase-config.js`
3. Make changes to HTML/CSS/JS files
4. Push to GitHub to deploy

## Security Notes

- Never commit Firebase config with real keys
- Use environment variables in production
- Implement proper authentication before publishing

## License

MIT License - feel free to use for your project!

## Support

For issues or questions:
1. Check Firebase console for errors
2. Open browser Developer Tools (F12) to see console logs
3. Verify Firebase Security Rules are properly set
4. Check file paths and Firebase config

---

**Happy travels with BuniChitral!** 🏔️
