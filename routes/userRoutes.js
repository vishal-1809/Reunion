const verifyToken = require('../middleware/verifyToken');
const requireLogin = require('../middleware/requireLogin');
const {register, authenticate, follow, unfollow, user, posts, deletePost, like, unlike, comment, particularPost, allPosts} = require("../controllers/userControllers");
const router = require('express').Router();



router.post("/register", register);
router.post("/authenticate", authenticate); //login
router.post("/follow/:id", requireLogin , follow);
router.post("/unfollow/:id",requireLogin, unfollow);
router.get("/user/", requireLogin, user);

router.post("/posts", requireLogin, posts);
router.delete("/posts/:id", requireLogin, deletePost);
router.post("/like/:id", requireLogin, like);
router.post("/unlike/:id", requireLogin, unlike);
router.post("/comment/:id", requireLogin, comment);
router.get("/posts/:id", requireLogin, particularPost);
router.get("/all_posts", requireLogin, allPosts);


module.exports = router;