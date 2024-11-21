// set of states: always has to have at least the start state and the halt state
let states = [
    { id: 'S', label: 'Start', instruction: { type: '+', k: 0, a: '0', q: 'H' } },
    { id: 'H', label: 'Halt', instruction: null }
];

// list of registers: each register is a string of 0s and 1s
let registers = Array(3).fill('');

// function to update the state list
function updateStateList() {

    // clear the state list
    const stateList = document.getElementById('stateList');
    stateList.innerHTML = '';

    // for each state, create a div with the state's label and instruction
    states.forEach(state => {
        const stateDiv = document.createElement('div');
        stateDiv.className = 'state-entry';

        // state ID (only editable for numeric states)
        const idLabel = document.createElement('span');
        idLabel.textContent = `State ${state.id}: `;
        stateDiv.appendChild(idLabel);

        // state label (editable) for all states
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = state.label;
        labelInput.placeholder = 'Label';
        labelInput.onchange = (e) => {
            state.label = e.target.value;
        };
        stateDiv.appendChild(labelInput);

        // don't show instruction interface for halt state
        if (state.id === 'H') {
            stateDiv.appendChild(document.createElement('br'));
            const haltLabel = document.createElement('span');
            haltLabel.textContent = '(The Halt state has no instruction)';
            stateDiv.appendChild(haltLabel);
            stateList.appendChild(stateDiv);
            return;
        }

        // instruction type selector
        const instructionDiv = document.createElement('div');
        instructionDiv.className = 'instruction-select';

        // instruction type selector (+, ?, -)
        const typeSelect = document.createElement('select');
        typeSelect.innerHTML = `
                    <option value="+">Add (+)</option>
                    <option value="?">Check (?)</option>
                    <option value="-">Remove (-)</option>
                `;
        typeSelect.value = state.instruction.type;
        instructionDiv.appendChild(typeSelect);

        // register selector (k)
        const kSelect = document.createElement('select');
        const n = parseInt(document.getElementById('registerCount').value);
        for (let i = 0; i < n; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Register ${i}`;
            kSelect.appendChild(option);
        }
        kSelect.value = state.instruction.k;
        instructionDiv.appendChild(kSelect);

        // Add letter selector for + and ? instructions
        if (state.instruction.type !== '-') {
            const letterSelect = document.createElement('select');

            if (state.instruction.type === '+') {
                letterSelect.innerHTML = `
                        <option value="0">0</option>
                        <option value="1">1</option>
                    `;
            } else if (state.instruction.type === '?') {
                letterSelect.innerHTML = `
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="empty">ε (empty)</option>
                    `;
            }
            letterSelect.value = state.instruction.a;
            instructionDiv.appendChild(letterSelect);
        }

        // state selector for q
        const qSelect = document.createElement('select');
        qSelect.innerHTML = getStateOptions();
        qSelect.value = state.instruction.q;
        instructionDiv.appendChild(qSelect);

        // additional state selector q' for ? and - instructions
        if (state.instruction.type !== '+') {
            const qPrimeSelect = document.createElement('select');
            qPrimeSelect.innerHTML = getStateOptions();
            qPrimeSelect.value = state.instruction.q_prime || 'H';
            instructionDiv.appendChild(qPrimeSelect);
        }

        // update instruction when any selector changes
        const selectors = instructionDiv.getElementsByTagName('select');
        Array.from(selectors).forEach(selector => {
            selector.onchange = () => updateInstruction(state, instructionDiv);
        });

        stateDiv.appendChild(instructionDiv);

        // delete button for numeric states
        if (!isNaN(state.id)) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete State';
            deleteButton.onclick = () => deleteState(state.id);
            stateDiv.appendChild(deleteButton);
        }

        // add the state div to the state list
        stateList.appendChild(stateDiv);
    });
}

// function to get the options for the state selector
function getStateOptions() {
    return states.map(s =>
        `<option value="${s.id}">${s.id} (${s.label})</option>`
    ).join('');
}

// function to update the instruction of a state
function updateInstruction(state, instructionDiv) {
    const selectors = instructionDiv.getElementsByTagName('select');
    const values = Array.from(selectors).map(selector => selector.value || null);
    const type = values[0];
    const k = parseInt(values[1]);

    // update instruction based on type
    if (type === '+') {
        // add (+) instruction: +(k, a, q)
        state.instruction = {
            type,
            k,
            a: values[2],
            q: values[3],
            q_prime: null
        };

    } else if (type === '-') {
        // delete (-) instruction: -(k, q, q')
        state.instruction = {
            type,
            k,
            a: null,
            q: values[2],
            q_prime: values[3]
        };

    } else if (type === '?') {

        // if the last value is null, set it to the second last value
        if (values[4] === null) {
            values[4] = values[3]
        };

        // check (?) instruction: ?(k, a, q, q')
        state.instruction = {
            type,
            k,
            a: values[2],
            q: values[3],
            q_prime: values[4]
        };
    }

    updateStateList();
}

// function to add a new state
function addState() {
    const newId = Math.max(...states.filter(s => !isNaN(s.id)).map(s => parseInt(s.id)), 0) + 1;
    states.push({
        id: newId.toString(),
        label: `State ${newId}`,
        instruction: { type: '+', k: 0, a: '0', q: 'H' }
    });
    updateStateList();
}

// function to delete a state
function deleteState(id) {
    states = states.filter(s => s.id !== id);
    updateStateList();
}

// function to update the register display
function updateRegisters() {
    const registerContainer = document.getElementById('registerContainer');
    registerContainer.innerHTML = '';
    
    // get current number of registers
    const n = parseInt(document.getElementById('registerCount').value);
    
    // ensure registers array matches current size
    while (registers.length < n) {
        registers.push('');
    }
    registers = registers.slice(0, n);
    
    // create register displays
    registers.forEach((content, i) => {
        const registerDiv = document.createElement('div');
        registerDiv.className = 'register';
        
        // header with label and controls
        const header = document.createElement('div');
        header.className = 'register-header';
        
        const label = document.createElement('span');
        label.textContent = `Register ${i}: `;
        header.appendChild(label);
        
        // create buttons as spans with click handlers
        ['Push a 0', 'Push a 1', 'Pop', 'Clear'].forEach((text, index) => {
            if (index > 0) {
                const separator = document.createElement('span');
                separator.textContent = ' / ';
                header.appendChild(separator);
            }
            
            const button = document.createElement('span');
            button.className = 'clickable';
            button.textContent = text;
            
            switch(index) {
                case 0: // push a 0
                    button.onclick = () => {
                        registers[i] += '0';
                        updateRegisters();
                    };
                    break;
                case 1: // push a 1
                    button.onclick = () => {
                        registers[i] += '1';
                        updateRegisters();
                    };
                    break;
                case 2: // pop (remove last digit)
                    button.onclick = () => {
                        registers[i] = registers[i].slice(0, -1);
                        updateRegisters();
                    };
                    break;
                case 3: // clear (remove all digits)
                    button.onclick = () => {
                        registers[i] = '';
                        updateRegisters();
                    };
                    break;
            }
            
            header.appendChild(button);
        });
        
        registerDiv.appendChild(header);
        
        // register content display
        const contentDiv = document.createElement('div');
        contentDiv.className = 'register-content';
        
        // create a box for each digit in the register content
        content.split('').forEach(digit => {
            const box = document.createElement('div');
            box.className = 'digit-box';
            box.textContent = digit;
            contentDiv.appendChild(box);
        });
        
        // create an empty box at the end
        const emptyBox = document.createElement('div');
        emptyBox.className = 'digit-box empty';
        contentDiv.appendChild(emptyBox);
        
        registerDiv.appendChild(contentDiv);
        registerContainer.appendChild(registerDiv);
    });
}

// Add these style rules:
const style = document.createElement('style');
style.textContent = `

`;
document.head.appendChild(style);

// initialise the state list with the start and halt states and the register display
document.getElementById('registerCount').addEventListener('input', function(e) {
    document.getElementById('registerCountDisplay').textContent = e.target.value;
    updateStateList();
    updateRegisters();
});

// initialise the state list with the start and halt states and the register display
updateStateList();
updateRegisters();