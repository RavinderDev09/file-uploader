const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const uploadedFilesContainer = document.getElementById('uploaded-files');

let filesToUpload = [];

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('hover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('hover');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('hover');
  filesToUpload = [...e.dataTransfer.files];
  showFilePreviews();
});

fileInput.addEventListener('change', () => {
  filesToUpload = [...fileInput.files];
  showFilePreviews();
});

function showFilePreviews() {
  uploadedFilesContainer.innerHTML = '';
  filesToUpload.forEach(file => {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.innerHTML = `
      <div class="file-info">
            <strong>${file.name}</strong><p>${(file.size / 1024).toFixed(10)} KB</p>
      </div>
    `;
    uploadedFilesContainer.appendChild(card);
  });
}

uploadBtn.addEventListener('click', async () => {
  if (!filesToUpload.length) return alert('No files selected.');

  const formData = new FormData();
  filesToUpload.forEach(file => formData.append('files', file)); // must match NestJS field name

  try {
const res = await fetch('http://localhost:5000/api/files/upload', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,  // Send token as Bearer token in header
    },
    body: formData,
});

if (res.ok) {
    alert('Files uploaded successfully!');
    filesToUpload = [];
    loadFiles();
} else {
    const errorText = await res.text();
    alert('Upload failed: ' + errorText);
}
} catch (err) {
console.error('Upload failed:', err);
alert('Upload failed: Network error or server issue.');
}
});


async function loadFiles() {
try {
const token = localStorage.getItem('token'); // ✅ Get token from localStorage first
console.log('Token:', token);

const res = await fetch('http://localhost:5000/api/files/files', {
  headers: {
'Authorization': `Bearer ${token}`
}
});

uploadedFilesContainer.innerHTML = '<p>Loading files...</p>';

if (!res.ok) {
  const errorText = await res.text();
  throw new Error(`Failed to load files: ${errorText}`);
}

const files = await res.json();

if (files.length === 0) {
  uploadedFilesContainer.innerHTML = '<p>No files found. Upload your first file!</p>';
  return;
}

uploadedFilesContainer.innerHTML = '';

for (const file of files) {
  const card = document.createElement('div');
  card.className = 'file-card';

  const info = document.createElement('div');
  info.className = 'file-info';
  info.innerHTML = `<strong>${file.originalName}</strong><p>${(file.size / 1024).toFixed(2)} KB</p>`;

  const preview = document.createElement('div');
  preview.className = 'preview';
  const fileUrl = `http://localhost:5000/api/files/view/${file.uuid}`;

  if (file.contentType.startsWith('image/')) {
    preview.innerHTML = `<img src="${fileUrl}" alt="Image preview" />`;
  } else if (file.contentType.startsWith('video/')) {
    preview.innerHTML = `<video src="${fileUrl}" controls></video>`;
  } else if (file.contentType.startsWith('audio/')) {
    preview.innerHTML = `<audio src="${fileUrl}" controls></audio>`;
  } else if (file.contentType === 'application/pdf') {
    preview.innerHTML = `<a href="${fileUrl}" target="_blank">Preview PDF</a>`;
  }

  const actions = document.createElement('div');
  actions.className = 'file-actions';
  actions.innerHTML = `
    <a href="${fileUrl}?download=true" class="btn-download">Download</a>
    <button class="btn-delete" onclick="deleteFile('${file.uuid}')">Delete</button>
  `;

  card.appendChild(preview);
  card.appendChild(info);
  card.appendChild(actions);

  uploadedFilesContainer.appendChild(card);
}
} catch (err) {
console.error('Failed to load files:', err);
uploadedFilesContainer.innerHTML = `<p>Error loading files: ${err.message}</p>`;
}
}

// Function to delete a file
async function deleteFile(uuid) {
try {
const res = await fetch(`http://localhost:5000/api/files/${uuid}`, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

if (res.ok) {
  alert('File deleted successfully!');
  loadFiles(); // Reload files after deletion
} else {
  const errorText = await res.text();
  alert('Delete failed: ' + errorText);
}
} catch (err) {
console.error('Failed to delete file:', err);
alert('Delete failed: Network error or server issue.');
}
}

// Load files when the page loads
loadFiles();


async function deleteFile(uuid) {
  try {
    await fetch(`http://localhost:5000/api/files/delete/${uuid}`, { method: 'DELETE' ,headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },});
    loadFiles();
  } catch (err) {
    console.error('Failed to delete file:', err);
    alert('Delete failed.');
  }
}

// Load files on page load
loadFiles();


const token = localStorage.getItem("token");

// Token nahi mila? Redirect to login
if (!token) {
window.location.href = "auth.html"; // ya jo bhi login page ka naam hai
}    



// Fetch User Profile Function
async function fetchUserProfile() {
  const token = localStorage.getItem('token');

  console.log('fdkfjdkjldskjlfd', token);
  
  if (!token) {
    alert("No token found. Please login again.");
    // window.location.href = "/auth.html"; // Redirect to login
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      
      const user = data.result;
      console.log('*************************88', data.result);

       
      if(user){        
        console.log('user',); // ✅ Log actual user object
        document.getElementById('username').innerText = `Name: ${user.name || 'N/A'}`;
        document.getElementById('email').innerText = `Email: ${user.email || 'N/A'}`;
        document.getElementById('role').innerText = `Role: ${user.role || 'N/A'}`;
  
        // Profile image
        document.getElementById('profileImage').src =
          user.profileImage
            ? `http://localhost:5000/api/files/view/${user.profileImage}`
            : 'https://www.w3schools.com/howto/img_avatar.png';
      }else {
        alert('User data missing from response.');
      }
      
    } else {
      alert('Failed to fetch user data');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

// Logout Function
function logout() {
  localStorage.removeItem('authToken');
  alert('Logged out successfully!');
  document.getElementById('profileSection').style.display = 'none';
  window.location.href = '/auth.html'; // Optional redirect
}

// Toggle Profile Section
function toggleProfileSection() {
  const profileSection = document.getElementById('profileSection');

  if (profileSection.style.display === 'block') {
    profileSection.style.display = 'none';
  } else {
    fetchUserProfile(); // Safe: defined above
    profileSection.style.display = 'block';
  }
}
