💡 Financial Increase App — Complete Blueprint
1️⃣ Database Schema

Tables:

users / admin
Column	Type	Notes
id	INTEGER PK	Auto-increment
name	TEXT	Full name
phone	TEXT	Contact
email	TEXT	Login / contact
password	TEXT	For email/password login
biometric_verified	INTEGER	0/1 if biometric used
created_at	TEXT	Timestamp
updated_at	TEXT	Timestamp
payment_status
Column	Type	Notes
id	INTEGER PK	Auto-increment
name	TEXT	Pending, Paid, Overdue…
color	TEXT	Hex color code
sort_order	INTEGER	For tab ordering
created_at	TEXT	Timestamp
updated_at	TEXT	Timestamp
payment_tracks
Column	Type	Notes
id	INTEGER PK	Auto-increment
user_id	INTEGER	FK → users(id)
amount	REAL	Money lent
method	TEXT	Payment method
status_id	INTEGER	FK → payment_status(id)
due_date	TEXT	Date payment is due
note	TEXT	Optional notes
created_at	TEXT	Timestamp
updated_at	TEXT	Timestamp
notifications
Column	Type	Notes
id	INTEGER PK	Auto-increment
user_id	INTEGER	FK → users(id)
message	TEXT	Notification content
seen	INTEGER	0/1
created_at	TEXT	Timestamp
backups
Column	Type	Notes
id	INTEGER PK	Auto-increment
backup_date	TEXT	Timestamp
status	TEXT	Success / Fail
2️⃣ App Folder / File Structure
BiometricPaymentTracker/
 ├─ App.js
 ├─ tailwind.config.js
 ├─ package.json
 ├─ src/
 │   ├─ database/
 │   │     └─ schema.js
 │   ├─ screens/
 │   │     ├─ LoginScreen.js
 │   │     ├─ HomeScreen.js
 │   │     ├─ PaymentForm.js
 │   │     ├─ StatusList.js
 │   │     ├─ StatusForm.js
 │   │     └─ BiometricLogin.js
 │   ├─ components/
 │   │     └─ PaymentCard.js
 │   └─ utils/
 │         ├─ colors.js
 │         ├─ backupManager.js
 │         └─ googleSheets.js

3️⃣ Navigation Flow
LoginScreen
  ├─ Email/Password login
  └─ Biometric login
      ↓ Success
HomeScreen (Landing page with Tabs)
  ├─ Pending Tab
  ├─ Paid Tab
  └─ Overdue Tab
    └─ Tap payment → EditPayment (if Pending)

AddPayment (via "+" button)
EditPayment (via tapping Pending payment)
StatusList (Admin menu)
  └─ StatusForm (Add/Edit status with color picker)

4️⃣ Screens & Features
Screen	Features
LoginScreen	Email/password login, biometric login
HomeScreen	WhatsApp-style tabs (Pending/Paid/Overdue), colored cards, grouped by status, add/edit payment
PaymentForm	Add/Edit payment, only editable if status=Pending, due date, method, notes
StatusList	List all statuses, edit or delete
StatusForm	Add/Edit status with name, color picker, sort order
BiometricLogin	Optional fingerprint/face authentication
5️⃣ Background Tasks
Task	Description
Notifications	Checks due/overdue payments and alerts the owner
Weekly Backup	Creates SQLite backup automatically
Backup Cleanup	Deletes backups older than 30 days
Google Sheets Sync	Pushes payments to Google Sheet automatically or manually
6️⃣ Styling

Tailwind CSS (tailwind-react-native-classnames)

Payment cards colored dynamically based on status (status.color)

Buttons, inputs, tabs styled consistently with Tailwind

7️⃣ Google Sheets Integration

Google Sheet Web App receives POST requests from app

Push payment data after add/edit

Keeps a cloud copy for safety

Can batch export weekly

8️⃣ App Flow Diagram (Text Version)
[LoginScreen] --email/pass or biometric--> [HomeScreen: Landing Tabs]
   |                                                  |
   |--"+" AddPayment -------------------------------  |
   |--Tap Pending Payment --> [EditPayment]         |
   |--Menu -> StatusList --> [StatusForm]          |
   |                                              |
   |--Background Tasks: Notifications, Backup, Sheet Sync

✅ Key Notes

Landing Page: HomeScreen with tabs is first after login.

Payments grouped: By status, colored cards.

Editable only Pending: Ensures data integrity.

Auto Backups: Weekly + cleanup.

Biometric login: Optional but recommended.

Google Sheet sync: Optional cloud backup.



⚙️ 2️⃣ Setup guide (from zero)
Step 1: Create your project

Since you’re focusing on Android, Expo is easiest.

npm install -g expo-cli
expo init financial-increase
cd financial-increase


Choose the “Blank (TypeScript or JavaScript)” template.

Step 2: Install required packages
expo install expo-sqlite expo-local-authentication expo-notifications expo-file-system
npm install react-native-background-fetch react-native-background-task


✅ expo-sqlite → Local database
✅ expo-local-authentication → Biometric login
✅ expo-notifications → Notifications
✅ expo-file-system → File access (for backups)
✅ react-native-background-fetch / background-task → Schedule weekly backups

Step 3: Database initialization

In a file like /src/database/init.js:

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('financial_increase.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS admin (...);`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS status (...);`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS finance (...);`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS payment_track (...);`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS notifications (...);`);
  });
};

export default db;


(Paste the full SQL schema above into those queries.)

Step 4: Biometric authentication

Use expo-local-authentication:

import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to access Financial Increase',
  });
  if (result.success) {
    // proceed to main screen
  }
};

Step 5: Notifications

Use expo-notifications to alert when due dates are near:

import * as Notifications from 'expo-notifications';

const sendReminder = async (personName) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Payment Reminder',
      body: `${personName} has a payment due soon!`,
    },
    trigger: { seconds: 10 }, // or set to daily check
  });
};


You can run a daily background check for overdue finance.due_date.

Step 6: Automatic weekly backup

You can use react-native-background-fetch + expo-file-system to:

Copy your .db file to a safe folder weekly.

(Optional) Upload it to Google Drive or export to Google Sheets.

Step 7: Export to Google Sheets

You can use Google Sheets API via a service account:

Create a Google Cloud project → enable Sheets API.

Use an npm package like googleapis or call the REST endpoint directly.

Export your data as rows (e.g., every finance record).

Or simply export CSV and upload manually:

import * as FileSystem from 'expo-file-system';

const exportToCSV = async () => {
  const data = 'Name,Phone,Money Provided,Money Returned\nJohn Doe,078...,500,300\n';
  const fileUri = `${FileSystem.documentDirectory}finance.csv`;
  await FileSystem.writeAsStringAsync(fileUri, data);
};

🚀 3️⃣ Functional roadmap
Feature	Implementation
Login / Biometric	expo-local-authentication + SQLite admin table
Add/Edit Finance Record	Form screen → insert/update into finance
Add Payment	Insert into payment_track, update money_returned
View All Records	Query finance table with joined status
Status Management	Preload 4 statuses, allow color changes
Notifications	Background check overdue loans + expo-notifications
Auto Weekly Backup	background-fetch task copies .db to /Documents/
Export to Google Sheets/CSV	Manual or automated upload


