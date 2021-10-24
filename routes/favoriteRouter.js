const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
// favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))   //options method handles pre flight request
.get(cors.cors, (req, res, next) => {
    Favorite.find({
        user: req.user._id
    //queries database for all docs that were instantiated using the Favorite model
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        //send json data to the client to the response stream, 
        // also automatically closes the stream afterwards, so no need for a res.end() method
        res.json(favorites);    
        })
        .catch(err => next(err))
    })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findById({
        user: req.user._id
    })
    .then(favorite => {
        // check if it exists
        if (favorite) {
            // add favorite array to favorite
            // body looks like: [{"_id":"campsite ObjectId"}], {"_id":"campsite ObjectId"}
            req.body.forEach((campsite) => {
                // check if the submitted campsite is in our document
                if(!favorite.campsites.includes(campsite._id)) {
            // if (favorite.campsites.indexOf(favorite._id) === -1) {
                favorite.campsites.push(campsite._id)
                }
            })
                favorite.save()
                    .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                    })
                    .catch(err => next(err));
                } else {
                Favorite
                .create({
                    user: req.user._id,
                    campsites: req.body
                })
                .then(favorite => {
                    console.log('Favorite Created ');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
        })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({
        user: req.user._id
    })
    .then(favorite => {
        if (favorite) {
            // it was found and deleted
            console.log('Favorite deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
            } else {
                // it was not
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You have no favorites to delete!');
            }
        })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite
    .findOne({user: req.user._id})
    .then(favorite => {
        // check if it exists
        if (favorite) {
            // add facorite array to favorite
            // add campsiteId from params to our array
            // if it is not present
            if(favorite.campsites.indexOf(favorite._id) == -1) {
                favorite.push(req.params.campsiteId);
            }
            // save the document
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            } else {
            // the favorite doucment dosnet exist yet
            // so create it
            // [setting it as an array]
            favorite.create({user: req.user._id, campsites: [req.params.campsiteId]
            })
            .then(favorite => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            // remove campsite from the array
            let campsites = favorite.campsites.filter( campsite => {
                return campsite === req.params.campsiteId;
            });

            favorite.campsites = campsites
            favorite
                .save()
                .then( favorite => {
            console.log('Favorite deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
            })
                .catch(err => next(err));
        } else {
            // it was not found
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You have no favorites to delete!');
        }
    }).catch(err => next(err));
});

module.exports = favoriteRouter;