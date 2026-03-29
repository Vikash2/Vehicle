require("dotenv").config();
const { auth, db } = require("../src/config/firebase");

/**
 * Script to create the first Super Admin user
 * Run: node scripts/createSuperAdmin.js
 */
async function createSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL || "admin@sandhyahonda.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";
  const name = "Super Admin";
  const mobile = "9999999999";

  try {
    console.log("🔄 Creating Super Admin user...");

    // Create auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    console.log("✅ Firebase Auth user created");

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: "Super Admin",
      showroomId: null,
    });

    console.log("✅ Custom claims set");

    // Save to RTDB
    await db.ref(`users/${userRecord.uid}`).set({
      uid: userRecord.uid,
      email,
      name,
      mobile,
      role: "Super Admin",
      showroomId: null,
      createdAt: Date.now(),
      isActive: true,
    });

    console.log("✅ User data saved to RTDB");
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Super Admin created successfully!");
    console.log("=".repeat(50));
    console.log("Email:   ", email);
    console.log("Password:", password);
    console.log("UID:     ", userRecord.uid);
    console.log("=".repeat(50));
    console.log("\n⚠️  IMPORTANT: Save these credentials securely!");
    console.log("You can now use these to login and create other users.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating Super Admin:");
    
    if (error.code === "auth/email-already-exists") {
      console.error("This email already exists. Use a different email or delete the existing user first.");
    } else {
      console.error(error.message);
    }
    
    process.exit(1);
  }
}

// Run the script
createSuperAdmin();
