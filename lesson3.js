import express from 'express';
import { uuid } from 'uuidv4';
import db from './db.json';
import fetch from 'node-fetch';
const app = express();
app.use(express.json());
app.listen(8080, () => {
    console.log('Server is running')
})

app.get('/users', (_, res) => {
    fetch('http://localhost:3000/users').then((rs) => {
        return rs.json()
    }).then((data) => {
        res.send({
            message: 'Thanh cong',
            data
        });
    });
});
// API đăng ký user
app.post('/users', (req, res) => {
    const { userName } = req.body;

    // Kiểm tra xem userName đã tồn tại hay chưa
    const existingUser = db.users.find(item => item.userName === userName);
    if (existingUser) {
        return res.status(400).json({ error: 'UserName đã tồn tại, vui lòng chọn một UserName khác' });
    }
    const id = 'US' + uuid().substring(0, 4); // Tạo id ngẫu nhiên
    const newUser = { id, userName };
    db.users.push(newUser);
    res.status(200).json(newUser);
});

// API tạo bài post
app.post('/posts', (req, res) => {
    const { content, authorId } = req.body;
    const id = 'PS' + uuid().substring(0, 4); // Tạo id ngẫu nhiên
    const newPost = { id, content, authorId };
    db.posts.push(newPost);
    res.json(newPost);
});

// API chỉnh sửa bài post
app.put('/posts/:postId', (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const postIndex = db.posts.findIndex(post => post.id === postId);
    if (postIndex === -1) return res.status(404).json({ error: 'Bài post không tồn tại' });
    // Kiểm tra quyền chỉnh sửa
    if (db.posts[postIndex].authorId !== req.body.authorId) {
        return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa bài post này' });
    }
    db.posts[postIndex].content = content;
    res.json(db.posts[postIndex]);
});

// API comment vào bài post
app.post('/comments', (req, res) => {
    const { postId, content, authorId } = req.body;
    const id = 'CMT' + uuid().substring(0, 4); // Tạo id ngẫu nhiên
    const newComment = { id, postId, content, authorId };
    db.comments.push(newComment);
    res.json(newComment);
});

// API chỉnh sửa comment
app.put('/comments/:commentId', (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const commentIndex = db.comments.findIndex(comment => comment.id === commentId);
    if (commentIndex === -1) return res.status(404).json({ error: 'Comment không tồn tại' });
    // Kiểm tra quyền chỉnh sửa
    if (db.comments[commentIndex].authorId !== req.body.authorId) {
        return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa comment này' });
    }
    db.comments[commentIndex].content = content;
    res.json(db.comments[commentIndex]);
});

// API lấy tất cả comment của một bài post
app.get('/posts/:postId/comments', (req, res) => {
    const { postId } = req.params;
    const postComments = db.comments.filter(comment => comment.postId === postId);
    res.json(postComments);
});

// API lấy tất cả các bài post, 3 comment đầu của tất cả user
app.get('/posts', (_, res) => {
    const postsWithComments = db.posts.map(post => {
        const postComments = db.comments.filter(comment => comment.postId === post.id).slice(0, 3);
        return { ...post, comments: postComments };
    });
    res.json(postsWithComments);
});

// API lấy một bài post và tất cả comment của bài post đó thông qua postId
app.get('/posts/:postId', (req, res) => {
    const { postId } = req.params;
    const post = db.posts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: 'Bài post không tồn tại' });
    const postComments = db.comments.filter(comment => comment.postId === postId);
    res.json({ post, comments: postComments });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));