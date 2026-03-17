export default function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  return res.status(200).json({
    hasBlobToken: Boolean(token),
    tokenLength: token ? token.length : 0,
    nodeEnv: process.env.NODE_ENV || null,
    vercelEnv: process.env.VERCEL_ENV || null,
  });
}
