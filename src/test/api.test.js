const request = require("supertest");
const app = require("../express");
const Database = require("../database/db");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

beforeAll(async () => {
  await Database.connect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await Database.disconnect();
});

describe("API Endpoints", () => {
  // Test GET API
  //   test("Test API", async () => {
  //     const response = await request(app).get("/");
  //     expect(response.statusCode).toBe(200);
  //   });

  it("Creating a user", async () => {
    const response = await request(app).post("/api/users/register").send({
      email: "admin-test@email.com",
      password: "test123",
      role: "admin",
      username: "admin-test",
    });
    expect(response.statusCode).toBe(201);
  });

  it("Success login and JWT token generate", async () => {
    const user = new User({
      email: "admin@email.com",
      password: "test123",
      role: "admin",
      username: "admin",
    });
    await user.save();
    const response = await request(app).post("/api/users/login").send({
      email: "admin@email.com",
      password: "test123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookies = response.headers["set-cookie"];
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(tokenCookie).toBeDefined();
  });

  it("Invalid Credentials Check", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: "wrong@email.com", password: "wrongpassword" });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid credentials");
  });

  it("Logout User API", async () => {
    const user = new User({
      email: "admin@email.com",
      password: "test123",
      role: "admin",
      username: "admin",
    });
    await user.save();
    const response = await request(app).post("/api/users/login").send({
      email: "admin@email.com",
      password: "test123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookies = response.headers["set-cookie"];
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(tokenCookie).toBeDefined();
    const responseLogout = await request(app)
      .post("/api/users/logout")
      .set("Cookie", tokenCookie);
    expect(responseLogout.statusCode).toBe(200);
  });

  it("delete user API", async () => {
    const user = new User({
      email: "admin@email.com",
      password: "test123",
      role: "admin",
      username: "admin",
    });
    await user.save();
    const response = await request(app).post("/api/users/login").send({
      email: "admin@email.com",
      password: "test123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookies = response.headers["set-cookie"];
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(tokenCookie).toBeDefined();
    const responseLogout = await request(app)
      .delete("/api/users/" + user.id)
      .set("Cookie", tokenCookie);
    expect(responseLogout.statusCode).toBe(200);
  });

  it("Get User API", async () => {
    const user = new User({
      email: "admin@email.com",
      password: "test123",
      role: "admin",
      username: "admin",
    });
    await user.save();
    const response = await request(app).post("/api/users/login").send({
      email: "admin@email.com",
      password: "test123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookies = response.headers["set-cookie"];
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(tokenCookie).toBeDefined();
    const responseLogout = await request(app)
      .get("/api/users/" + user.id)
      .set("Cookie", tokenCookie);
    expect(responseLogout.statusCode).toBe(200);
  });

  it("Get User List API", async () => {
    const user = new User({
      email: "admin@email.com",
      password: "test123",
      role: "admin",
      username: "admin",
    });
    await user.save();
    const response = await request(app).post("/api/users/login").send({
      email: "admin@email.com",
      password: "test123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookies = response.headers["set-cookie"];
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(tokenCookie).toBeDefined();
    const responseLogout = await request(app)
      .get("/api/users/user/list")
      .set("Cookie", tokenCookie);
    expect(responseLogout.statusCode).toBe(200);
  });
  it("Update a user", async () => {
    const user = new User({
      email: "admin@email.com",
      password: "test123",
      role: "admin",
      username: "admin",
    });
    await user.save();
    const response = await request(app).post("/api/users/login").send({
      email: "admin@email.com",
      password: "test123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookies = response.headers["set-cookie"];
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(tokenCookie).toBeDefined();
    const updatePayload = {
      username: "updated-username",
    };
    const responseLogout = await request(app)
      .put("/api/users/" + user.id)
      .send(updatePayload)
      .set("Cookie", tokenCookie);
    expect(responseLogout.statusCode).toBe(200);
  });
  it("Assign a manager", async () => {
    // dummy data
    const admin = new User({
      email: "admin@email.com",
      password: "test123",
      role: "admin",
      username: "admin",
    });
    await admin.save();
    const manager = new User({
      email: "manager@email.com",
      password: "test123",
      role: "manager",
      username: "manager",
    });
    await manager.save();
    const user = new User({
      email: "user@email.com",
      password: "test123",
      role: "user",
      username: "user",
    });
    await user.save();
    const response = await request(app).post("/api/users/login").send({
      email: "admin@email.com",
      password: "test123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookies = response.headers["set-cookie"];
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(tokenCookie).toBeDefined();
    const updatePayload = {
      manager_id: manager.id,
      user_id: user.id,
    };
    const responseLogout = await request(app)
      .put("/api/users/manager/assign")
      .send(updatePayload)
      .set("Cookie", tokenCookie);
    expect(responseLogout.statusCode).toBe(200);
  });
  it("Create Task", async () => {
    const user = new User({
      email: "admin@email.com",
      password: "test123",
      role: "admin",
      username: "admin",
    });
    await user.save();
    const response = await request(app).post("/api/users/login").send({
      email: "admin@email.com",
      password: "test123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookies = response.headers["set-cookie"];
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(tokenCookie).toBeDefined();
    const responseLogout = await request(app)
      .post("/api/tasks/create")
      .send({
        title: "New Task Test Case",
      })
      .set("Cookie", tokenCookie);
    expect(responseLogout.statusCode).toBe(201);
  });

  it("Delete Task", async () => {
    const user = new User({
      email: "admin@email.com",
      password: "test123",
      role: "admin",
      username: "admin",
    });
    await user.save();
    const response = await request(app).post("/api/users/login").send({
      email: "admin@email.com",
      password: "test123",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    const cookies = response.headers["set-cookie"];
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(tokenCookie).toBeDefined();
    const responseCreate = await request(app)
      .post("/api/tasks/create")
      .send({
        title: "New Task Test Case",
      })
      .set("Cookie", tokenCookie);
    expect(responseCreate.statusCode).toBe(201);
    const responseDelete = await request(app)
      .delete("/api/tasks/"+responseCreate.body.data._id)
      .set("Cookie", tokenCookie);
    expect(responseDelete.statusCode).toBe(200);
  });
});
