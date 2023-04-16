const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const testHelper = require('./test_helper')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of testHelper.blogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('returns notes as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(testHelper.blogs.length)
})

test('blogs can be posted', async () => {
  const blog = {
    title: "Test blog",
    author: "Justy Oberg",
    url: "https://www.google.com",
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await testHelper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(testHelper.blogs.length + 1)

  const authors = blogsAtEnd.map(n => n.author)
  expect(authors).toContain(
    'Justy Oberg'
  )
})

afterAll(async () => {
  await mongoose.connection.close()
})