/* eslint-disable no-useless-escape */
/* eslint-disable camelcase */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeTestUsers () {
  return [
    {
      id: 1,
      full_name: 'John Doe',
      email: 'example@mail.com',
      password: 'password',
      date_created: new Date('2020-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      full_name: 'Jane Lane',
      email: 'jl3le@mail.com',
      password: 'password1',
      date_created: new Date('2020-01-22T16:28:32.615Z')
    },
    {
      id: 3,
      full_name: 'Bob Roe',
      email: 'bos0i8e@mail.com',
      password: 'password2',
      date_created: new Date('2020-01-22T16:28:32.615Z')
    },
    {
      id: 4,
      full_name: 'Luke Sky',
      email: 'skywalker2@mail.com',
      password: 'password4orce',
      date_created: new Date('2020-01-22T16:28:32.615Z')
    }
  ];
};

function makeTestJournals (users) {
  return [
    {
      id: 1,
      title: 'Spanish Delight',
      location: 'Madrid, Spain',
      content: 'Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.',
      start_date: new Date('Wed Jun 05 2019 20:00:00'),
      end_date: new Date('Thu Jun 06 2019 20:00:00'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      author_id: users[0].id
    },
    {
      id: 2,
      title: 'Fun Day in Florida',
      location: 'Miami, Florida',
      content: 'Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.',
      start_date: new Date('Fri Jan 11 2019 19:00:00'),
      end_date: new Date('Fri Jan 12 2019 19:00:00'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      author_id: users[0].id
    },
    {
      id: 3,
      title: 'Beauty of Italy',
      location: 'Rome, Italy',
      content: 'Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.',
      start_date: new Date('Mon Feb 10 2020 12:00:00'),
      end_date: new Date('Fri Feb 14 2020 12:00:00'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      author_id: users[3].id
    },
    {
      id: 4,
      title: 'Disney World',
      location: 'Orlando, Florida',
      content: 'Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.',
      start_date: new Date('Tue Jul 02 2019 20:00:00'),
      end_date: new Date('Tue Jul 09 2019 20:00:00'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      author_id: users[2].id
    },
    {
      id: 5,
      title: 'First day in Australia',
      location: 'Brisbane, Australia',
      content: 'Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.',
      start_date: new Date('Sun Apr 14 2019 20:00:00'),
      end_date: new Date('Mon Apr 15 2019 20:00:00'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      author_id: users[1].id
    }
  ];
};

function makeTestComments (users, journals) {
  return [
    {
      id: 1,
      text: 'First comment!',
      journal_id: journals[0].id,
      author_id: users[0].id,
      date_created: new Date('2020-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      text: 'Lorem ipsum dolor!',
      journal_id: journals[2].id,
      author_id: users[1].id,
      date_created: new Date('2020-01-22T16:28:32.615Z')
    },
    {
      id: 3,
      text: 'Lorem!',
      journal_id: journals[0].id,
      author_id: users[2].id,
      date_created: new Date('2020-01-22T16:28:32.615Z')
    },
    {
      id: 4,
      text: 'Lorem ipsum dolor sit amet, afsdfasdf',
      journal_id: journals[0].id,
      author_id: users[3].id,
      date_created: new Date('2020-01-22T16:28:32.615Z')
    },
    {
      id: 5,
      text: 'Amazing place!',
      journal_id: journals[4].id,
      author_id: users[0].id,
      date_created: new Date('2020-01-22T16:28:32.615Z')
    }
  ];
};

function makeJournalsFixtures () {
  const testUsers = makeTestUsers();
  const testJournals = makeTestJournals(testUsers);
  const testComments = makeTestComments(testUsers, testJournals);
  return { testUsers, testJournals, testComments };
};

function seedTravelingJournalsTables (db, users, journals, comments = []) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into('traveling_journals').insert(journals);
    await trx.raw(
      // eslint-disable-next-line quotes
      `SELECT setval('traveling_journals_id_seq', ?)`,
      [journals[journals.length - 1].id]
    );

    if (comments.length) {
      await trx.into('traveling_comments').insert(comments);
      await trx.raw(
        // eslint-disable-next-line quotes
        `SELECT setval('traveling_comments_id_seq', ?)`,
        [comments[comments.length - 1].id]
      );
    }
  });
};

function seedUsers (db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.into('traveling_users').insert(preppedUsers)
    .then(() =>
      db.raw(
        // eslint-disable-next-line quotes
        `SELECT setval('traveling_users_id_seq', ?)`,
        [users[users.length - 1].id]
      )
    );
};

function makeExpectedJournal (users, journal, comments = []) {
  const author = users.find(user => user.id === journal.author_id);
  const number_of_comments = comments.filter(comment => comment.journal_id === journal.id).length;

  return {
    id: journal.id,
    title: journal.title,
    location: journal.location,
    content: journal.content,
    date_created: journal.date_created.toISOString(),
    date_modified: journal.date_modified || null,
    start_date: journal.start_date.toISOString(),
    end_date: journal.end_date.toISOString(),
    number_of_comments: Number(number_of_comments),
    author: author.full_name
  };
};

function makeExpectedJournalComments (users, journalId, comments) {
  const expectedComments = comments.filter(comment => comment.journal_id === journalId);

  return expectedComments.map(comment => {
    const commentUser = users.find(user => user.id === comment.author_id);
    return {
      id: commentUser.id,
      text: comment.text,
      date_created: comment.date_created.toISOString(),
      journal_id: comment.journal_id,
      author: commentUser.full_name
    };
  });
};

function makeMaliciousJournal (user) {
  const maliciousJournal = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    location: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
    content: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    date_created: new Date().toISOString(),
    author_id: user.id
  };
  const expectedJournal = {
    ...maliciousJournal,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    location: 'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.',
    content: 'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.'
  };
  return {
    maliciousJournal,
    expectedJournal
  };
};

function seedMaliciousJournal (db, user, journal) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('traveling_journals')
        .insert([journal])
    );
};

function makeAuthHeader (user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256'
  });

  return `Bearer ${token}`;
};

module.exports = {
  makeTestUsers,
  makeTestJournals,
  makeTestComments,
  makeJournalsFixtures,
  seedTravelingJournalsTables,
  seedUsers,
  makeExpectedJournal,
  makeExpectedJournalComments,
  makeMaliciousJournal,
  seedMaliciousJournal,
  makeAuthHeader
};
