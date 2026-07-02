export const createAccessToken = (payload) => {
  return jwt.sign(
    { id: payload.id, role: payload.role },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
};

export const hashTokenId = (tokenId) => {
  return crypto.createHash("sha256").update(tokenId).digest("hex");
};

export const createRefreshToken = (payload) => {
  return jwt.sign(
    { id: payload.id, tokenId: payload.tokenId },
    config.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
};
