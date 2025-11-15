const prisma = require("../db");

const getVerificationTokenByEmail = async (email) => {
  try {
    const verififcationToken = await prisma.verificationToken.findFirst({
      where: { email },
    });

    return verififcationToken;
  } catch {
    return null;
  }
};

const getVerificationTokenByToken = async (token) => {
  try {
    const verififcationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    return verififcationToken;
  } catch {
    return null;
  }
};

const deleteVerificationToken = async (tokenId) => {
  try {
    await prisma.verificationToken.delete({
      where: { id: tokenId },
    });
  } catch {
    return null;
  }
};

const createVerificationToken = async (email, token, expires) => {
  try {
    const verififcationToken = await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return verififcationToken;
  } catch {
    return null;
  }
};

module.exports = {
  getVerificationTokenByEmail,
  getVerificationTokenByToken,
  deleteVerificationToken,
  createVerificationToken,
};
