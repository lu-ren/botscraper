var Struct = function(target) {
    this.target = target;
    this.clients = [];
};

var ClientObj = function(name) {
    this.name = name;
    this.data = {};
};

module.exports = Struct;
