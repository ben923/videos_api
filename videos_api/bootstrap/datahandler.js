const handler = (req, res, next) => {
    let data = "";

    req.on('data', (chunk) => data += chunk);
    return req.on('end', () => {
        if(data !== ""){
            req.body = JSON.parse(data);
            return next();
        } else {
            return next();
        }
    })
}

module.exports = handler