var mongoose = require('mongoose'),
  mongoosePaginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;



var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, trim: true, required: true },
  host: { type: String, trim: true, required: true },
  field: { type: String, trim: true, required: true },
  applicant: { type: String, trim: true, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  personInCharge: { type: String, trim: true, required: true },
  contact: { type: String, trim: true, required: true },
  prize: { type: String, trim: true, required: true },
  content: { type: String, trim: true, required: true },
  
  tags: [String],
  numLikes: { type: Number, default: 0 },
  numAnswers: { type: Number, default: 0 },
  numReads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
schema.plugin(mongoosePaginate);
var Contest = mongoose.model('Contest', schema);

module.exports = Contest;
