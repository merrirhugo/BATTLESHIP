/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,

        // liste des joueurs
        players: [],

        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.board .mini-grid');

            // défini l'ordre des phase de jeu
            const select = document.getElementById("change-order");

            select.addEventListener('change', (event) => {
                var selectValue = select.value
                if(selectValue == "player") {
                    this.phaseOrder = [
                        this.PHASE_INIT_PLAYER,
                        this.PHASE_INIT_OPPONENT,
                        this.PHASE_PLAY_PLAYER,
                        this.PHASE_PLAY_OPPONENT,
                        this.PHASE_GAME_OVER
                    ]; 
                    this.playerTurnPhaseIndex = 0;

                    // initialise les joueurs
                    this.setupPlayers();

                    // ajoute les écouteur d'événement sur la grille
                    this.addListeners();

                    // c'est parti !
                    this.goNextPhase();               
                }else if (selectValue == "computer"){
                        this.phaseOrder = [
                            this.PHASE_INIT_OPPONENT,
                            this.PHASE_INIT_PLAYER,
                            this.PHASE_PLAY_OPPONENT,
                            this.PHASE_PLAY_PLAYER,
                            this.PHASE_GAME_OVER
                        ];
                    this.playerTurnPhaseIndex = 0;

                    // initialise les joueurs
                    this.setupPlayers();

                    // ajoute les écouteur d'événement sur la grille
                    this.addListeners();

                    // c'est parti !
                    this.goNextPhase();                
                }
                else if(selectValue == "aleatoire") {
                    let randomNumber = Math.floor(Math.random() * 10)
                    if(randomNumber < 5) {
                        this.phaseOrder = [
                            this.PHASE_INIT_OPPONENT,
                            this.PHASE_INIT_PLAYER,
                            this.PHASE_PLAY_OPPONENT,
                            this.PHASE_PLAY_PLAYER,
                            this.PHASE_GAME_OVER
                        ];
                    this.playerTurnPhaseIndex = 0;

                    // initialise les joueurs
                    this.setupPlayers();

                    // ajoute les écouteur d'événement sur la grille
                    this.addListeners();

                    // c'est parti !
                    this.goNextPhase();
                    }else{
                        this.phaseOrder = [
                            this.PHASE_INIT_PLAYER,
                            this.PHASE_INIT_OPPONENT,
                            this.PHASE_PLAY_PLAYER,
                            this.PHASE_PLAY_OPPONENT,
                            this.PHASE_GAME_OVER
                        ]; 
                        this.playerTurnPhaseIndex = 0;
    
                        // initialise les joueurs
                        this.setupPlayers();
    
                        // ajoute les écouteur d'événement sur la grille
                        this.addListeners();
    
                        // c'est parti !
                        this.goNextPhase();
                    }

                }
            })
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;
            if (ci == 3) {
                this.currentPhase = this.phaseOrder[2]
            }
            else if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[0];
            }

            switch (this.currentPhase) {
                case this.PHASE_GAME_OVER:
                    // detection de la fin de partie
                    if (!this.gameIsOver()) {
                        // le jeu n'est pas terminé on recommence un tour de jeu
                        this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                    }

                case this.PHASE_INIT_PLAYER:
                    utils.info("Placez vos bateaux");
                    break;
                case this.PHASE_INIT_OPPONENT:
                    this.wait();
                    utils.info("En attente de votre adversaire");
                    this.players[1].isShipOk(function () {
                        self.stopWaiting();
                        self.goNextPhase();
                    });
                    break;
                case this.PHASE_PLAY_PLAYER:
                    utils.info("A vous de jouer, choisissez une case !");
                    break;
                case this.PHASE_PLAY_OPPONENT:
                    utils.info("A votre adversaire de jouer...");
                    this.players[1].play(this.players[1].tries);
                    break;
            }

        },
        gameIsOver: function () {
            if (this.players[0].global_life === 0) {
                alert("Fin de partie, tu as perdu...");
                window.location.reload()
            } else if (this.players[1].global_life === 0) {
                alert("Bien joué ! Tu as gagné");
                window.location.reload()
            }
            else {
                return false
            }
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },

        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('contextmenu', _.bind(this.rightClickHandler, this), false);
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];


                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                if (ship.getId() === 3 && this.players[0].orientation == 'Verticale') {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + (this.players[0].activeShip) * 60) + 30 + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + 30 + "px";
                } else {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + (this.players[0].activeShip) * 60) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                }
            }
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;

            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if ((this.players[0].orientation == 'Horizontale'
                        && this.players[0].checkShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))
                        && this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode)))
                        || (this.players[0].orientation == 'Verticale'
                            && this.players[0].checkShipPositionRight(utils.eq(e.target), utils.eq(e.target.parentNode))
                            && this.players[0].setActiveShipPositionRight(utils.eq(e.target), utils.eq(e.target.parentNode)))) {
                        this.players[0].orientation = 'Horizontale'
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                    // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode))
                }
            }
        },
        rightClickHandler: function (e) {
            e.preventDefault()
            // Selection du bateau actuel
            var currentShip = this.players[0].fleet[this.players[0].activeShip]
            // Si la pos est horizontale
            if (this.players[0].orientation == 'Verticale') {
                this.players[0].orientation = 'Horizontale'
                //On passe la rotation à 0deg pour le passer en horizontale
                currentShip.dom.style.transform = 'rotate(0deg)'
            }
            else if (this.players[0].orientation == 'Horizontale') {
                if (currentShip.name !== 'Submarine') {
                    this.players[0].orientation = 'Verticale'
                    //On effectue une rotation à 90deg pour le passer en horizontale
                    currentShip.dom.style.transform = 'rotate(90deg)'
                }
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];

            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            }

            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)

            target.receiveAttack(col, line, function (hasSucceed) {
                var audio_miss = new Audio('audio/plouf.wav')
                var audio_hit = new Audio('audio/hit.wav')
                var audio_canon = new Audio('audio/canon.wav')
                var animation_hit = document.createElement('img')
                animation_hit.className += ' animation-hit'
                animation_hit.src = 'img/hit.png'
                var animation_miss = document.createElement('img')
                animation_miss.className += ' animation-miss'
                animation_miss.src = 'img/miss.gif'
                


                audio_canon.play()

                let cell_player = document.querySelectorAll('.main-grid>.row:nth-of-type(' + (line + 1) + ')>.cell:nth-of-type(' + (col + 1) + ')').item(0);
                let cell_opponent = document.querySelectorAll('.mini-grid>.row:nth-of-type(' + (line + 1) + ')>.cell:nth-of-type(' + (col + 1) + ')').item(0);
                if (target.fleet[0].id == 5) {
                    if (cell_player.style.backgroundColor == 'red' || cell_player.style.backgroundColor == 'grey') {
                        if (cell_player.style.backgroundColor == 'red') {
                            msg += "Encore touché ..."
                            setTimeout(function() {
                                cell_player.appendChild(animation_hit)
                            }, 1000)
                            setTimeout(function() {
                                cell_player.removeChild(animation_hit)
                            }, 1000) 
                            setTimeout(function() {
                                audio_hit.play()
                            }, 1000)             
                        }
                        else {
                            msg += "Encore manqué ..."
                            setTimeout(function() {
                                cell_player.appendChild(animation_miss)
                            }, 1000)
                            setTimeout(function () {
                                cell_player.removeChild(animation_miss)
                            }, 2000)
                            setTimeout(function() {
                                audio_miss.play()
                            }, 1000)             

                        }
                    } else if (hasSucceed) {
                        cell_player.style.backgroundColor = 'red';
                        setTimeout(function() {
                            cell_player.appendChild(animation_hit)
                        }, 1000) 
                        setTimeout(function () {
                            cell_player.removeChild(animation_hit)
                        }, 2000)
                        msg += "touché !";
                        target.global_life -= 1
                        setTimeout(function() {
                            audio_hit.play()
                        }, 1000)             

                    } else {
                        cell_player.style.backgroundColor = 'grey';
                        msg += "manqué...";
                        setTimeout(function () {
                            cell_player.appendChild(animation_miss)
                        }, 1000)
                        setTimeout(function () {
                            cell_player.removeChild(animation_miss)
                        }, 2000)
                        audio_canon.play() 
                        setTimeout(function() {
                            audio_miss.play()
                        }, 1000)             
                }
                }
                else if (target.fleet[0].id == 1) {
                    if (cell_opponent.style.backgroundColor == 'red' || cell_opponent.style.backgroundColor == 'grey') {
                        if (cell_opponent.style.backgroundColor == 'red') {
                            msg += "Encore touché ..."
                            setTimeout(function() {
                                cell_opponent.appendChild(animation_hit)
                            }, 1000)
                            setTimeout(function() {
                                cell_opponent.removeChild(animation_hit)
                            }, 1000) 
                            setTimeout(function() {
                                audio_hit.play()
                            }, 1000)             
                        }
                        else {
                            msg += "Encore manqué ..."
                            setTimeout(function () {
                                cell_opponent.appendChild(animation_miss)
                            }, 1000)
                            setTimeout(function () {
                                cell_opponent.removeChild(animation_miss)
                            }, 2000)
                            setTimeout(function() {
                                audio_miss.play()
                            }, 1000)             
                        }
                    } else if (hasSucceed) {
                        cell_opponent.style.backgroundColor = 'red';
                        setTimeout(function() {
                            cell_opponent.appendChild(animation_hit)
                        }, 1000) 
                        setTimeout(function() {
                            cell_opponent.removeChild(animation_hit)
                        }, 2000) 
                        msg += "touché !";
                        target.global_life -= 1
 
                        setTimeout(function() {
                            audio_hit.play()
                        }, 1000)             

                    } else {
                        cell_opponent.style.backgroundColor = 'grey';
                        msg += "manqué...";
                        setTimeout(function () {
                            cell_opponent.appendChild(animation_miss)
                        }, 1000)
                        setTimeout(function () {
                            cell_opponent.removeChild(animation_miss)
                        }, 2000)
                        audio_canon.play()
                        setTimeout(function() {
                            audio_miss.play()
                        }, 1000)             

                    }
                }

                utils.info(msg);

                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                callback(hasSucceed);
                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 1000);
            });
            this.gameIsOver();
        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);

        },
        renderMiniMap: function () {
            // On égalise la mini map et la grande pour faire une prévisualisation
            document.getElementsByClassName("mini-grid").item(0).innerHTML = document.getElementsByClassName('main-grid').item(0).innerHTML;

            // Pour éviter le décalage par en haut on soustrait 210px de margin-top à la grid
            document.getElementsByClassName('mini-grid').item(0).style.marginTop = '-210px'
        }
    };

    // Help for the player
    var button = document.querySelector('.help')

    button.addEventListener('click', (event) => {
        var count = -1;
        let shipPlacement = []
        const random = Math.floor(Math.random() * 16)
            //console.log(computer.grid)
            computer.grid.forEach(row => {
                row.forEach(entry => {
                    count++ 
                    if(entry !== 0) {
                        shipPlacement.push(count)
                    }
                    })
                })

        
         alert('Essaye la ligne numéro : ' + (parseInt(shipPlacement[random].toString().substr(0, 1)) + 1) + ' et la colonne numéro : ' + (parseInt(shipPlacement[random].toString().substr(1, 1)) + 1))
         return               
        
        })


    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

}());