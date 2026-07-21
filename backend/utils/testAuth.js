const mongoose = require('mongoose');

const uri1 = 'mongodb+srv://Rohini:Rohoni%402004@cluster0.7jdgxrh.mongodb.net/sahakara_erp?retryWrites=true&w=majority';
const uri2 = 'mongodb+srv://Rohini:Rohini%402004@cluster0.7jdgxrh.mongodb.net/sahakara_erp?retryWrites=true&w=majority';
const uri3 = 'mongodb+srv://Rohini:Rohoni@2004@cluster0.7jdgxrh.mongodb.net/sahakara_erp?retryWrites=true&w=majority';

async function test() {
  for (const [idx, uri] of [uri1, uri2, uri3].entries()) {
    try {
      console.log(`Testing URI #${idx + 1}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ URI #${idx + 1} SUCCESSFUL! Connected to: ${mongoose.connection.host}`);
      await mongoose.disconnect();
      return uri;
    } catch (err) {
      console.log(`❌ URI #${idx + 1} Failed: ${err.message}`);
    }
  }
}

test();
