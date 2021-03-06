const twitterAPI = require('node-twitter-api');
var creds = {};
var twitter = new twitterAPI({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callback: process.env.CALLBACK_URL
});

const querystring = require('querystring');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (req, reply) => {
      if (!req.state.creds && req.query.oauth_verifier){
        twitter.getAccessToken(creds.requestToken, creds.requestTokenSecret, req.query.oauth_verifier, (error, accessToken, accessTokenSecret, results) => {
          if (error) {
            console.log(error);
          } else {
            creds.accessToken = accessToken;
            creds.accessTokenSecret = accessTokenSecret;
            reply.file(__dirname + '/../public/index.html').state('creds', {'access': accessToken, 'secret': accessTokenSecret});
          }
        });
      } else if (req.state.creds){
        twitter.verifyCredentials(req.state.creds.access, req.state.creds.secret, function(error, data, response) {
          if (error) {
            console.log(error);
          } else {
            var user = data["screen_name"];
            var userId = data["id_str"];
            reply.file(__dirname + '/../public/index.html').state('user', {username: user, userId: userId});
          }
        });
      } else {
        reply.redirect('/twitterlogin');
      }
    }
  },
  {
    method: ['GET', 'POST'],
    path: '/twitterlogin',
    handler: function (req, reply) {
      twitter.getRequestToken((error, requestToken, requestTokenSecret, results) => {
        if (error) {
          console.log('Error getting OAuth request token : ' + error);
        } else {
          creds.requestToken = requestToken;
          creds.requestTokenSecret = requestTokenSecret;
          if (creds.accessToken) {
            reply.file(__dirname + '/../public/index.html').state('creds', {access: creds.accessToken, secret: creds.accessTokenSecret});
          } else {
            reply.redirect(`https://twitter.com/oauth/authenticate?oauth_token=${requestToken}`);
          }
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/returndata',
    handler: (req, reply) => {
      twitter.getTimeline('home', {count: 200}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          data = data.map(formatTweet);
          reply(data);
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/testsearch',
    handler: (req, reply) => {
      twitter.users("lookup", {screen_name: "nadinebphoto"}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/friendsid',
    handler: (req, reply) => {
      twitter.friends('ids', {}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          var ids = data.ids.splice(0, 99).join();
          twitter.users('lookup', {user_id: ids}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
            if (error) {
              console.log(error);
            } else {
              data = data.map(el => {
                return {
                  name: el.name,
                  screen_name: el.screen_name,
                  description: el.description,
                  profile_image: el.profile_image_url,
                  id: el.id_str
                };
              });
              reply(data);
            }
          });
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/blocked',
    handler: (req, reply) => {
      twitter.blocks('list', {}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          data = data.users.map(el => {
            return {
              name: el.name,
              screen_name: el.screen_name,
              description: el.description,
              profile_image: el.profile_image_url,
              id: el.id_str
            };
          });
          reply(data);
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/listsowned',
    handler: (req, reply) => {
      twitter.lists('ownerships', {}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          data = data.lists.map(el => {
            return {
              name: el.name,
              link: el.uri,
              slug: el.slug,
              id: el.user.id_str,
            };
          });
          reply(data);
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/listmembersall/{id}/{slug}',
    handler: (req, reply) => {
      twitter.lists('members', {slug: req.params.slug, owner_id: req.params.id}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          data = data.users.map(el => {
            return {
              name: el.name,
              screen_name: el.screen_name,
              text: el.description,
              profile_image: el.profile_image_url
            };
          });
          reply(data);
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/dms',
    handler: (req, reply) => {
      twitter.direct_messages('sent', {count: 200}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          data = data.map(el => {
            return {
              text: el.text,
              name: el.recipient.name,
              screen_name: el.recipient.screen_name,
              profile_image: el.recipient.profile_image_url
            };
          });
          const dataObject = {};
          for (var i = 0; i < data.length; i++) {
            if (!dataObject[data[i].name]) {
              dataObject[data[i].name] = data[i];
            }
          }
          reply(Object.keys(dataObject).map(el => dataObject[el]));
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/rts',
    handler: (req, reply) => {
      twitter.getTimeline('mentions_timeline', {count: 200}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          data = data.map(el => {
            return {
              text: el.text,
              name: el.user.name,
              screen_name: el.user.screen_name,
              profile_image: el.user.profile_image_url,
              time: el.created_at
            };
          });
          reply(data);
          {/*const dataObject = {};
          for (var i = 0; i < data.length; i++) {
            if (!dataObject[data[i].name]) {
              dataObject[data[i].name] = data[i];
            }
          }
          reply(Object.keys(dataObject).map(el => dataObject[el]));*/}
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/profilepage',
    handler: (req, reply) => {
      if (!req.state.user.username) {
        twitter.verifyCredentials(req.state.creds.access, req.state.creds.secret, function(error, data, response) {
          if (error) {
            console.log(error);
          } else {
            var user = data["screen_name"];
            var userId = data["id_str"];
            twitter.getTimeline('user_timeline', {screen_name: user, count: 200}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
              if (error) {
                console.log(error);
              } else {
                data = data.map(formatTweet);
                reply(data).state('user', {username: user, userId: userId});;
              }
            });
          }
        })
      }
      twitter.getTimeline('user_timeline', {screen_name: req.state.user.username, count: 200}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          data = data.map(formatTweet);
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/deleteatweet',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.statuses('destroy', {id: updates.id}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/profilepages',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.account('update_profile', {name: updates.name, location: updates.location, description: updates.profileText} , req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/createlists',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.lists('create', {name: updates.listName} , req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/favouritetweet',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.favorites('create', {id: updates.tweetId} , req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/unfavouritetweet',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.favorites('destroy', {id: updates.tweetId} , req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/unfriend',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.friendships('destroy',{user_id: updates.id}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/refriend',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.friendships('create',{user_id: updates.id}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/sendtweet',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.statuses('update',{status: updates.tweet}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/blockuser',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.blocks('destroy',{user_id: updates.id}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/createblockuser',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.blocks('create',{screen_name: updates.screen_name}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/reblockuser',
    handler: (req, reply) => {
      var updates = querystring.parse(req.payload);
      twitter.blocks('create',{user_id: updates.id}, req.state.creds.access, req.state.creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          reply(data);
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: function(request, reply) {
      reply.file(__dirname + '/../public/' + request.params.path);
    }
  }
];

function formatTweet(tweet) {
  return {
    text: tweet.text,
    name: tweet.user.name,
    username: tweet.user.screen_name,
    profileImage: tweet.user.profile_image_url,
    time: tweet.created_at,
    image: getMedia(tweet).image,
    video: getMedia(tweet).video,
    profileText: tweet.user.description,
    followersCount: tweet.user.followers_count,
    friendsCount: tweet.user.friends_count,
    location: tweet.user.location,
    id: tweet.id_str,
    favorited: tweet.favorited,
  };
}

function getMedia(tweet){
  var media = {};
  if(tweet.extended_entities && tweet.extended_entities.media) {
    media.image = tweet.extended_entities.media.map(el => {
      if (el.type === 'photo') {
        return el.media_url;
      };
    });
  }
  if(tweet.extended_entities && tweet.extended_entities.media && tweet.extended_entities.media[0] && tweet.extended_entities.media[0].video_info) {
    var videos = tweet.extended_entities.media[0].video_info.variants;
    media.video = videos.filter(el => {
      return el.content_type = 'video/mp4';
    }).sort((a, b) => {
      return a.bitrate - b.bitrate;
    })[0].url;
    media.video;
  }
  return media;
}
