import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAxXn3y736o56WEv6ZfzjU_HB9VDdGCJqA",
    authDomain: "loko-video-logs.firebaseapp.com",
    projectId: "loko-video-logs",
    storageBucket: "loko-video-logs.firebasestorage.app",
    messagingSenderId: "1029510039700",
    appId: "1:1029510039700:web:5762a02e518b2b8a164c81",
    measurementId: "G-M6KZPKZGLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const logsRef = ref(database, 'logs');

let logs = [];

// Listen for changes in real-time
onValue(logsRef, snapshot => {
    const data = snapshot.val();
    logs = data ? Object.values(data) : [];
    renderEntries();
});

// Helper: Format date/time
function getFormattedDateTime() {
    const now = new Date();
    return now.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

// Show/hide create box
function showCreateBox() {
    const createArea = document.getElementById("createArea");
    createArea.style.display = "block";
    const textarea = document.getElementById("newEntryText");
    textarea.focus();
}

function hideCreateBox() {
    document.getElementById("newEntryText").value = "";
    document.getElementById("createArea").style.display = "none";
}

// Add new log entry
function addEntry() {
    const text = document.getElementById('newEntryText').value.trim();
    if (!text) return;

    const newEntry = {
        id: Date.now(),
        text,
        timestamp: getFormattedDateTime()
    };

    set(ref(database, 'logs/' + newEntry.id), newEntry);
    hideCreateBox();
}

// Delete a log entry
function deleteEntry(id) {
    remove(ref(database, 'logs/' + id));
}

// Edit a log entry
function editEntry(id) {
    const entryDiv = document.getElementById("entry-" + id);
    const entry = logs.find(e => e.id === id);

    entryDiv.innerHTML = `
        <div class="timestamp">${entry.timestamp}</div>
        <textarea id="editText-${id}" rows="3" style="width:100%;">${entry.text}</textarea>
        <br><br>
        <button class="btn createBtn" onclick="saveEdit(${id})">Save</button>
        <button class="btn deleteBtn" onclick="renderEntries()">Cancel</button>
    `;

    const editTA = document.getElementById(`editText-${id}`);
    editTA.focus();
    editTA.selectionStart = editTA.selectionEnd = editTA.value.length;

    // Enter to save, Shift+Enter for newline
    editTA.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            saveEdit(id);
        }
    });
}

// Save edited log entry
function saveEdit(id) {
    const newText = document.getElementById(`editText-${id}`).value.trim();
    update(ref(database, 'logs/' + id), { text: newText });
}

// Render all entries
function renderEntries() {
    const container = document.getElementById("entries");
    container.innerHTML = "";

    logs.sort((a, b) => b.id - a.id).forEach((entry, index) => {
        const div = document.createElement("div");
        div.className = "entry";
        div.id = "entry-" + entry.id;
        div.style.background = index % 2 === 0 ? "white" : "#f5f5f5";

        div.innerHTML = `
            <div class="timestamp">${entry.timestamp}</div>
            <p>${entry.text}</p>
            <button class="btn editBtn" onclick="editEntry(${entry.id})">Edit</button>
            <button class="btn deleteBtn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        container.appendChild(div);
    });
}

// Export logs as text file
function exportLogs() {
    if (logs.length === 0) {
        alert("No logs to export!");
        return;
    }

    let output = "";
    logs.forEach(entry => {
        output += `[${entry.timestamp}]\n${entry.text}\n\n`;
    });

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "logbook_export.txt";
    a.click();

    URL.revokeObjectURL(url);
}

// Add Enter key listener for new entry textarea
document.getElementById("newEntryText").addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        addEntry();
    }
});

// Expose functions to HTML
window.showCreateBox = showCreateBox;
window.hideCreateBox = hideCreateBox;
window.addEntry = addEntry;
window.deleteEntry = deleteEntry;
window.editEntry = editEntry;
window.saveEdit = saveEdit;
window.exportLogs = exportLogs;