⚙️ 1️⃣ Folder Structure

After setup, your project will look like this:

financial-increase/
├── App.js
├── package.json
├── tailwind.config.js
├── src/
│   ├── database/
│   │   └── init.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   └── FinanceForm.js
│   ├── components/
│   │   ├── Header.js
│   │   └── Button.js
│   ├── utils/
│   │   ├── backup.js
│   │   └── notifications.js
│   └── styles/
│       └── colors.js

🧩 2️⃣ Step-by-step setup
Step 1: Create and enter your project
npm install -g expo-cli
expo init financial-increase
cd financial-increase


Choose “Blank (JavaScript)”.

Step 2: Install dependencies
expo install expo-sqlite expo-local-authentication expo-notifications expo-file-system
npm install nativewind react-native-background-fetch react-native-background-task

Step 3: Set up Tailwind CSS (NativeWind)
npm install nativewind
npm install --save-dev tailwindcss
npx tailwindcss init


Then open tailwind.config.js and replace contents with:

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};


Now, edit babel.config.js:

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};


✅ Tailwind is now ready — you can use classes like bg-blue-500 text-white p-4 rounded-xl.

🧠 3️⃣ Database Initialization (src/database/init.js)
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('financial_increase.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        total_invested REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status_name TEXT NOT NULL,
        color TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS finance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        money_provided REAL NOT NULL,
        money_returned REAL DEFAULT 0,
        due_date TEXT,
        notes TEXT,
        status_id INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (admin_id) REFERENCES admin(id),
        FOREIGN KEY (status_id) REFERENCES status(id)
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS payment_track (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        finance_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_date TEXT DEFAULT (datetime('now')),
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (finance_id) REFERENCES finance(id)
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        finance_id INTEGER,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (finance_id) REFERENCES finance(id)
      );
    `);
  });
};

export default db;

🔐 4️⃣ Biometric Login (src/screens/LoginScreen.js)
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { initDB } from '../database/init';

export default function LoginScreen({ navigation }) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    initDB();
    authenticateUser();
  }, []);

  const authenticateUser = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert('Device not supported', 'Biometric authentication not available.');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Financial Increase',
    });
    if (result.success) {
      setAuthenticated(true);
      navigation.navigate('Home');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-blue-500">
      <Text className="text-white text-3xl font-bold mb-4">Financial Increase</Text>
      <TouchableOpacity
        className="bg-white px-5 py-3 rounded-xl"
        onPress={authenticateUser}
      >
        <Text className="text-blue-500 font-semibold">Unlock with Fingerprint</Text>
      </TouchableOpacity>
    </View>
  );
}

🏠 5️⃣ Home Screen (src/screens/HomeScreen.js)
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <Text className="text-2xl font-bold text-blue-700 mb-6">Dashboard</Text>

      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-xl mb-4"
        onPress={() => navigation.navigate('FinanceForm')}
      >
        <Text className="text-white text-lg">Add New Finance Record</Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-green-500 px-6 py-3 rounded-xl">
        <Text className="text-white text-lg">View All Records</Text>
      </TouchableOpacity>
    </View>
  );
}

📱 6️⃣ App Entry (App.js)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

🧠 7️⃣ Next steps (features to implement next)

✅ Add a FinanceForm screen to insert into finance table
✅ Add a list screen to view all finance records
✅ Create notification scheduler that runs daily & weekly auto-backups
✅ Implement CSV/Google Sheet export


Excellent ✅ — we’ll build the FinanceForm screen where you can:

➕ Add a new finance record

✏️ Edit an existing one (only if the status is “Pending”)

💾 Save changes to SQLite

💅 Use Tailwind (NativeWind) for styling

Let’s make it work smoothly in your current React Native + Expo + SQLite setup.

⚙️ 1️⃣ Create the screen

📄 src/screens/FinanceForm.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import db from '../database/init';
import { useIsFocused } from '@react-navigation/native';

export default function FinanceForm({ route, navigation }) {
  const isFocused = useIsFocused();
  const editingId = route.params?.id || null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [moneyProvided, setMoneyProvided] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [statusId, setStatusId] = useState(1); // default: Pending
  const [editable, setEditable] = useState(true);

  // Load record if editing
  useEffect(() => {
    if (editingId && isFocused) {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM finance WHERE id = ?',
          [editingId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const f = rows.item(0);
              setName(f.name);
              setPhone(f.phone);
              setEmail(f.email);
              setMoneyProvided(f.money_provided.toString());
              setDueDate(f.due_date || '');
              setNotes(f.notes || '');
              setStatusId(f.status_id);

              // Only allow editing if status = Pending (id = 1)
              setEditable(f.status_id === 1);
            }
          }
        );
      });
    }
  }, [editingId, isFocused]);

  // Save or update record
  const handleSave = () => {
    if (!name || !moneyProvided) {
      Alert.alert('Missing info', 'Name and money provided are required.');
      return;
    }

    db.transaction(tx => {
      if (editingId && editable) {
        tx.executeSql(
          `UPDATE finance 
           SET name=?, phone=?, email=?, money_provided=?, due_date=?, notes=?, updated_at=datetime('now')
           WHERE id=?`,
          [name, phone, email, moneyProvided, dueDate, notes, editingId],
          () => {
            Alert.alert('Updated', 'Finance record updated successfully');
            navigation.goBack();
          }
        );
      } else if (!editingId) {
        tx.executeSql(
          `INSERT INTO finance (name, phone, email, money_provided, due_date, notes, status_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [name, phone, email, moneyProvided, dueDate, notes, statusId],
          () => {
            Alert.alert('Saved', 'Finance record added successfully');
            navigation.goBack();
          }
        );
      } else {
        Alert.alert('Locked', 'This record cannot be edited because it is no longer pending.');
      }
    });
  };

  return (
    <View className="flex-1 bg-gray-100 p-5">
      <Text className="text-2xl font-bold text-blue-700 mb-5">
        {editingId ? 'Edit Finance Record' : 'Add Finance Record'}
      </Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        editable={editable}
        className="bg-white rounded-xl p-3 mb-3 border border-gray-300"
      />
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        editable={editable}
        className="bg-white rounded-xl p-3 mb-3 border border-gray-300"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={editable}
        className="bg-white rounded-xl p-3 mb-3 border border-gray-300"
      />
      <TextInput
        placeholder="Money Provided"
        keyboardType="numeric"
        value={moneyProvided}
        onChangeText={setMoneyProvided}
        editable={editable}
        className="bg-white rounded-xl p-3 mb-3 border border-gray-300"
      />
      <TextInput
        placeholder="Due Date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
        editable={editable}
        className="bg-white rounded-xl p-3 mb-3 border border-gray-300"
      />
      <TextInput
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        editable={editable}
        multiline
        numberOfLines={3}
        className="bg-white rounded-xl p-3 mb-4 border border-gray-300"
      />

      <TouchableOpacity
        onPress={handleSave}
        disabled={!editable}
        className={`${editable ? 'bg-blue-600' : 'bg-gray-400'} py-3 rounded-xl`}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {editingId ? 'Update Record' : 'Save Record'}
        </Text>
      </TouchableOpacity>

      {!editable && (
        <Text className="text-red-500 text-center mt-3">
          You can only edit records while status is Pending.
        </Text>
      )}
    </View>
  );
}

