const otpGenerator = require("otp-generator");

exports.generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: true,
    specialChars: true,
  });
};
