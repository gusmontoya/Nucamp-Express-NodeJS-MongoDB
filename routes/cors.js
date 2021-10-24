const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
// taking two parameters req and callback
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    // check whitelist array using indexOf method.
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

// export cors and corsWithOptions middleware functions
exports.cors = cors();
// check to see if incoing requests belong to the whitelisted origins localhost 3000/3443
// of it does will send back cors response header of access control allow origin but with whitelisted origin as value.
// if it dosent it won't include cors response header at all. If there is a restAPI end point, where we only want to accept
// cross-origin requests from one of these whitelisted origins then we'll apply this middleware to that endpoint.
//  and for the endpoints where we want to accept all cross-origin requests we'll use the other one. 
exports.corsWithOptions = cors(corsOptionsDelegate);