const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {

  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length < 1) return null

  const favorite = blogs.reduce((prev, curr) => (prev.likes > curr.likes) ? prev : curr)

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length < 1) return null

  let dict = {}

  blogs.forEach(blog => {
    if (!dict[blog.author]) dict[blog.author] = 1
    else dict[blog.author] += 1
  })

  let most = Object
              .entries(dict)
              .reduce((a, b) => a[1] > b[1] ? a : b)

  return {
    "author": most[0],
    "blogs": most[1]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length < 1) return null
  
  let dict = {}

  blogs.forEach(blog => {
    if (!dict[blog.author]) dict[blog.author] = blog.likes
    else dict[blog.author] += blog.likes
  })

  let most = Object
              .entries(dict)
              .reduce((a, b) => a[1] > b[1] ? a : b)

  return {
    "author": most[0],
    "likes": most[1]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}