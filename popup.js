document.getElementById("fetchBtn").addEventListener("click", fetchEmails);

async function fetchEmails() {
  try {
    const token = await getAuthToken();
    console.log("Got token, fetching messages...");

    const messages = await listMessages(token, 15);
    console.log(`Found ${messages.length} messages. Fetching details...`);

    for (const msg of messages) {
      const detail = await getMessage(token, msg.id);
      logEmail(detail);
    }
  } catch (err) {
    console.error("Failed to fetch emails:", err);
  }
}

// Chrome's built-in OAuth helper. Reads client_id + scopes from manifest.json.
// interactive: true pops the Google consent screen the first time; after that
// Chrome caches the token until it expires.
function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError || new Error("No token returned"));
        return;
      }
      resolve(token);
    });
  });
}

async function listMessages(token, maxResults = 5) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`List messages failed: ${res.status}`);
  const data = await res.json();
  return data.messages || [];
}

async function getMessage(token, id) {
  const url =
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}` +
    `?format=metadata&metadataHeaders=Subject&metadataHeaders=From`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Get message failed: ${res.status}`);
  return res.json();
}

function logEmail(detail) {
  const headers = detail.payload?.headers || [];
  const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
  const from = headers.find((h) => h.name === "From")?.value || "(unknown sender)";

  console.log(`From: ${from}`);
  console.log(`Subject: ${subject}`);
  console.log(`Snippet: ${detail.snippet}`);
  console.log("---");
}