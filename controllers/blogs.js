const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user.id,
    likes: body.likes || 0
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    response.status(404).json({
      error: 'blog with that id doesn`t exist'
    })
  }
  
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if(!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  if (blog.user.toString() === decodedToken.id){
    await Blog.deleteOne({ _id: request.params.id })
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'blog doesn`t belong to logged in user'})
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const updated = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes : body.likes || 0
  }

  const updatedBlog =
    await Blog.findByIdAndUpdate(request.params.id, updated, { new: true })
    response.status(204).json(updatedBlog)
})

module.exports = blogsRouter