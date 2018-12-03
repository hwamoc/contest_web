const express = require('express');
const Contest = require('../models/contest');
const User = require('../models/user'); 
// const Answer = require('../models/answer'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
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
  res.render('contests/index', {contests: contests, query: req.query});
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
  // const answers = await Answer.find({question: question.id}).populate('author');
  contest.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
  await contest.save();
  res.render('contests/show', {contest: contest});
    // , answers: answers});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    req.flash('danger', 'Not exist contest');
    return res.redirect('back');
  }
  contest.title = req.body.title;
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
  const user = req.session.user;

  var contest = new Contest({
    
    title: req.body.title,
    author: user._id,
    host: req.body.host,
    field: req.body.field,
    applicant: req.body.applicant,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    personInCharge: req.body.personInCharge,
    contact: req.body.contact,
    prize: req.body.prize,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await contest.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/contests');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    req.flash('danger', 'Not exist contest');
    return res.redirect('back');
  }

  // var answer = new Answer({
  //   author: user._id,
  //   question: question._id,
  //   content: req.body.content
  // });
  // await answer.save();
  // question.numAnswers++;
  // await question.save();

  // req.flash('success', 'Successfully answered');
  // res.redirect(`/questions/${req.params.id}`);
}));



module.exports = router;
