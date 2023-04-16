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

test('id property is not called _id', async () => {
  const blogs = await testHelper.blogsInDb()
  
  for (let blog of blogs) {
    expect(blog.id).toBeDefined()
    expect(blog._id).toBe(undefined)
  }
})

test('likes default to 0 if missing from request', async () => {
  const missingLikes = {
    title: "Missing the likes!",
    author: "Justy Oberg",
    url: "N/A",
  }

  await api
    .post('/api/blogs')
    .send(missingLikes)
    .expect(201)
  
  const blogs = await testHelper.blogsInDb()

  expect(blogs).toHaveLength(testHelper.blogs.length + 1)
  expect(blogs[blogs.length - 1].likes).toBe(0)
})

afterAll(async () => {
  await mongoose.connection.close()
})