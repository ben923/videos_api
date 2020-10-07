const Controllers = require('./controllers');

class App {
    constructor(helper){
        for(const ControllerName in Controllers){
            const ControllerExecutor = Controllers[ControllerName];
            const Model = helper.modules.models[ControllerName];

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