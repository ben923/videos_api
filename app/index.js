const Controllers = require('./controllers');

class App {
    constructor(helper){
        for(const ControllerName in Controllers){
            const ControllerExecutor = Controllers[ControllerName];
            const Model = helper.modules.models[ControllerName];

            helper.logger.info(ControllerName);

            if(!Model){
                helper.logger.info(`${ControllerName} has no model !`);
                continue;
            } else {
                helper.model = Model;
            }

            new ControllerExecutor(helper);
        }
    }
}

module.exports = App;