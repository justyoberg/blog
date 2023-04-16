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
