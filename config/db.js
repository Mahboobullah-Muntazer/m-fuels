const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    let connreq = await mongoose.connect(db, {
      retryWrites: true,
      w: 'majority',
    });
    // console.log({connreq})
    if (connreq) {
      console.log('MongoDB Connected...');
    }
  } catch (err) {
    console.log({ err });
    console.error(err.message);
    //exit process with failure
    process.exit(1);
  }
};
module.exports = connectDB;
