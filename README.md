
# VoucherVault - Digital Wallet for Vouchers

A modern, secure web application for managing all your vouchers, coupons, gift cards, and loyalty cards in one place.

## 🎯 Features

### Core Functionality
- **Add Vouchers**: Store voucher details including name, code, expiry date, balance, notes, and color tags
- **Smart Dashboard**: View statistics, total value, and expiring vouchers at a glance
- **Search & Filter**: Find vouchers by name, code, type, or expiry date
- **Balance Tracking**: Monitor voucher balances and transaction history
- **Expiry Alerts**: Get notified about vouchers expiring soon

### Sharing & Collaboration
- **Share Vouchers**: Share vouchers with other users with view or edit permissions
- **Webhook Notifications**: Set up custom webhooks for expiry notifications

### Modern Experience
- **PWA Ready**: Install as an app on your device
- **Offline Support**: Access your vouchers even without internet
- **Dark Mode**: Eye-friendly dark theme
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vouchervault
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## 🏗️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Icons**: Lucide React
- **State Management**: React Query
- **Routing**: React Router DOM
- **PWA**: Service Worker, Web App Manifest

## 📊 Database Schema

The application uses the following main entities:

### Users
- `id` (UUID, Primary Key)
- `name` (Text)
- `email` (Text, Unique)
- `webhook_url` (Text, Optional)
- `created_at`, `updated_at` (Timestamps)

### Vouchers
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `name`, `code` (Text)
- `type` (Enum: gift_card, coupon, loyalty_card, discount, other)
- `balance`, `original_balance` (Decimal)
- `expiry_date` (Date)
- `notes` (Text, Optional)
- `color_tag` (Text)
- `image_url` (Text, Optional)
- `is_active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

### Transactions
- `id` (UUID, Primary Key)
- `voucher_id` (UUID, Foreign Key)
- `amount`, `previous_balance`, `new_balance` (Decimal)
- `description` (Text)
- `created_at` (Timestamp)

### Shared Vouchers
- `id` (UUID, Primary Key)
- `voucher_id` (UUID, Foreign Key)
- `shared_with_user_id` (UUID, Foreign Key)
- `permission` (Enum: view, edit)
- `created_at` (Timestamp)

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── lib/                # Utilities and database mock
├── data/               # Database schema and seed files
└── hooks/              # Custom React hooks
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 PWA Features

The app includes Progressive Web App capabilities:
- **Installable**: Add to home screen on mobile devices
- **Offline Access**: Basic offline functionality with service worker
- **App-like Experience**: Fullscreen mode and native feel

## 🚧 TODO Items

### High Priority
- [ ] Connect to Supabase for real database functionality
- [ ] Implement user authentication and registration
- [ ] Add image upload functionality for vouchers
- [ ] Implement voucher sharing features
- [ ] Add webhook notification system
- [ ] Complete offline functionality with service worker

### Medium Priority
- [ ] Voucher detail page with full transaction history
- [ ] Bulk operations (import/export vouchers)
- [ ] Advanced filtering and sorting options
- [ ] QR code generation for vouchers
- [ ] Push notifications for expiring vouchers

### Low Priority
- [ ] Multiple currency support
- [ ] Voucher categories and tags
- [ ] Data export functionality
- [ ] Advanced statistics and reports
- [ ] Voucher usage analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Note**: This is the initial version with mock data. Full backend integration with Supabase is required for production use.
