let teamPlayers = [];
let filteredTeams = [];
let teamsUsed = 0;
let playerOld
let player

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.league-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            getTeams();
        });
    });

    document.getElementById('start-button').addEventListener('click', () => {
        getTeams().then(teams => {
            if (teams.length != 0) {
                document.querySelector(".overlay-container").style.display = "none";
                document.querySelector(".up-section").style.display = "none";
                document.querySelector(".down-section").style.display = "";

                filteredTeams = teams;

                document.querySelector(".team-text").textContent = filteredTeams[teamsUsed].team_name

                fetchPlayersForTeams(filteredTeams.map(team => team.team_id)).then(players => {
                    teamPlayers = players;
                });
            }
        });
    });

    document.getElementById('player-button').addEventListener('click', mainPlayerHandle);
    document.getElementById('player-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            mainPlayerHandle();
        }
    });
});

const mainPlayerHandle = () => {
    const normalizedInput = document.getElementById('player-input').value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const players = teamPlayers.filter(player => 
        player.team === filteredTeams[teamsUsed].team_id &&
        [player.first_name, player.surname, player.nickname].some(name =>
            name?.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase() === normalizedInput.toLowerCase()
        )
    );
                
        
    // Multiple players handeling
if (!player){
    if (players.length === 1) {
        player = players[0]
    } else if (players.length > 1) {
        playerSelected = Array.from(document.querySelector('.select-player-position').querySelectorAll('input[type="radio"].player-selector'))
            .filter(radio => radio.checked)

        console.log(playerSelected);

        if (playerSelected.length > 0) {
            player = players[playerSelected[0].value];
            console.log(player);
        } else {
            document.querySelector('.select-player-position').innerHTML = '';
            let iteration = 0
            players.forEach(player => {
                let playerSelector
                if (player.nickname) {
                    playerSelector = `${player.first_name} '${player.nickname}' ${player.surname}`;
                } else { 
                    playerSelector =`${player.first_name} ${player.surname}`;   
                }

                const radioButton = document.createElement('input');
                radioButton.type = 'radio';
                radioButton.name = 'player-selector';
                radioButton.className = 'player-selector';
                radioButton.value = iteration;
                radioButton.id = iteration;
    
                if (document.querySelector('.select-player-position').querySelectorAll('input[type="radio"].player-selector').length === 0) {
                    radioButton.checked = true;
                }
    
                const label = document.createElement('label');
                label.htmlFor = playerSelector;
                label.textContent = playerSelector;
    
                document.querySelector('.select-player-position').appendChild(radioButton);
                document.querySelector('.select-player-position').appendChild(label);

                iteration++;
            });
            return 0;
        }

    } else {
        document.querySelector('.select-player-position').textContent = 'No players found with the given input';
        return 0;
    }
}
    // Takes player positions
    const positions = [player.main_position, player.alt_position1, player.alt_position2]
        
    // Takes map positions
    const cardPositions = Array.from(
        new Set(
            Array.from(document.querySelectorAll('.card-back'))
                .filter(element => element.textContent.trim() === '')
                .map(element => element.parentElement.querySelector('.card-front').textContent.trim())
        )
    );
        
    // Checks if any position matches
    const matches = positions.filter(element => cardPositions.includes(element));

    // Handles matches
    let selectedPosition

    if (matches.length == 1){
        selectedPosition = matches[0];
    } else if (matches.length > 1){
        selectedPosition = Array.from(document.querySelector('.select-player-position').querySelectorAll('input[type="radio"].position-selector'))
            .filter(radio => radio.checked)
        
        if (selectedPosition.length > 0 && player == playerOld) {
            selectedPosition = selectedPosition[0].value
        } else {
            document.querySelector('.select-player-position').innerHTML = '';
            matches.forEach(matches => {
                createRB(matches);
            }); 
            playerOld = player
        }
    } else{
        document.querySelector('.select-player-position').textContent = `Can't find a position for ${player.display_name || player.surname}`;
        player = null;
        return 0
    }

    if (selectedPosition.length > 0) {
        playerInsert(player, selectedPosition);
        player = null;
        if (teamsUsed < filteredTeams.length) {
            document.querySelector(".team-text").textContent = filteredTeams[teamsUsed].team_name
        } else {
            document.querySelector(".up-section").style.display = "";
            document.querySelector(".up-section").textContent = "You Win! Refresh the web page to play again.";
            document.querySelector(".down-section").style.display = "none";
        }
    }
}
const playerInsert = (player, position) => {
    const positionDiv = Array.from(document.querySelectorAll('.card-back'))
        .filter(element => element.textContent.trim() === '' && element.parentElement.querySelector('.card-front').textContent.trim() == position)

    if  (positionDiv[0]){
        positionDiv[0].innerHTML = `
            <img src="/static/public/images/players/${player.player_id}.webp" class="player-image" />
            <span>${player.display_name || player.surname}</span>
        `;
        positionDiv[0].parentElement.classList.add('flipme');
        document.getElementById('player-input').value = '';
        document.querySelector('.select-player-position').innerHTML = '';
        teamsUsed++;
    }
};

const getTeams = () => {
    const checkedLeagueIds = Array.from(document.querySelectorAll('.league-checkbox'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => Number(checkbox.value));

    return fetch('/get_teams_data/')
        .then(response => response.json())
        .then(teams => teams.filter(team => checkedLeagueIds.includes(team.league)))
        .then(filteredTeams => {
            if (filteredTeams.length < 11) {
                document.querySelector('.team-error').textContent = `Please select at least 11 teams. Currently selected ${filteredTeams.length}.`;
                return [];
            }

            document.querySelector('.team-error').textContent = '';
            return filteredTeams
                .sort(() => 0.5 - Math.random())
                .slice(0, 11);
        });
}

const fetchPlayersForTeams = (selectedTeamIds) => {
    return fetch('/get_player_data/')
        .then(response => response.json())
        .then(players => players.filter(player => selectedTeamIds.includes(player.team)));
}

const createRB = (cardText) => {
    const radioButton = document.createElement('input');
    radioButton.type = 'radio';
    radioButton.name = 'position-selector';
    radioButton.className = 'position-selector';
    radioButton.value = cardText;
    radioButton.id = cardText;

    if (document.querySelector('.select-player-position').querySelectorAll('input[type="radio"].position-selector').length === 0) {
        radioButton.checked = true;
    }

    const label = document.createElement('label');
    label.htmlFor = cardText;
    label.textContent = cardText;

    document.querySelector('.select-player-position').appendChild(radioButton);
    document.querySelector('.select-player-position').appendChild(label);
};