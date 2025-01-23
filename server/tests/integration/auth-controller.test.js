import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import bcrypt from 'bcrypt'
import prisma from "../../src/config/db.js";
import app from "../../src/app.js"

//helper function to generate unique usernames and emails
const uniqueUser = () => {
    const randomNum = `${Date.now()}-${Math.floor(Math.random() * 10000)}`
    return {
        username: `User${randomNum}`,
        email: `test${randomNum}@email.com`
    }
}

describe("Auth Controller Integration Tests", () => {
    beforeAll(async () => {
        await prisma.$connect()
    })
    afterAll(async () => {
        await prisma.$disconnect()
    })
    beforeEach(async () => {
        //clear out the table so each test starts fresh
        await prisma.users.deleteMany()
    })

    // ----------- register tests ---------------
    it("POST /auth/register => 201 and sets cookies if valid", async () => {
        const { username, email } = uniqueUser()
        const payload = {
            username,
            email,
            password: "Secret1!",
            repeatPassword: "Secret1!"
        }

        const res = await request(app)
            .post("/auth/register")
            .send(payload)
            .expect(201)

        expect(res.body).toMatchObject({
            message: "User registered successfully!",
            user: {
                username,
                email
            }
        })
        const cookies = res.headers["set-cookie"]
        expect(cookies).toBeDefined()
        expect(cookies.length).toBeGreaterThanOrEqual(2)

        //confirm user is created in DB 
        const dbUser = await prisma.users.findUnique({ where: { email } })
        expect(dbUser).not.toBeNull()
        const isMatch = await bcrypt.compare("Secret1!", dbUser.password_hash)
        expect(isMatch).toBe(true)
    })

    it("POST /auth/register => 400 if username is taken", async () => {
        const { username, email } = uniqueUser()
        await prisma.users.create({
            data: {
                username: username,
                email: email,
                password_hash: await bcrypt.hash("Secret1!", 10)
            }
        })

        //attempt to register again with exact same username
        const payload = {
            username: username,
            email: "another@email.com",
            password: "Secret1!",
            repeatPassword: "Secret1!"
        }

        const res = await request(app)
            .post("/auth/register")
            .send(payload)
            .expect(400)
        expect(res.body).toHaveProperty("error", "Username is already taken")
    })

    it("POST /auth/register => 400 if email is taken", async () => {
        const { username, email } = uniqueUser()
        await prisma.users.create({
            data: {
                username: username,
                email: email,
                password_hash: await bcrypt.hash("Secret1!", 10)
            }
        })

        //attempt to register with new username but the same email
        const payload = {
            username: `New${username}`,
            email: email,
            password: "Secret1!",
            repeatPassword: "Secret1!"
        }

        const res = await request(app)
            .post("/auth/register")
            .send(payload)
            .expect(400)

        expect(res.body).toHaveProperty("error", "Email is already taken")
    })

    it("POST /auth/register => 400 if repeatPassword mismatch", async () => {
        const { username, email } = uniqueUser()
        const payload = {
            username,
            email,
            password: "Secret1!",
            repeatPassword: "Mismatch1!"
        }

        const res = await request(app)
            .post("/auth/register")
            .send(payload)
            .expect(400)

        expect(res.body.error).toBeDefined() //likely a zod error
    })

    it("POST /auth/register => 400 if password is missing special char", async () => {
        const { username, email } = uniqueUser()
        const payload = {
            username,
            email,
            password: "Secret1",
            repeatPassword: "Secret1"
        }

        const res = await request(app)
            .post("/auth/register")
            .send(payload)
            .expect(400)

        expect(res.body.error).toBeDefined()
    })

    // ------------ login tests -------------
    it("POST /auth/login => 200 and sets cookies if valid", async () => {
        const { username, email } = uniqueUser()
        //insert user into db 
        const user = await prisma.users.create({
            data: {
                username,
                email,
                password_hash: await bcrypt.hash("Secret1!", 10)
            }
        })

        //now attempt to login
        const payload = {
            identifier: email,
            password: "Secret1!"
        }
        const res = await request(app)
            .post("/auth/login")
            .send(payload)
            .expect(200)

        expect(res.body).toMatchObject({
            message: "Login successful!",
            user: {
                id: user.id,
                username,
                email
            }
        })

        const cookies = res.headers["set-cookie"]
        expect(cookies).toBeDefined()
        expect(cookies.length).toBeGreaterThanOrEqual(2)
    })

    it("POST /auth/login => 401 if password is wrong", async () => {
        const { username, email } = uniqueUser()
        const user = await prisma.users.create({
            data: {
                username,
                email,
                password_hash: await bcrypt.hash("Secret1!", 10)
            }
        })

        const res = await request(app)
            .post("/auth/login")
            .send({ identifier: email, password: "Wrong1!" })
            .expect(401)
        expect(res.body).toHaveProperty("error", "Invalid username or password")
    })

    it("POST /auth/login => 401 if user not found", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ identifier: "NonExistingUser", password: "Secret1!" })
            .expect(401)
        expect(res.body).toHaveProperty("error", "Invalid username or password")
    })

    it("POST /auth/login => 400 if password fails zod checks", async () => {
        const { username, password } = uniqueUser()
        const payload = { identifier: username, password: "secret1!" }
        const res = await request(app)
            .post("/auth/login")
            .send(payload)
            .expect(400)

        expect(res.body.error).toBeDefined()
    })

    // ----------- me tests ------------

    it("GET /auth/me => 200 if access_token is valid", async () => {
        //create and login the user
        const { username, email } = uniqueUser()
        const dbUser = await prisma.users.create({
            data: {
                username,
                email,
                password_hash: await bcrypt.hash("Secret1!", 10)
            }
        })

        //login
        const loginRes = await request(app)
            .post("/auth/login")
            .send({ identifier: username, password: "Secret1!" })
            .expect(200)
        const cookies = loginRes.headers["set-cookie"]

        //now me
        const meRes = await request(app)
            .get("/auth/me")
            .set("Cookie", cookies)
            .expect(200)
        expect(meRes.body).toMatchObject({
            user: {
                id: dbUser.id,
                username,
                email
            }
        })
    })

    it("GET /auth/me => 401 if missing access_token", async () => {
        const res = await request(app)
            .get("/auth/me")
            .expect(401)
        expect(res.body).toHaveProperty("error", "Authentication token missing")
    })

    it("GET /auth/me => 403 if invalid or expired access_token", async () => {
        const invalidCookie = ["access_token=abc.def.ghi"]
        const res = await request(app)
            .get("/auth/me")
            .set("Cookie", invalidCookie)
            .expect(403)
        expect(res.body).toHaveProperty("error", "Invalid or expired access token")
    })

    // ------------ refresh tests -------------

    it("POST /auth/refresh => 200 if refresh token is valid", async () => {
        //create the user
        const { username, email } = uniqueUser()
        await prisma.users.create({
            data: {
                username,
                email,
                password_hash: await bcrypt.hash("Secret1!", 10)
            }
        })

        //login with matching credentials
        const loginRes = await request(app)
            .post("/auth/login")
            .send({ identifier: username, password: "Secret1!"})
            .expect(200)
        const cookies = loginRes.headers["set-cookie"]

        //then refresh
        const refreshRes = await request(app)
            .post("/auth/refresh")
            .set("Cookie", cookies)
            .expect(200)
        
        expect(refreshRes.body).toHaveProperty("message", "Access token refreshed successfully!")
    })

    it("POST /auth/refresh => 401 if no refresh token", async () => {
        const res = await request(app)
            .post("/auth/refresh")
            .expect(401)
        expect(res.body).toHaveProperty("error", "No refresh token provided")
    })

    it("POST /auth/refresh => 403 if invalid refresh token", async () => {
        const { username, email} = uniqueUser()
        await prisma.users.create({
            data: {
                username,
                email,
                password_hash: await bcrypt.hash("Secret1!", 10)
            }
        })

        const res = await request(app)
            .post("/auth/refresh")
            .set("Cookie", ["refresh_token=invalid"])
            .expect(403)

        expect(res.body).toHaveProperty("error", "Invalid or expired refresh token")
    })

    // ------------- logout tests --------------
    it("POST /auth/logout => clears cookies", async () => {
        //create user in db
        const {username, email} = uniqueUser()
        await prisma.users.create({
            data: {
                username, 
                email,
                password_hash: await bcrypt.hash("Secret1!", 10)
            }
        })

        //login
        const loginRes = await request(app)
            .post("/auth/login")
            .send({identifier: email, password: "Secret1!"})
            .expect(200)
        const cookies = loginRes.headers["set-cookie"]

        //logout
        const logoutRes = await request(app)
            .post("/auth/logout")
            .set("Cookie", cookies)
            .expect(200)
        
        expect(logoutRes.body).toHaveProperty("message", "Logged out successfully")
        const cleared = logoutRes.header["set-cookie"]
        expect(cleared).toBeDefined()
    })
})