# SocialCal - Social Calendar App

## Data Storage

All data is stored in your browser's **localStorage**:

1. **currentUser** - The logged-in user's data (events, friends, invitations)
2. **allUsers** - Array of all registered users

## How to Use

1. Open `index.html` in your browser
2. Create an account with the signup form
3. Login with your email and password
4. Create events on the calendar
5. Invite friends to events
6. Match with new friends

## Viewing Stored Data

Open browser console (F12) and type:
```javascript
// View current user
console.log(JSON.parse(localStorage.getItem('currentUser')));

// View all users
console.log(JSON.parse(localStorage.getItem('allUsers')));

// Clear all data (reset app)
localStorage.clear();
```

## Features

- ✅ Account creation with member info (name, email, birthday, gender, bio, interests)
- ✅ Login/logout system
- ✅ Calendar with event display
- ✅ Create events and invite friends
- ✅ Accept/decline event invitations
- ✅ Friend matching system
- ✅ Profile management

## Troubleshooting

If events don't show:
1. Make sure you're logged in
2. Check browser console for errors (F12)
3. Verify events are saved: `localStorage.getItem('currentUser')`
4. Try clearing localStorage and creating a new account
