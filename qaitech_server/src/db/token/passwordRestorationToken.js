const prisma = require("../db");

const getPasswordRestorationTokenByEmail = async (email) => {
  try {
    const passwordRestorationToken =
      await prisma.passwordRestorationToken.findFirst({
        where: { email },
      });

    return passwordRestorationToken;
  } catch {
    return null;
  }
};

const getPasswordRestorationTokenByToken = async (token) => {
  try {
    const passwordRestorationToken =
      await prisma.passwordRestorationToken.findUnique({
        where: { token },
      });

    return passwordRestorationToken;
  } catch {
    return null;
  }
};

const deletePasswordRestorationToken = async (tokenId) => {
  try {
    await prisma.passwordRestorationToken.delete({
      where: { id: tokenId },
    });
  } catch {
    return null;
  }
};

const createPasswordRestorationToken = async (email, token, expires) => {
  try {
    const passwordRestorationToken =
      await prisma.passwordRestorationToken.create({
        data: {
          email,
          token,
          expires,
        },
      });

    return passwordRestorationToken;
  } catch {
    return null;
  }
};

module.exports = {
  getPasswordRestorationTokenByEmail,
  getPasswordRestorationTokenByToken,
  deletePasswordRestorationToken,
  createPasswordRestorationToken,
};
