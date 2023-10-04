console.log('Script is running.');
let movesCount = 0;
let movesText;
let endGame = false;
let difficulty = 0;
// Load the dictionary asynchronously from local storage or fetch if not available
async function loadDictionary() {
    console.log('Loading dictionary...');

    const cachedDictionary = localStorage.getItem('dictionary');

    if (cachedDictionary) {
        console.log('Using cached dictionary...');
        return JSON.parse(cachedDictionary);
    } else {
        console.log('Fetching dictionary...');
        try {
            const response = await fetch('dictionary.json');
            if (!response.ok) {
                throw new Error('Failed to load dictionary');
            }
            const data = await response.json();
            console.log('Dictionary data:', data);
            localStorage.setItem('dictionary', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error loading dictionary:', error);
            return null;
        }
    }
}

// Functions that update movesText
function updateMovesText(moves) {
    //console.log('Updating Move Count');
    if (movesText) {
        //console.log(moves);
        movesText.textContent = `Moves: ${moves}`;
    }
}
function updateDiffText(newDiff) {
    const difficultyDiv = document.getElementById('difficulty-text');
    difficultyDiv.innerHTML = 'Difficulty: ' + newDiff;
}

// Function to find a ladder from start to end
function findWordLadder(start, end, dictionary) {
    const queue = [{ word: start, ladder: [start] }];
    const visited = new Set([start]);

    while (queue.length > 0) {
        const { word, ladder } = queue.shift();

        if (word === end) {
            return ladder; // Found ladder
        }

        const neighbors = dictionary[word];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push({ word: neighbor, ladder: [...ladder, neighbor] });
            }
        }
    }

    return null; // No ladder found
}

// Function to display the ladder
function oldDisplayLadder(ladder, elementId) {
  const ladderDiv = document.getElementById(elementId);
  ladderDiv.innerHTML = ladder.join('<br>');
}
function displayLadder(ladder) {
    const ladderDiv = document.getElementById('ladder');
    const startWord = ladder[0];
    const endWord = ladder[ladder.length - 1];

    ladderDiv.innerHTML = `Start: ${startWord} | End: ${endWord}`;

    const ladderlength = ladder.length - 1;
    let adder = 0;
    if (ladderlength >= 4 && ladderlength < 6) { adder = 1; }
    else if (ladderlength >= 6 && ladderlength < 8) { adder = 3; }
    else if (ladderlength >= 8 && ladderlength < 10) { adder = 5; }
    else if (ladderlength >= 10 && ladderlength < 15) { adder = 10; }
    else if (ladderlength >= 15) { adder = ladderlength; }
    const goalNumber = ladderlength + adder;

    const goalText = document.createElement('div');
    goalText.textContent = `Goal: ${goalNumber}`;
    goalText.classList.add('goal-text');
    //Move Text
    movesText = document.createElement('div');
    movesText.textContent = `Moves: ${movesCount}`;
    movesText.classList.add('moves-text');
    const goalAndMovesContainer = document.createElement('div');
    goalAndMovesContainer.appendChild(goalText);
    goalAndMovesContainer.appendChild(movesText);
    ladderDiv.appendChild(goalAndMovesContainer);
    //ladderDiv.appendChild(goalText);
}

function addWordToUserLadder(word) {
    const ladderDiv = document.getElementById('userLadderList');
    const currentLadder = ladderDiv.innerHTML.split('<br>');
    const updatedLadder = [...currentLadder, word];
    ladderDiv.innerHTML = updatedLadder.join('<br>');

    // Automatically scroll to the bottom if scrollbar exists
    const scrollDiv = document.getElementById('userLadder');
    if (scrollDiv.scrollHeight > scrollDiv.clientHeight) {
        scrollDiv.scrollTop = scrollDiv.scrollHeight - scrollDiv.clientHeight;
    }
}

