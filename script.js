const STORAGE_KEY = 'parsons_state_final';
let isTeacher = false;
let showingSolution = false;
let appState = {
    isActive: false,
    originalLines: [], 
    blocks: [] 
};

document.addEventListener('DOMContentLoaded', () => {
    initSortables();

    const urlParams = new URLSearchParams(window.location.search);
    const puzzleData = urlParams.get('p');
    isTeacher = urlParams.get('t') === '1';

    if (puzzleData) {
        // Clear local memory for a fresh load from URL
        localStorage.removeItem(STORAGE_KEY); 
        loadSharedPuzzle(puzzleData);
    } else {
        loadState();
    }
    
    const textarea = document.getElementById('inputCode');
    textarea.addEventListener('keydown', function(e) {
        if (e.key == 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });
});

function initSortables() {
    const config = {
        group: 'shared',
        animation: 150,
        ghostClass: 'bg-blue-100',
        onEnd: () => {
            saveState();
            render(); 
        }
    };
    new Sortable(document.getElementById('sourceList'), config);
    new Sortable(document.getElementById('solutionList'), config);
}

function generatePuzzle() {
    const rawText = document.getElementById('inputCode').value;
    if (!rawText.trim()) return;

    const lines = rawText.split('\n').filter(line => line.trim() !== '');
    
    appState.originalLines = lines.map((line, index) => {
        const leadingSpaces = line.search(/\S|$/);
        return {
            id: 'block-' + index,
            code: line.trim(),
            requiredIndent: Math.floor(leadingSpaces / 4)
        };
    });

    if (isTeacher) {
        // TEACHER VIEW: Pre-solved, no shuffle
        appState.blocks = appState.originalLines.map((l, idx) => ({
            id: l.id, 
            listId: 'solution', 
            currentIndent: l.requiredIndent, 
            sortIndex: idx
        }));
    } else {
        // STUDENT/PREVIEW VIEW: Jumbled
        appState.blocks = appState.originalLines.map((l, idx) => ({
            id: l.id, 
            listId: 'source', 
            currentIndent: 0, 
            sortIndex: idx
        }));

        // Fisher-Yates Shuffle
        for (let i = appState.blocks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [appState.blocks[i], appState.blocks[j]] = [appState.blocks[j], appState.blocks[i]];
        }
        // Assign new sort order based on shuffle
        appState.blocks.forEach((block, idx) => block.sortIndex = idx);
    }

    appState.isActive = true;
    document.getElementById('backToEditorBtn').classList.remove('hidden');
    render();
    saveState();
}

function render() {
    const setupPanel = document.getElementById('setupPanel');
    const puzzlePanel = document.getElementById('puzzlePanel');
    const sourceList = document.getElementById('sourceList');
    const solutionList = document.getElementById('solutionList');

    if (!appState.isActive) {
        setupPanel.classList.remove('hidden');
        puzzlePanel.classList.add('hidden');
        return;
    }

    setupPanel.classList.add('hidden');
    puzzlePanel.classList.remove('hidden');
    puzzlePanel.classList.add('flex');
    
    // In Teacher view, we can also show the "Show Solution" button if we want to toggle back/forth
    if (isTeacher) document.getElementById('viewSolutionBtn').classList.remove('hidden');

    const blocksToRender = [...appState.blocks].sort((a, b) => a.sortIndex - b.sortIndex);
    sourceList.innerHTML = '';
    solutionList.innerHTML = '';

    blocksToRender.forEach(block => {
        const original = appState.originalLines.find(l => l.id === block.id);
        const el = createBlockElement(block, original.code);
        (block.listId === 'source' ? sourceList : solutionList).appendChild(el);
    });
}

function createBlockElement(blockState, text) {
    const div = document.createElement('div');
    div.className = 'code-block bg-white p-3 rounded shadow-sm border border-gray-200 flex items-center justify-between no-select';
    div.setAttribute('data-id', blockState.id);
    
    if (blockState.listId === 'solution') {
        div.style.marginLeft = (blockState.currentIndent * 2) + 'rem';
        div.classList.add('border-l-4', 'border-l-blue-400');
    }

    const textContainer = document.createElement('div');
    textContainer.className = 'flex-grow overflow-hidden pointer-events-none';
    textContainer.innerHTML = `<code class="font-mono text-sm text-gray-800">${text}</code>`;
    div.appendChild(textContainer);

    if (blockState.listId === 'solution') {
        const controls = document.createElement('div');
        controls.className = 'flex gap-1 shrink-0';
        
        const btnLeft = document.createElement('button');
        btnLeft.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        btnLeft.className = 'w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-400';
        btnLeft.onclick = (e) => { e.stopPropagation(); updateIndent(blockState.id, -1); };
        
        const btnRight = document.createElement('button');
        btnRight.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        btnRight.className = 'w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-400';
        btnRight.onclick = (e) => { e.stopPropagation(); updateIndent(blockState.id, 1); };

        controls.appendChild(btnLeft);
        controls.appendChild(btnRight);
        div.appendChild(controls);
    }
    return div;
}

function updateIndent(id, change) {
    const block = appState.blocks.find(b => b.id === id);
    if (block) {
        block.currentIndent = Math.max(0, Math.min(8, block.currentIndent + change));
        saveState();
        render();
    }
}

function goBackToEditor() {
    // Reset teacher flag and return to setup
    const url = new URL(window.location);
    url.searchParams.delete('p');
    url.searchParams.delete('t');
    window.history.pushState({}, '', url);
    
    isTeacher = false;
    appState.isActive = false;
    render();
}

function checkAnswer() {
    const solutionListEl = document.getElementById('solutionList');
    const currentIds = Array.from(solutionListEl.children).map(el => el.getAttribute('data-id'));
    const isStrict = document.getElementById('strictIndent').checked;

    if (currentIds.length !== appState.originalLines.length) {
        showStatus("Incomplete! Use all blocks.", "text-orange-600");
        return;
    }

    let isCorrect = true;
    for (let i = 0; i < appState.originalLines.length; i++) {
        const correct = appState.originalLines[i];
        const userBlockId = currentIds[i];
        const userState = appState.blocks.find(b => b.id === userBlockId);

        if (userBlockId !== correct.id || (isStrict && userState.currentIndent !== correct.requiredIndent)) {
            isCorrect = false;
            break;
        }
    }
    showStatus(isCorrect ? "Correct!" : "Try again.", isCorrect ? "text-green-600" : "text-red-600");
}

function showStatus(msg, color) {
    const el = document.getElementById('statusMessage');
    el.textContent = msg;
    el.className = `text-sm font-bold ${color}`;
}

function toggleSolution() {
    showingSolution = !showingSolution;
    const btn = document.getElementById('viewSolutionBtn');
    if (showingSolution) {
        btn.innerHTML = '<i class="fa-solid fa-eye-slash mr-2"></i> Hide Solution';
        appState.blocks.sort((a, b) => appState.originalLines.findIndex(l => l.id === a.id) - appState.originalLines.findIndex(l => l.id === b.id));
        appState.blocks.forEach((block, idx) => {
            const correct = appState.originalLines.find(l => l.id === block.id);
            block.listId = 'solution';
            block.currentIndent = correct.requiredIndent;
            block.sortIndex = idx;
        });
    } else {
        btn.innerHTML = '<i class="fa-solid fa-eye mr-2"></i> Show Solution';
        // Reload from local storage to get back to user's "work in progress"
        loadState(); 
    }
    render();
}

function sharePuzzle(role) {
    const code = document.getElementById('inputCode').value;
    const isStrict = document.getElementById('strictIndent').checked;
    if (!code.trim()) return alert("Enter code first!");
    const data = { c: code, s: isStrict };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    let shareUrl = `${window.location.origin}${window.location.pathname}?p=${encoded}`;
    if (role === 'teacher') shareUrl += '&t=1';
    navigator.clipboard.writeText(shareUrl).then(() => alert(`${role} link copied!`));
}

function loadSharedPuzzle(encodedData) {
    try {
        const json = decodeURIComponent(escape(atob(encodedData)));
        const data = JSON.parse(json);
        document.getElementById('inputCode').value = data.c;
        document.getElementById('strictIndent').checked = data.s;
        
        generatePuzzle();
        
        // Hide Reset and Back to Editor for shared puzzles
        document.getElementById('resetBtn').classList.add('hidden');
        document.getElementById('backToEditorBtn').classList.add('hidden');
    } catch (e) {
        alert("Invalid puzzle link.");
    }
}

function saveState() {
    if (!appState.isActive || showingSolution) return;
    const sourceIds = Array.from(document.getElementById('sourceList').children).map(el => el.getAttribute('data-id'));
    const solutionIds = Array.from(document.getElementById('solutionList').children).map(el => el.getAttribute('data-id'));
    appState.blocks.forEach(block => {
        if (sourceIds.includes(block.id)) {
            block.listId = 'source';
            block.sortIndex = sourceIds.indexOf(block.id);
        } else if (solutionIds.includes(block.id)) {
            block.listId = 'solution';
            block.sortIndex = solutionIds.indexOf(block.id);
        }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        appState = JSON.parse(saved);
        render();
    }
}

function resetPuzzle() {
    if (confirm("Reset everything?")) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = window.location.origin + window.location.pathname;
    }
}