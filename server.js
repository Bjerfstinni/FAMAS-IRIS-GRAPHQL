const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();

const typeDefs = gql`
  type Author {
    id: ID!
    name: String!
    books: [Book]
  }

  type Book {
    id: ID!
    title: String!
    genre: String!
    author: Author!
    reviews: [Review]
  }

  type Review {
    id: ID!
    rating: Int!
    comment: String
    book: Book!
  }

  type Query {
    authors: [Author]
    books: [Book]
    reviews: [Review]
  }

  type Mutation {
    addAuthor(name: String!): Author
    addBook(title: String!, genre: String!, authorId: ID!): Book
    addReview(rating: Int!, comment: String, bookId: ID!): Review
  }
`;

const authors = [];
const books = [];
const reviews = [];

const resolvers = {
  Query: {
    authors: () => authors,
    books: () => books,
    reviews: () => reviews,
  },
  Mutation: {
    addAuthor: (parent, { name }) => {
      const author = { id: authors.length + 1, name, books: [] };
      authors.push(author);
      return author;
    },
    addBook: (parent, { title, genre, authorId }) => {
      const author = authors.find(author => author.id == authorId);
      if (!author) throw new Error("Author not found");
      const book = { id: books.length + 1, title, genre, author, reviews: [] };
      books.push(book);
      author.books.push(book);
      return book;
    },
    addReview: (parent, { rating, comment, bookId }) => {
      const book = books.find(book => book.id == bookId);
      if (!book) throw new Error("Book not found");
      const review = { id: reviews.length + 1, rating, comment, book };
      reviews.push(review);
      book.reviews.push(review);
      return review;
    },
  },
  Author: {
    books: (author) => books.filter(book => book.author.id == author.id),
  },
  Book: {
    author: (book) => authors.find(author => author.id == book.author.id),
    reviews: (book) => reviews.filter(review => review.book.id == book.id),
  },
  Review: {
    book: (review) => books.find(book => book.id == review.book.id),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(res => {
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
});
