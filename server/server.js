require('dotenv').config();

const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { authMiddleware } = require('./utils/auth')
// const User = require('./models/User');
// const bcrypt = require('bcrypt');


const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }
  
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

// app.post('/refresh-token', (req, res) => {
//   // Extract the refresh token from the request headers
//   const refreshToken = req.headers.authorization.split(' ')[1];

//   try {
//     // Verify and decode the refresh token
//     const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

//     // If the refresh token is valid, generate a new access token
//     const accessToken = jwt.sign({ userId: decodedToken.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

//     // Send the new access token in the response
//     res.json({ accessToken });
//   } catch (error) {
//     // If the refresh token is invalid or expired, respond with an error
//     console.error('Error refreshing token:', error);
//     res.status(401).json({ message: 'Invalid or expired refresh token' });
//   }
// });

// app.post('/updateUser', async (req, res) => {
//   const { userId, input } = req.body;
//   try {
//     // Fetch user by userId
//     const user = await User.findById(userId);

//     // Update user fields
//     user.firstName = input.firstName;
//     user.lastName = input.lastName;
//     user.email = input.email;

//     // Check if password is provided and update if needed
//     if (input.password) {
//       // Hash the new password before updating
//       const saltRounds = 10;
//       user.password = await bcrypt.hash(input.password, saltRounds);
//     }

//     // Save updated user
//     await user.save();

//     res.status(200).json({ message: 'User updated successfully' });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({ message: 'Error updating user' });
//   }
// });



  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();