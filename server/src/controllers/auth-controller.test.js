// tests/auth-controller.test.js
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import app from "../app.js"; // or wherever your Express app is exported
import prisma from "../config/db.js"; // your Prisma instance

describe("Auth Controller", () => {
  // 1) Connect to test DB, clear data
  beforeAll(async () => {
    // connect if needed
    await prisma.$connect();
  });

  afterAll(async () => {
    // optionally, close the DB connection
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Wipe relevant tables so each test starts fresh
    // e.g. all users:
    await prisma.users.deleteMany({});
  });

  // 2) Test register
  it("POST /auth/register => should register new user with cookies set", async () => {
    const payload = {
      username: "testuser",
      email: "test@example.com",
      password: "secret123",
    };

    const res = await request(app)
      .post("/auth/register")
      .send(payload)
      .expect(201);

    // Check response body
    expect(res.body).toMatchObject({
      message: "User registered successfully!",
      user: {
        username: "testuser",
        email: "test@example.com",
      },
    });
    // Check if cookies are set
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    // Typically we'd expect "access_token=..." and "refresh_token=..."
    expect(cookies.length).toBeGreaterThanOrEqual(2);

    // Validate user is in DB
    const dbUser = await prisma.users.findUnique({
      where: { email: "test@example.com" },
    });
    expect(dbUser).not.toBeNull();
    // Confirm the password is hashed
    // e.g. expect(dbUser.password_hash).not.toBe("secret123");
  });

  it("POST /auth/register => should fail if username is already taken", async () => {
    // create a user first
    await prisma.users.create({
      data: {
        username: "existing",
        email: "existing@example.com",
        password_hash: "hashedPW",
      },
    });

    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "existing",
        email: "new@example.com",
        password: "another",
      })
      .expect(400);

    expect(res.body).toHaveProperty("error", "Username is already taken");
  });

  // 3) Test login
  it("POST /auth/login => should login with valid credentials & set cookies", async () => {
    // Insert user
    const hashed = "$2b$10$5jNf60kClht8pHWfEu4.nOdPqUJs2KdfYm1LTTrDDpK8/l12EWR3y"; 
    // bcrypt.hashSync("secret123", 10); // pre-hash "secret123"
    await prisma.users.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        password_hash: hashed,
      },
    });

    const payload = { identifier: "test@example.com", password: "secret123" };
    const res = await request(app)
      .post("/auth/login")
      .send(payload)
      .expect(200);

    expect(res.body).toMatchObject({
      message: "Login successful!",
      user: {
        username: "testuser",
        email: "test@example.com",
      },
    });
    // Cookies
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.length).toBeGreaterThanOrEqual(2);
  });

  it("POST /auth/login => should 401 if wrong password", async () => {
    // user in DB
    const hashed = "$2b$10$5jNf60kClht8pHWfEu4.nOdPqUJs2KdfYm1LTTrDDpK8/l12EWR3y";
    await prisma.users.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        password_hash: hashed,
      },
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ identifier: "test@example.com", password: "wrongPW" })
      .expect(401);

    expect(res.body).toHaveProperty("error", "Invalid username or password");
  });

  // 4) Test /auth/me
  it("GET /auth/me => should return user data if access_token is valid", async () => {
    // Register or create user, then login to get cookies
    const hashed = "$2b$10$EGnxQ7k7qKyZPRwRfqZTUENNeSdgK4OZJwxWvpNZkscdkghD59dsy";
    const created = await prisma.users.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        password_hash: hashed,
      },
    });

    // login
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ identifier: "test@example.com", password: "secret123" });
    const cookies = loginRes.headers["set-cookie"];

    // now call /auth/me with those cookies
    const meRes = await request(app)
      .get("/auth/me")
      .set("Cookie", cookies)
      .expect(200);

    expect(meRes.body).toMatchObject({
      user: {
        id: created.id,
        username: "testuser",
        email: "test@example.com",
      },
    });
  });

  it("GET /auth/me => 401 if no access_token cookie", async () => {
    const res = await request(app).get("/auth/me").expect(401);
    expect(res.body).toHaveProperty("error", "Authentication token missing");
  });

  // 5) Test refresh
  it("POST /auth/refresh => refreshes access_token if refresh_token is valid", async () => {
    // create user & login
    const hashed = "$2b$10$EGnxQ7k7qKyZPRwRfqZTUENNeSdgK4OZJwxWvpNZkscdkghD59dsy";
    await prisma.users.create({
      data: {
        username: "refresher",
        email: "refresh@example.com",
        password_hash: hashed,
      },
    });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ identifier: "refresh@example.com", password: "secret123" });
    const cookies = loginRes.headers["set-cookie"];

    // Then call /auth/refresh
    const refreshRes = await request(app)
      .post("/auth/refresh")
      .set("Cookie", cookies)
      .expect(200);

    expect(refreshRes.body).toHaveProperty("message", "Access token refreshed successfully!");
    // check new access_token cookie is set
    const newCookies = refreshRes.headers["set-cookie"];
    expect(newCookies).toBeDefined();
    // Typically you only see a new access_token, no new refresh_token
  });

  it("POST /auth/refresh => 401 if no refresh_token cookie", async () => {
    const res = await request(app).post("/auth/refresh").expect(401);
    expect(res.body).toHaveProperty("error", "No refresh token provided");
  });

  // 6) Test logout
  it("POST /auth/logout => clears cookies", async () => {
    // create user & login
    const hashed = "$2b$10$EGnxQ7k7qKyZPRwRfqZTUENNeSdgK4OZJwxWvpNZkscdkghD59dsy";
    await prisma.users.create({
      data: {
        username: "logoutUser",
        email: "logout@example.com",
        password_hash: hashed,
      },
    });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ identifier: "logout@example.com", password: "secret123" })
      .expect(200);
    const cookies = loginRes.headers["set-cookie"];

    // logout
    const logoutRes = await request(app)
      .post("/auth/logout")
      .set("Cookie", cookies)
      .expect(200);

    expect(logoutRes.body).toHaveProperty("message", "Logged out successfully");
    const cleared = logoutRes.headers["set-cookie"];
    // Usually you'd see `access_token=; Max-Age=0;` or something similar
    expect(cleared).toBeDefined();
  });
});
