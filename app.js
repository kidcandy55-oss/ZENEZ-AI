
// =====================================
// ZENEZ AI - MAIN JAVASCRIPT
// =====================================

// IMPORTANT:
// Worker deploy pannina piragu unga Worker URL-ah inga paste pannunga.
const API_URL = "https://zenez-ai.kidcandy55.workers.dev";;

let currentTool = "chat";

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const welcome = document.getElementById("welcome");
const toolBox = document.getElementById("toolBox");
const toolInput = document.getElementById("toolInput");
const toolTitle = document.getElementById("toolTitle");

// =====================================
// SELECT TOOL
// =====================================

function selectTool(tool) {
  currentTool = tool;

  const names = {
    chat: "AI Assistant",
    image: "Image Prompt Studio",
    code: "Coding Assistant",
    translate: "Translator",
    summarize: "Text Summarizer",
    pdf: "PDF Assistant"
  };

  toolTitle.textContent = names[tool] || "AI Assistant";

  if (tool === "chat") {
    toolBox.style.display = "none";
    userInput.placeholder = "Ask ZENEZ AI anything...";
  } else {
    toolBox.style.display = "block";
    toolInput.value = "";

    const placeholders = {
      image: "Describe the image you want to create...",
      code: "Explain the code or project you need...",
      translate: "Enter text and mention the target language...",
      summarize: "Paste the text you want to summarize...",
      pdf: "Paste text copied from your PDF and ask a question..."
    };

    toolInput.placeholder = placeholders[tool] || "Enter your request...";
  }

  welcome.style.display = "none";
}

// =====================================
// ADD MESSAGE TO CHAT
// =====================================

function addMessage(text, sender) {
  const message = document.createElement("div");

  message.className = "message " + sender;
  message.textContent = text;

  chatBox.appendChild(message);

  message.scrollIntoView({
    behavior: "smooth",
    block: "end"
  });
}

// =====================================
// CONNECT TO AI BACKEND
// =====================================

async function askAI(message, mode = "chat") {
  if (
    API_URL.includes("YOUR-WORKER-NAME") ||
    API_URL.includes("YOUR-SUBDOMAIN")
  ) {
    throw new Error("Worker URL set pannala. Backend setup mudichu URL add pannunga.");
  }

  const response = await fetch(API_URL + "/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: message,
      mode: mode
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "AI request failed.");
  }

  return data.reply || "AI response empty-ah irukku.";
}

// =====================================
// SEND CHAT MESSAGE
// =====================================

async function sendMessage() {
  const message = userInput.value.trim();

  if (!message) {
    alert("First unga message type pannunga!");
    return;
  }

  welcome.style.display = "none";
  addMessage(message, "user");

  userInput.value = "";

  const loading = document.createElement("div");
  loading.className = "message ai";
  loading.textContent = "ZENEZ AI is thinking...";
  chatBox.appendChild(loading);

  try {
    const reply = await askAI(message, "chat");
    loading.textContent = reply;
  } catch (error) {
    loading.textContent = "Error: " + error.message;
  }
}

// =====================================
// RUN OTHER TOOLS
// =====================================

async function runTool() {
  const message = toolInput.value.trim();

  if (!message) {
    alert("Please enter your request!");
    return;
  }

  welcome.style.display = "none";

  addMessage(message, "user");

  const loading = document.createElement("div");
  loading.className = "message ai";
  loading.textContent = "Generating...";
  chatBox.appendChild(loading);

  try {
    const reply = await askAI(message, currentTool);
    loading.textContent = reply;
  } catch (error) {
    loading.textContent = "Error: " + error.message;
  }
}

// =====================================
// NEW CHAT
// =====================================

function newChat() {
  chatBox.innerHTML = "";
  userInput.value = "";
  toolInput.value = "";

  welcome.style.display = "block";
  toolBox.style.display = "none";

  currentTool = "chat";
}

// =====================================
// VOICE INPUT
// =====================================

function startVoice() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice input unga browser-la support aagala. Chrome browser try pannunga.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = function () {
    alert("Pesunga... Voice listening started!");
  };

  recognition.onresult = function (event) {
    const spokenText = event.results[0][0].transcript;
    userInput.value = spokenText;
  };

  recognition.onerror = function () {
    alert("Voice input error. Microphone permission check pannunga.");
  };

  recognition.start();
}

// =====================================
// ENTER KEY TO SEND
// =====================================

userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

// =====================================
// INITIAL SETTINGS
// =====================================

toolBox.style.display = "none";

console.log("ZENEZ AI loaded successfully!");
