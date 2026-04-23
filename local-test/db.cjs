module.exports = {
  users: [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' },
  ],
  posts: [
    { id: 1, userId: 1, title: 'First Post', body: 'Hello World!', published: true },
    { id: 2, userId: 1, title: 'Second Post', body: 'More content', published: true },
    { id: 3, userId: 2, title: "Bob's Post", body: "Bob's content", published: true },
  ],
  comments: [
    { id: 1, postId: 1, body: 'Great post!', author: 'John' },
    { id: 2, postId: 1, body: 'Thanks for sharing', author: 'Jane' },
    { id: 3, postId: 2, body: 'Interesting', author: 'John' },
  ],
};
