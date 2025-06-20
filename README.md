# Personal Task Manager

A modern, responsive web application for managing personal tasks with Firebase integration. Built with HTML, CSS, and JavaScript.

## Features

### Core Functionality (As Required by the Problem)
- ✅ **Display All Tasks**: Clear list showing task description and completion status
- ✅ **Add New Task**: Input field with button to add new tasks
- ✅ **Mark Task as Complete/Incomplete**: Clickable checkbox to toggle completion status
- ✅ **Delete Task**: Button to permanently remove tasks
- ✅ **Persistent Data Storage**: All data stored in Firebase Firestore

### Firebase Integration (As Required)
- ✅ **Retrieve All Tasks**: Query Firebase to fetch all task documents
- ✅ **Create New Task**: Add new documents to Firebase with description and initial status
- ✅ **Update Task Status**: Update the isCompleted field of existing tasks
- ✅ **Delete Task**: Remove specific task documents from Firebase

### Additional Features
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Fast Loading**: Optimized for minimal loading time
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🔔 **Toast Notifications**: User feedback for all actions
- 📊 **Task Statistics**: Shows total and completed task counts
- ♿ **Accessibility**: Keyboard navigation and screen reader support
- 🔄 **Offline Support**: Firebase offline persistence enabled
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database:
   - Go to Firestore Database in the sidebar
   - Click "Create Database"
   - Choose "Start in test mode" (for development)
   - Select a location for your database

4. Get your Firebase configuration:
   - Click on the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - Click the web icon (</>)
   - Register your app with a nickname
   - Copy the configuration object

5. Update `firebase-config.js`:
   ```javascript
   const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project-id.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project-id.appspot.com",
       messagingSenderId: "your-messaging-sender-id",
       appId: "your-app-id"
   };
   ```

### 2. Firestore Security Rules

Update your Firestore security rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if true;  // For development only
    }
  }
}
```

**Note**: For production, implement proper authentication and security rules.

### 3. Run the Application

1. Open `index.html` in a web browser
2. Or serve the files using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000` in your browser

## Usage

### Adding Tasks
1. Type your task description in the input field
2. Press Enter or click "Add Task"
3. The task will be saved to Firebase and displayed in the list

### Managing Tasks
- **Complete/Incomplete**: Click the circular checkbox next to any task
- **Delete**: Click the "Delete" button on any task (confirmation dialog will appear)

### Task Statistics
The app shows real-time statistics:
- Total number of tasks
- Number of completed tasks

## File Structure

```
Task Manager/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── app.js             # Main JavaScript application logic
├── firebase-config.js # Firebase configuration
└── README.md          # This file
```

## Technical Implementation

### Firebase Firestore Structure
```javascript
Collection: 'tasks'
Document: {
  id: 'auto-generated',
  description: 'Task description text',
  isCompleted: false,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Key Features Implementation

1. **CRUD Operations**:
   - **Create**: `db.collection('tasks').add(newTask)`
   - **Read**: `db.collection('tasks').orderBy('createdAt', 'desc').get()`
   - **Update**: `db.collection('tasks').doc(taskId).update(updates)`
   - **Delete**: `db.collection('tasks').doc(taskId).delete()`

2. **Responsive Design**:
   - Mobile-first approach
   - Flexbox and CSS Grid
   - Media queries for different screen sizes

3. **Performance Optimizations**:
   - Efficient DOM manipulation
   - Debounced input handling
   - Optimized Firebase queries

4. **Error Handling**:
   - Try-catch blocks for all Firebase operations
   - User-friendly error messages
   - Graceful fallbacks

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Deployment

### Firebase Hosting (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

### Other Hosting Options
- GitHub Pages
- Netlify
- Vercel
- Any static file hosting service

## Troubleshooting

### Common Issues

1. **Firebase not loading**:
   - Check internet connection
   - Verify Firebase SDK URLs in HTML

2. **Configuration errors**:
   - Ensure Firebase config is properly set in `firebase-config.js`
   - Check that all required fields are filled

3. **Permission denied**:
   - Verify Firestore security rules
   - Check if database is created and accessible

4. **Tasks not loading**:
   - Check browser console for errors
   - Verify Firebase project settings
   - Ensure Firestore is enabled

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is created for educational purposes as part of the Ecell Task-2 assignment.

---

**Note**: This application meets all the requirements specified in Project Option 1 of the Ecell Task-2 PDF, including all core functional requirements and Firebase interaction specifications. 