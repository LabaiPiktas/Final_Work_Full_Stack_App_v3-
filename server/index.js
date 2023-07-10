const express = require("express");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
const cors = require("cors");

require("dotenv").config();

const PORT = process.env.PORT || 8080;
const url = process.env.DB_CONNECTION_STRING;
const dbName = process.env.DB_NAME;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const generateID = () => Math.random().toString(36).substring(2, 10);

MongoClient.connect(url, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const usersCollection = db.collection("users");
    const threadListCollection = db.collection("threadList");

    app.post("/api/register", (req, res) => {
      const { email, password, username } = req.body;

      // Check if user already exists
      usersCollection
        .findOne({ email })
        .then((result) => {
          if (result) {
            return res.json({
              error_message: "User already exists",
            });
          }

          const newUser = { email, password, username };

          usersCollection
            .insertOne(newUser)
            .then(() => {
              res.json({
                message: "Account created successfully!",
              });
            })
            .catch((error) => {
              console.error("Error inserting user:", error);
              res.sendStatus(500);
            });
        })
        .catch((error) => {
          console.error("Error finding user:", error);
          res.sendStatus(500);
        });
    });

    app.post("/api/login", (req, res) => {
      const { email, password } = req.body;

      // Check if user exists and password matches
      usersCollection
        .findOne({ email, password })
        .then((result) => {
          if (result) {
            res.json({
              message: "Login successfully",
              id: result._id,
            });
          } else {
            res.json({
              error_message: "Incorrect credentials",
            });
          }
        })
        .catch((error) => {
          console.error("Error finding user:", error);
          res.sendStatus(500);
        });
    });

    app.post("/api/create/thread", (req, res) => {
      const { thread, userId } = req.body;
      const threadId = new ObjectId(); // Generate a new ObjectId

      const newThread = {
        id: threadId.toHexString(), // Convert ObjectId to string format
        title: thread,
        userId,
        replies: [], // Initialize the replies array as empty
        replies: [],
        likes: [],
        timestamp: new Date().toISOString(),
      };

      threadListCollection
        .insertOne(newThread)
        .then(() => {
          threadListCollection
            .find()
            .toArray()
            .then((threads) => {
              res.json({
                message: "Thread created successfully!",
                threads,
              });
            })
            .catch((error) => {
              console.error("Error retrieving threads:", error);
              res.sendStatus(500);
            });
        })
        .catch((error) => {
          console.error("Error inserting thread:", error);
          res.sendStatus(500);
        });
    });

    app.post("/api/like", (req, res) => {
      const { threadId, userId } = req.body;

      threadListCollection
        .updateOne({ id: threadId }, { $push: { likes: userId } })
        .then(() => {
          threadListCollection
            .findOne({ id: threadId })
            .then((thread) => {
              res.json({
                message: "Like added successfully!",
                likesCount: thread.likes.length, // Return the updated likes count
              });
            })
            .catch((error) => {
              console.error("Error retrieving thread:", error);
              res.sendStatus(500);
            });
        })
        .catch((error) => {
          console.error("Error adding like:", error);
          res.sendStatus(500);
        });
    });

    app.get("/api/all/threads", (req, res) => {
      threadListCollection
        .find()
        .toArray()
        .then((threads) => {
          const formattedThreads = threads.map((thread) => ({
            id: thread.id,
            title: thread.title,
            userId: thread.userId,
            replies: thread.replies,
            likes: thread.likes,
            name: thread.name,
            timestamp: thread.timestamp,
          }));

          res.json({
            threads: formattedThreads,
          });
        })
        .catch((error) => {
          console.error("Error retrieving threads:", error);
          res.sendStatus(500);
        });
    });

    app.delete("/api/delete/thread/:threadId", (req, res) => {
      const { threadId } = req.params;

      threadListCollection
        .deleteOne({ id: threadId })
        .then(() => {
          res.json({
            message: "Thread deleted successfully!",
          });
        })
        .catch((error) => {
          console.error("Error deleting thread:", error);
          res.sendStatus(500);
        });
    });

    app.post("/api/add/reply/:threadId", (req, res) => {
      const { threadId } = req.params;
      const { replyText, userId } = req.body;

      const newReply = {
        _id: new ObjectId(), // Generate a new ObjectId for the reply
        text: replyText,
        userId: userId,
        timestamp: new Date().toISOString(),
        replyLikes: [], // Initialize the replyLikes array as empty
      };

      threadListCollection
        .findOneAndUpdate(
          { id: threadId },
          { $push: { replies: newReply } },
          { returnOriginal: false }
        )
        .then((result) => {
          const updatedThread = result.value;
          const addedReply =
            updatedThread.replies[updatedThread.replies.length - 1];
          res.json({
            message: "Reply added successfully!",
            reply: addedReply,
            thread: updatedThread,
          });
        })
        .catch((error) => {
          console.error("Error adding reply:", error);
          res.sendStatus(500);
        });
    });

    // DELETE route to delete a reply
    app.delete("/api/delete/reply/:threadId/:replyId", (req, res) => {
      const { threadId, replyId } = req.params;

      threadListCollection
        .findOneAndUpdate(
          { id: threadId },
          { $pull: { replies: { _id: new ObjectId(replyId) } } },
          { returnOriginal: false }
        )
        .then((result) => {
          const updatedThread = result.value;
          res.json({
            message: "Reply deleted successfully!",
            thread: updatedThread,
          });
        })
        .catch((error) => {
          console.error("Error deleting reply:", error);
          res.sendStatus(500);
        });
    });

    // Likes for Reply...

    app.post("/api/like/reply", (req, res) => {
      const { replyId, userId } = req.body;

      threadListCollection
        .findOneAndUpdate(
          { "replies._id": new ObjectId(replyId) },
          { $push: { "replies.$.replyLikes": userId } },
          { returnOriginal: false }
        )
        .then((result) => {
          const updatedThread = result.value;
          const updatedReply = updatedThread.replies.find(
            (reply) => reply._id.toString() === replyId
          );

          res.json({
            message: "Like added successfully!",
            likesCount: updatedReply.replyLikes.length,
          });
        })
        .catch((error) => {
          console.error("Error adding like:", error);
          res.sendStatus(500);
        });
    });

    // ...

    app.put("/api/edit/thread/:threadId", (req, res) => {
      const { threadId } = req.params;
      const { newText } = req.body;

      threadListCollection
        .findOneAndUpdate(
          { id: threadId },
          { $set: { title: newText, edited: true } },
          { returnOriginal: false }
        )
        .then((result) => {
          const updatedThread = result.value;
          if (updatedThread) {
            res.json({
              message: "Thread edited successfully!",
              thread: updatedThread,
            });
          } else {
            res.json({
              error_message: "Thread not found",
            });
          }
        })
        .catch((error) => {
          console.error("Error editing thread:", error);
          res.sendStatus(500);
        });
    });

    // PUT route to edit a reply
    app.put("/api/edit/reply/:threadId/:replyId", (req, res) => {
      const { threadId, replyId } = req.params;
      const { newText } = req.body;

      threadListCollection
        .findOneAndUpdate(
          { id: threadId, "replies._id": new ObjectId(replyId) },
          { $set: { "replies.$.text": newText, "replies.$.edited": true } },
          { returnOriginal: false }
        )
        .then((result) => {
          const updatedThread = result.value;
          if (updatedThread) {
            const updatedReply = updatedThread.replies.find(
              (reply) => reply._id.toString() === replyId
            );
            res.json({
              success: true,
              thread: updatedThread,
              reply: updatedReply,
            });
          } else {
            res.json({
              success: false,
              message: "Thread or reply not found",
            });
          }
        })
        .catch((error) => {
          console.error("Error editing reply:", error);
          res.sendStatus(500);
        });
    });

    // ...

    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
