const User = require('../models/userSchema');
const Post = require('../models/postSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

// authenticate, follow, unfollow, user, posts, deletePost, like, unlike, comment, allPosts
const JWT_SECRET = process.env.JWT_SECRET;

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck) {
            return res.json({ message: "Username already used", status: false });
        }
        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
            return res.json({ message: "Email already used", status: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        delete user.password;
        return res.json({ status: true, user });
    }
    catch (err) {
        next(err);
    }
};


module.exports.authenticate = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(422).json({ error: "please add email or password" })
        }
        User.findOne({ email: email })
            .then(savedUser => {
                if (!savedUser) {
                    return res.status(422).json({ error: "Invalid Email or password" })
                }
                bcrypt.compare(password, savedUser.password)
                    .then(doMatch => {
                        if (doMatch) {
                            // res.json({message:"successfully signed in"})
                            // const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
                            // const { _id, name, email, followers, following, pic } = savedUser
                            // res.json({ token, user: { _id, name, email, followers, following, pic } })
                            const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, {
                                expiresIn: '24h',
                            });
                            return res.json({ token: token });
                        }
                        else {
                            return res.status(422).json({ error: "Invalid Email or password" })
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
    }
    catch (err) {
        next(err);
    }
};


module.exports.follow = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(id, req.user);
        // User.findByIdAndUpdate(id, {
        //     $push: { followers: req.user.id }
        // }, {
        //     new: true
        // }, (err, result) => {
        //     if (err) {
        //         return res.status(422).json({ error: err })
        //     }
        //     User.findByIdAndUpdate(req.user.id, {
        //         $push: { following: id }

        //     }, { new: true }).select("-password").then(result => {
        //         res.json(result)
        //     }).catch(err => {
        //         return res.status(422).json({ error: err })
        //     })

        // })
        User.findByIdAndUpdate(id, {
            $push: { followers: req.user.id }
        }, { new: true })
            .then((result) => {
                return User.findByIdAndUpdate(req.user.id, {
                    $push: { following: id }
                }, { new: true }).select("-password")
            })
            .then((result) => {
                res.json(result)
            })
            .catch((err) => {
                return res.status(422).json({ error: err })
            })
    }
    catch (err) {
        next(err);
    }
}


module.exports.unfollow = async (req, res, next) => {
    try {
        const { id } = req.params;
        // User.findByIdAndUpdate(id, {
        //     $pull: { followers: req.user.id }
        // }, {
        //     new: true
        // }, (err, result) => {
        //     if (err) {
        //         return res.status(422).json({ error: err })
        //     }
        //     User.findByIdAndUpdate(req.user._id, {
        //         $pull: { following: id }

        //     }, { new: true }).select("-password").then(result => {
        //         res.json(result)
        //     }).catch(err => {
        //         return res.status(422).json({ error: err })
        //     })

        // })
        User.findByIdAndUpdate(id, {
            $pull: { followers: req.user.id }
        }, {
            new: true
        }).then(result => {
            User.findByIdAndUpdate(req.user._id, {
                $pull: { following: id }
            }, {
                new: true
            }).select("-password").then(result => {
                res.json(result);
            }).catch(err => {
                return res.status(422).json({ error: err });
            });
        }).catch(err => {
            return res.status(422).json({ error: err });
        });
    }
    catch (err) {
        next(err);
    }
}

module.exports.user = async (req, res, next) => {
    try {
        User.findOne({ _id: req.user._id })
            .then(user => {
                if (!user) {
                    return res.status(422).json({ error: "User not found" })
                }
                else {
                    const { _id, username, email, password, followers, following } = user;
                    let followersArr = followers;
                    let followingArr = following;
                    console.log(followersArr.length);
                    return res.json({ username, followers: followersArr.length, following: followingArr.length });
                }
            }).catch(err => {
                return res.status(404).json({ error: "User not found" })
            })
    }
    catch (err) {
        next(err);
    }
}


//--------------------------------------------------------------------------------------------------------------------

