import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function verify() {
    await mongoose.connect(process.env.MONGODB_URI);

    const users = await mongoose.connection.db.collection('users').find({}).toArray();

    for (const user of users) {
        console.log('Email:', user.email);
        console.log('Name:', user.firstName, user.lastName);
        console.log('Interviews Remaining:', user.subscription?.interviewsRemaining);
    }

    await mongoose.disconnect();
}

verify();
