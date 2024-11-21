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

        // delete button for numeric states
        if (!isNaN(state.id)) {
            const deleteButton = document.createElement('span');
            deleteButton.className = 'clickable';
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteState(state.id);
            stateDiv.appendChild(deleteButton);
        }

        // don't show instruction interface for halt state
        if (state.id === 'H') {
            stateDiv.appendChild(document.createElement('br'));
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
                        <option value="0">ends in 0</option>
                        <option value="1">ends in 1</option>
                        <option value="empty">is empty (ε)</option>
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

// variables to keep track of the current computation state
let currentState = 'S';
let isPaused = true;
let computationSpeed = 500;
let computationInterval = null;
let computationLog = [];

// functions to perform and control the computation
function performComputationStep() {

    // get the current state
    const state = states.find(s => s.id === currentState);

    // if the state is null or the halt state, stop the computation
    if (!state || state.id === 'H') {
        stopComputation();
        addToLog('Computation halted.');
        return false;
    }

    // get the instruction
    const instruction = state.instruction;
    let nextState;
    let logMessage = `Current state: ${state.id} (${state.label}) - `;
    
    // perform the instruction based on its type
    switch(instruction.type) {

        // add instruction: append letter to register k
        case '+':
            logMessage += `add ${instruction.a} to register ${instruction.k} and go to state ${instruction.q}.`;
            registers[instruction.k] += instruction.a;
            nextState = instruction.q;
            break;
        
        // check instruction: check last letter of register k
        case '?':
            const register = registers[instruction.k];
            const isEmpty = register.length === 0;
            const lastChar = isEmpty ? 'empty' : register[register.length - 1];

            // if we want to check for an empty register
            if (instruction.a === 'empty') {
                logMessage += `check register ${instruction.k} empty `;

                // if the register is empty, go to q, otherwise go to q'
                if (isEmpty) {
                    nextState = instruction.q;
                    logMessage += `(yes); go to state ${instruction.q}`;
                } else {
                    nextState = instruction.q_prime;
                    logMessage += `(no); go to state ${instruction.q_prime}`;
                }

            // if we want to check for a specific letter, but the register is empty
            } else if (isEmpty) {
                logMessage += `check register ${instruction.k} ends in ${instruction.a} (no, empty); go to state ${instruction.q_prime}.`;
                nextState = instruction.q_prime;

            // if the last letter of the register matches the letter we're looking for
            } else if (instruction.a === lastChar) {
                logMessage += `check register ${instruction.k} ends in ${instruction.a} (yes); go to state ${instruction.q}.`;
                nextState = instruction.q;

            // if the last letter of the register doesn't match the letter we're looking for
            } else {
                logMessage += `check register ${instruction.k} ends in ${instruction.a} (no); go to state ${instruction.q_prime}.`;
                nextState = instruction.q_prime;
            }

            break;
        
        // remove instruction: remove last letter from register k if non-empty
        case '-':
            if (registers[instruction.k].length === 0) {
                logMessage += `remove from register ${instruction.k} (empty, so go to state ${instruction.q}).`;
                nextState = instruction.q;
            } else {
                logMessage += `remove from register ${instruction.k} (non-empty, so go to state ${instruction.q_prime}).`;
                registers[instruction.k] = registers[instruction.k].slice(0, -1);
                nextState = instruction.q_prime;
            }
            break;
    }
    
    // add the log message and update the state of the computation
    addToLog(logMessage);
    currentState = nextState;
    updateRegisters();
    updateComputationState();
    return true;
}

// reset the computation state
function resetComputation() {
    currentState = 'S';
    computationLog = [];
    updateComputationLog();
    updateComputationState();
    stopComputation();
}

// run the computation on a loop
function startComputation() {
    isPaused = false;
    updateComputationState();
    computationInterval = setInterval(() => {
        if (!performComputationStep()) {
            stopComputation();
        }
    }, computationSpeed);
}

// stop the computation loop
function stopComputation() {
    isPaused = true;
    updateComputationState();
    if (computationInterval) {
        clearInterval(computationInterval);
        computationInterval = null;
    }
}

// add a message to the computation log
function addToLog(message) {
    const timestamp = (computationLog.length + 1).toString().padStart(3, '0');
    computationLog.push(`Step ${timestamp}: ${message}`);
    updateComputationLog();
}

// update the computation log display
function updateComputationLog() {
    const logContainer = document.getElementById('computationLog');
    logContainer.innerHTML = computationLog.map(msg => `<div>${msg}</div>`).join('');
    logContainer.scrollTop = logContainer.scrollHeight;
}

// update the computation state display
function updateComputationState() {
    const state = states.find(s => s.id === currentState);
    document.getElementById('currentState').textContent = `${currentState} (${state ? state.label : 'Unknown'})`;
    document.getElementById('playPauseBtn').textContent = isPaused ? 'Play' : 'Pause';
}

// create the control interface for the computation
function createComputationControls() {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'computation-controls';
    controlsDiv.innerHTML = `
        <div class="control-row">
            <button id="resetBtn">Reset</button>
            <button id="stepBtn">Step</button>
            <button id="playPauseBtn">Play</button>
            <span class="speed-control">
                Speed: <input type="range" id="speedSlider" min="50" max="2000" value="500">
                <span id="speedDisplay">500ms</span>
            </span>
        </div>
        <div class="state-display">
            Current State: <span id="currentState">S</span>
        </div>
        <div id="computationLog" class="computation-log"></div>
    `;
    
    document.body.appendChild(controlsDiv);
    
    // add event listeners
    document.getElementById('resetBtn').onclick = resetComputation;
    document.getElementById('stepBtn').onclick = () => {
        stopComputation();
        performComputationStep();
    };

    // play/pause button
    document.getElementById('playPauseBtn').onclick = () => {
        if (isPaused) {
            startComputation();
        } else {
            stopComputation();
        }
    };

    // speed slider
    document.getElementById('speedSlider').oninput = (e) => {
        computationSpeed = parseInt(e.target.value);
        document.getElementById('speedDisplay').textContent = `${computationSpeed}ms`;
        if (!isPaused) {
            stopComputation();
            startComputation();
        }
    };
}

// save the state of the machine to local storage
function saveAll() {
    const data = {
        states: states,
        registers: registers,
        computationLog: computationLog
    };
    localStorage.setItem('turingMachineData', JSON.stringify(data));
    document.getElementById('saveButton').textContent = 'Saved!';
    setTimeout(() => {
        document.getElementById('saveButton').textContent = 'Save';
    }, 1000);
}

// load the state of the machine from local storage
function loadAll() {
    const data = JSON.parse(localStorage.getItem('turingMachineData'));
    if (data) {

        // load the states, registers, and computation log
        states = data.states;
        registers = data.registers;
        computationLog = data.computationLog;

        // update the interface
        updateStateList();
        updateRegisters();
        resetComputation();
        updateComputationLog();
    }
}

// initialise the state list with the start and halt states and the register display
document.getElementById('registerCount').addEventListener('input', function(e) {
    document.getElementById('registerCountDisplay').textContent = e.target.value;
    updateStateList();
    updateRegisters();
});

// initialise the state list with the start and halt states and the register display
updateStateList();
updateRegisters();

// reset and render the computation controls
createComputationControls();
resetComputation();

// load saved data
loadAll();