require('dotenv').config();
const { getUploadPresignedUrl } = require('./utils/s3');

async function test() {
  try {
    console.log(process.env.R2_ENDPOINT);
    const data = await getUploadPresignedUrl("test.mp4", "video/mp4");
    console.log("URL generated successfully:");
    console.log(data.uploadUrl);
  } catch(e) {
    console.error(e);
  }
}
test();
