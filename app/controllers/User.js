class User {
    constructor(helper){
        this.server = helper.server;
        this.model = helper.model;
        this.config = helper.config;
        
        this.init();
    }

    init = () => {
        this.server.use(this.middlewareUser)
    }

    middlewareUser = (req, res, next) => {
        //
    }
}

module.exports = User;