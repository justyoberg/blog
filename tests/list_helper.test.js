const listHelper = require('../utils/list_helper')
const testHelper = require('./test_helper.js')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('empty array to be 0', () => {
    const result = listHelper.totalLikes([])

    expect(result).toBe(0)
  })

  test('array of 5 blogs to equal 36', () => {
    const result = listHelper.totalLikes(testHelper.blogs)

    expect(result).toBe(42)
  })
})

describe('favorite blog', () => {
  test('expect empty array to return null', () => {
    const result = listHelper.favoriteBlog([])

    expect(result).toBe(null)
  })

  test('expect to return blog post with 12 likes', () => {
    const result = listHelper.favoriteBlog(testHelper.blogs)

    const favorite = {
      "author": "Edsger W. Dijkstra",
      "title": "Canonical string reduction",
      "likes": 12
    }

    expect(result).toEqual(favorite)
  })
})

describe('most blogs', () => {
  test('expect empty array to return null', () => {
    const result = listHelper.mostBlogs([])

    expect(result).toBe(null)
  })

  test('expect to return Robert C. Martin with 3 posts', () => {
    const result = listHelper.mostBlogs(testHelper.blogs)

    expect(result).toEqual({
      "author": "Robert C. Martin",
      "blogs": 3
    })
  })
})

describe('most likes', () => {
  test('expect empty array to return null', () => {
    const result = listHelper.mostLikes([])

    expect(result).toBe(null)
  })
  
  test('expect to return Robert C. Martin with 18 likes', () => {
    const result = listHelper.mostLikes(testHelper.blogs)

    expect(result).toEqual({
      "author": "Robert C. Martin",
      "likes": 18
    })
  })
})