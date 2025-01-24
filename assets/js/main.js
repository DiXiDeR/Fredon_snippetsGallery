let snippets = JSON.parse(localStorage.getItem('snippets') || '[]');
let currentModalIndex = -1;
// Add default snippets if empty

function openModal(index) {
	currentModalIndex = index;
	const snippet = snippets[index];
	const modal = document.getElementById('snippetModal');
	const modalCode = document.getElementById('modalCode');

	modalCode.innerHTML = Prism.highlight(
		snippet.code,
		Prism.languages[snippet.language],
		snippet.language
	);

	modalCode.className = `language-${snippet.language}`;
	modal.style.display = 'flex';
}

function closeModal() {
	document.getElementById('snippetModal').style.display = 'none';
}

function copyModalContent() {
	const code = document.getElementById('modalCode').textContent;
	navigator.clipboard.writeText(code).then(() => {
		alert('Code copied to clipboard!');
	});
}

function saveSnippet() {
	const title = document.getElementById('snippetTitle').value || 'Untitled Snippet';
	const code = document.getElementById('codeEditor').value;
	const language = document.getElementById('languageSelect').value;

	const snippet = {
		title,
		code,
		language,
		date: new Date().toISOString()
	};

	snippets.push(snippet);
	localStorage.setItem('snippets', JSON.stringify(snippets));
	renderGallery();
	showGallery();

	// Clear title input after save
	document.getElementById('snippetTitle').value = '';
}

function renderGallery() {
	const gallery = document.getElementById('gallery');
	gallery.innerHTML = snippets
		.map(
			(snippet, index) => `
        <div class="snippet-card">
            <div class="terminal-header">
                <div class="terminal-buttons">
                    <button class="terminal-button red"></button>
                    <button class="terminal-button yellow"></button>
                    <button class="terminal-button green"></button>
                </div>
                <span class="terminal-title">${snippet.title}</span>
            </div>
            <pre class="language-${snippet.language}" onclick="openModal(${index})">
                <code>${Prism.highlight(
					snippet.code,
					Prism.languages[snippet.language],
					snippet.language
				)}</code>
            </pre>
            <button class="delete-btn" onclick="deleteSnippet(${index})">Delete</button>
            <button class="copy-btn" onclick="copyToClipboard(${index})">Copy</button>
        </div>
    `
		)
		.join('');
}

function showGallery() {
	document.getElementById('editorContainer').classList.add('hidden');
	document.getElementById('gallery').classList.remove('hidden');
	setActiveButton(1);
}

function showEditor() {
	document.getElementById('editorContainer').classList.remove('hidden');
	document.getElementById('gallery').classList.add('hidden');
	setActiveButton(0);
}

function setActiveButton(index) {
	document.querySelectorAll('.nav-button').forEach((btn, i) => {
		btn.classList.toggle('active', i === index);
	});
}
// Close modal when clicking outside
window.onclick = function (event) {
	const modal = document.getElementById('snippetModal');
	if (event.target === modal) {
		closeModal();
	}
};
function deleteSnippet(index) {
	if (confirm('Are you sure you want to delete this snippet?')) {
		snippets.splice(index, 1);
		localStorage.setItem('snippets', JSON.stringify(snippets));
		renderGallery();
		closeModal();
	}
}
function clearEditor() {
	document.getElementById('codeEditor').value = '';
	document.getElementById('languageSelect').selectedIndex = 0;
}

// Update existing copyToClipboard function
function copyToClipboard(index) {
	navigator.clipboard.writeText(snippets[index].code).then(() => {
		alert('Code copied to clipboard!');
	});
}
// Update default snippets with titles
if (snippets.length === 0) {
	snippets.push({
		title: 'Docker Management',
		code: `index.dockerfile\n\n# put docker in folder down\nsudo docker compose down\n\n# update docker compose\nsudo docker compose pull\n\n# start new updated image - in background\nsudo docker compose up -d`,
		language: 'dockerfile',
		date: new Date().toISOString()
	});
	snippets.push({
		title: 'Windows Recovery',
		code: `Windows.exe\n\n# Windows Last Hope before reinstall\nSFC /SCANNOW\nDISM /Online /Cleanup-Image /StartComponentCleanup\nDISM /Online /Cleanup-Image /RestoreHealth`,
		language: 'batch',
		date: new Date().toISOString()
	});
	localStorage.setItem('snippets', JSON.stringify(snippets));
}

// Initial render
renderGallery();
