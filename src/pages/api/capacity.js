export default async function capacity(req, res) {
  if (req.method === "GET") {
    res.status(200);
  }
  else {
    res.status(405);
  }
  res.end();
}