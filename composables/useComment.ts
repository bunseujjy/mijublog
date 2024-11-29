import { ref } from 'vue'

interface Comment {
  id: number
  author: string
  content: string
  date: string
  likes: number
  replyIds: number[]
}

export const useComments = () => {
  const comments = ref<Map<number, Comment>>(new Map())
  const rootCommentIds = ref<number[]>([])

  const addComment = (content: string, parentId?: number) => {
    const newComment: Comment = {
      id: Date.now(),
      author: 'Current User',
      content,
      date: new Date().toISOString(),
      likes: 0,
      replyIds: []
    }
    
    comments.value.set(newComment.id, newComment)
    
    if (parentId) {
      const parentComment = comments.value.get(parentId)
      if (parentComment) {
        parentComment.replyIds.push(newComment.id)
      }
    } else {
      rootCommentIds.value.unshift(newComment.id)
    }
    
    return newComment.id
  }

  // Initialize with sample data
  const initializeComments = () => {
    const comment1 = {
      id: 1,
      author: 'John Doe',
      content: 'This is a great post! Really enjoyed reading it.',
      date: '2024-04-03T10:00:00Z',
      likes: 5,
      replyIds: [2]
    }
    
    const comment2 = {
      id: 2,
      author: 'Jane Smith',
      content: 'I completely agree with you!',
      date: '2024-04-03T10:30:00Z',
      likes: 3,
      replyIds: [3]
    }
    
    const comment3 = {
      id: 3,
      author: 'Mike Johnson',
      content: 'Thanks for sharing your thoughts!',
      date: '2024-04-03T11:00:00Z',
      likes: 1,
      replyIds: []
    }
    
    comments.value.set(comment1.id, comment1)
    comments.value.set(comment2.id, comment2)
    comments.value.set(comment3.id, comment3)
    rootCommentIds.value = [1]
  }

  initializeComments()

  return {
    comments,
    rootCommentIds,
    addComment
  }
}