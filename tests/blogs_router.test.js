const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const testHelper = require('./test_helper')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const username = new User({ username: 'root', passwordHash })

  await username.save()

  let blogs = testHelper.blogs.map(blog => {
    return {
      ...blog,
      user: username._id
    }
  })

  await Blog.deleteMany({})
  await Blog.insertMany(blogs)
})

describe('when there is initially some blogs saved', () =>{
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

  test('id property is not called _id', async () => {
    const blogs = await testHelper.blogsInDb()
    
    for (let blog of blogs) {
      expect(blog.id).toBeDefined()
      expect(blog._id).toBeUndefined()
    }
  })

  test('a specific blog is within the returned notes', async () => {
    const response = await api.get('/api/blogs')

    const authors = response.body.map(r => r.title)

    expect(authors).toContain(
      'Go To Statement Considered Harmful'
    )
  })
})

describe('addition of a new blog', () => {
  let login
  let userAtStart

  beforeEach(async () => {
    login = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      
      userAtStart = await User.findOne({ username: 'root' })
  })

  test('succeeds with valid data', async () => {
    const blog = {
      title: "Test blog",
      author: "Justy Oberg",
      url: "https://www.google.com",
      user: userAtStart._id,
      likes: 10
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(blog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await testHelper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(testHelper.blogs.length + 1)
    
    const userAtEnd = await User.findOne({ username: 'root' })
    expect(userAtEnd.blogs).toHaveLength(userAtStart.blogs.length + 1)

    const authors = blogsAtEnd.map(n => n.author)
    expect(authors).toContain(
      'Justy Oberg'
    )
  })

  test('likes default to 0 if missing from request', async () => {
    const missingLikes = {
      title: "Missing the likes!",
      author: "Justy Oberg",
      url: "N/A",
      user: userAtStart._id,
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(missingLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogs = await testHelper.blogsInDb()
  
    const notMissingLikes = blogs
      .find(blog => blog.title === "Missing the likes!")
    expect(notMissingLikes.likes).toBe(0)

    const userAtEnd = await User.findOne({ username: 'root' })
    expect(userAtEnd.blogs).toHaveLength(userAtStart.blogs.length + 1)
  })

  test('fails with 400 status if missing title', async () => {
    const missingTitle = {
      author: "Missing Properties",
      url: "N/A",
      user: userAtStart._id,
      likes: 0
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(missingTitle)
      .expect(400)
  
    const blogsAtEnd = await testHelper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(testHelper.blogs.length)

    const userAtEnd = await User.findOne({ username: 'root' })
    expect(userAtEnd.blogs).toHaveLength(userAtStart.blogs.length)
  })

  test('fails with 400 status if missing url', async () => {
    const missingUrl = {
      title: "Missing url",
      author: "Missing Properties",
      user: userAtStart._id,
      likes: 0
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send(missingUrl)
      .expect(400)
  
    const blogsAtEnd = await testHelper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(testHelper.blogs.length)

    const userAtEnd = await User.findOne({ username: 'root' })
    expect(userAtEnd.blogs).toHaveLength(userAtStart.blogs.length)
  })

  test('fails with status code 401 if not authorized', async () => {
    const blog = {
      title: "Test blog",
      author: "Justy Oberg",
      url: "https://www.google.com",
      user: userAtStart._id,
      likes: 10
    }

    await api
      .post('/api/blogs')
      .send(blog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})

describe('deletion of a blog', () => {
  let login
  let userAtStart

  beforeEach(async () => {
    login = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      
      userAtStart = await User.findOne({ username: 'root' })
  })

  test('succeeds if id is valid', async () => {
    const blogsAtStart = await testHelper.blogsInDb()
    
    await api
      .delete(`/api/blogs/${blogsAtStart[0].id}`)
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(204)

    const blogsAtEnd = await testHelper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

  })
  
  test('fails with status code 400 if id is invalid', async () => {
    const id = "Not a Valid ID"
  
    await api
      .delete(`/api/blogs/${id}`)
      .set('Authorization', 'Bearer ' + login.body.token)
      .expect(400)
  })

  test('fails with status code 401 if not authorized', async () => {
    const id = "Not a Valid ID"
  
    await api
      .delete(`/api/blogs/${id}`)
      .expect(401)
  })
})

describe('updating of a blog', () => {
  test('succeeds if id is valid', async () => {
    const blogs = await testHelper.blogsInDb()

    const updatedBlog = {
      ...blogs[0],
      title: "Changed Author"
    }

    await api
      .put(`/api/blogs/${blogs[0].id}`)
      .send(updatedBlog)
      .expect(204)

    const blogsAtEnd = await testHelper.blogsInDb()

    expect(blogs[0]).not.toEqual(blogsAtEnd[0])
  })

  test('fails with status code 400 if id is invalid', async () => {
    const blogs = await testHelper.blogsInDb()
    const id = "Not a Valid ID"
    
    await api
      .put(`/api/blogs/${id}`)
      .send(blogs[1])
      .expect(400)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})