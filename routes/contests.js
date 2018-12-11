const express = require('express');
const Contest = require('../models/contest');
const Answer = require('../models/answer'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

function validateForm(form, options) {
  var title = form.title || "";
  var author = user._id || "";
  var host = form.host || "";
  var field = form.field || "";
  var applicant = form.applicant || "";
  var startDate = form.startDate || "";
  var endDate = form.endDate || "";
  var personInCharge = form.personInCharge || "";
  var contact = form.contact || "";
  var prize = form.prize || "";
  var content = form.content || "";
  var tags = form.tags.split(" ").map(e => e.trim()) || "";

  title = title.trim();
  content = content.trim();
  // event_description = event_description.trim();
  // organizer = organizer.trim();
  // organizer_description = organizer_description.trim();

  if (!title) {
    return 'Title is required.';
  }
  if (!author) {
    return 'Location is required.';
  }
  if (!host) {
    return 'Start date is required.';
  }
  if(!field){
    return 'Start time is required.';
  }
  if(!applicant) {
    return 'Start time is required.';
  }
  if (!startDate) {
    return 'End date is required.';
  }
  if(!endDate) {
    return 'End time is required.';
  }
  if(!personInCharge) {
    return 'End time is required.';
  }
  if (!contact) {
    return 'Event description is required.';
  }
  if (!prize) {
    return 'Organizer is required.';
  }
  if (!content) {
    return 'Organizer description is required.';
  }
  return null;
}

/* GET contests listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const contests = await Contest.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('contests/index', {contests: contests, term: term, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('contests/new', {contest: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  res.render('contests/edit', {contest: contest});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id).populate('author');
  const answers = await Answer.find({contest: contest.id}).populate('author');
  contest.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await contest.save();
  res.render('contests/show', {contest: contest, answers: answers});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    req.flash('danger', 'Not exist contest');
    return res.redirect('back');
  }
  contest.title = req.body.title;
  contest.author = user._id;
  contest.host = req.body.host;
  contest.field = req.body.field;
  contest.applicant = req.body.applicant;
  contest.startDate = req.body.startDate;
  contest.endDate = req.body.endDate;
  contest.personInCharge = req.body.personInCharge;
  contest.contact = req.body.contact;
  contest.prize = req.body.prize;
  contest.content = req.body.content;
  contest.tags = req.body.tags.split(" ").map(e => e.trim());

  await contest.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/contests');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Contest.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/contests');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var contest = new Contest({
    title: req.body.title,
    author: user._id,
    host: req.body.host,
    field: req.body.field,
    applicant: req.body.applicant,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    personInCharge: req.body.personInCharge,
    contact: req.body.contact,
    prize: req.body.prize,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim())
  });
  await contest.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/contests');
}));

router.post('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Contest.findByIdAndUpdate({_id: req.params.id}, {$set: 
      {title: req.body.title,
      author: req.body.author,
      host: req.body.host,
      field: req.body.field,
      applicant: req.body.applicant,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      personInCharge: req.body.personInCharge,
      contact: req.body.contact,
      prize: req.body.prize,
      content: req.body.content,
      tags: req.body.tags.split(" ").map(e => e.trim())}}, {new: true}, function(err,doc) {
    if (err) { throw err; }
    else { console.log("Updated"); }
  });  

  req.flash('success', 'Successfully updated');
  res.redirect('/contests');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => { 
  const user = req.user;
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    req.flash('danger', 'Not exist contest');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    contest: contest._id,
    content: req.body.content
  });
  await answer.save();
  contest.numAnswers++;
  await contest.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/contests/${req.params.id}`);
}));



module.exports = router;
