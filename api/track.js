module.exports = async (req, res) => {
  try {
    return res.status(200).json({
      ok: true,
      message: "track funcionando"
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};
