let snippets = JSON.parse(localStorage.getItem('snippets') || '[]');
let currentModalIndex = -1;
// Add default snippets if empty

// main.js - přidat tracking kurzoru
document.addEventListener('mousemove', (e) => {
	document.documentElement.style.setProperty('--x', `${e.clientX}px`);
	document.documentElement.style.setProperty('--y', `${e.clientY}px`);
});
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

function downloadAsSVG(index) {
	const snippet = snippets[index];
	const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
            <style>
                .code-container {
                    font-family: 'Fira Code', monospace;
                    font-size: 14px;
                    fill: #d4d4d4;
                }
                .background {
                    fill: #1e1e1e;
                }
                .title {
                    font-size: 16px;
                    fill: #42beff;
                    font-weight: bold;
                }
            </style>
            <rect class="background" width="100%" height="100%"/>
            <text x="20" y="40" class="title">${snippet.title}</text>
            <foreignObject x="20" y="60" width="760" height="320">
                <pre xmlns="http://www.w3.org/1999/xhtml" 
                     style="color: #d4d4d4; font-family: 'Fira Code', monospace; white-space: pre-wrap;">
${Prism.highlight(snippet.code, Prism.languages[snippet.language], snippet.language)}
                </pre>
            </foreignObject>
        </svg>
    `;

	const blob = new Blob([svgContent], { type: 'image/svg+xml' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${snippet.title.replace(/ /g, '_')}.svg`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

async function downloadAsPNG(index) {
	const card = document.querySelectorAll('.snippet-card')[index];
	const originalStyle = card.style.cssText;

	// Dočasné úpravy pro lepší export
	card.style.transform = 'none';
	card.style.width = '800px';
	card.style.height = 'auto';
	card.style.maxHeight = 'none';

	try {
		const canvas = await html2canvas(card, {
			backgroundColor: '#1e1e1e',
			scale: 2,
			logging: true
		});

		const img = canvas.toDataURL('image/png');
		const a = document.createElement('a');
		a.href = img;
		a.download = `${snippets[index].title.replace(/ /g, '_')}.png`;
		a.click();
	} catch (error) {
		alert('Chyba při generování PNG: ' + error.message);
	} finally {
		card.style.cssText = originalStyle;
	}
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
            <div class="download-buttons">
                <button class="download-btn svg-btn" onclick="downloadAsSVG(${index})" title="Download SVG">↓ SVG</button>
                <button class="download-btn png-btn" onclick="downloadAsPNG(${index})" title="Download PNG">↓ PNG</button>
            </div>
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

// main.js - přidat nové funkce

// Export snippets do JSON souboru
function exportSnippets() {
	try {
		const dataStr = JSON.stringify(snippets, null, 2);
		const blob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `snippets_backup_${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showToast('Export úspěšně dokončen!');
	} catch (error) {
		alert('Chyba při exportu: ' + error.message);
	}
}

// Import snippets z JSON souboru
function importSnippets(event) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function (e) {
		try {
			const imported = JSON.parse(e.target.result);
			if (!Array.isArray(imported)) throw new Error('Neplatný formát souboru');

			// Validace snippetů
			const validSnippets = imported.filter((s) => {
				const isValid =
					s.title &&
					s.code &&
					s.language &&
					s.date &&
					document.querySelector(`#languageSelect option[value="${s.language}"]`);

				if (!isValid) console.warn('Vynechán neplatný snippet:', s);
				return isValid;
			});

			// Sloučení s existujícími snippety
			const existingHashes = new Set(snippets.map((s) => hashSnippet(s)));
			const newSnippets = validSnippets.filter((s) => !existingHashes.has(hashSnippet(s)));

			if (newSnippets.length > 0) {
				snippets = [...snippets, ...newSnippets];
				localStorage.setItem('snippets', JSON.stringify(snippets));
				renderGallery();
				alert(`Naimportováno ${newSnippets.length} nových snippetů!`);
			} else {
				alert('Žádné nové snippety k importu.');
			}
		} catch (error) {
			alert('Chyba při importu: ' + error.message);
		} finally {
			event.target.value = ''; // Reset file inputu
		}
	};
	reader.readAsText(file);
}

// Pomocná funkce pro detekci duplicit
function hashSnippet(snippet) {
	return `${snippet.title}|${snippet.code}|${snippet.language}|${snippet.date}`;
}

// Toast notifikace
function showToast(message, duration = 3000) {
	const toast = document.createElement('div');
	toast.textContent = message;
	toast.style.position = 'fixed';
	toast.style.bottom = '20px';
	toast.style.right = '20px';
	toast.style.background = '#252526';
	toast.style.color = 'white';
	toast.style.padding = '1rem';
	toast.style.borderRadius = '4px';
	toast.style.zIndex = '1000';
	document.body.appendChild(toast);

	setTimeout(() => toast.remove(), duration);
}

// Initial render
renderGallery();
