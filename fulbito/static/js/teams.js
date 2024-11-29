document.addEventListener('DOMContentLoaded', function() {
    const playerButton = document.getElementById('player-button');
    const playerInput = document.getElementById('player-input');
    const selectPlayerPositionDiv = document.querySelector('.select-player-position');
    const playerCards = document.querySelectorAll('.player-card.card-back');
    const leaguesCheckboxes = document.querySelectorAll('.leagues-checkbox');
    let playerOld = null;
    let selectedTeam = [];
    let count = 0;

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    fetch('/get_teams_data/')
        .then(response => response.json())
        .then(data => {
            shuffleArray(data);
            selectedTeam = data.slice(0, 11);
            printTeam();
        })
        .catch(error => console.error('Error fetching teams:', error));

    const printTeam = () => {
        if (count < selectedTeam.length) {
            document.querySelector('.team-text').textContent = selectedTeam[count].team_name;
        } else {
            document.querySelector('.out-pick').innerHTML = 'You Win! Refresh the web page to play again.';
        }
    };

    const handlePlayerInsertion = () => {
        const playerName = playerInput.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        fetch('/get_player_data/')
            .then(response => response.json())
            .then(players => {
                const player = players.find(p => {
                    const firstName = p.first_name?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                    const surname = p.surname?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                    const nickname = p.nickname?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

                    const fullName = `${firstName} ${surname}`.trim();

                    return (
                        fullName === playerName ||
                        surname === playerName ||
                        nickname === playerName
                    );
                });

                if (player) {
                    const radioButtonExists = selectPlayerPositionDiv.querySelectorAll('.position-selector');

                    if (count < selectedTeam.length) {
                        if (player.team === selectedTeam[count].team_id) {
                            if (radioButtonExists.length > 0 && playerName === playerOld) {
                                playerInsert(player);
                                count++;
                                printTeam();
                            } else {
                                positionCompare(player);
                                playerOld = playerName;
                            }
                        } else {
                            selectPlayerPositionDiv.textContent = `${player.display_name || player.surname} does not play for ${selectedTeam[count].team_name}`;
                        }
                    }
                } else {
                    selectPlayerPositionDiv.textContent = `Can't find ${playerInput.value}`;
                }
            })
            .catch(error => console.error('Error:', error));
    };

    playerButton.addEventListener('click', handlePlayerInsertion);
    playerInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handlePlayerInsertion();
        }
    });

    const playerInsert = (player) => {
        const selectedRadioButton = selectPlayerPositionDiv.querySelectorAll('input[name="position-selector"]:checked');

        console.log(selectedRadioButton)

        if (selectedRadioButton) {
            const selectedPosition = selectedRadioButton.value;
            const dispPosition = Array.from(playerCards).find(card => {
                return card.parentElement.querySelector('.card-front').textContent.trim() === selectedPosition && card.parentElement.querySelector('.card-back').textContent.trim() === "";
            });

            if (dispPosition) {
                dispPosition.textContent = player.display_name || player.surname;
                dispPosition.parentElement.classList.add('flipme');
                playerInput.value = '';
                selectPlayerPositionDiv.innerHTML = '';
            }
        }
    };

    const positionCompare = (player) => {
        selectPlayerPositionDiv.textContent = '';

        const positions = ['main_position', 'alt_position1', 'alt_position2'];
        const addedPositions = new Set();

        positions.forEach(pos => {
            const positionValue = player[pos];
            if (positionValue) {
                for (let card of playerCards) {
                    const cardText = card.parentElement.querySelector('.card-front').textContent.trim();
                    if (cardText === positionValue && card.textContent.trim() === '' && !addedPositions.has(positionValue)) {
                        createRB(positionValue);
                        addedPositions.add(positionValue);
                    }
                }
            }
        });

        if (addedPositions.size === 0) {
            selectPlayerPositionDiv.textContent = `There's no place for ${player.display_name || player.surname} in the formation`;
        }

        if (addedPositions.size === 1) {
            playerInsert(player);
            count++;
            printTeam();
        }
    };

    const createRB = (cardText) => {
        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.name = 'position-selector';
        radioButton.className = 'position-selector';
        radioButton.value = cardText;

        if (selectPlayerPositionDiv.querySelectorAll('input[type="radio"]').length === 0) {
            radioButton.checked = true;
        }

        const label = document.createElement('label');
        label.htmlFor = cardText;
        label.textContent = cardText;

        selectPlayerPositionDiv.appendChild(radioButton);
        selectPlayerPositionDiv.appendChild(label);
    };

});
