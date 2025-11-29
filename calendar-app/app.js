// Mock data
let currentUser = null;
let currentDate = new Date();
let currentMatchIndex = 0;
let selectedDate = null;

const mockUsers = [
    { id: 1, name: 'Alex Chen', interests: ['hiking', 'photography', 'coffee'], emoji: '🎨', bio: 'Love outdoor adventures!' },
    { id: 2, name: 'Sarah Johnson', interests: ['yoga', 'reading', 'travel'], emoji: '🌟', bio: 'Bookworm and world traveler' },
    { id: 3, name: 'Mike Rodriguez', interests: ['gaming', 'cooking', 'music'], emoji: '🎮', bio: 'Gamer chef by night' },
    { id: 4, name: 'Emma Wilson', interests: ['fitness', 'movies', 'art'], emoji: '💪', bio: 'Fitness enthusiast and art lover' },
    { id: 5, name: 'David Kim', interests: ['tech', 'basketball', 'food'], emoji: '🏀', bio: 'Tech geek and foodie' }
];

// Get all users from localStorage
function getAllUsers() {
    const users = localStorage.getItem('allUsers');
    return users ? JSON.parse(users) : [];
}

// Save all users to localStorage
function saveAllUsers(users) {
    localStorage.setItem('allUsers', JSON.stringify(users));
}

// Initialize
function init() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    }
}

// Show signup form
function showSignup() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
}

// Show login form
function showLogin() {
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

// Signup
function signup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const birthday = document.getElementById('signup-birthday').value;
    const gender = document.getElementById('signup-gender').value;
    const bio = document.getElementById('signup-bio').value.trim();
    const interests = document.getElementById('signup-interests').value.split(',').map(i => i.trim()).filter(i => i);
    
    if (!name || !email || !password || !birthday || !gender) {
        alert('Please fill in all required fields');
        return;
    }
    
    const allUsers = getAllUsers();
    
    // Check if email already exists
    if (allUsers.some(u => u.email === email)) {
        alert('Email already registered');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        birthday,
        gender,
        bio,
        interests,
        emoji: ['🎨', '🌟', '🎮', '💪', '🏀', '🎭', '🎪', '🎯'][Math.floor(Math.random() * 8)],
        friends: [],
        events: [],
        invitations: [],
        createdAt: new Date().toISOString()
    };
    
    allUsers.push(newUser);
    saveAllUsers(allUsers);
    
    alert('Account created successfully! Please login.');
    showLogin();
}

// Login
function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    const allUsers = getAllUsers();
    const user = allUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
        alert('Invalid email or password');
        return;
    }
    
    // Ensure user has required arrays
    if (!user.events) user.events = [];
    if (!user.invitations) user.invitations = [];
    if (!user.friends) user.friends = [];
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showApp();
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('hidden');
}

function showApp() {
    document.getElementById('username').textContent = currentUser.name;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    renderCalendar();
    loadEvents();
    loadFriends();
    loadUserProfile();
    showNextMatch();
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    
    event.target.classList.add('active');
    document.getElementById(`${tab}-tab`).classList.remove('hidden');
    
    if (tab === 'calendar') renderCalendar();
    if (tab === 'events') loadEvents();
    if (tab === 'friends') showNextMatch();
}

// Calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('current-month').textContent = 
        new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    // Day headers
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement('div'));
    }
    
    // Days
    const events = getEvents();
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        
        if (dayEvents.length > 0) {
            cell.classList.add('has-event');
        }
        
        cell.innerHTML = `
            <div class="day-number">${day}</div>
            ${dayEvents.map(e => `<div class="event-dot" title="${e.title}"></div>`).join('')}
        `;
        
        cell.onclick = () => showDayEvents(dateStr, dayEvents);
        
        grid.appendChild(cell);
    }
}

