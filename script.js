const STORAGE_KEY = 'parsons_state_final';
let appState = {
    isActive: false,
    originalLines: [], 
    blocks: [] 
};

document.addEventListener('DOMContentLoaded', () => {
    initSortables();
    loadState();
    
    // Tab Key Support in Textarea
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
        onEnd: handleDrop 
    };
    new Sortable(document.getElementById('sourceList'), config);
    new Sortable(document.getElementById('solutionList'), config);
}

function handleDrop(evt) {
    saveState();
    // Only re-render if moving between lists to ensure buttons are added/removed correctly
    if (evt.from !== evt.to) {
        render();
    }
}

function generatePuzzle() {
    const rawText = document.getElementById('inputCode').value;
    if (!rawText.trim()) return alert("Please enter some code.");

    const lines = rawText.split('\n').filter(line => line.trim() !== '');
    appState.originalLines = lines.map((line, index) => {
        const leadingSpaces = line.search(/\S|$/);
        return {
            id: 'block-' + index,
            code: line.trim(),
            requiredIndent: Math.floor(leadingSpaces / 4)
        };
    });

    appState.blocks = appState.originalLines.map((l, idx) => ({
        id: l.id, listId: 'source', currentIndent: 0, sortIndex: idx
    })).sort(() => Math.random() - 0.5);

    appState.isActive = true;
    saveState();
    render();
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

    // Sort blocks by user-defined order before rendering
    appState.blocks.sort((a, b) => a.sortIndex - b.sortIndex);

    sourceList.innerHTML = '';
    solutionList.innerHTML = '';

    appState.blocks.forEach(block => {
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

    const codeSpan = document.createElement('code');
    codeSpan.className = 'font-mono text-sm text-gray-800 truncate mr-2 pointer-events-none';
    codeSpan.textContent = text;
    
    const textContainer = document.createElement('div');
    textContainer.className = 'flex-grow overflow-hidden';
    textContainer.appendChild(codeSpan);
    div.appendChild(textContainer);

    if (blockState.listId === 'solution') {
        const controls = document.createElement('div');
        controls.className = 'flex gap-1 shrink-0';
        
        const btnLeft = document.createElement('button');
        btnLeft.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        btnLeft.className = 'w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-500 transition';
        btnLeft.onclick = (e) => { e.stopPropagation(); updateIndent(blockState.id, -1); };
        
        const btnRight = document.createElement('button');
        btnRight.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        btnRight.className = 'w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-500 transition';
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

        // Check vertical order (always required)
        const orderCorrect = (userBlockId === correct.id);
        
        // Check indentation (only if strict mode is ON)
        const indentCorrect = isStrict ? (userState.currentIndent === correct.requiredIndent) : true;

        if (!orderCorrect || !indentCorrect) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        showStatus("Correct! Perfect logic.", "text-green-600");
        solutionListEl.classList.add('ring-4', 'ring-green-400');
    } else {
        showStatus(isStrict ? "Incorrect order or indentation." : "Incorrect order.", "text-red-600");
        solutionListEl.classList.add('ring-4', 'ring-red-400');
    }
    setTimeout(() => solutionListEl.classList.remove('ring-green-400', 'ring-red-400', 'ring-4'), 2000);
}

function showStatus(msg, color) {
    const el = document.getElementById('statusMessage');
    el.textContent = msg;
    el.className = `text-sm font-bold ${color}`;
}

function saveState() {
    if (!appState.isActive) return;
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
    if (confirm("Reset everything? This will clear your current progress.")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}

function provideHint() {
    const solutionListEl = document.getElementById('solutionList');
    const currentIds = Array.from(solutionListEl.children).map(el => el.getAttribute('data-id'));
    const isStrict = document.getElementById('strictIndent').checked;
    
    let firstErrorIndex = -1;

    for (let i = 0; i < appState.originalLines.length; i++) {
        const correct = appState.originalLines[i];
        const userBlockId = currentIds[i];
        const userState = appState.blocks.find(b => b.id === userBlockId);

        const orderCorrect = (userBlockId === correct.id);
        const indentCorrect = isStrict ? (userState?.currentIndent === correct.requiredIndent) : true;

        if (!userBlockId || !orderCorrect || !indentCorrect) {
            firstErrorIndex = i;
            break;
        }
    }

    if (firstErrorIndex === -1) {
        showStatus("Everything looks perfect!", "text-green-600");
        return;
    }

    const errorBlockId = currentIds[firstErrorIndex];
    if (errorBlockId) {
        const errorEl = document.querySelector(`#solutionList [data-id="${errorBlockId}"]`);
        errorEl.classList.add('hint-highlight');
        showStatus(isStrict ? "Check position or indentation." : "This block is in the wrong order.", "text-amber-600");
        setTimeout(() => errorEl.classList.remove('hint-highlight'), 1500);
    } else {
        showStatus("The next block is missing!", "text-amber-600");
    }
}