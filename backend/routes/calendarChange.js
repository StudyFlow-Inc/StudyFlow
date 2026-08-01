const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/entry/:entryID', (req, res) => {
  res.json(
    db.prepare('SELECT * FROM calendar_change WHERE entryID = ?').all(req.params.entryID)
  );
});

module.exports = router;