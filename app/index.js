const Controllers = require('./controllers');
const Database = require('./database/database');

class App {
    constructor(helper){
        for(const ControllerName in Controllers){
            const ControllerExecutor = Controllers[ControllerName];
            const Model = Database[ControllerName];

            console.log(ControllerName);

            if(!Model){
                console.log(`${ControllerName} has no model !`);
                continue;
            } else {
                helper.model = Model;
            }

            new ControllerExecutor(helper);
        }
    }
}

module.exports = App;