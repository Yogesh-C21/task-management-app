STEPS TO SETUP:

Prerequisites: Install MongoDB / Or MongoDB Atlas URI, Redis, Mail Credentials (For notifications), Docker Desktop

1) Clone the repository.
2) Go to the directory and run **"npm i"** to install all the necessary dependencies.
3) Take the reference of src/config/config.js file and put all the variables in the .env file in the parent directory where "index.js" file lies.

   Now: For running locally you can user pm2 or nodemon (I will go for nodemon for local and have setup pm2 for running the app inside the docker container in production environment)
   To run using nodemon simple run **"npm i nodemon -g"** and in parent directory run **"npm run dev"**

   For docker: install docker runtime (say Docker Desktop) and in the parent directory run **"docker compose up"**. (Here the app and the nginx reverse proxy has been containerzed)

   Go to browser / Postman to hit http://localhost:3000 it should be working fine.

   Check **'/api-docs'** endpoint for API Docs using swagger and run **"npm test"** for running test cases (created using jest).

ASSUMPTIONS FOR THE TASK MANAGEMENT:

1) Only admin can create and delete User/Manager. User/Manager cannot create themselves.
2) Only Admin can decide who will be the manager of whom. No user/manager can decide this by itself.
3) Managers can see the their team users (list wise and individually) but cannot change user details.
4) User/Manager can change their details with restriction of changing their role (That power is only limited to Admin).
5) Managers can see any task, make changes to it and assign any task to any user who comes under him where as user is only limited to tasks assigned to him by manager/admin.
6) A user cannnot assign a task to itself. That is only restricted to manager/admin.

QUICK OVERVIEW OF TECH STACK AND TOOLS USED:

1) NodeJS (ExpressJS) as backend framework.
2) OOPS Programming paradigm has been used throughout.
3) For Database (MongoDB) and Mongoose ODM and Caching (Redis)
4) Token based authorization using JWT and express-session and Cookie parser.
5) Ratelimiting using express-rate-limiting and Validation and encryption using cors, bcrypt, helmet and other security measures and some other miscs.
6) Testing Framework is Jest and Supertest
7) Mailing service is Gmail for notifications for task update using nodemailer (Faced some account activation issue is Twilio Sendgrid)
8) API Documentation using Swagger using OpenAPI 3.0 Standards
9) Docker For containerzation and Nginx for reverseproxy

NOTES:
1) There is REDIS_ENABLED and EMAIL_ENABLED option in the config to enable/disable redis and mail service.
2) Attached Postman Collection for all the API's Used. Please modify and use all accordingly.
3) For demonstation purpose I've user port 3000. Please stick to it. Otherwise if you want to change the PORT also change the port in nginx default.conf file (if you wish to test the API through the containerized app and Nginx).
