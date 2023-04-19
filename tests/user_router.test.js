const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const testHelper = require('./test_helper')
const api = supertest(app)

const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  await api
    .post('/api/users')
    .send(testHelper.defaultUser)
})

describe('creation of a user', () => {
  test('succeeds with status code 201 if the user is valid', async () => {
    const user = {
      username: "unique",
      name: "justy oberg",
      password: "password"
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('fails with status code 400 if username is missing', async () => {
    const user = {
      name: "justy oberg",
      password: "password"
    }
    
    const response = await api
      .post('/api/users')
      .send(user)
      .expect(400)
  
    expect(response.body.error).toContain(
      'missing username'
    )
  })

  test('fails with status code 400 if password is missing', async () => {
    const user = {
      username: "unique",
      name: "justy oberg"
    }
    
    const response = await api
      .post('/api/users')
      .send(user)
      .expect(400)
  
    expect(response.body.error).toContain(
      'password must be longer than 3 characters'
    )
  })

  test('fails with status code 400 if the user already exists', async () => {
    const user = testHelper.defaultUser
    
    const response = await api
      .post('/api/users')
      .send(user)
      .expect(400)

    expect(response.body.error).toContain(
      'Error, expected `username` to be unique.'
    )
  })

  test('fails with status code 400 if username is too short', async () => {
    const user = {
      username: "sh",
      name: "justy oberg",
      password: "password"
    }
    
    const response = await api
      .post('/api/users')
      .send(user)
      .expect(400)
  
    expect(response.body.error).toContain(
      'needs to be longer than 3 characters'
    )
  })

  test('fails with status code 400 if password is too short', async () => {
    const user = {
      username: "unique",
      name: "justy oberg",
      password: "pa"
    }
    
    const response = await api
      .post('/api/users')
      .send(user)
      .expect(400)

    expect(response.body.error).toContain(
      'password must be longer than 3 characters'
    )
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})