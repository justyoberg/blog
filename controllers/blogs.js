const userExtractor = require('../utils/middleware').userExtractor
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {
    username: 1,
    name: 1,
  })
  response.json(blog)
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body

  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    comments: [],
    user: user.id,
    likes: body.likes || 0,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id/comments', async (request, response) => {
  const body = request.body

  if (!body) {
    response.status(404).json({
      error: 'blog with that id doesn`t exist',
    })
  }

  const blog = await Blog.findById(request.params.id)
  blog.comments = body.comments
  const updatedBlog = await blog.save()

  response.status(201).json(updatedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    response.status(404).json({
      error: 'blog with that id doesn`t exist',
    })
  }

  const user = request.user

  if (blog.user.toString() === user.id.toString()) {
    await Blog.deleteOne({ _id: request.params.id })
    user.blogs = await Blog.find({ user: user.id })
    await user.save()
    response.status(200).json(blog)
  } else {
    response
      .status(401)
      .json({ error: 'blog doesn`t belong to logged in user' })
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const updated = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, updated, {
    new: true,
  })
  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter
