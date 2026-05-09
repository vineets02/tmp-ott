const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

/**
 * Generate a Presigned URL for direct client-side upload
 * @param {string} fileName - Name of the file
 * @param {string} contentType - MIME type (e.g. video/mp4)
 * @returns {Promise<Object>} - The upload URL and the final object key
 */
const getUploadPresignedUrl = async (fileName, contentType, movieName = "uncategorized") => {
  const fileKey = `movies/${movieName}/${Date.now()}_${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  // URL valid for 1 hour
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    uploadUrl,
    fileKey,
  };
};

/**
 * Get a temporary view URL (if bucket is private)
 * or return the public URL (if bucket is public)
 */
const getFileUrl = (fileKey) => {
  // If you have a custom domain for your R2 bucket:
  if (process.env.R2_CUSTOM_DOMAIN) {
    return `${process.env.R2_CUSTOM_DOMAIN}/${fileKey}`;
  }
  
  // Otherwise, use the R2 public endpoint (if enabled)
  return `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${fileKey}`;
};

/**
 * Get total bucket size and object count
 */
const getBucketStats = async () => {
  let totalSize = 0;
  let objectCount = 0;
  let isTruncated = true;
  let continuationToken = null;

  while (isTruncated) {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);
    
    if (response.Contents) {
      response.Contents.forEach((obj) => {
        totalSize += obj.Size;
        objectCount++;
      });
    }

    isTruncated = response.IsTruncated;
    continuationToken = response.NextContinuationToken;
  }

  return {
    totalSize, // bytes
    objectCount,
  };
};

module.exports = {
  s3Client,
  getUploadPresignedUrl,
  getFileUrl,
  getBucketStats,
};
