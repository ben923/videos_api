const querystring = require('querystring');

const parser = (req, res, next) => {
    const url = req.url;

    if(url.indexOf('?') !== -1){
        const rawParams = url.split('?')[1];
        const params = querystring.parse(rawParams);

        req.query = params;
    }

    return next();
}

module.exports = parser