🧠 2️⃣ Update your navigation

In your App.js, import the new screen and add it to the stack:

import FinanceForm from './src/screens/FinanceForm';


Then inside <Stack.Navigator>:

<Stack.Screen name="FinanceForm" component={FinanceForm} options={{ title: 'Finance Form' }} />

🧾 3️⃣ Usage

To add: navigate to it using
navigation.navigate('FinanceForm');

To edit: pass the ID:
navigation.navigate('FinanceForm', { id: recordId });

When editing, if the status is not “Pending” (status_id !== 1),
the form automatically becomes read-only, and a message appears:

“You can only edit records while status is Pending.”

✅ Next options for you

From here, you can:

Add a screen to list all finance records

Add status filtering (“Pending”, “Paid”, etc.)

Add due-date checks to trigger notifications

Add automatic weekly backup for your SQLite DB


⚙️ 1️⃣ FinanceList.js

📄 src/screens/FinanceList.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import db from '../database/init';
import { useIsFocused } from '@react-navigation/native';

export default function FinanceList({ navigation }) {
  const [statuses, setStatuses] = useState([]);
  const [finances, setFinances] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadStatuses();
      loadFinances();
    }
  }, [isFocused]);

  const loadStatuses = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM status ORDER BY sort_order ASC', [], (_, { rows }) => {
        if (rows.length > 0) {
          const data = rows._array;
          setStatuses(data);
          setSelectedStatus(data[0].id); // default first tab
        }
      });
    });
  };

  const loadFinances = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT f.*, s.status_name, s.color 
         FROM finance f
         LEFT JOIN status s ON f.status_id = s.id
         ORDER BY f.created_at DESC`,
        [],
        (_, { rows }) => {
          setFinances(rows._array);
        }
      );
    });
  };

  const filterFinances = (statusId) => {
    setSelectedStatus(statusId);
  };

  const getFilteredList = () => {
    if (!selectedStatus) return [];
    return finances.filter(f => f.status_id === selectedStatus);
  };

  const handleEdit = (id, statusId) => {
    if (statusId === 1) {
      navigation.navigate('FinanceForm', { id });
    } else {
      alert('You can only edit records while status is Pending.');
    }
  };

  const records = getFilteredList();

  return (
    <View className="flex-1 bg-gray-50 pt-10">
      {/* Header */}
      <View className="px-5 pb-3 border-b border-gray-300 bg-blue-600">
        <Text className="text-white text-2xl font-bold">Financial Increase</Text>
      </View>

      {/* Tabs (like WhatsApp) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-gray-200 bg-white">
        {statuses.map(status => (
          <TouchableOpacity
            key={status.id}
            className={`px-5 py-3 ${selectedStatus === status.id ? 'border-b-4' : ''}`}
            style={{
              borderColor: selectedStatus === status.id ? status.color : 'transparent',
            }}
            onPress={() => filterFinances(status.id)}
          >
            <Text
              className={`font-bold ${selectedStatus === status.id ? 'text-black' : 'text-gray-500'}`}
            >
              {status.status_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Records list */}
      <ScrollView className="p-4">
        {records.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10">No records found for this status.</Text>
        ) : (
          records.map(item => (
            <View
              key={item.id}
              className="p-4 rounded-xl mb-4"
              style={{ backgroundColor: item.color || '#ccc' }}
            >
              <Text className="text-lg font-bold text-white mb-1">{item.name}</Text>
              <Text className="text-white">Phone: {item.phone || '-'}</Text>
              <Text className="text-white">Amount: {item.money_provided}</Text>
              <Text className="text-white">Due: {item.due_date || 'N/A'}</Text>
              <Text className="text-white mb-2">Status: {item.status_name}</Text>

              <TouchableOpacity
                onPress={() => handleEdit(item.id, item.status_id)}
                className={`px-4 py-2 rounded-xl ${item.status_id === 1 ? 'bg-white' : 'bg-gray-300'}`}
              >
                <Text
                  className={`text-center font-semibold ${
                    item.status_id === 1 ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add New Button */}
      <TouchableOpacity
        className="bg-blue-600 p-4 m-4 rounded-full items-center shadow-lg"
        onPress={() => navigation.navigate('FinanceForm')}
      >
        <Text className="text-white font-bold text-lg">+ Add New Record</Text>
      </TouchableOpacity>
    </View>
  );
}

🧠 2️⃣ Make it the landing page

In your App.js, replace the default home route with FinanceList:

import FinanceList from './src/screens/FinanceList';


Then update the navigator:

<Stack.Navigator initialRouteName="FinanceList">
  <Stack.Screen name="FinanceList" component={FinanceList} options={{ headerShown: false }} />
  <Stack.Screen name="FinanceForm" component={FinanceForm} options={{ title: 'Finance Form' }} />
</Stack.Navigator>


✅ Now when you open the app after biometric login, you’ll land on your FinanceList screen.

🌈 3️⃣ Features this gives you
Feature	Description
Tabs like WhatsApp	Horizontal tabs for each status
Dynamic colors	Each status uses its color from the status table
Grouped view	Only records of the selected status are shown
Editable control	Only “Pending” (status_id = 1) can be edited
Add button	Floating button to add new record
Auto-refresh	Reloads each time you return to screen
🔮 4️⃣ Next recommended features

After this, we can add:

🔔 Automatic notifications for overdue records

💾 Automatic weekly backup

📤 Export all data to Google Sheets or CSV


Files we’ll add
src/
├── utils/
│   ├── backup.js
│   └── notifications.js
App.js (updated)


You already have src/database/init.js and your DB name is financial_increase.db. The code below expects that; if you used another filename, change it.

1) Install required packages

Run in your project root:

expo install expo-file-system expo-task-manager expo-background-fetch expo-notifications expo-permissions
expo install expo-sqlite


(You probably already have expo-file-system, expo-sqlite and expo-notifications from earlier steps — installing these again is harmless.)

2) src/utils/backup.js — weekly DB backup (copy file)
// src/utils/backup.js
import * as FileSystem from 'expo-file-system';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

const BACKUP_TASK = 'WEEKLY_DB_BACKUP';
const DB_FILENAME = 'financial_increase.db';
const SQLITE_DIR = `${FileSystem.documentDirectory}SQLite/`;
const BACKUP_DIR = `${FileSystem.documentDirectory}financial_increase_backups/`;

// Ensure backup folder exists
async function ensureBackupDir() {
  const info = await FileSystem.getInfoAsync(BACKUP_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
  }
}

