const Message = require('../Models/Message');

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const createMessage = async (req, res) => {
  try {
    const { text, images, name } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Text is required', success: false });
    }
    const message = new Message({
      userId: req.user.userId, // UUID from JWT
      sender: 'user', // Hardcoded as 'user'
      text,
      name,
      images: images || [],
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      replies: [],
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const updateMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found', success: false });
    }
    if (message.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized', success: false });
    }

    message.text = req.body.text || message.text;
    message.images = req.body.images || message.images;
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found', success: false });
    }
    if (message.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized', success: false });
    }

    await message.deleteOne();
    res.status(200).json({ message: 'Message deleted', success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const createReply = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found', success: false });
    }

    const { text, name, images } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Reply text is required', success: false });
    }

    const reply = {
      userId: req.user.userId, // UUID from JWT
      name,
      text,
      images: images || [],
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    };
    message.replies.push(reply);
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error posting reply:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const updateReply = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found', success: false });
    }
    const reply = message.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found', success: false });
    }
    if (reply.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized', success: false });
    }

    reply.text = req.body.text || reply.text;
    reply.images = req.body.images || reply.images;
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const deleteReply = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found', success: false });
    }
    const reply = message.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found', success: false });
    }
    if (reply.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized', success: false });
    }

    message.replies.pull({ _id: req.params.replyId });
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

module.exports = {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  createReply,
  updateReply,
  deleteReply,
};