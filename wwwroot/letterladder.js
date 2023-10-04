console.log('Script is running.');
let movesCount = 0;
let movesText;
let endGame = false;
const webhookUrl = 'https://discord.com/api/webhooks/1158867807086333962/VweLqIpvKOHpdaSkEkW4opUNnQFfqklAwYmEE8oALho1clOCOdWwjaMR_nzPoW8hI8Iw';
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

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
let userID = localStorage.getItem('userID');
if (userID === null || userID === undefined) {
    userID = makeid(4);
    localStorage.setItem('userID', userID);
}
console.log('User ID: ' + userID);

// Function to send a message to the Discord webhook
function sendMessageToDiscord(message) {
    const payload = {
        content: message,
        //username: userID,
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
        .then(response => {
            if (response.ok) {
                console.log('Message sent to Discord.');
            } else {
                console.error('Failed to send message to Discord.');
            }
        })
        .catch(error => {
            console.error('An error occurred:', error);
        });
}

// Functions that update movesText
function updateMovesText(moves) {
    //console.log('Updating Move Count');
    if (movesText) {
        //console.log(moves);
        movesText.textContent = `Moves: ${moves}`;
    }
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

    sendMessageToDiscord(userID + ': ' + inputWord);
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
    sendMessageToDiscord(userID + ': CHEAT - ' + inputWord);
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

// Entry point
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const dictionary = await loadDictionary();
        if (!dictionary) {
            return; // Exit if dictionary loading fails
        }

        const wordPairs = [            
            { start: 'SLIP', end: 'SLIDE' },//2
            { start: 'PACK', end: 'RAT' },//3           
            { start: 'RARE', end: 'BACON' },//4
            { start: 'DINNER', end: 'INN' },//5
            { start: 'BIGGER', end: 'BETTER' },//5
            { start: 'TOSSED', end: 'TURNED' },//6
            { start: 'DANCING', end: 'MONKEY' },//10
            { start: 'RIVER', end: 'EMBANKED' }//21
        ];

        let currentWordPairIndex = 0;
        let startWord = wordPairs[currentWordPairIndex].start;
        let endWord = wordPairs[currentWordPairIndex].end;

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
            currentWordPairIndex++;
            if (currentWordPairIndex >= wordPairs.length) {
                alert('That\'s it for now, thanks for playing!');
                return;
            }
            sendMessageToDiscord(userID + ': Next Level');

            startWord = wordPairs[currentWordPairIndex].start;
            endWord = wordPairs[currentWordPairIndex].end;

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
                //const ladderDiv = document.getElementById('ladder');
                //ladderDiv.innerHTML = `${startWord} -> ${endWord}`;
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
        console.log('Event Listener Attached.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
});