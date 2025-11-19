# Dashboard Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API URL**
   - Open `src/api/axiosClient.js`
   - Update `baseURL` if your backend is not on `http://localhost:8000`

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Dashboard**
   - Open browser to `http://localhost:5173`
   - Login with admin credentials:
     - Email: `admin@inventory.com`
     - Password: `password`

## Backend Requirements

Make sure your Laravel backend is running on `http://localhost:8000` and has these endpoints:

### Required Endpoints (Already Added)
- ✅ `POST /api/admin/login`
- ✅ `GET /api/me`
- ✅ `POST /api/logout`
- ✅ `GET /api/products` (CRUD)
- ✅ `GET /api/categories` (CRUD)
- ✅ `GET /api/warehouse-stock`
- ✅ `POST /api/warehouse-stock/update`
- ✅ `GET /api/admin/drivers` (NEW - Added)
- ✅ `GET /api/drivers/{id}/stock`
- ✅ `POST /api/assign-stock`
- ✅ `GET /api/admin/sales` (NEW - Added)
- ✅ `GET /api/sales/{id}`
- ✅ `GET /api/admin/stats`

## Project Structure

```
Dashboard/
├── src/
│   ├── api/
│   │   └── axiosClient.js       # API configuration
│   ├── components/               # Reusable components
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state
│   ├── pages/                    # All pages
│   ├── App.jsx                   # Main app with routing
│   └── main.jsx                  # Entry point
├── package.json
└── README.md
```

## Features

- ✅ Login/Logout
- ✅ Dashboard with statistics
- ✅ Products Management (Full CRUD)
- ✅ Categories Management (Full CRUD)
- ✅ Warehouse Stock Management
- ✅ Drivers List & Stock View
- ✅ Assign Stock to Drivers
- ✅ Sales List & Details

## Troubleshooting

### CORS Issues
If you get CORS errors, make sure your Laravel backend has CORS configured properly.

### API Connection Failed
- Check if backend is running
- Verify API URL in `axiosClient.js`
- Check browser console for errors

### Login Not Working
- Verify backend endpoint `/api/admin/login` is working
- Check network tab in browser DevTools
- Ensure token is being saved in localStorage

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

