const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const dotenv = require('dotenv')

const app = express();

dotenv.config()

app.use(cors({
  origin: [process.env.FRONTURI]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const storage = multer.memoryStorage();

const upload = multer({ storage });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  resume: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

app.post('/signup', upload.single('resume'), (req, res) => {
  const { name, email, password } = req.body;
  const { originalname, buffer } = req.file;

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      const newUser = new User({ name, email, password, resume: buffer.toString('base64') });
      newUser.save()
        .then(() => res.send({ message: '1' }))
        .catch((err) => res.status(400).json(`Error: ${err}`));
    }
    else {
      res.send({ message: "User already exists" });
    }
  })
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
