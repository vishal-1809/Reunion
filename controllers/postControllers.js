const User = require('../models/userSchema');
const Post = require('../models/postSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const requireLogin = require('../middleware/requireLogin');
const verifyToken = require('../middleware/verifyToken');

module.exports.post = async (req, res, next) => {
    try {
        const { title, description } = req.body
        if (!title || !description) {
            return res.status(422).json({ error: "Plase add all the fields" })
        }
        req.user.password = undefined
        const post = new Post({
            title,
            description,
            postedBy: req.user
        })
        post.save().then(result => {
            res.json({ post: result })
        })
            .catch(err => {
                console.log(err)
            })
    }
    catch (err) {
        next(err);
    }
}

module.exports.deletePost = async (req, res, next) => {
    try {
        Post.findOne({ _id: req.params.id })
            .populate("postedBy", "_id")
            .exec((err, post) => {
                if (err || !post) {
                    return res.status(422).json({ error: err })
                }
                if (post.postedBy._id.toString() === req.user._id.toString()) {
                    post.remove()
                        .then(result => {
                            res.json(result)
                        }).catch(err => {
                            console.log(err)
                        })
                }
            })
    }
    catch (err) {
        next(err);
    }
}

module.exports.like = async (req, res, next) => {
    try {
        const { id } = req.params;
        Post.findByIdAndUpdate(id, {
            $push: { likes: req.user._id }
        }, {
            new: true
        }).exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
    }
    catch (err) {
        next(err);
    }
}

module.exports.unlike = async (req, res, next) => {
    try {
        const { id } = req.params;
        Post.findByIdAndUpdate(id, {
            $pull: { likes: req.user._id }
        }, {
            new: true
        }).exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
    }
    catch (err) {
        next(err);
    }
}

module.exports.comment = async (req, res, next) => {
    try {
        const comment = {
            text: req.body.text,
            postedBy: req.user._id
        }
        Post.findByIdAndUpdate(req.body.postId, {
            $push: { comments: comment }
        }, {
            new: true
        })
            .populate("comments.postedBy", "_id name")
            .populate("postedBy", "_id name")
            .exec((err, result) => {
                if (err) {
                    return res.status(422).json({ error: err })
                } else {
                    res.json(result)
                }
            })
    }
    catch (err) {
        next(err);
    }
}

module.exports.allPosts = async (req, res, next) => {
    try {
        Post.find()
            .populate("postedBy", "_id name")
            .populate("comments.postedBy", "_id name")
            .sort('-createdAt')
            .then((posts) => {
                res.json({ posts })
            }).catch(err => {
                console.log(err)
            })
    }
    catch (err) {
        next(err);
    }
}