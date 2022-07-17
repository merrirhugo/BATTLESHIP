/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        directions: "none",
        fleet: [],
        game: null,
        global_index_hit: 0,
        global_index_miss: 0,
        grid: [],
        hit_boats_arr: [],
        start_index: 1,
        tries: [],
        play: function () {
            var self = this;
            setTimeout(function () {
                var select = document.getElementById("change-difficulty");
                var selectValue = select.value;
                if (selectValue === "easy") {
                    var x = Math.floor(Math.random() * 10);
                    var y = Math.floor(Math.random() * 10);
                    if (self.tries[y][x] === 0) {
                        self.game.fire(this, y, x, function (hasSucceed) {
                            self.tries[y][x] = hasSucceed;
                        });
                    }
                    else {
                        self.game.fire(this, x, y, function (hasSucceed) {
                            self.tries[x][y] = hasSucceed;
                        });
                    }
                }
                // mode difficile
                else {

                    // En cas de toucher
                    var hit_y = self.hit_boats_arr[0];
                    var hit_x = self.hit_boats_arr[1];
                    console.log(self.directions);
                    console.log(self.global_index_hit);
                    console.log(self.global_index_miss);

                    // Premier tir ou pas encore touché
                    if (self.directions === "none") {
                        self.global_index_hit = 0;
                        self.global_index_miss = 0;
                        var x = Math.floor(Math.random() * 10);
                        var y = Math.floor(Math.random() * 10);
                        if (self.tries[y][x] === 0) {
                            self.game.fire(this, y, x, function (hasSucceed) {
                                self.tries[y][x] = hasSucceed;
                                if (hasSucceed === true) {
                                    // On commence par la droite
                                    self.hit_boats_arr.splice(0, 2)
                                    self.hit_boats_arr.push(y + 1, x)
                                    self.directions = 'right'
                                    self.start_index++
                                    self.global_index_hit++
                                }
                            })
                        }
                        else {
                            self.game.fire(this, x, y, function (hasSucceed) {
                                self.tries[x][y] = hasSucceed;
                                if (hasSucceed === true) {
                                    // On commence par la droite
                                    self.hit_boats_arr.splice(0, 2)
                                    self.hit_boats_arr.push(y + 1, x)
                                    self.directions = 'right'
                                    self.start_index++
                                    self.global_index_hit++
                                }
                            })
                        }
                    }
                    else if (self.directions === "right") {
                        if (hit_x > 9) {
                            hit_x -= self.global_index_hit
                        }
                        else if (hit_x < 0) {
                            hit_x += self.global_index_hit
                        }
                        else if (hit_y > 9) {
                            hit_y -= self.global_index_hit
                        }
                        else if (hit_y < 0) {
                            hit_y += self.global_index_hit
                        }
                        //On essaye la case à droite
                        self.game.fire(this, hit_y, hit_x, function (hasSucceed) {
                            self.tries[hit_y][hit_x] = hasSucceed;
                            if (hasSucceed == true) {

                                if (self.global_index_hit === 4) {
                                    self.directions = "none"
                                }
                                self.hit_boats_arr.splice(0, 2)
                                self.hit_boats_arr.push(hit_y + 1, hit_x)
                                self.start_index++
                                self.global_index_hit++
                            }
                            else {
                                // On bouge vers le bas
                                self.directions = "left"
                                if (self.global_index_miss === 3 || self.global_index_hit === 4) {
                                    self.directions = "none"
                                }
                                self.global_index_miss++
                                self.hit_boats_arr.splice(0, 2)
                                self.hit_boats_arr.push(hit_y - self.start_index, hit_x)
                                self.start_index = 1
                            }
                        })
                    }
                    else if (self.directions === "left") {
                        if (hit_x > 9) {
                            hit_x -= self.global_index_hit
                        }
                        else if (hit_x < 0) {
                            hit_x += self.global_index_hit
                        }
                        else if (hit_y > 9) {
                            hit_y -= self.global_index_hit
                        }
                        else if (hit_y < 0) {
                            hit_y += self.global_index_hit
                        }
                        self.game.fire(this, hit_y, hit_x, function (hasSucceed) {
                            self.tries[hit_y][hit_x] = hasSucceed;
                            if (hasSucceed === true) {

                                if (self.global_index_hit === 4) {
                                    self.directions = "none"
                                }
                                self.hit_boats_arr.splice(0, 2)
                                self.hit_boats_arr.push(hit_y - 1, hit_x)
                                self.start_index++
                                self.global_index_hit++
                            }
                            else {
                                self.directions = "up"
                                if (self.global_index_miss === 3 || self.global_index_hit === 4) {
                                    self.directions = "none"
                                }
                                self.global_index_miss++
                                self.hit_boats_arr.splice(0, 2)
                                self.hit_boats_arr.push(hit_y + self.start_index, hit_x - 1)
                                self.start_index = 1
                            }
                        })
                    }
                    else if (self.directions === "up") {
                        if (hit_x > 9) {
                            hit_x -= self.global_index_hit
                        }
                        else if (hit_x < 0) {
                            hit_x += self.global_index_hit
                        }
                        else if (hit_y > 9) {
                            hit_y -= self.global_index_hit
                        }
                        else if (hit_y < 0) {
                            hit_y += self.global_index_hit
                        }
                        self.game.fire(this, hit_y, hit_x, function (hasSucceed) {
                            self.tries[hit_y][hit_x] = hasSucceed;
                            if (hasSucceed === true) {
                                if (self.global_index_hit === 4) {
                                    self.directions = "none"
                                }
                                self.hit_boats_arr.splice(0, 2)
                                self.hit_boats_arr.push(hit_y, hit_x - 1)
                                self.start_index++
                                self.global_index_hit++
                            }
                            else {
                                self.directions = "down"
                                if (self.global_index_miss === 3 || self.global_index_hit === 4) {
                                    self.directions = "none"
                                }
                                self.global_index_miss++
                                self.hit_boats_arr.splice(0, 2)
                                self.hit_boats_arr.push(hit_y, hit_x + self.start_index)
                                self.start_index = 1
                            }
                        })
                    }
                    else if (self.directions === "down") {
                        if (hit_x > 9) {
                            hit_x -= self.global_index_hit
                        }
                        else if (hit_x < 0) {
                            hit_x += self.global_index_hit
                        }
                        else if (hit_y > 9) {
                            hit_y -= self.global_index_hit
                        }
                        else if (hit_y < 0) {
                            hit_y += self.global_index_hit
                        }
                        self.game.fire(this, hit_y, hit_x, function (hasSucceed) {
                            self.tries[hit_y][hit_x] = hasSucceed;
                            if (hasSucceed === true) {
                                if (self.global_index_hit === 4) {
                                    self.directions = "none"
                                }
                                self.hit_boats_arr.splice(0, 2)
                                self.hit_boats_arr.push(hit_y, hit_x + 1)
                                self.global_index_hit++

                            }
                            else {
                                self.directions = "none"
                                self.hit_boats_arr.splice(0, 2)
                            }
                        })
                    }
                }
            }, 2000);
        },
        areShipOk: function (callback) {
            var i = 0;
            var j;

            this.fleet[i].forEach(function (ship, i) {
                j = 0;
                while (j < ship.life) {
                    this.grid[i][j] = ship.getId();
                    j += 1;
                }
            }, this);

            setTimeout(function () {
                callback();
            }, 500);
        },
        isShipOk: function (callback) {
            var i = 0;
            var j;
            while (i < 4) {
                this.randomOrientation();
                var x = this.randomPos();
                var y = this.randomPos();
                if ((this.orientation === "Horizontale"
                    && this.checkShipPosition(y, x)
                    && this.setActiveShipPosition(y, x))
                    || (this.orientation === "Verticale"
                        && this.checkShipPositionRight(y, x)
                        && this.setActiveShipPositionRight(y, x))) {
                    var ship = this.fleet[this.activeShip];
                    this.activateNextShip();
                    i++;
                }
            }

            setTimeout(function () {
                callback();
            }, 500);
        },
        randomOrientation: function () {
            var rand = Math.random() * 10;
            if (rand > 4) {
                this.orientation = "Horizontale";
            } else {
                this.orientation = "Verticale";
            }
        },
        setGame: function (obj) {
            this.game = obj;
        }

    });

    global.computer = computer;

}(this));