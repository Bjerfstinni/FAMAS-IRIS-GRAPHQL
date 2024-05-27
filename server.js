const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post]
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment]
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }

  type Query {
    users: [User]
    posts: [Post]
    comments: [Comment]
  }

  type Mutation {
    addUser(name: String!, email: String!): User
    addPost(title: String!, content: String!, authorId: ID!): Post
    addComment(text: String!, authorId: ID!, postId: ID!): Comment
  }
`;

const users = [];
const posts = [];
const comments = [];

const resolvers = {
  Query: {
    users: () => users,
    posts: () => posts,
    comments: () => comments,
  },
  Mutation: {
    addUser: (parent, { name, email }) => {
      const user = { id: users.length + 1, name, email, posts: [] };
      users.push(user);
      return user;
    },
    addPost: (parent, { title, content, authorId }) => {
      const author = users.find(user => user.id == authorId);
      if (!author) throw new Error("User not found");
      const post = { id: posts.length + 1, title, content, author, comments: [] };
      posts.push(post);
      author.posts.push(post);
      return post;
    },
    addComment: (parent, { text, authorId, postId }) => {
      const author = users.find(user => user.id == authorId);
      const post = posts.find(post => post.id == postId);
      if (!author) throw new Error("User not found");
      if (!post) throw new Error("Post not found");
      const comment = { id: comments.length + 1, text, author, post };
      comments.push(comment);
      post.comments.push(comment);
      return comment;
    },
  },
  User: {
    posts: (user) => posts.filter(post => post.author.id == user.id),
  },
  Post: {
    author: (post) => users.find(user => user.id == post.author.id),
    comments: (post) => comments.filter(comment => comment.post.id == post.id),
  },
  Comment: {
    author: (comment) => users.find(user => user.id == comment.author.id),
    post: (comment) => posts.find(post => post.id == comment.post.id),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(res => {
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
});