// Function to find the next word and display the updated ladder
function findNextWord(dictionary, ladder) {
    const inputElement = document.getElementById('userWordInput');
    const inputWord = inputElement.value.trim().toUpperCase();

    if (inputWord === '') {
        alert('Please enter a valid word.');
        return;
    }

    const ladderDiv = document.getElementById('userLadderList');
    const currentLadder = ladderDiv.innerHTML.split('<br>');

    const currentWord = currentLadder[currentLadder.length - 1];
    //console.log('Current Word:', currentWord); // Debug log
    const neighbors = dictionary[currentWord];
    //console.log('Neighbors:', neighbors); // Debug log

    if (!neighbors.includes(inputWord)) {
        alert('Invalid word. Please enter a word that is one edit away from the current word.');
        return;
    }

    movesCount++;
    updateMovesText(movesCount);
    //const updatedLadder = [...currentLadder, inputWord];
    //ladderDiv.innerHTML = updatedLadder.join('<br>');
    addWordToUserLadder(inputWord);
    const endWord = ladder[ladder.length - 1];
    if (inputWord === endWord) {
        const ladderlength = ladder.length - 1;
        let adder = 0;
        if (ladderlength >= 4 && ladderlength < 6) { adder = 1; }
        else if (ladderlength >= 6 && ladderlength < 8) { adder = 3; }
        else if (ladderlength >= 8 && ladderlength < 10) { adder = 5; }
        else if (ladderlength >= 10 && ladderlength < 15) { adder = 10; }
        else if (ladderlength >= 15) { adder = ladderlength; }
        const goalNumber = ladderlength + adder;
        const minimumMoves = ladder.length - 1;
        if (movesCount === minimumMoves) {
            addWordToUserLadder('Perfect!<br>You reached the goal in the minimum number of moves.');
        } else if (movesCount <= goalNumber) {
            addWordToUserLadder('Congratulations!<br>You reached the goal.');
        } else {
            addWordToUserLadder('Nice Job!<br>But that took more moves than expected.');
        }
        endGame = true;
    }
    inputElement.value = '';
}
function cheatWord(dictionary, ladder) {
    const endWord = ladder[ladder.length - 1];
    const ladderDiv = document.getElementById('userLadderList');
    const currentLadder = ladderDiv.innerHTML.split('<br>');

    const currentWord = currentLadder[currentLadder.length - 1];
    const neighbors = dictionary[currentWord];

    const cladder = findWordLadder(currentWord, endWord, dictionary);
    const inputWord = cladder[1];

    if (!neighbors.includes(inputWord)) {
        alert('Invalid word. Please enter a word that is one edit away from the current word.');
        return;
    }
    movesCount++;
    updateMovesText(movesCount);
    addWordToUserLadder(inputWord);
    if (inputWord === endWord) {
        const ladderlength = ladder.length - 1;
        let adder = 0;
        if (ladderlength >= 4 && ladderlength < 6) { adder = 1; }
        else if (ladderlength >= 6 && ladderlength < 8) { adder = 3; }
        else if (ladderlength >= 8 && ladderlength < 10) { adder = 5; }
        else if (ladderlength >= 10 && ladderlength < 15) { adder = 10; }
        else if (ladderlength >= 15) { adder = ladderlength; }
        const goalNumber = ladderlength + adder;
        const minimumMoves = ladder.length - 1;
        if (movesCount === minimumMoves) {
            addWordToUserLadder('Perfect!<br>You reached the goal in the minimum number of moves.');
        } else if (movesCount <= goalNumber) {
            addWordToUserLadder('Congratulations!<br>You reached the goal.');
        } else {
            addWordToUserLadder('Nice Job!<br>But that took more moves than expected.');
        }
        endGame = true;
    }
    const inputElement = document.getElementById('userWordInput');
    inputElement.value = '';
}

// Function to generate a word pair based on the difficulty
function generateWordPair(dictionary, difficulty) {
    const wordLengthCounts = [2, 101, 1012, 4009, 8374, 12167, 13118, 8885, 3297, 670, 78, 4, 1];
    const words = Object.keys(dictionary);
    const getRandomWord = (minLength, maxLength) => {
        let leftBuffer = 0;
        let lloops = 0;
        if (minLength > 1) {
            lloops = minLength;
            lloops--;
            while (lloops > 0) {
                leftBuffer += wordLengthCounts[lloops - 1];
                lloops--;
            }
            leftBuffer--;
        }
        let poolSize = 0;
        for (let i = minLength - 1; i < maxLength; i++) {
            poolSize += wordLengthCounts[i];
        }
        return words[leftBuffer + Math.floor(Math.random() * poolSize)];
    };

    let startWord, endWord, minLadderLength, maxLadderLength, maxWordLength;

    switch (difficulty) {
        case 0: // Very Easy
            minLadderLength = 3;
            maxLadderLength = 4;
            minWordLength = 1;
            maxWordLength = 4;
            break;
        case 1: // Easy
            minLadderLength = 5;
            maxLadderLength = 6;
            minWordLength = 1;
            maxWordLength = 5;
            break;
        case 2: // Normal
            minLadderLength = 7;
            maxLadderLength = 10;
            minWordLength = 1;
            maxWordLength = 6;
            break;
        case 3: // Hard
            minLadderLength = 11;
            maxLadderLength = 15;
            minWordLength = 3;
            maxWordLength = 7;
            break;
        case 4: // Very Hard
            minLadderLength = 16;
            maxLadderLength = 25;
            minWordLength = 6;
            maxWordLength = 13;
            break;
        case 5: // Insane
            minLadderLength = 26;
            maxLadderLength = 51;
            minWordLength = 8;
            maxWordLength = 13;
            break;
        default:
            minLadderLength = 3;
            maxLadderLength = 4;
            minWordLength = 1;
            maxWordLength = 4;
    }

    // Generate a random start word
    startWord = getRandomWord(minWordLength, maxWordLength);

    // Keep generating random end words until it meets the difficulty criteria
    do {
        endWord = getRandomWord(minWordLength, maxWordLength);
        ladder = findWordLadder(startWord, endWord, dictionary);
    } while (!ladder || ladder.length < minLadderLength || ladder.length > maxLadderLength);

    return { start: startWord, end: endWord };
}