module.exports.posts = async (req, res, next) => {
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
            const { _id, title, description, createdAt } = result;
            // res.json({ post: result })
            res.json({ _id, title, description, createdAt })
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
        // Post.findOne({ _id: req.params.id })
        //     .populate("postedBy", "_id")
        //     .exec((err, post) => {
        //         if (err || !post) {
        //             return res.status(422).json({ error: err })
        //         }
        //         if (post.postedBy._id.toString() === req.user._id.toString()) {
        //             post.remove()
        //                 .then(result => {
        //                     res.json(result)
        //                 }).catch(err => {
        //                     console.log(err)
        //                 })
        //         }
        //     })
        Post.findOne({ _id: req.params.id })
            .populate("postedBy", "_id")
            .exec()
            .then(post => {
                if (!post) {
                    return res.status(422).json({ error: "Post not found" });
                }
                if (post.postedBy._id.toString() !== req.user._id.toString()) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                return post.deleteOne();
            })
            .then(result => {
                res.json(result);
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ error: "Server error" });
            });
    }
    catch (err) {
        next(err);
    }
}

module.exports.like = async (req, res, next) => {
    try {
        // const { id } = req.params;
        // Post.findByIdAndUpdate(id, {
        //     $push: { likes: req.user._id }
        // }, {
        //     new: true
        // }).exec((err, result) => {
        //     if (err) {
        //         return res.status(422).json({ error: err })
        //     } else {
        //         res.json(result)
        //     }
        // })
        const { id } = req.params;
        Post.findByIdAndUpdate(id, {
            $push: { likes: req.user._id }
        }, {
            new: true
        })
            .then(result => {
                res.json(result);
            })
            .catch(err => {
                return res.status(422).json({ error: err });
            });
    }
    catch (err) {
        next(err);
    }
}

module.exports.unlike = async (req, res, next) => {
    try {
        // const { id } = req.params;
        // Post.findByIdAndUpdate(id, {
        //     $pull: { likes: req.user._id }
        // }, {
        //     new: true
        // }).exec((err, result) => {
        //     if (err) {
        //         return res.status(422).json({ error: err })
        //     } else {
        //         res.json(result)
        //     }
        // })
        const { id } = req.params;
        Post.findByIdAndUpdate(id, {
            $pull: { likes: req.user._id }
        }, {
            new: true
        })
            .then(result => {
                res.json(result)
            })
            .catch(err => {
                return res.status(422).json({ error: err })
            });
    }
    catch (err) {
        next(err);
    }
}

module.exports.comment = async (req, res, next) => {
    try {
        // const comment = {
        //     text: req.body.text,
        //     postedBy: req.user._id
        // }
        // Post.findByIdAndUpdate(req.body.postId, {
        //     $push: { comments: comment }
        // }, {
        //     new: true
        // })
        //     .populate("comments.postedBy", "_id name")
        //     .populate("postedBy", "_id name")
        //     .exec((err, result) => {
        //         if (err) {
        //             return res.status(422).json({ error: err })
        //         } else {
        //             res.json(result)
        //         }
        //     })
        const comment = {
            text: req.body.comment,
            postedBy: req.user._id
        };
        const { id } = req.params;
        Post.findByIdAndUpdate(id, {
            $push: { comments: comment }
        }, {
            new: true
        })
            .populate("comments.postedBy", "_id name")
            .populate("postedBy", "_id name")
            .then(result => {
                res.json({ comment_id: result._id });
            })
            .catch(err => {
                res.status(422).json({ error: err });
            });
    }
    catch (err) {
        next(err);
    }
}

module.exports.particularPost = async (req, res, next) => {
    try {
        // const id = req.params
        // Post.findById(id, (err, post) => {
        //     if(err) {
        //         return res.status(422).json({ error: "Post not found" });
        //     }
        //     else {
        //         res.json({post});
        //     }
        // })
        const { id } = req.params;
        Post.findById(id)
            .then(post => {
                if (!post) {
                    return res.status(404).json({ error: 'Post not found' });
                }
                const {_id, title, description, likes, postedBy, comments} = post;
                const temp1 = likes;
                const temp2 = comments;
                res.json({ likes: temp1.length, comments: temp2.length });
            })
            .catch(err => {
                return res.status(422).json({ error: err });
            });
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