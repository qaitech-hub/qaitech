const {
  getPasswordRestorationTokenByEmail,
  deletePasswordRestorationToken,
  createPasswordRestorationToken,
} = require("./passwordRestorationToken");

const generatePasswordRestorationToken = async (email) => {
  let token = "";
  for (let i = 0; i < 6; i++) {
    let digit = Math.floor(Math.random() * 10);
    token += digit;
  }
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordRestorationTokenByEmail(email);
  if (existingToken) await deletePasswordRestorationToken(existingToken.id);

  const verificationToken = await createPasswordRestorationToken(
    email,
    token,
    expires
  );

  return verificationToken;
};

module.exports = { generatePasswordRestorationToken };
