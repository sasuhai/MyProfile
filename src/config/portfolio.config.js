// Portfolio Configuration
// This file determines which user's portfolio to display
// Change the USER_EMAIL to match the portfolio owner's email in the database

export const PORTFOLIO_CONFIG = {
    // The email of the portfolio owner whose data should be displayed
    // This should match the email in the profile_info table
    USER_EMAIL: 'sasuhai0@gmail.com',

    // Optional: You can also use user_id if you prefer
    // USER_ID: 'uuid-here',
}

// Note: When deploying for different users:
// 1. Change USER_EMAIL to the target user's email
// 2. Deploy to their personal domain
// 3. Each deployment will show only that user's portfolio
