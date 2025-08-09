# MongoDB Atlas Setup Guide 🗄️

## Step 1: Create Free MongoDB Atlas Account

1. **Visit MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with email or Google account
3. **Verify email** if needed

## Step 2: Create Your First Cluster (Free Tier)

1. **Select "Build a Database"**
2. **Choose M0 Sandbox** (FREE tier)
   - 512 MB storage
   - No credit card required
3. **Select Cloud Provider**: AWS
4. **Select Region**: Choose closest to your location
5. **Cluster Name**: `chizen-fitness`
6. **Click "Create"** (takes 1-3 minutes)

## Step 3: Configure Database Access

1. **Navigate to Database Access** (left sidebar)
2. **Add New Database User**:
   - **Authentication Method**: Password
   - **Username**: `chizen-admin`
   - **Password**: Click "Autogenerate Secure Password" (save this!)
   - **Database User Privileges**: Read and write to any database
3. **Add User**

## Step 4: Configure Network Access

1. **Navigate to Network Access** (left sidebar)
2. **Add IP Address**:
   - **Current IP**: Allow your current IP
   - **0.0.0.0/0**: Allow access from anywhere (for production)
   - **Description**: "ChiZen App Access"
3. **Confirm**

## Step 5: Get Connection String

1. **Navigate to Clusters** (Database Deployments)
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Driver**: Node.js, Version: 5.5 or later
5. **Copy Connection String**:
   ```
   mongodb+srv://chizen-admin:<password>@chizen-fitness.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with the password you generated

## Step 6: Update Your Environment Files

**Backend (.env)**:
```bash
# Replace this line:
MONGODB_URL=mongodb://localhost:27017/chizen-fitness

# With your Atlas connection string:
MONGODB_URL=mongodb+srv://chizen-admin:YOUR_PASSWORD@chizen-fitness.xxxxx.mongodb.net/chizen-fitness?retryWrites=true&w=majority
```

## Step 7: Test Connection

```bash
# Start your backend
cd backend
python run.py

# Look for this in the logs:
# ✅ Connected to MongoDB
```

## Database Schema (Auto-Created)

Your app will automatically create these collections:
- `users` - User accounts and preferences
- `routines` - Generated AI routines
- `newsletter_subscriptions` - Email subscribers

## Optional: View Your Data

1. **In Atlas Dashboard**: Click "Browse Collections"
2. **Create Sample Data**: Use Atlas sample datasets
3. **Use Compass**: Download MongoDB Compass for GUI access

## Production Considerations

**Security**:
- Use strong passwords
- Limit IP access to your servers only
- Enable database encryption

**Performance**:
- Free tier includes 100 connections
- Upgrade to M10+ for production workloads
- Consider connection pooling

**Backup**:
- Free tier includes basic backup
- Configure backup schedules in production

## Troubleshooting

**Connection Issues**:
- Check IP whitelist includes your server IPs
- Verify username/password
- Ensure connection string format is correct

**Slow Performance**:
- Free tier has shared resources
- Consider upgrading for better performance
- Use indexes for frequently queried fields

Your MongoDB Atlas cluster is now ready! 🎉