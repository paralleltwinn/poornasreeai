# 🔐 Admin Dashboard System - Role-Based Access Control

## 📋 Overview

The Poornasree AI system now features **separate dashboards** for different administrative roles, with **Super Admin having exclusive control** over admin management.

## 🎯 Dashboard Access Levels

### 🔴 **Super Admin Dashboard** (`SUPER_ADMIN` role only)
**Exclusive Features:**
- ✅ **System Overview** - Complete system statistics and monitoring
- ✅ **Add Admin** - Create new administrator accounts (EXCLUSIVE)
- ✅ **Admin Control Panel** - Manage all admin accounts, modify permissions (EXCLUSIVE)
- ✅ **Profile Settings** - Update personal profile information

**Access Requirements:**
- Must have `SUPER_ADMIN` role
- Accessed via: `http://localhost:3000/dashboard`
- Sidebar shows "Open Super Admin Dashboard"

### 🟡 **Admin Dashboard** (`ADMIN` role only)
**Available Features:**
- ✅ **Admin Overview** - Limited system statistics relevant to admin tasks
- ✅ **Engineer Applications** - Review and approve/reject engineer applications
- ✅ **User Management** - Basic user management features
- ✅ **Profile Settings** - Update personal profile information

**Access Requirements:**
- Must have `ADMIN` role
- Accessed via: `http://localhost:3000/dashboard`
- Sidebar shows "Open Admin Dashboard"

**Restrictions:**
- ❌ **Cannot create admin accounts** (Super Admin exclusive)
- ❌ **Cannot manage other admins** (Super Admin exclusive)
- ❌ **Cannot access complete system statistics** (Limited view only)

## 🛡️ Security Implementation

### **Route Protection**
```typescript
// Dashboard page automatically routes based on role
if (isSuperAdmin) {
  return <SuperAdminDashboard />;
} else if (isAdmin) {
  return <AdminDashboard />;
} else {
  // Redirect to home (no access)
  router.push('/');
}
```

### **Role Validation**
- **Super Admin**: Can access all admin management features
- **Admin**: Limited to user management and application reviews
- **Engineer/Customer**: No dashboard access (redirected to main app)

### **Exclusive Features**
Super Admin dashboard includes clear messaging about exclusive privileges:
- "Super Admin Exclusive: Create new administrator accounts"
- "Super Admin Exclusive: Manage all administrator accounts"
- Visual indicators showing super admin privileges

## 🎨 UI Differences

### **Super Admin Dashboard**
- **Primary color scheme** (Blue) indicating highest privilege level
- **"System Overview"** tab with complete statistics
- **"Add Admin"** and **"Admin Control"** tabs clearly marked as exclusive
- **Security badge** highlighting super admin privileges

### **Admin Dashboard**
- **Secondary color scheme** (Purple/Grey) indicating admin level
- **"Admin Overview"** tab with limited, relevant statistics
- **"Engineer Applications"** tab for core admin responsibility
- **"User Management"** tab for basic user operations
- **No admin creation/management capabilities**

## 🔄 Navigation Flow

### **Sidebar Behavior**
- **Super Admin**: "Open Super Admin Dashboard" tooltip
- **Admin**: "Open Admin Dashboard" tooltip
- **Regular Users**: "Logout" option (no dashboard access)

### **Role-Based Avatar Colors**
- **Super Admin**: Blue avatar (primary.main)
- **Admin**: Purple avatar (secondary.main)
- **Regular Users**: Grey avatar (grey.500)

### **Dashboard Redirection**
- Both admin and super admin users get dashboard opened in new tab
- Same URL (`/dashboard`) but different content based on role
- Automatic role detection and appropriate dashboard rendering

## 📊 Feature Matrix

| Feature | Super Admin | Admin | Engineer | Customer |
|---------|-------------|-------|----------|----------|
| Dashboard Access | ✅ Full | ✅ Limited | ❌ | ❌ |
| Create Admin Accounts | ✅ | ❌ | ❌ | ❌ |
| Manage Admin Accounts | ✅ | ❌ | ❌ | ❌ |
| Review Engineer Applications | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ✅ Limited | ❌ | ❌ |
| System Statistics | ✅ Complete | ✅ Limited | ❌ | ❌ |
| Profile Management | ✅ | ✅ | ✅ | ✅ |

## 🧪 Testing the System

### **Test Super Admin Access**
1. Login with: `official.tishnu@gmail.com / Access@404`
2. Visit dashboard - should see "Super Admin Dashboard"
3. Verify all 4 tabs are available: System Overview, Profile Settings, Add Admin, Admin Control
4. Test creating admin accounts in "Add Admin" tab
5. Test managing admins in "Admin Control" tab

### **Test Admin Access**
1. Create an admin account using super admin dashboard
2. Login with admin credentials
3. Visit dashboard - should see "Admin Dashboard"
4. Verify 4 tabs: Admin Overview, Engineer Applications, User Management, Profile Settings
5. Confirm no admin creation/management options available

### **Test Regular User Access**
1. Login as customer or engineer
2. Try accessing `/dashboard` - should be redirected to home
3. Sidebar should show "Logout" option, not dashboard access

## 🚀 Implementation Benefits

### **Security**
- **Principle of Least Privilege**: Admins only get necessary permissions
- **Separation of Concerns**: Clear role boundaries
- **Audit Trail**: Different interfaces for different privilege levels

### **User Experience**
- **Role-Appropriate Interfaces**: Each user sees relevant features only
- **Clear Visual Hierarchy**: Color coding and messaging indicate privilege levels
- **Intuitive Navigation**: Role-based sidebar behavior

### **Maintainability**
- **Modular Components**: Separate dashboard components for each role
- **Scalable Architecture**: Easy to add new roles or modify permissions
- **Clear Code Structure**: Role checking logic centralized and consistent

## 📁 File Structure

```
src/
├── app/dashboard/
│   └── page.tsx                    # Routes to appropriate dashboard
├── components/dashboard/
│   ├── SuperAdminDashboard.tsx     # Super admin exclusive dashboard
│   ├── AdminDashboard.tsx          # Admin limited dashboard
│   ├── AddAdminForm.tsx            # Super admin only component
│   ├── AdminList.tsx               # Super admin only component
│   └── ProfileUpdateForm.tsx       # Shared component
```

This role-based dashboard system ensures that **only Super Admins can create and manage admin accounts**, while providing appropriate interfaces for each user role level.