// Entry point
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const dictionary = await loadDictionary();
        if (!dictionary) {
            return; // Exit if dictionary loading fails
        }

        let wordPair = generateWordPair(dictionary, difficulty);
        let startWord = wordPair.start;
        let endWord = wordPair.end;

        const findingLadderTimeout = setTimeout(() => {
            alert(`Finding the ladder from ${startWord} to ${endWord} is taking too long. Please try with different words.`);
        }, 30000);

        let ladder = findWordLadder(startWord, endWord, dictionary);
        clearTimeout(findingLadderTimeout);

        if (ladder) {
            displayLadder(ladder);
            //const ladderDiv = document.getElementById('ladder');
            //ladderDiv.innerHTML = `${startWord} -> ${endWord}`;
        } else {
            alert(`No ladder found from ${startWord} to ${endWord}`);
        }

        const userLadder = [startWord]; // Initialize user ladder with start word

        // Display user ladder
        function displayUserLadder() {
            oldDisplayLadder(userLadder, 'userLadderList');
        }
        displayUserLadder();

        const nextWordButton = document.getElementById('nextWordButton');
        nextWordButton.addEventListener('click', () => {
            endGame = false;

            wordPair = generateWordPair(dictionary, difficulty);
            startWord = wordPair.start;
            endWord = wordPair.end;

            // Reset the user ladder and display
            userLadder.length = 1;
            userLadder[0] = startWord;
            displayUserLadder();
            movesCount = 0;
            updateMovesText(movesCount);

            const findingLadderTimeout = setTimeout(() => {
                alert(`Finding the ladder from ${startWord} to ${endWord} is taking too long. Please try with different words.`);
            }, 30000);

            ladder = findWordLadder(startWord, endWord, dictionary);
            clearTimeout(findingLadderTimeout);

            if (ladder) {
                displayLadder(ladder);
            } else {
                alert(`No ladder found from ${startWord} to ${endWord}`);
            }
            userWordInput.value = '';
            userWordInput.focus();
        });

        // Attach event listener to button click
        const addWordButton = document.getElementById('addWordButton');
        addWordButton.addEventListener('click', () => {
            if (!endGame) {
                findNextWord(dictionary, ladder);
            }
            else {
                alert('User ladder is complete. Click the "Next" button to move to the next pair.');
            }
            userWordInput.focus();
        });
        const cheatButton = document.getElementById('cheatButton');
        cheatButton.addEventListener('click', () => {
            if (!endGame) {
                cheatWord(dictionary, ladder);
            }           
            else {
                alert('User ladder is complete. Click the "Next" button to move to the next pair.');
            }
            userWordInput.focus();
        });
        const userWordInput = document.getElementById('userWordInput');
        userWordInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission
                addWordButton.click(); // Trigger the click event on the addWordButton
            }
        });
        const veryeasyButton = document.getElementById('diffVeryEasy');
        veryeasyButton.addEventListener('click', () => {
            updateDiffText('Very Easy');
            difficulty = 0;
        });
        const easyButton = document.getElementById('diffEasy');
        easyButton.addEventListener('click', () => {
            updateDiffText('Easy');
            difficulty = 1;
        });
        const normalButton = document.getElementById('diffNormal');
        normalButton.addEventListener('click', () => {
            updateDiffText('Normal');
            difficulty = 2;
        });
        const hardButton = document.getElementById('diffHard');
        hardButton.addEventListener('click', () => {
            updateDiffText('Hard');
            difficulty = 3;
        });
        const veryhardButton = document.getElementById('diffVeryHard');
        veryhardButton.addEventListener('click', () => {
            updateDiffText('Very Hard');
            difficulty = 4;
        });
        const insaneButton = document.getElementById('diffInsane');
        insaneButton.addEventListener('click', () => {
            updateDiffText('Insane');
            difficulty = 5;
        });
        console.log('Event Listener Attached.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
});