// Copy DB file to backup dir with timestamp
export async function createBackupNow() {
  try {
    await ensureBackupDir();
    const source = `${SQLITE_DIR}${DB_FILENAME}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // safe filename
    const dest = `${BACKUP_DIR}backup-${timestamp}.db`;

    const srcInfo = await FileSystem.getInfoAsync(source);
    if (!srcInfo.exists) {
      // DB file may not exist yet
      console.warn('Backup: DB file not found at', source);
      return { ok: false, message: 'DB not found' };
    }

    await FileSystem.copyAsync({ from: source, to: dest });
    console.log('Backup created at', dest);
    return { ok: true, path: dest };
  } catch (err) {
    console.error('Backup error', err);
    return { ok: false, error: err };
  }
}

/**
 * Background task registration for weekly backup.
 * Use BackgroundFetch.registerTaskAsync in your App startup.
 */
TaskManager.defineTask(BACKUP_TASK, async () => {
  try {
    console.log('[Backup Task] running backup task');
    await createBackupNow();
    // Return BackgroundFetch.Result.NewData when successful
    return BackgroundFetch.Result.NewData;
  } catch (err) {
    console.error('[Backup Task] failed', err);
    return BackgroundFetch.Result.Failed;
  }
});

export async function registerWeeklyBackup() {
  try {
    // minimumInterval is in seconds. 7 days = 7*24*3600 = 604800
    await BackgroundFetch.registerTaskAsync(BACKUP_TASK, {
      minimumInterval: 7 * 24 * 60 * 60, // 7 days
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Weekly backup task registered');
  } catch (err) {
    console.error('Failed to register weekly backup', err);
  }
}

export async function unregisterWeeklyBackup() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKUP_TASK);
  } catch (err) {
    console.error('failed to unregister', err);
  }
}


Notes about this approach

It simply copies Expo SQLite DB file from FileSystem.documentDirectory/SQLite/financial_increase.db to documentDirectory/financial_increase_backups/backup-<timestamp>.db.

On Android the file path used by expo-sqlite is typically that SQLite folder. If your DB file name or path is different, update DB_FILENAME and SQLITE_DIR.

Background execution frequency is not guaranteed exactly once per week by the OS; minimumInterval is a hint. On Android it's generally respected more than iOS. For reliable backups (especially on iOS), consider also creating a "on app start" backup check (create backup if last backup older than 7 days).

3) src/utils/notifications.js — daily scan + schedule local notifications
// src/utils/notifications.js
import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const DB_NAME = 'financial_increase.db';
const db = SQLite.openDatabase(DB_NAME);

const NOTIFY_TASK = 'DAILY_DUE_CHECK'; // background task name

// helper: convert YYYY-MM-DD to Date at 00:00
function parseYMD(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// schedule a single notification immediately (or at time)
async function scheduleNotification(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null, // immediate
    });
  } catch (err) {
    console.error('Error scheduling notification', err);
  }
}

/**
 * Scan database for due payments and schedule notifications.
 * - If due_date is today or past -> send an "Overdue" notification
 * - If due_date is within next 3 days -> send "Due soon"
 */
export function scanAndNotifyOnce() {
  return new Promise((resolve, reject) => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    db.transaction(tx => {
      // find records that are not fully paid (money_provided > money_returned)
      tx.executeSql(
        `SELECT f.id, f.name, f.due_date, f.money_provided, f.money_returned, s.status_name
         FROM finance f
         LEFT JOIN status s ON f.status_id = s.id
         WHERE (f.money_returned IS NULL OR f.money_returned < f.money_provided)`,
        [],
        (_, { rows }) => {
          const arr = rows._array || [];
          let notificationsScheduled = 0;

          arr.forEach(rec => {
            const due = parseYMD(rec.due_date);
            if (!due) return;

            // remove time portion for comparison
            const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
            const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            if (dueMidnight <= todayMid) {
              // overdue
              const title = 'Payment overdue';
              const body = `${rec.name} had a payment due on ${rec.due_date}.`;
              scheduleNotification(title, body);
              notificationsScheduled++;
            } else if (dueMidnight <= threeDaysFromNow) {
              // due soon
              const title = 'Payment due soon';
              const body = `${rec.name} will be due on ${rec.due_date}.`;
              scheduleNotification(title, body);
              notificationsScheduled++;
            }
          });

          resolve({ ok: true, scheduled: notificationsScheduled });
        },
        (_, error) => {
          console.error('DB error scanning for due payments', error);
          reject(error);
        }
      );
    });
  });
}

// Background task: define it
TaskManager.defineTask(NOTIFY_TASK, async () => {
  try {
    console.log('[Notify Task] running daily scan');
    await scanAndNotifyOnce();
    return BackgroundFetch.Result.NewData;
  } catch (err) {
    console.error('[Notify Task] failed', err);
    return BackgroundFetch.Result.Failed;
  }
});

// register function to start background notifications scan
export async function registerDailyDueCheck() {
  try {
    await BackgroundFetch.registerTaskAsync(NOTIFY_TASK, {
      minimumInterval: 24 * 60 * 60, // 1 day
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Daily due-check task registered');
  } catch (err) {
    console.error('Failed to register daily due-check', err);
  }
}

export async function unregisterDailyDueCheck() {
  try {
    await BackgroundFetch.unregisterTaskAsync(NOTIFY_TASK);
  } catch (err) {
    console.error('failed to unregister notify task', err);
  }
}


Notes about notifications

You must request notification permissions in your app and configure the notification handler.

scanAndNotifyOnce() queries the local DB for records where money_returned < money_provided and compares due_date. It schedules immediate notifications for overdue or due-soon items.

The task is registered with minimumInterval: 24 * 60 * 60 but exact schedule is not guaranteed by platform. For reliability also call scanAndNotifyOnce() every time the app opens.

4) Update App.js to register tasks, request permissions and create an on-start backup check

Replace or update your App.js with the following (merge with your existing navigation code):

// App.js
import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import FinanceList from './src/screens/FinanceList';
import FinanceForm from './src/screens/FinanceForm';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { registerWeeklyBackup, createBackupNow } from './src/utils/backup';
import { registerDailyDueCheck, scanAndNotifyOnce } from './src/utils/notifications';
import { initDB } from './src/database/init';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    // initialize DB
    initDB();

    // request permissions for notifications
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Notifications disabled', 'Enable notifications to get due-date reminders.');
      }
    })();

    // Register background tasks (best-effort)
    registerWeeklyBackup();
    registerDailyDueCheck();

    // Also run immediate checks on app start (backup + notification scan) if needed
    (async () => {
      // If you want an immediate backup on first run/open uncomment:
      // await createBackupNow();

      // Run notification scan immediately when app opens
      try {
        await scanAndNotifyOnce();
      } catch (err) {
        console.error('Immediate scan failed', err);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FinanceList" component={FinanceList} options={{ headerShown: false }} />
        <Stack.Screen name="FinanceForm" component={FinanceForm} options={{ title: 'Finance Form' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

5) CSV export and pushing to Google Sheets
A) Quick CSV export (device)

Add a function to generate a CSV from the finance table and save it to the documentDirectory, then allow the user to share it.

Example snippet (to add where you want the export button):

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('financial_increase.db');

export async function exportFinanceCSV() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT f.*, s.status_name FROM finance f LEFT JOIN status s ON f.status_id = s.id', [], async (_, { rows }) => {
        const arr = rows._array || [];
        const header = 'id,name,phone,email,money_provided,money_returned,due_date,status,created_at,updated_at\n';
        const lines = arr.map(r => `${r.id},"${r.name}","${r.phone}","${r.email}",${r.money_provided || 0},${r.money_returned || 0},"${r.due_date || ''}","${r.status_name || ''}","${r.created_at || ''}","${r.updated_at || ''}"`);
        const csv = header + lines.join('\n');
        const fname = `${FileSystem.documentDirectory}finance-export-${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
        await FileSystem.writeAsStringAsync(fname, csv, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fname);
        }
        resolve({ ok: true, path: fname });
      }, (_, error) => { reject(error); });
    });
  });
}


