require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerUi');
const sampleRoutes = require('./routes/demo');
const passport = require('passport');
const defineRolesandPermissions = require('./helpers/populate');
const userAuthRoutes = require('./routes/auth');
const getAuthRoutes = require('./routes/getAuth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sequelize = require('./config/db');
const UserPermissions = require('./models/UserPermissions');

sequelize.authenticate().then(async () => {
  await sequelize.sync();
  await UserPermissions.sync();
  // populate roles and permissions if not already populated
  await defineRolesandPermissions();
});

app.use(passport.initialize());
require('./middleware/authEmail')(passport);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use your API routes
app.use('/api', sampleRoutes);

// PLEASE DEFINE ALL AUTHENTICATION ROUTES WITH "/api/auth" OR PUT IN "routes/auth.js" ENSURE NO CONFLICTING ROUTE
app.use('/api/auth', userAuthRoutes);

//communication with other microservices
app.use('/api/get-auth', getAuthRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