function showDayEvents(date, events) {
    selectedDate = date;
    const container = document.getElementById('selected-day-events');
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="day-events">
                <h3>Events for ${new Date(date).toLocaleDateString()}</h3>
                <p class="empty-state">No events on this day</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="day-events">
                <h3>Events for ${new Date(date).toLocaleDateString()}</h3>
                ${events.map(e => `
                    <div class="event-card">
                        <h4>${e.title}</h4>
                        <p>⏰ ${e.time || 'All day'}</p>
                        <p>${e.description || ''}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

// Events
function showEventModal() {
    document.getElementById('event-modal').classList.remove('hidden');
    
    // Set default date to selected date or today
    const defaultDate = selectedDate || new Date().toISOString().split('T')[0];
    document.getElementById('event-date').value = defaultDate;
    
    const friendSelect = document.getElementById('friend-select');
    friendSelect.innerHTML = '<p>Invite friends:</p>';
    currentUser.friends.forEach(friend => {
        friendSelect.innerHTML += `
            <label>
                <input type="checkbox" class="friend-invite" value="${friend.id}" />
                ${friend.name}
            </label>
        `;
    });
}

function closeEventModal() {
    document.getElementById('event-modal').classList.add('hidden');
}

function createEvent() {
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const description = document.getElementById('event-description').value.trim();
    const isPublic = document.getElementById('event-public').checked;
    
    if (!title || !date) {
        alert('Please fill in title and date');
        return;
    }
    
    const invitedFriends = Array.from(document.querySelectorAll('.friend-invite:checked'))
        .map(cb => parseInt(cb.value));
    
    const event = {
        id: Date.now(),
        title,
        date,
        time,
        description,
        creator: currentUser.id,
        creatorName: currentUser.name,
        invitedFriends: isPublic ? currentUser.friends.map(f => f.id) : invitedFriends
    };
    
    // Ensure events array exists
    if (!currentUser.events) currentUser.events = [];
    currentUser.events.push(event);
    
    console.log('Event created:', event);
    console.log('Current user events:', currentUser.events);
    
    // Save user data
    saveUser();
    
    // Send invitations to friends
    const allUsers = getAllUsers();
    event.invitedFriends.forEach(friendId => {
        const friend = allUsers.find(u => u.id === friendId);
        if (friend) {
            if (!friend.invitations) friend.invitations = [];
            friend.invitations.push({
                id: event.id,
                title: event.title,
                date: event.date,
                time: event.time,
                description: event.description,
                creator: currentUser.name,
                creatorId: currentUser.id
            });
        }
    });
    saveAllUsers(allUsers);
    
    // Clear form
    document.getElementById('event-title').value = '';
    document.getElementById('event-time').value = '';
    document.getElementById('event-description').value = '';
    document.getElementById('event-public').checked = false;
    
    closeEventModal();
    renderCalendar();
    loadEvents();
    alert('Event created and invitations sent!');
}

function loadEvents() {
    const invitationsList = document.getElementById('invitations-list');
    const myEventsList = document.getElementById('my-events-list');
    
    // Mock invitations
    invitationsList.innerHTML = currentUser.invitations.length === 0 
        ? '<p class="empty-state">No pending invitations</p>'
        : currentUser.invitations.map(inv => `
            <div class="event-card">
                <h3>${inv.title}</h3>
                <p>📅 ${inv.date} ${inv.time || ''}</p>
                <p>From: ${inv.creator}</p>
                <button class="btn-small" onclick="acceptInvitation(${inv.id})">Accept</button>
                <button class="btn-small btn-reject" onclick="declineInvitation(${inv.id})">Decline</button>
            </div>
        `).join('');
    
    myEventsList.innerHTML = currentUser.events.length === 0
        ? '<p class="empty-state">No events yet</p>'
        : currentUser.events.map(event => `
            <div class="event-card">
                <h3>${event.title}</h3>
                <p>📅 ${event.date} ${event.time || ''}</p>
                <p>${event.description || ''}</p>
                <p>Invited: ${event.invitedFriends.length} friends</p>
            </div>
        `).join('');
}

function acceptInvitation(id) {
    const invitation = currentUser.invitations.find(inv => inv.id === id);
    if (invitation) {
        // Add to user's events
        currentUser.events.push({
            id: invitation.id,
            title: invitation.title,
            date: invitation.date,
            time: invitation.time,
            description: invitation.description,
            creator: invitation.creatorId,
            creatorName: invitation.creator,
            accepted: true
        });
    }
    
    currentUser.invitations = currentUser.invitations.filter(inv => inv.id !== id);
    saveUser();
    renderCalendar();
    loadEvents();
    alert('Invitation accepted! Event added to your calendar.');
}

function declineInvitation(id) {
    currentUser.invitations = currentUser.invitations.filter(inv => inv.id !== id);
    saveUser();
    loadEvents();
}

// Profile management
function loadUserProfile() {
    const profile = document.getElementById('user-profile');
    profile.innerHTML = `
        <div class="profile-card">
            <div class="profile-emoji">${currentUser.emoji}</div>
            <h3>${currentUser.name}</h3>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Birthday:</strong> ${new Date(currentUser.birthday).toLocaleDateString()}</p>
            <p><strong>Gender:</strong> ${currentUser.gender}</p>
            <p><strong>Bio:</strong> ${currentUser.bio || 'No bio yet'}</p>
            <div class="interests">
                ${(currentUser.interests || []).map(i => `<span class="interest-tag">${i}</span>`).join('')}
            </div>
        </div>
    `;
}

function showEditProfile() {
    document.getElementById('profile-modal').classList.remove('hidden');
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-birthday').value = currentUser.birthday;
    document.getElementById('edit-gender').value = currentUser.gender;
    document.getElementById('edit-bio').value = currentUser.bio || '';
    document.getElementById('edit-interests').value = (currentUser.interests || []).join(', ');
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

function saveProfile() {
    currentUser.name = document.getElementById('edit-name').value.trim();
    currentUser.birthday = document.getElementById('edit-birthday').value;
    currentUser.gender = document.getElementById('edit-gender').value;
    currentUser.bio = document.getElementById('edit-bio').value.trim();
    currentUser.interests = document.getElementById('edit-interests').value.split(',').map(i => i.trim()).filter(i => i);
    
    saveUser();
    
    // Update in all users
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
        saveAllUsers(allUsers);
    }
    
    loadUserProfile();
    closeProfileModal();
    alert('Profile updated!');
}

// Friends matching
function showNextMatch() {
    const allUsers = getAllUsers();
    const availableUsers = [...mockUsers, ...allUsers].filter(u => 
        u.id !== currentUser.id && !currentUser.friends.some(f => f.id === u.id)
    );
    
    if (availableUsers.length === 0) {
        document.getElementById('match-card').innerHTML = `
            <div class="empty-state">
                <h3>No more users to match</h3>
                <p>Check back later!</p>
            </div>
        `;
        document.querySelector('.match-actions').style.display = 'none';
        return;
    }
    
    currentMatchIndex = currentMatchIndex % availableUsers.length;
    const user = availableUsers[currentMatchIndex];
    
    document.getElementById('match-card').innerHTML = `
        <div class="match-profile">
            <div class="match-emoji">${user.emoji}</div>
            <h2>${user.name}</h2>
            <p class="match-bio">${user.bio || 'No bio available'}</p>
            <div class="interests">
                ${(user.interests || []).map(i => `<span class="interest-tag">${i}</span>`).join('')}
            </div>
        </div>
    `;
    
    document.querySelector('.match-actions').style.display = 'flex';
}

function acceptMatch() {
    const allUsers = getAllUsers();
    const availableUsers = [...mockUsers, ...allUsers].filter(u => 
        u.id !== currentUser.id && !currentUser.friends.some(f => f.id === u.id)
    );
    
    if (availableUsers.length > 0) {
        const user = availableUsers[currentMatchIndex];
        currentUser.friends.push({
            id: user.id,
            name: user.name,
            emoji: user.emoji,
            interests: user.interests || [],
            bio: user.bio || ''
        });
        saveUser();
        alert(`You're now connected with ${user.name}!`);
    }
    
    currentMatchIndex++;
    showNextMatch();
    loadFriends();
}

function rejectMatch() {
    currentMatchIndex++;
    showNextMatch();
}

function loadFriends() {
    const friendsList = document.getElementById('friends-list');
    
    friendsList.innerHTML = currentUser.friends.length === 0
        ? '<p class="empty-state">No connections yet. Start matching!</p>'
        : currentUser.friends.map(friend => `
            <div class="friend-card">
                <div class="friend-emoji">${friend.emoji}</div>
                <div>
                    <h3>${friend.name}</h3>
                    <div class="interests">
                        ${friend.interests.map(i => `<span class="interest-tag">${i}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
}

// Helpers
function getEvents() {
    return currentUser ? currentUser.events : [];
}

function saveUser() {
    // Save to currentUser
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Also update in allUsers array
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
        saveAllUsers(allUsers);
    }
}

// Initialize app
init();
