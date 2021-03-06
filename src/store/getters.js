// 返回添加用户信息后的所有文章
export const computedArticles  = state => {
  let articles = state.articles;
  let newArticles = [];

  // 添加用户信息，参数 isCurrentUser 代表是否当前用户
  const addUserInfo = function (isCurrentUser) {
    const userName = state.user && state.user.name;
    const userAvatar = state.user && state.user.avatar;
    const avatarUrl = 'https://api.adorable.io/avatars/200/';

    // 当前用户时, 设置用户数据为当前用户的信息
    if (isCurrentUser) {
      this.uname = userName;
      this.uavatar = userAvatar
    } else {
      // 不是挡墙用户时，设置用户数据为对象里用户的信息
      this.uavatar = `${avatarUrl}${this.uname}`;
    }
  };

  if (Array.isArray(articles)) {
    // 深拷贝 articles 以不影响原值
    newArticles = JSON.parse(JSON.stringify(articles));
    newArticles.forEach(article => {
      const comments = article.comments;
      const likeUsers = article.likeUsers;

      // 添加用户信息到文章
      if (article.uid === 1) {
        addUserInfo.call(article, true)
      } else {
        addUserInfo.call(article)
      }

      // 添加用户信息到评论
      if (Array.isArray(comments)) {
        comments.forEach(comment => {
          if (comment.uid === 1) {
            addUserInfo.call(comment, true)
          } else {
            addUserInfo.call(comment)
          }
        })
      }

      // 添加用户信息到点赞
      if (Array.isArray(likeUsers)) {
        likeUsers.forEach(likeUser => {
          if (likeUser.uid === 1) {
            addUserInfo.call(likeUser, true)
          } else {
            addUserInfo.call(likeUser)
          }
        })
      }
    });
  }
  return newArticles
}

// 返回指定 uid 下的所有文章，参数 uid 是用户 ID，user 是用户名
export const getArticlesByUid = (state, getters) => (uid, user) => {
  // 使用派生状态 computedArticles 作为所有文章
  let articles = getters.computedArticles;

  if (Array.isArray(articles)) {
    if (user) {
      // 有用户名时编译所有文章
      for(const article of articles) {
        if (article.uname === user) {
          // 指定 uid 为文章上的 uid
          uid = article.uid;
          break
        }
      }
    }

    // 使用指定 uid 过滤所有文章
    articles = articles.filter(article => parseInt(uid) === parseInt(article.uid))
  } else {
    articles = []
  }
  return articles
}

export const getArticlesByFilter = (state, getters) => (filter) => {
  // 使用派生状态 computedArticles 获取所有文章
  let articles = getters.computedArticles;
  let filteredArticles = [];

  if (Array.isArray(articles)) {
    // 深拷贝 articles 以不影响其原值
    filteredArticles = articles.map(article => ({ ...article }));

    switch(filter) {
      case 'excellent':
        // 将当前用户的文章设置为精华文章
        filteredArticles = getters.getArticlesByUid(1)
        break
      case 'vote':
        // 将获赞最多的文章排在前面
        filteredArticles.sort((a, b) => {
          const aLikeUsers = Array.isArray(a.likeUser) ? a.likeUser : [];
          const bLikeUsers = Array.isArray(b.likeUser) ? b.likeUser : [];

          return bLikeUsers.length - aLikeUsers.length
        })
        break
      case 'recent':
        // 将最新写的文章排在前面
        filteredArticles.reverse();
        break
      case 'noreply':
        // 将评论最少的文章排在前面
        filteredArticles.sort((a, b) => {
          const aComments = Array.isArray(a.comments) ? a.comments : [];
          const bComments = Array.isArray(b.comments) ? b.comments : [];

          return aComments.length - bComments.length
        })
        break
      default:
        // 默认将回复时间最新的文章排在前面
        filteredArticles.sort((a, b) => {
          const aComments = Array.isArray(a.comments) ? a.comments : [];
          const bComments = Array.isArray(b.comments) ? b.comments : [];
          const aCommentsLength = aComments.length;
          const bCommentsLength = bComments.length;

          if (aCommentsLength > 0) {
            if (bCommentsLength > 0) {
              return new Date(bComments[bCommentsLength - 1].date) - new Date(aComments[aCommentsLength - 1].date)
            } else {
              return -1
            }
          } else {
            return -1
          }
        })

        break
    }
  }
  return filteredArticles
}

// 根据关键字 keyword 返回搜索结果
export const getArticlesByKeyWord = (state, getters) => (keyWord, filter) => {
  let articles = getters.computedArticles;
  let results = [];

  if (Array.isArray(articles)) {
    articles.forEach(article => {
      let { articleId, title, content } = article;
      // 该正则表示文章标题或内容的关键字
      const regex = new RegExp(`(${keyWord})`, 'gi');

      if (~title.indexOf(keyWord) || ~content.indexOf(keyWord)) {
        // url 是文章中没有的数据，我们结合 articleId 拼出完整的路径
        const url = `${state.origin}/articles/${articleId}/content`;
        // 给文章标题的关键字加上高亮，$1 匹配第一个括号的内容
        title = title.replace(regex, '<span class="highlight">$1</span>');
        // 给文章内容中的关键字加上高亮，只取内容的前100个字
        content = content.substr(0, 100).replace(regex, '<span class="highlight">$1</span>');
        // 等价于 Object.assign({}, article, { url: url, title: title, content })
        results.push({...article, ...{url, title, content}});
      }
    })
  }

  // 评估排序方式
  switch(filter) {
    case 'vote':
        // 将赞的最多的文章排在前面
        results.sort((a, b) => {
          const aLikeUsers = Array.isArray(a.likeUsers) ? a.likeUsers : [];
          const bLikeUsers = Array.isArray(b.likeUsers) ? b.likeUsers : [];

          return bLikeUsers.length - aLikeUsers.length;
        })
      break
    default:
        // 默认降标题含有关键字的文章排在前面
        results.sort((a, b) => a.title.indexOf(keyWord) < b.title.indexOf(keyWord))
  }
  return results
};
