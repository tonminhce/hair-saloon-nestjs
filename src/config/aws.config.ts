export const s3Config = {
  region: process.env.AWS_REGION || "ap-southeast-1",
  bucketName: process.env.AWS_BUCKET_IMAGE || "qbhouse-image-dev",
  presignedUrlExpirationTime: parseInt(process.env.AWS_PRESIGNED_URL_EXPIRATION_TIME || '60'),
};