This lets you export CSV and share/upload it manually to Google Drive, email, etc.

B) Automate export to Google Sheets (recommended approach)

There are two practical options:

Option 1 — Easiest (no OAuth in the app):
Create a Google Apps Script (GAS) web app that accepts a POST (JSON or CSV) and writes rows into a Google Sheet. Then call that endpoint from your app with fetch() and an API key you control (or with a simple token you check in the script). Steps:

In Google Drive create a new Google Sheet.

Tools → Script editor. Paste script like:

// Apps Script endpoint
function doPost(e) {
  const ss = SpreadsheetApp.openById('YOUR_SHEET_ID');
  const sheet = ss.getSheetByName('Sheet1');
  const payload = JSON.parse(e.postData.contents); // expect array of rows
  payload.forEach(row => {
    sheet.appendRow([row.id, row.name, row.phone, row.email, row.money_provided, row.money_returned, row.due_date, row.status_name]);
  });
  return ContentService.createTextOutput(JSON.stringify({ ok: true }));
}


Deploy → New deployment → Web app → Set "Who has access" to "Anyone with link" (or restrict but then manage auth).

From app fetch('https://script.google.com/macros/s/XXX/exec', { method: 'POST', body: JSON.stringify(rows) }).

Important: this approach is simplest but not strongly secure if you allow “Anyone”; add a token param and check in your script.

Option 2 — Use Google OAuth + Sheets API from the app
This is more secure but requires implementing OAuth 2.0 and using the Sheets API (googleapis). It's more complex and usually needs server-side handling or careful client OAuth setup. If you want to go this route I can provide a step-by-step guide.

6) Practical testing checklist & notes

Test on a real Android device, not simulator, for background fetch and notifications. Background tasks are often suppressed by emulators.

Permissions: Android requires runtime permissions for notifications (handled above) and for writing files to external storage if you plan to save outside app document folder — we used FileSystem.documentDirectory which is internal app storage and doesn’t require extra permissions.

DB path: Confirm actual DB path by printing FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'SQLite') — ensure financial_increase.db exists.

Background fetch behavior: Android is more lenient; iOS may throttle background fetch frequency. Always run scanAndNotifyOnce() on app open so the user gets timely alerts even if background tasks are delayed.

Backup retention: consider cleaning old backups after N copies to avoid filling device storage.

🧩 Updated src/utils/backup.js

Replace your current backup.js content with the version below (the rest of your app code stays the same):

// src/utils/backup.js
import * as FileSystem from 'expo-file-system';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKUP_TASK = 'WEEKLY_DB_BACKUP';
const DB_FILENAME = 'financial_increase.db';
const SQLITE_DIR = `${FileSystem.documentDirectory}SQLite/`;
const BACKUP_DIR = `${FileSystem.documentDirectory}financial_increase_backups/`;
const META_FILE = `${BACKUP_DIR}last_backup.json`; // stores last backup time

async function ensureBackupDir() {
  const info = await FileSystem.getInfoAsync(BACKUP_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
  }
}

// ⏱ Helper: read last backup timestamp
async function getLastBackupDate() {
  const info = await FileSystem.getInfoAsync(META_FILE);
  if (!info.exists) return null;
  try {
    const content = await FileSystem.readAsStringAsync(META_FILE);
    const json = JSON.parse(content);
    return json.lastBackup ? new Date(json.lastBackup) : null;
  } catch {
    return null;
  }
}

// 💾 Helper: save last backup timestamp
async function saveLastBackupDate(date = new Date()) {
  await ensureBackupDir();
  await FileSystem.writeAsStringAsync(
    META_FILE,
    JSON.stringify({ lastBackup: date.toISOString() })
  );
}

// 🧰 Main function: backup DB file with “lastBackup” check
export async function createBackupNow(force = false) {
  try {
    await ensureBackupDir();
    const source = `${SQLITE_DIR}${DB_FILENAME}`;
    const srcInfo = await FileSystem.getInfoAsync(source);
    if (!srcInfo.exists) {
      console.warn('Backup: DB file not found');
      return { ok: false, message: 'DB file not found' };
    }

    // Check if last backup < 7 days ago
    if (!force) {
      const lastBackup = await getLastBackupDate();
      if (lastBackup) {
        const daysSince =
          (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
          console.log(
            `Backup skipped — last backup was ${daysSince.toFixed(
              1
            )} days ago`
          );
          return { ok: true, skipped: true };
        }
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = `${BACKUP_DIR}backup-${timestamp}.db`;
    await FileSystem.copyAsync({ from: source, to: dest });
    await saveLastBackupDate();
    console.log('Backup created at', dest);
    return { ok: true, path: dest };
  } catch (err) {
    console.error('Backup error', err);
    return { ok: false, error: err };
  }
}

// 🪄 Background task for automatic weekly backup
TaskManager.defineTask(BACKUP_TASK, async () => {
  try {
    console.log('[Backup Task] running backup task');
    await createBackupNow();
    return BackgroundFetch.Result.NewData;
  } catch (err) {
    console.error('[Backup Task] failed', err);
    return BackgroundFetch.Result.Failed;
  }
});

export async function registerWeeklyBackup() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKUP_TASK, {
      minimumInterval: 7 * 24 * 60 * 60, // 7 days
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Weekly backup task registered');
  } catch (err) {
    console.error('Failed to register weekly backup', err);
  }
}

export async function unregisterWeeklyBackup() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKUP_TASK);
  } catch (err) {
    console.error('failed to unregister', err);
  }
}

✅ What this version does

Keeps track of the last successful backup date in financial_increase_backups/last_backup.json.

Skips creating a new backup if the last one was made less than 7 days ago, unless you explicitly call createBackupNow(true) (force mode).

Works automatically with your existing weekly background task.

Prevents duplicate .db copies every time you open the app.

🧠 Optional: If you want a quick “Backup Now” button

You can use this anywhere (for example, in a settings screen):

import { createBackupNow } from '../utils/backup';

const handleManualBackup = async () => {
  const result = await createBackupNow(true);
  if (result.ok && !result.skipped) {
    alert('Backup created successfully!');
  } else if (result.skipped) {
    alert('Backup skipped — already backed up recently.');
  } else {
    alert('Backup failed. Check console for details.');
  }
};



