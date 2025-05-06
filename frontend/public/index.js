const token = localStorage.getItem("accessToken");


// Token nahi mila? Redirect to login
if (!token) {
window.location.href = "welcome.html"; // ya jo bhi login page ka naam hai
}    


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

  uploadBtn.disabled = true; // Disable button
  uploadBtn.innerText = 'Uploading...'; // Change text

  const formData = new FormData();
  filesToUpload.forEach(file => formData.append('files', file));

  try {
    // const res = await fetch('http://localhost:5000/api/files/upload', {
      const res = await fetch('https://file-uploader-dzr7.onrender.com/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // ensure token is defined globally
      },
      body: formData,
    });

    if (res.ok) {
      alert('Files uploaded successfully!');
      filesToUpload = [];
      uploadedFilesContainer.innerHTML = '';
      loadFiles(); // Refresh file list
    } else {
      const errorText = await res.text();
      alert('Upload failed: ' + errorText);
    }
  } catch (err) {
    console.error('Upload failed:', err);
    alert('Upload failed: Network error or server issue.');
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.innerText = 'Upload Selected Files'; // Reset button
  }
});



async function loadFiles() {
  try {
    const res = await fetch('https://file-uploader-dzr7.onrender.com/api/files/files', {
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
      console.log('file', file);
      
      const card = document.createElement('div');
    
      card.className = 'file-card';


      const uploader = file.userId ? `<p class="uploader">👤 <strong>${file.userId.name}</strong> (${file.userId.email})</p>` : '';


      const info = document.createElement('div');
      info.className = 'file-info';
      info.innerHTML = `
      <strong>${file.originalName}</strong>
      <p>${(file.size / 1024).toFixed(2)} KB</p>
      ${uploader}
    `;

      const preview = document.createElement('div');
      preview.className = 'preview';
      const fileUrl = `https://file-uploader-dzr7.onrender.com/api/files/view/${file.uuid}`;

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
        <button class="btn-copy" onclick="copyToClipboard('${fileUrl}')">Copy URL</button>
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



// ✅ Helper Function: Copy to Clipboard
function copyToClipboard(url) {
  navigator.clipboard.writeText(url)
    .then(() => alert('URL copied to clipboard!'))
    .catch(() => alert('Failed to copy URL.'));
}



async function deleteFile(uuid) {
  try {
  const res = await fetch(`https://file-uploader-dzr7.onrender.com/api/files/delete/${uuid}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
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


let currentUserEmail = null; // store fetched user email globally

async function fetchUserProfile() {
 
  try {
    // const response = await fetch('https://file-uploader-dzr7.onrender.com/users/profile', {
      const response = await fetch('http://localhost:5000/users/profile', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();    
    
    if (data.success && data.result) {
      const user = data.result;
      currentUserEmail = user.email || null; // 🔥 Save user email globally

      document.getElementById('username').innerText = `Name: ${user.name || 'N/A'}`;
      document.getElementById('email').innerText = `Email: ${user.email || 'N/A'}`;
      document.getElementById('profileImage').src =
        user.profilePictureId
          // ? `https://file-uploader-dzr7.onrender.com/api/files/view/${user.profilePictureId}`
          ? `http://localhost:5000/users/picture-show/${user.profilePictureId}`
          : 'https://www.w3schools.com/howto/img_avatar.png';
          document.getElementById('mobileNumber').innerText = `Mobile Number: ${user.mobileNumber || 'N/A'}`
          document.getElementById('age').innerText = `Age: ${user.age || 'N/A'}`

        
    } else {
      alert('Failed to fetch user data'); 
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

function logout() {
  localStorage.removeItem('accessToken');
  alert('Logged out successfully!');
  document.getElementById('profileSection').style.display = 'none';
  window.location.href = '/welcome.html';
}

function toggleProfileSection() {
  const section = document.getElementById('profileSection');
  if (section.style.display === 'block') {
    section.style.display = 'none';
  } else {
    fetchUserProfile();
    section.style.display = 'block';
  }
}

async function forgotPassword() {
  if (!currentUserEmail) {
    alert("Please login or refresh to fetch profile data.");
    return;
  }

  const confirmReset = confirm(`Are you sure you want to reset the password for ${currentUserEmail}?`);
  if (!confirmReset) return;

  try {
    const response = await fetch('https://file-uploader-dzr7.onrender.com/users/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUserEmail })
    });

    const result = await response.json();
    alert(result.message || 'Reset link sent if email exists');
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong while sending reset link.');
  }
}


//frontend/public/index.html
//