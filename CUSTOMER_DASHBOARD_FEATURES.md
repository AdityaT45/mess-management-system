# Customer Dashboard Features

## 🧑‍🍳 Customer Dashboard (Mobile App)

The customer dashboard provides a comprehensive interface for mess customers to manage their subscriptions, track attendance, and interact with the mess system.

### 🔹 1. Welcome Section
- **Greeting**: "Welcome, Rohit 👋" with personalized name
- **Profile photo**: Avatar with customer's initial
- **Status badge**: Shows current subscription status (Active/Expired/Pending)

### 🔹 2. Active Subscription Info
- **Mess Name**: Display with logo/emoji
- **Plan Details**: Monthly/Weekly/Trial with pricing
- **Date Range**: Start Date → End Date
- **Meal Preference**: Veg/Non-Veg indicator
- **Status**: Active/Expired/Pending Renewal
- **Action Button**: Renew/Upgrade Plan

### 🔹 3. Daily Meals Overview
- **Today's Menu**: Breakfast/Lunch/Dinner with detailed items
- **Meal Timing**: Next eligible meal reminder
- **Inclusion Status**: Highlights if today's meal is included or extra charge

### 🔹 4. Attendance & Check-ins
- **Monthly Stats**: Days attended this month with progress bar
- **Next Eligible Meal**: Shows what meal customer can attend next
- **Mark Attendance**: QR code scan or manual code entry
- **Progress Visualization**: Attendance percentage with visual progress bar

### 🔹 5. Payment Section
- **Current Plan Price**: Displayed prominently
- **Last Payment**: Status (Paid/Unpaid) with date
- **Download Invoice**: PDF download functionality
- **Online Payment**: UPI/Wallet/Card payment options

### 🔹 6. Notifications & Announcements
- **Admin Messages**: Holiday notices, special meals, timing changes
- **System Notifications**: Payment due, subscription ending reminders
- **Visual Indicators**: Color-coded notification types (info/warning)

### 🔹 7. Feedback & Complaints
- **Quick Rating**: Star-based rating system for daily meals
- **Feedback Form**: Detailed feedback on taste, hygiene, service
- **Complaint Box**: Direct communication with mess admin

### 🔹 8. History & Reports
- **Attendance Records**: Past attendance history
- **Payment History**: All previous transactions
- **Feedback History**: Past reviews and ratings
- **Reports**: Downloadable reports and invoices

### 🔹 9. Quick Actions/Shortcuts
- **Renew Plan**: Quick subscription renewal
- **Pay Now**: Immediate payment processing
- **View Menu**: Weekly meal plan access
- **Give Feedback**: Quick feedback submission

### 🔹 10. Upcoming Renewal Reminder
- **Banner Alert**: "Your plan ends in X days – Renew now & save 5%"
- **Direct CTA**: Prominent renewal button
- **Conditional Display**: Only shows when renewal is due soon

## Technical Implementation

### API Integration
- **Customer Dashboard Service**: `api/customerDashboardService.js`
- **Endpoints**: Dashboard data, attendance, feedback, payments, menu
- **Error Handling**: Graceful fallback to mock data
- **Real-time Updates**: Pull-to-refresh functionality

### UI/UX Features
- **Responsive Design**: Optimized for mobile devices
- **Modern UI**: Clean, intuitive interface with consistent styling
- **Interactive Elements**: Touch-friendly buttons and modals
- **Visual Feedback**: Loading states, progress bars, status indicators
- **Accessibility**: Clear typography and color contrast

### Navigation
- **Sidebar Menu**: Easy access to all features
- **Modal Dialogs**: Attendance marking and feedback submission
- **Smooth Transitions**: Native navigation animations

### State Management
- **Redux Integration**: User authentication and data persistence
- **Local State**: Component-level state for UI interactions
- **Data Caching**: Efficient data loading and refresh

## Usage

1. **Login**: Customer logs in with their credentials
2. **Dashboard Load**: System fetches customer data and subscription info
3. **Daily Interaction**: Customer can mark attendance, view menu, give feedback
4. **Payment Management**: View payment history and make new payments
5. **Subscription Management**: Renew or upgrade plans as needed

## Future Enhancements

- **Push Notifications**: Real-time alerts for meal times and announcements
- **QR Code Scanner**: Camera integration for attendance marking
- **Offline Support**: Cached data for offline viewing
- **Social Features**: Community feedback and ratings
- **Analytics**: Personal usage statistics and insights