🏗️ Phase 1: Project Setup & Database Design
⚙️ Step 1: Create Your App Folder
npx create-expo-app BiometricPaymentTracker
cd BiometricPaymentTracker

⚙️ Step 2: Install Dependencies

We’ll use Expo because it’s simpler, and it supports expo-sqlite easily.

npx expo install expo-sqlite expo-local-authentication
npm install tailwind-react-native-classnames react-native-tab-view axios


✅ Packages Explained:

expo-sqlite → local database storage

expo-local-authentication → for fingerprint/face biometric

tailwind-react-native-classnames → Tailwind CSS styling

react-native-tab-view → for WhatsApp-like status tabs

axios → for connecting/exporting to Google Sheets

🧩 Step 3: Create Database Tables (Schema)

Inside your app folder, create a file:
📄 src/database/schema.js

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('payment_tracker.db');

export const createTables = () => {
  db.transaction(tx => {
    // USERS TABLE
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        email TEXT,
        biometric_verified INTEGER DEFAULT 0
      );
    `);

    // PAYMENT STATUS TABLE
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS payment_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        color TEXT,
        sort_order INTEGER
      );
    `);

    // PAYMENT TRACK TABLE
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS payment_tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL,
        method TEXT,
        status_id INTEGER,
        due_date TEXT,
        note TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (status_id) REFERENCES payment_status(id)
      );
    `);

    // NOTIFICATIONS TABLE
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        user_id INTEGER,
        seen INTEGER DEFAULT 0,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // AUTO BACKUP LOG TABLE
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        backup_date TEXT,
        status TEXT
      );
    `);
  });
};

export default db;

🎨 Step 4: Configure Tailwind

Run:

npm install nativewind


Then create a tailwind.config.js:

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pending: "#facc15",
        paid: "#22c55e",
        overdue: "#ef4444",
      },
    },
  },
  plugins: [],
};

🧠 Step 5: Define App Logic Plan
Functionality	Description	Implementation
Add/Edit Payment	Add or edit payments if status = Pending	Form + SQLite insert/update
Status Tabs	WhatsApp-like top tabs (Pending / Paid / Overdue)	react-native-tab-view
Color Coding	Card color based on status	Tailwind color binding
Notifications	Alerts when payment is due or missed	Background check + local push
Biometric Auth	Use fingerprint to unlock app	expo-local-authentication
Auto Backup	Weekly SQLite → Google Sheets	Background scheduler + Axios
Google Sheets Export	Upload all rows to a Google Sheet	Google API endpoint
Landing Page	Tabs with grouped payments by status	Default Home Screen
🚀 Step 6: Next Steps (Phase 2)

Once we confirm this setup, I’ll generate for you:

App.js with full navigation + WhatsApp-like tabs

HomeScreen displaying colored grouped payments

Add/Edit form pages

Biometric login screen

Automatic backup + Google Sheets export integration


🏠 Phase 2 — Home Screen & UI Tabs
📁 1. Create Folder Structure

Inside src/, create:

src/
 ├── components/
 │     └── PaymentCard.js
 ├── screens/
 │     └── HomeScreen.js
 ├── database/
 │     └── schema.js     (already created)
 └── utils/
       └── colors.js

🎨 2. Color Mapping Utility – utils/colors.js
export const statusColors = {
  pending: 'bg-yellow-400',
  paid: 'bg-green-500',
  overdue: 'bg-red-500',
};

💳 3. Payment Card Component – components/PaymentCard.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { statusColors } from '../utils/colors';

export default function PaymentCard({ item, onEdit }) {
  const colorClass = statusColors[item.status_name?.toLowerCase()] || 'bg-gray-300';

  return (
    <TouchableOpacity
      style={tw`p-4 m-2 rounded-2xl shadow-md ${colorClass}`}
      onPress={() => item.status_name === 'Pending' && onEdit(item)}
    >
      <Text style={tw`text-white text-lg font-semibold`}>{item.user_name}</Text>
      <Text style={tw`text-white`}>Amount: ${item.amount}</Text>
      <Text style={tw`text-white`}>Method: {item.method}</Text>
      <Text style={tw`text-white`}>Due: {item.due_date}</Text>
      <Text style={tw`text-white italic text-xs`}>
        Status: {item.status_name}
      </Text>
    </TouchableOpacity>
  );
}

🧭 4. Home Screen – src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import db from '../database/schema';
import PaymentCard from '../components/PaymentCard';

