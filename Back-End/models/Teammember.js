// const mongoose = require('mongoose');
// const TeamMember = mongoose.model('TeamMember', {
//    name: {
//       type: String,
//       required: true,
//       trim: true
//    },
//     role: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     imageUrl: {
//         type: String,
//         required: true,
//         trim: true
//     }
// });
// module.exports = mongoose.model('TeamMember', TeamMember);

// models/Teammember.js
const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

module.exports = TeamMember;


