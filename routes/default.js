export const method = "get";
export const name = "/";
export const execute = async (req, res) => {
 res.status(200).json({
  status: 200,
  discord: "kfwr",
  instagram: "kauexz",
  routes: "/user/:id",
 });
};