export default function HomeScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'pending', title: 'Pending' },
    { key: 'paid', title: 'Paid' },
    { key: 'overdue', title: 'Overdue' },
  ]);

  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT p.*, s.name AS status_name, u.name AS user_name
         FROM payment_tracks p
         JOIN payment_status s ON p.status_id = s.id
         JOIN users u ON p.user_id = u.id
         ORDER BY s.sort_order`,
        [],
        (_, { rows }) => setPayments(rows._array)
      );
    });
  };

  const renderTab = status => () => {
    const filtered = payments.filter(
      p => p.status_name.toLowerCase() === status
    );
    return (
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <PaymentCard
            item={item}
            onEdit={() => navigation.navigate('EditPayment', { payment: item })}
          />
        )}
      />
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`flex-row justify-between items-center px-4 py-2 bg-blue-600`}>
        <Text style={tw`text-white text-xl font-bold`}>💰 Payment Tracker</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddPayment')}>
          <Text style={tw`text-white text-lg`}>＋</Text>
        </TouchableOpacity>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          pending: renderTab('pending'),
          paid: renderTab('paid'),
          overdue: renderTab('overdue'),
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: 360 }}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'white' }}
            style={tw`bg-blue-600`}
            labelStyle={tw`text-white font-semibold`}
          />
        )}
      />
    </SafeAreaView>
  );
}

🚪 5. Connect to App Navigation – App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createTables } from './src/database/schema';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    createTables();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* AddPayment, EditPayment, and Biometric screens come next */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

✅ 6. What You Now Have

A Tailwind-styled, tab-based landing page.

Payments are grouped and colored by status.

Pending payments are editable.

A floating “＋” adds a new payment.

🚀 Next Phase (Phase 3)

If you confirm, the next phase will add:

Add / Edit Payment form (with status check)

Biometric login screen (fingerprint / face)

Auto-notification service that reminds owner of overdue payments


🏗 Phase 3 — Add/Edit Payment + Biometric Auth + Notifications
📁 1. Add/Edit Payment Form

Create file: src/screens/PaymentForm.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import db from '../database/schema';

export default function PaymentForm({ navigation, route }) {
  const payment = route.params?.payment; // null if adding new
  const [name, setName] = useState(payment?.user_name || '');
  const [phone, setPhone] = useState(payment?.phone || '');
  const [email, setEmail] = useState(payment?.email || '');
  const [amount, setAmount] = useState(payment?.amount?.toString() || '');
  const [statusId, setStatusId] = useState(payment?.status_id || 1);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM payment_status ORDER BY sort_order`,
        [],
        (_, { rows }) => setStatuses(rows._array)
      );
    });
  };

  const savePayment = () => {
    if (!name || !phone || !amount) {
      Alert.alert('Missing fields', 'Name, phone, and amount are required');
      return;
    }

    const now = new Date().toISOString();

    db.transaction(tx => {
      if (payment) {
        // Edit only if status is Pending
        if (payment.status_name !== 'Pending') {
          Alert.alert('Cannot Edit', 'Only pending payments can be edited');
          return;
        }
        tx.executeSql(
          `UPDATE payment_tracks 
           SET amount=?, status_id=?, updated_at=?
           WHERE id=?`,
          [parseFloat(amount), statusId, now, payment.id],
          () => {
            Alert.alert('Updated', 'Payment updated successfully');
            navigation.goBack();
          }
        );
      } else {
        // Add new payment
        tx.executeSql(
          `INSERT INTO users (name, phone, email) VALUES (?, ?, ?)`,
          [name, phone, email],
          (_, { insertId }) => {
            tx.executeSql(
              `INSERT INTO payment_tracks (user_id, amount, status_id, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?)`,
              [insertId, parseFloat(amount), statusId, now, now],
              () => {
                Alert.alert('Saved', 'Payment added successfully');
                navigation.goBack();
              }
            );
          }
        );
      }
    });
  };

  return (
    <ScrollView style={tw`flex-1 p-4 bg-gray-50`}>
      <Text style={tw`text-lg font-bold mb-2`}>User Name</Text>
      <TextInput value={name} onChangeText={setName} style={tw`border p-2 rounded mb-4`} />

      <Text style={tw`text-lg font-bold mb-2`}>Phone</Text>
      <TextInput value={phone} onChangeText={setPhone} style={tw`border p-2 rounded mb-4`} />

      <Text style={tw`text-lg font-bold mb-2`}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} style={tw`border p-2 rounded mb-4`} />

      <Text style={tw`text-lg font-bold mb-2`}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={tw`border p-2 rounded mb-4`}
      />

      <Text style={tw`text-lg font-bold mb-2`}>Status</Text>
      {statuses.map(s => (
        <TouchableOpacity
          key={s.id}
          style={tw`p-2 mb-2 border rounded ${statusId === s.id ? 'bg-blue-400' : 'bg-white'}`}
          onPress={() => setStatusId(s.id)}
        >
          <Text style={tw`text-black`}>{s.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={savePayment}
        style={tw`bg-blue-600 p-3 rounded mt-4`}
      >
        <Text style={tw`text-white text-center font-bold`}>{payment ? 'Update Payment' : 'Add Payment'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


✅ Supports Add + Edit, but edits are allowed only for Pending payments.

🔐 2. Biometric Login Screen

Create file: src/screens/BiometricLogin.js

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import * as LocalAuthentication from 'expo-local-authentication';

export default function BiometricLogin({ navigation }) {
  const handleBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert('Error', 'Biometric authentication not supported');
      return;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      Alert.alert('Error', 'No fingerprints or face registered');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login with Biometrics',
    });

    if (result.success) {
      navigation.replace('Home'); // Go to landing page
    } else {
      Alert.alert('Failed', 'Authentication failed');
    }
  };

  useEffect(() => {
    handleBiometric();
  }, []);

  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-50`}>
      <Text style={tw`text-lg font-bold mb-4`}>Biometric Login</Text>
      <TouchableOpacity onPress={handleBiometric} style={tw`bg-blue-600 p-3 rounded`}>
        <Text style={tw`text-white font-bold`}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

🔔 3. Notifications (Payment Reminder)

You already have notifications.js from Phase 1. Here’s the simplified usage:

import { scanAndNotifyOnce } from './utils/notifications';

// Call when app opens:
useEffect(() => {
  scanAndNotifyOnce();
}, []);


It will automatically trigger notifications for overdue and due soon payments.

Works best when combined with the background fetch you already set up.

🧭 4. Update App Navigation (App.js)
import BiometricLogin from './src/screens/BiometricLogin';
import PaymentForm from './src/screens/PaymentForm';
import HomeScreen from './src/screens/HomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Login" component={BiometricLogin} />
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="AddPayment" component={PaymentForm} />
  <Stack.Screen name="EditPayment" component={PaymentForm} />
</Stack.Navigator>

✅ 5. What You Have Now

Landing Page

WhatsApp-style tabs (Pending / Paid / Overdue)

Colored cards based on status

Add / Edit Payment Form

Can only edit Pending payments

Add new users/payments

Biometric Login

Fingerprint / Face authentication

Notifications

Local notifications for due / overdue payments

Works on app open + background tasks


🏗 Phase 4 — Auto Backup Cleanup + Google Sheets Integration
🔄 1. Auto Backup Cleanup

Create file: src/utils/backupManager.js

import * as FileSystem from 'expo-file-system';
import { createBackupNow } from './backup';

const BACKUP_DIR = `${FileSystem.documentDirectory}financial_increase_backups/`;

export async function cleanupOldBackups(daysToKeep = 30) {
  try {
    const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
    const now = Date.now();

    for (const file of files) {
      if (!file.endsWith('.db')) continue;

      const info = await FileSystem.getInfoAsync(BACKUP_DIR + file);
      const fileAgeDays = (now - info.modificationTime) / (1000 * 60 * 60 * 24);
      if (fileAgeDays > daysToKeep) {
        await FileSystem.deleteAsync(BACKUP_DIR + file);
        console.log('Deleted old backup:', file);
      }
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}

// Combined weekly backup + cleanup
export async function weeklyBackupRoutine() {
  await cleanupOldBackups();
  const result = await createBackupNow();
  if (result.ok && !result.skipped) {
    console.log('Weekly backup completed:', result.path);
  }
}


What this does:

Deletes backup files older than 30 days.

Creates a new backup if 7+ days passed since last backup.

Can be called from app open or background fetch task.

📤 2. Google Sheets Export

To export to Google Sheets, use Google Sheets API via a Web App endpoint:

Create a Google Sheet.

Go to Extensions → Apps Script → New Project

Paste:

function doPost(e){
  var ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
  var sheet = ss.getSheetByName('Sheet1');
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.user_name,
    data.phone,
    data.email,
    data.amount,
    data.status_name,
    data.due_date
  ]);

  return ContentService.createTextOutput(JSON.stringify({result: 'success'}))
        .setMimeType(ContentService.MimeType.JSON);
}


Deploy → Web App → Anyone, even anonymous

Copy Web App URL.

🔗 3. Expo Function to Push Payments

src/utils/googleSheets.js

import axios from 'axios';

const SHEET_URL = 'YOUR_WEB_APP_URL';

export async function pushPaymentToSheet(payment) {
  try {
    const payload = {
      user_name: payment.user_name,
      phone: payment.phone,
      email: payment.email,
      amount: payment.amount,
      status_name: payment.status_name,
      due_date: payment.due_date
    };
    const res = await axios.post(SHEET_URL, payload);
    console.log('Sheet response:', res.data);
    return res.data;
  } catch (err) {
    console.error('Google Sheet push error:', err);
    return null;
  }
}


Call pushPaymentToSheet(payment) after adding or updating a payment.

You can also run a batch push for all payments weekly.

🔄 4. Hook Backup + Sheet Export

You can now combine:

import { weeklyBackupRoutine } from './utils/backupManager';
import { pushPaymentToSheet } from './utils/googleSheets';
import db from './database/schema';

async function weeklyRoutine() {
  await weeklyBackupRoutine();

  // Push all payments to Google Sheet
  db.transaction(tx => {
    tx.executeSql(
      `SELECT p.*, s.name AS status_name, u.name AS user_name, u.phone, u.email
       FROM payment_tracks p
       JOIN users u ON p.user_id = u.id
       JOIN payment_status s ON p.status_id = s.id`,
      [],
      async (_, { rows }) => {
        for (let p of rows._array) {
          await pushPaymentToSheet(p);
        }
      }
    );
  });
}


Can be scheduled in background fetch to run weekly.

Old backups are cleaned automatically.

Google Sheet always updated with latest data.

✅ 5. What You Now Have

Automatic Weekly Backup (skips if <7 days since last backup)

Auto Cleanup of backups older than 30 days

Google Sheets Export (manual or scheduled)

All core app functionalities (landing page, add/edit, biometric login, notifications)


🏗 Status Management Page
📁 1. Install Color Picker

We’ll use a simple React Native color picker:

npm install react-native-color-picker

📄 2. Create StatusForm Screen

src/screens/StatusForm.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ColorPicker } from 'react-native-color-picker';
import tw from 'tailwind-react-native-classnames';
import db from '../database/schema';

export default function StatusForm({ navigation, route }) {
  const status = route.params?.status; // null if adding new
  const [name, setName] = useState(status?.name || '');
  const [color, setColor] = useState(status?.color || '#facc15');
  const [sortOrder, setSortOrder] = useState(status?.sort_order?.toString() || '1');

  const saveStatus = () => {
    if (!name || !color || !sortOrder) {
      Alert.alert('Missing fields', 'Name, color, and sort order are required');
      return;
    }

    const now = new Date().toISOString();

    db.transaction(tx => {
      if (status) {
        // Update existing status
        tx.executeSql(
          `UPDATE payment_status SET name=?, color=?, sort_order=?, updated_at=? WHERE id=?`,
          [name, color, parseInt(sortOrder), now, status.id],
          () => {
            Alert.alert('Updated', 'Status updated successfully');
            navigation.goBack();
          }
        );
      } else {
        // Add new status
        tx.executeSql(
          `INSERT INTO payment_status (name, color, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
          [name, color, parseInt(sortOrder), now, now],
          () => {
            Alert.alert('Saved', 'Status added successfully');
            navigation.goBack();
          }
        );
      }
    });
  };

  return (
    <ScrollView style={tw`flex-1 p-4 bg-gray-50`}>
      <Text style={tw`text-lg font-bold mb-2`}>Status Name</Text>
      <TextInput value={name} onChangeText={setName} style={tw`border p-2 rounded mb-4`} />

      <Text style={tw`text-lg font-bold mb-2`}>Sort Order</Text>
      <TextInput
        value={sortOrder}
        onChangeText={setSortOrder}
        keyboardType="numeric"
        style={tw`border p-2 rounded mb-4`}
      />

      <Text style={tw`text-lg font-bold mb-2`}>Choose Color</Text>
      <View style={tw`h-60 mb-4`}>
        <ColorPicker
          defaultColor={color}
          onColorSelected={color => setColor(color)}
          style={{ flex: 1 }}
        />
      </View>

      <TouchableOpacity
        onPress={saveStatus}
        style={tw`bg-blue-600 p-3 rounded`}
      >
        <Text style={tw`text-white text-center font-bold`}>
          {status ? 'Update Status' : 'Add Status'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

📄 3. Add Navigation

Update App.js navigation stack:

import StatusForm from './src/screens/StatusForm';

<Stack.Screen name="StatusForm" component={StatusForm} />

📄 4. Optional: Status List Page

If you want a list of statuses to edit:

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import db from '../database/schema';

export default function StatusList({ navigation }) {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM payment_status ORDER BY sort_order`, [], (_, { rows }) => {
        setStatuses(rows._array);
      });
    });
  }, []);

  return (
    <View style={tw`flex-1 p-4 bg-gray-50`}>
      <FlatList
        data={statuses}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[tw`p-4 mb-2 rounded`, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate('StatusForm', { status: item })}
          >
            <Text style={tw`text-white font-bold`}>{item.name}</Text>
            <Text style={tw`text-white text-sm`}>Sort Order: {item.sort_order}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={tw`bg-blue-600 p-3 rounded mt-4`}
        onPress={() => navigation.navigate('StatusForm')}
      >
        <Text style={tw`text-white text-center font-bold`}>Add New Status</Text>
      </TouchableOpacity>
    </View>
  );
}


Add navigation:

<Stack.Screen name="StatusList" component={StatusList} />

✅ 5. Features Included

Add / Edit Status with:

Name

Color (color picker)

Sort order

List of statuses with option to edit

Status colors will automatically apply in Payment cards

Integrated with your existing SQLite DB



🏗 Login Page
📁 1. Create Login Screen

src/screens/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import db from '../database/schema';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email & Password login
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Email and password are required');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM users WHERE email = ? AND password = ?`,
        [email, password],
        (_, { rows }) => {
          if (rows.length > 0) {
            Alert.alert('Login Success', `Welcome ${rows._array[0].name}`);
            navigation.replace('Home');
          } else {
            Alert.alert('Login Failed', 'Invalid credentials');
          }
        }
      );
    });
  };

  // Biometric login
  const handleBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!compatible || !enrolled) {
      Alert.alert('Biometric Error', 'Your device does not support biometrics or no fingerprint/face is registered');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login with Biometrics',
    });

    if (result.success) {
      navigation.replace('Home');
    } else {
      Alert.alert('Authentication Failed', 'Could not authenticate');
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-50 p-4`}>
      <Text style={tw`text-2xl font-bold mb-8`}>Login</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={tw`w-full border p-3 rounded mb-4`}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={tw`w-full border p-3 rounded mb-6`}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={tw`bg-blue-600 w-full p-3 rounded mb-4`}
      >
        <Text style={tw`text-white text-center font-bold`}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleBiometric}
        style={tw`bg-green-500 w-full p-3 rounded`}
      >
        <Text style={tw`text-white text-center font-bold`}>Login with Biometrics</Text>
      </TouchableOpacity>
    </View>
  );
}

📁 2. Add Navigation

Update App.js stack navigator:

import LoginScreen from './src/screens/LoginScreen';

<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="AddPayment" component={PaymentForm} />
  <Stack.Screen name="EditPayment" component={PaymentForm} />
  <Stack.Screen name="StatusList" component={StatusList} />
  <Stack.Screen name="StatusForm" component={StatusForm} />
</Stack.Navigator>

✅ 3. Features Included

Email & Password login for admin users.

Optional Biometric login if supported.

Redirects to Home Screen upon successful login.

Fully Tailwind-styled.


