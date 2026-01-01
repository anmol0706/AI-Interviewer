import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const FREE_INTERVIEWS = 500;

async function giveFreeInterviews() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // First, list all users in the database
        const users = await mongoose.connection.db.collection('users').find({}).toArray();

        console.log(`Found ${users.length} users in the database:\n`);

        for (const user of users) {
            console.log(`ID: ${user._id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Name: ${user.firstName} ${user.lastName}`);
            console.log(`Current Interviews: ${user.subscription?.interviewsRemaining}`);
            console.log('---');
        }

        // Update ALL users or a specific one
        if (users.length > 0) {
            // Find user with email containing 'anmol'
            const targetUser = users.find(u => u.email && u.email.toLowerCase().includes('anmol'));

            if (targetUser) {
                console.log(`\nUpdating user: ${targetUser.email}`);

                const result = await mongoose.connection.db.collection('users').updateOne(
                    { _id: targetUser._id },
                    { $set: { 'subscription.interviewsRemaining': FREE_INTERVIEWS } }
                );

                if (result.modifiedCount === 1) {
                    console.log(`✅ Successfully gave ${FREE_INTERVIEWS} free interviews!`);

                    // Verify the update
                    const updated = await mongoose.connection.db.collection('users').findOne({ _id: targetUser._id });
                    console.log(`📊 New interviewsRemaining: ${updated.subscription?.interviewsRemaining}`);
                } else {
                    console.log('⚠️ No changes made');
                }
            } else {
                console.log('\n❌ No user found with "anmol" in email');
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

giveFreeInterviews();
